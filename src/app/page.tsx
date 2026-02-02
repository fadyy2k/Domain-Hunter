"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/components/layout/workspace";
import {
    PhraseInput,
    TldSelector,
    GenerationSettings,
    CheckingModeSelector,
    defaultConfig,
    type GeneratorConfig,
    type CheckingMode,
} from "@/components/input";
import {
    ResultsTable,
    ExportActions,
    CheckProgress,
    type DomainResult,
} from "@/components/results";

interface GenerateResponse {
    success: boolean;
    data: {
        domains: Array<{
            domain: string;
            name: string;
            tld: string;
            score: number;
        }>;
        stats: {
            totalGenerated: number;
            totalAfterFilters: number;
            totalWithTlds: number;
        };
    };
}

interface CheckSSEEvent {
    type: "start" | "progress" | "result" | "done" | "error" | "message";

    // result fields
    domain?: string;
    status?: string;
    confidence?: number;
    source?: string;
    responseMs?: number;
    raw?: unknown;
    error?: string;

    // progress fields
    total?: number;
    checked?: number;
    available?: number;
    taken?: number;
    unknown?: number;
}

type ProgressState = {
    total: number;
    checked: number;
    available: number;
    taken: number;
    unknown: number;
    errors: number;
    isRunning: boolean;
    isPaused: boolean;
};

const initialProgress: ProgressState = {
    total: 0,
    checked: 0,
    available: 0,
    taken: 0,
    unknown: 0,
    errors: 0,
    isRunning: false,
    isPaused: false,
};

function safeParseSSEChunk(
    bufferRef: { current: string },
    chunk: string
): CheckSSEEvent[] {
    bufferRef.current += chunk;

    const out: CheckSSEEvent[] = [];

    // SSE events end with double newline
    let idx: number;
    while ((idx = bufferRef.current.indexOf("\n\n")) !== -1) {
        const rawEvent = bufferRef.current.slice(0, idx);
        bufferRef.current = bufferRef.current.slice(idx + 2);

        // Ignore empty events
        if (!rawEvent.trim()) continue;

        const lines = rawEvent.split("\n");
        const eventLine = lines.find((l) => l.startsWith("event:"));
        const dataLines = lines.filter((l) => l.startsWith("data:"));

        const type = eventLine ? eventLine.slice(6).trim() : "message";
        const dataStr = dataLines.map((l) => l.slice(5).trim()).join("");

        if (!dataStr) continue;

        try {
            const payload = JSON.parse(dataStr) as Record<string, unknown>;
            out.push({
                type: type as CheckSSEEvent["type"],
                ...payload,
            });
        } catch (e) {
            // If JSON parse fails, keep going—do not crash the stream loop
            console.error("SSE JSON parse error:", e, dataStr);
        }
    }

    return out;
}

