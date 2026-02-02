import EventEmitter from "events";
import { checkDomain } from "./checkDomain";
import { type CheckResult, type CheckerOptions } from "./types";
import { getCached } from "./cache";

export interface QueueProgress {
    total: number;
    checked: number;
    available: number;
    taken: number;
    unknown: number;
}

export interface QueueOptions extends CheckerOptions {
    concurrency?: number;
    useCache?: boolean;
    mode?: "rdap" | "enhanced";

    // Throttle knobs (safe defaults)
    progressIntervalMs?: number; // emit progress at most every N ms
    progressEveryN?: number; // emit progress every N results
}

function normalizeDomain(input: string): string {
    return input.trim().toLowerCase();
}

function dedupePreserveOrder(domains: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const d of domains) {
        const n = normalizeDomain(d);
        if (!n) continue;
        if (seen.has(n)) continue;
        seen.add(n);
        out.push(n);
    }
    return out;
}

export class DomainQueue extends EventEmitter {
    private domains: string[];
    private options: Required<
        Pick<
            QueueOptions,
            "concurrency" | "useCache" | "timeout" | "progressIntervalMs" | "progressEveryN"
        >
    > &
        Omit<QueueOptions, "concurrency" | "useCache" | "timeout" | "progressIntervalMs" | "progressEveryN">;

    private activeCount = 0;
    private currentIndex = 0;
    private isRunning = false;
    private isStopped = false;

    private stats: QueueProgress = {
        total: 0,
        checked: 0,
        available: 0,
        taken: 0,
        unknown: 0,
    };

    private lastProgressEmitAt = 0;

    constructor(domains: string[], options: QueueOptions = {}) {
        super();

        const normalized = dedupePreserveOrder(domains);

        this.domains = normalized;

        this.options = {
            concurrency: options.concurrency ?? 60,
            useCache: options.useCache ?? true,
            timeout: options.timeout ?? 2500,

            // throttling defaults
            progressIntervalMs: options.progressIntervalMs ?? 120,
            progressEveryN: options.progressEveryN ?? 25,

            ...options,
        };

        this.stats.total = this.domains.length;
    }

    public start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.isStopped = false;

        // Emit an initial progress snapshot once
        this.emit("progress", { ...this.stats });

        this.processNext();
    }

    public stop() {
        this.isStopped = true;
        this.isRunning = false;
    }

    private processNext() {
        if (this.isStopped) return;

        // done condition
        if (this.currentIndex >= this.domains.length && this.activeCount === 0) {
            this.isRunning = false;
            this.emit("done");
            return;
        }

        const maxConcurrency = this.options.concurrency;

        while (
            this.activeCount < maxConcurrency &&
            this.currentIndex < this.domains.length &&
            !this.isStopped
        ) {
            const domain = this.domains[this.currentIndex];
            this.currentIndex++;
            this.activeCount++;

            void this.checkSingle(domain)
                .catch(() => {
                    // checkSingle already emits unknown, so ignore
                })
                .finally(() => {
                    this.activeCount--;
                    // schedule next tick to avoid deep recursion under heavy load
                    queueMicrotask(() => this.processNext());
                });
        }
    }

    private async checkSingle(domain: string) {
        if (this.isStopped) return;

        try {
            // 1) Cache
            if (this.options.useCache) {
                const cached = await getCached(domain);
                if (cached) {
                    const result: CheckResult = {
                        domain,
                        status: cached.status,
                        confidence: 1,
                        source: "cache",
                        responseMs: 0,
                        raw: cached.data ?? undefined,
                    };
                    this.emitResult(result);
                    return;
                }
            }

            // 2) RDAP check
            const result = await checkDomain(domain, this.options.timeout);
            this.emitResult(result);
        } catch (error) {
            const result: CheckResult = {
                domain,
                status: "unknown",
                confidence: 0,
                source: "rdap",
                responseMs: 0,
                error: error instanceof Error ? error.message : String(error),
            };
            this.emitResult(result);
        }
    }

    private emitResult(result: CheckResult) {
        if (this.isStopped) return;

        this.stats.checked++;
        if (result.status === "available") this.stats.available++;
        else if (result.status === "taken") this.stats.taken++;
        else this.stats.unknown++;

        this.emit("result", result);

        // Throttle progress events to reduce SSE spam + UI thrash
        const now = Date.now();
        const shouldEmitByTime = now - this.lastProgressEmitAt >= this.options.progressIntervalMs;
        const shouldEmitByCount = this.stats.checked % this.options.progressEveryN === 0;

        if (shouldEmitByTime || shouldEmitByCount || this.stats.checked === this.stats.total) {
            this.lastProgressEmitAt = now;
            this.emit("progress", { ...this.stats });
        }
    }
}
