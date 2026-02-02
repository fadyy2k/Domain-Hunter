import { NextRequest } from "next/server";
import { z } from "zod";
import { DomainQueue, type CheckResult } from "@/lib/checker";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const checkSchema = z.object({
    domains: z.array(z.string().min(1)).min(1).max(5000),
    concurrency: z.number().min(1).max(80).default(60),
    mode: z.enum(["rdap", "enhanced"]).default("rdap"),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = checkSchema.safeParse(body);

        if (!parsed.success) {
            return new Response(
                JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { domains, concurrency, mode } = parsed.data;

        const encoder = new TextEncoder();

        const stream = new ReadableStream<Uint8Array>({
            async start(controller) {
                const queue = new DomainQueue(domains, { concurrency, mode });

                // --- DB batch persistence (serialized) ---
                let batch: CheckResult[] = [];
                const BATCH_SIZE = 50;

                let flushInFlight: Promise<void> | null = null;

                const flushBatch = async () => {
                    if (flushInFlight) return flushInFlight;

                    flushInFlight = (async () => {
                        if (batch.length === 0) return;

                        const toSave = batch;
                        batch = [];

                        try {
                            const now = new Date();

                            // Only store definitive results (available/taken)
                            const ops = toSave
                                .filter((r) => r.status !== "unknown")
                                .map((r) => {
                                    const ttlSeconds = r.status === "available" ? 3600 : 86400;
                                    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
                                    const rawData = r.raw ? JSON.stringify(r.raw) : undefined;

                                    return prisma.cache.upsert({
                                        where: { domain: r.domain.toLowerCase() },
                                        update: {
                                            status: r.status,
                                            source: r.source,
                                            checkedAt: now,
                                            expiresAt,
                                            data: rawData,
                                        },
                                        create: {
                                            domain: r.domain.toLowerCase(),
                                            status: r.status,
                                            source: r.source,
                                            checkedAt: now,
                                            expiresAt,
                                            data: rawData,
                                        },
                                    });
                                });

                            if (ops.length > 0) {
                                await prisma.$transaction(ops);
                            }
                        } catch (err) {
                            console.error("Batch save error:", err);
                        } finally {
                            flushInFlight = null;
                        }
                    })();

                    return flushInFlight;
                };

                // --- SSE sender ---
                const send = (type: string, data: unknown) => {
                    try {
                        controller.enqueue(
                            encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`)
                        );
                    } catch {
                        queue.stop();
                    }
                };

                send("start", { total: domains.length });

                queue.on("result", (result: CheckResult) => {
                    send("result", result);

                    // Only persist fresh RDAP checks (cache results already have TTL)
                    if (result.source === "rdap") {
                        batch.push(result);
                        if (batch.length >= BATCH_SIZE) {
                            void flushBatch();
                        }
                    }
                });

                queue.on("progress", (stats) => {
                    send("progress", stats);
                });

                queue.on("done", async () => {
                    await flushBatch();
                    send("done", {});
                    try {
                        controller.close();
                    } catch { }
                });

                queue.on("error", async (err: unknown) => {
                    send("error", { error: err instanceof Error ? err.message : "Unknown error" });
                    await flushBatch();
                    try {
                        controller.close();
                    } catch { }
                });

                // Stop queue on client disconnect
                request.signal?.addEventListener("abort", () => {
                    queue.stop();
                });

                queue.start();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
                // Helps some proxies avoid buffering:
                "X-Accel-Buffering": "no",
            },
        });
    } catch (error) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
