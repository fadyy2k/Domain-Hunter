"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type CheckingMode = "rdap" | "enhanced";

interface CheckingModeProps {
    mode: CheckingMode;
    onChange: (mode: CheckingMode) => void;
    hasApiKeys?: boolean;
    className?: string;
}

export function CheckingModeSelector({
    mode,
    onChange,
    hasApiKeys = false,
    className,
}: CheckingModeProps) {
    return (
        <div className={cn("space-y-3", className)}>
            <Label className="text-sm font-medium">Checking Mode</Label>

            <div className="grid grid-cols-2 gap-3">
                {/* RDAP Only */}
                <button
                    onClick={() => onChange("rdap")}
                    className={cn(
                        "relative flex flex-col items-start gap-1 p-4 rounded-lg border transition-all",
                        mode === "rdap"
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-muted-foreground/50"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                                mode === "rdap" ? "border-primary" : "border-muted-foreground"
                            )}
                        >
                            {mode === "rdap" && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                        </div>
                        <span className="font-medium text-sm">RDAP Only</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                        Free, no API keys needed. Shows availability status.
                    </p>
                </button>

                {/* Enhanced */}
                <button
                    onClick={() => hasApiKeys && onChange("enhanced")}
                    disabled={!hasApiKeys}
                    className={cn(
                        "relative flex flex-col items-start gap-1 p-4 rounded-lg border transition-all",
                        mode === "enhanced"
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border",
                        hasApiKeys
                            ? "hover:border-muted-foreground/50"
                            : "opacity-50 cursor-not-allowed"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                                mode === "enhanced" ? "border-primary" : "border-muted-foreground"
                            )}
                        >
                            {mode === "enhanced" && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                        </div>
                        <span className="font-medium text-sm">Enhanced</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                        {hasApiKeys
                            ? "Uses registrar APIs for price & premium info."
                            : "Configure API keys in Settings to enable."}
                    </p>
                </button>
            </div>
        </div>
    );
}