export default function GeneratorPage() {
    // Input state
    const [phrases, setPhrases] = React.useState("");
    const [tlds, setTlds] = React.useState(["com", "io", "co", "ai"]);
    const [config, setConfig] = React.useState<GeneratorConfig>(defaultConfig);
    const [checkMode, setCheckMode] = React.useState<CheckingMode>("rdap");

    // Results state - Map for O(1) updates
    const [resultsMap, setResultsMap] = React.useState<Map<string, DomainResult>>(
        new Map()
    );
    const [selectedDomains, setSelectedDomains] = React.useState<string[]>([]);
    const [favorites, setFavorites] = React.useState<Set<string>>(new Set());

    // Progress
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [isChecking, setIsChecking] = React.useState(false);
    const [progress, setProgress] = React.useState<ProgressState>(initialProgress);

    const abortControllerRef = React.useRef<AbortController | null>(null);

    // Derived array for table
    const resultsArray = React.useMemo(
        () => Array.from(resultsMap.values()),
        [resultsMap]
    );

    const resetProgress = React.useCallback(() => {
        setProgress(initialProgress);
    }, []);

    const handleGenerate = React.useCallback(async () => {
        if (!phrases.trim()) return;

        setIsGenerating(true);

        // Clear previous results
        setResultsMap(new Map());
        setSelectedDomains([]);
        resetProgress();

        try {
            const phraseList = phrases
                .split("\n")
                .map((p) => p.trim())
                .filter(Boolean);

            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phrases: phraseList,
                    tlds,
                    settings: config,
                }),
            });

            if (!response.ok) {
                throw new Error("Generation failed");
            }

            const data: GenerateResponse = await response.json();

            const newMap = new Map<string, DomainResult>();
            for (const d of data.data.domains) {
                newMap.set(d.domain, {
                    domain: d.domain,
                    name: d.name,
                    tld: d.tld,
                    status: "pending",
                    score: d.score,
                    favorite: favorites.has(d.domain),
                });
            }

            setResultsMap(newMap);

            if (newMap.size > 0) {
                await handleCheck(Array.from(newMap.keys()));
            }
        } catch (error) {
            console.error("Generate error:", error);
        } finally {
            setIsGenerating(false);
        }
    }, [phrases, tlds, config, favorites, resetProgress]);

    const handleCheck = React.useCallback(
        async (domainsToCheck: string[]) => {
            setIsChecking(true);
            setProgress({
                total: domainsToCheck.length,
                checked: 0,
                available: 0,
                taken: 0,
                unknown: 0,
                errors: 0,
                isRunning: true,
                isPaused: false,
            });

            // Abort previous check if any
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            const decoder = new TextDecoder();
            const bufferRef = { current: "" };

            try {
                const response = await fetch("/api/check", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "text/event-stream",
                    },
                    body: JSON.stringify({
                        domains: domainsToCheck,
                        mode: checkMode,
                        concurrency: 60,
                    }),
                    signal: abortControllerRef.current.signal,
                });

                if (!response.ok || !response.body) {
                    throw new Error("Check request failed");
                }

                const reader = response.body.getReader();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    if (!value) continue;

                    const chunk = decoder.decode(value, { stream: true });

                    const updates = safeParseSSEChunk(bufferRef, chunk);
                    if (updates.length === 0) continue;

                    // Apply result updates in one Map clone per chunk
                    setResultsMap((prev) => {
                        let changed = false;
                        const next = new Map(prev);

                        for (const update of updates) {
                            if (update.type === "result" && update.domain) {
                                const existing = next.get(update.domain);
                                if (!existing) continue;

                                const newStatus =
                                    (update.status as DomainResult["status"]) || "unknown";

                                next.set(update.domain, {
                                    ...existing,
                                    status: newStatus,
                                    error: update.error,
                                });
                                changed = true;
                            }
                        }

                        return changed ? next : prev;
                    });

                    // Apply latest progress update (don’t mutate updates)
                    const lastProgress = [...updates]
                        .reverse()
                        .find((u) => u.type === "progress");

                    if (lastProgress) {
                        setProgress((p) => ({
                            ...p,
                            checked: lastProgress.checked ?? p.checked,
                            available: lastProgress.available ?? p.available,
                            taken: lastProgress.taken ?? p.taken,
                            unknown: lastProgress.unknown ?? p.unknown,
                            total: lastProgress.total ?? p.total,
                        }));
                    }

                    // Track server errors if any
                    const lastError = [...updates].reverse().find((u) => u.type === "error");
                    if (lastError?.error) {
                        setProgress((p) => ({ ...p, errors: p.errors + 1 }));
                    }

                    const doneEvent = updates.find((u) => u.type === "done");
                    if (doneEvent) break;
                }
            } catch (error) {
                const err = error as { name?: string };
                if (err?.name !== "AbortError") {
                    console.error("Check error:", error);
                }
            } finally {
                setIsChecking(false);
                setProgress((p) => ({ ...p, isRunning: false }));
            }
        },
        [checkMode]
    );

    const handleToggleFavorite = React.useCallback((domain: string) => {
        setFavorites((prev) => {
            const next = new Set(prev);
            if (next.has(domain)) next.delete(domain);
            else next.add(domain);
            return next;
        });

        setResultsMap((prev) => {
            const next = new Map(prev);
            const item = next.get(domain);
            if (item) {
                next.set(domain, { ...item, favorite: !item.favorite });
            }
            return next;
        });
    }, []);

    const handleCopyDomain = React.useCallback((domain: string) => {
        void navigator.clipboard.writeText(domain);
    }, []);

    const canGenerate = phrases.trim().length > 0 && tlds.length > 0;

    return (
        <Workspace className="h-full flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Domain Generator</h1>
                    <p className="text-sm text-muted-foreground">
                        Generate and check domain availability instantly
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <ExportActions results={resultsArray} selectedDomains={selectedDomains} />

                    <Button
                        variant="glow"
                        onClick={handleGenerate}
                        disabled={!canGenerate || isGenerating || isChecking}
                        className="gap-2"
                    >
                        {isGenerating || isChecking ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {isGenerating ? "Generating..." : "Checking..."}
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Generate & Check
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Input Panel */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-6 space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PhraseInput value={phrases} onChange={setPhrases} />
                    <TldSelector selected={tlds} onChange={setTlds} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GenerationSettings config={config} onChange={setConfig} />
                    <CheckingModeSelector mode={checkMode} onChange={setCheckMode} />
                </div>
            </motion.div>

            {/* Progress */}
            {resultsArray.length > 0 && (
                <CheckProgress
                    {...progress}
                    onPause={() => setProgress((p) => ({ ...p, isPaused: true }))}
                    onResume={() => setProgress((p) => ({ ...p, isPaused: false }))}
                />
            )}

            {/* Results */}
            <div className="flex-1 min-h-0">
                <ResultsTable
                    results={resultsArray}
                    isLoading={isGenerating}
                    onToggleFavorite={handleToggleFavorite}
                    onCopyDomain={handleCopyDomain}
                    onSelectDomains={setSelectedDomains}
                    selectedDomains={selectedDomains}
                />
            </div>
        </Workspace>
    );
}
