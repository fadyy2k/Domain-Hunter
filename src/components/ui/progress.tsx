"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressProps {
    value: number;
    max?: number;
    className?: string;
    showLabel?: boolean;
    variant?: "default" | "success" | "warning";
}

export function Progress({
    value,
    max = 100,
    className,
    showLabel = false,
    variant = "default",
}: ProgressProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const variantStyles = {
        default: "bg-primary",
        success: "bg-success",
        warning: "bg-warning",
    };

    return (
        <div className={cn("relative", className)}>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div
                    className={cn("h-full rounded-full", variantStyles[variant])}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                />
            </div>
            <AnimatePresence>
                {showLabel && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute right-0 -top-6 text-xs text-muted-foreground"
                    >
                        {Math.round(percentage)}%
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}
