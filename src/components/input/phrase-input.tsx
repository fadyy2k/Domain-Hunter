"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PhraseInputProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function PhraseInput({ value, onChange, className }: PhraseInputProps) {
    const lineCount = value.split("\n").filter((line) => line.trim()).length;
    const charCount = value.length;

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center justify-between">
                <Label htmlFor="phrases" className="text-sm font-medium">
                    Brand Keywords / Phrases
                </Label>
                <span className="text-xs text-muted-foreground">
                    {lineCount} phrase{lineCount !== 1 ? "s" : ""} · {charCount} chars
                </span>
            </div>
            <Textarea
                id="phrases"
                placeholder="Enter brand keywords, one per line...&#10;&#10;Examples:&#10;quick brand solutions&#10;fast payment app&#10;smart home tech"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="min-h-[160px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
                Enter each keyword or phrase on a new line. The generator will create domain variations from each.
            </p>
        </div>
    );
}
