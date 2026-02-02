"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Play, Pause, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/utils";

interface CheckProgressProps {
    total: number;
    checked: number;
    available: number;
    taken: number;
    unknown: number;
    errors: number;
    isRunning: boolean;
    isPaused: boolean;
    onPause?: () => void;
    onResume?: () => void;
    onStop?: () => void;
    onRecheck?: () => void;
    className?: string;
}

export function CheckProgress({
    total,
    checked,
    available,
    taken,
    unknown,
    errors,
    isRunning,
    isPaused,
    onPause,
    onResume,
    onStop: _onStop,
    onRecheck,
    className,
}: CheckProgressProps) {
    const progress = total > 0 ? Math.round((checked / total) * 100) : 0;
    const isComplete = checked === total && total > 0;

    return (
        <div className={cn("space-y-3", className)}>
            {/* Progress Bar */}
            <div className="flex items-center gap-4">
                <Progress
                    value={progress}
                    variant={isComplete ? "success" : "default"}
                    showLabel
                    className="flex-1"
                />

                <div className="flex items-center gap-2">
                    {isRunning && !isComplete && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={isPaused ? onResume : onPause}
                            className="gap-1"
                        >
                            {isPaused ? (
                                <>
                                    <Play className="h-4 w-4" />
                                    Resume
                                </>
                            ) : (
                                <>
                                    <Pause className="h-4 w-4" />
                                    Pause
                                </>
                            )}
                        </Button>
                    )}

                    {isComplete && errors > 0 && (
                        <Button variant="outline" size="sm" onClick={onRecheck} className="gap-1">
                            <RefreshCw className="h-4 w-4" />
                            Recheck {errors} failed
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
                <StatItem label="Total" value={total} />
                <StatItem label="Checked" value={checked} color="text-foreground" />
                <StatItem label="Available" value={available} color="text-emerald-500" />
                <StatItem label="Taken" value={taken} color="text-rose-500" />
                {unknown > 0 && <StatItem label="Unknown" value={unknown} color="text-yellow-500" />}
                {errors > 0 && <StatItem label="Errors" value={errors} color="text-orange-500" />}
            </div>
        </div>
    );
}

function StatItem({
    label,
    value,
    color = "text-muted-foreground",
}: {
    label: string;
    value: number;
    color?: string;
}) {
    return (
        <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">{label}:</span>
            <motion.span
                key={value}
                initial={{ scale: 1.2, color: "var(--primary)" }}
                animate={{ scale: 1 }}
                className={cn("font-medium tabular-nums", color)}
            >
                {formatNumber(value)}
            </motion.span>
        </div>
    );
}
