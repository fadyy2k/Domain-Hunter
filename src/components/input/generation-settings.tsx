"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface GeneratorConfig {
    minLength: number;
    maxLength: number;
    useInitials: boolean;
    useJoined: boolean;
    useFirstLast: boolean;
    useDevowel: boolean;
    useChunking: boolean;
    usePhonetic: boolean;
    usePrefixes: boolean;
    useSuffixes: boolean;
    useHyphens: boolean;
    excludeDigits: boolean;
    excludeDoubleLetters: boolean;
    blacklist: string[];
}

interface GenerationSettingsProps {
    config: GeneratorConfig;
    onChange: (config: GeneratorConfig) => void;
    className?: string;
}

// Default config - prefixes/suffixes ON by default for better results
export const defaultConfig: GeneratorConfig = {
    minLength: 3,
    maxLength: 15,
    useInitials: true,
    useJoined: true,
    useFirstLast: true,
    useDevowel: true,
    useChunking: true,
    usePhonetic: true,
    usePrefixes: true,
    useSuffixes: true,
    useHyphens: true,
    excludeDigits: true,
    excludeDoubleLetters: false,
    blacklist: [],
};

// Strategy descriptions for tooltips
const STRATEGY_DESCRIPTIONS: Record<string, string> = {
    useInitials: "Creates initials from words. Example: 'tech startup' → 'ts', 'tsu'",
    useJoined: "Combines words together. Example: 'tech startup' → 'techstartup'",
    useFirstLast: "Uses first and last word. Example: 'my tech startup' → 'mystartup'",
    useDevowel: "Removes vowels for shorter names. Example: 'tech' → 'tch', 'autocare' → 'atcr'",
    useChunking: "First 3-4 letters of each word. Example: 'technology' → 'tec', 'tech'",
    usePhonetic: "Sound-alike patterns. Example: 'quick' → 'kwik', 'cool' → 'kool'",
};

export function GenerationSettings({
    config,
    onChange,
    className,
}: GenerationSettingsProps) {
    const [expanded, setExpanded] = React.useState(true); // Default expanded
    const [blacklistInput, setBlacklistInput] = React.useState(
        config.blacklist.join(", ")
    );

    const updateConfig = <K extends keyof GeneratorConfig>(
        key: K,
        value: GeneratorConfig[K]
    ) => {
        onChange({ ...config, [key]: value });
    };

    const handleBlacklistChange = (value: string) => {
        setBlacklistInput(value);
        const words = value
            .split(",")
            .map((w) => w.trim().toLowerCase())
            .filter(Boolean);
        updateConfig("blacklist", words);
    };

    return (
        <div className={cn("space-y-4", className)}>
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between w-full py-2 text-sm font-medium text-left hover:text-primary transition-colors"
            >
                <span>Generation Settings</span>
                {expanded ? (
                    <ChevronUp className="h-4 w-4" />
                ) : (
                    <ChevronDown className="h-4 w-4" />
                )}
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-6 py-4 border-t border-border/50">
                            {/* Length Range */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Domain Length</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {config.minLength} - {config.maxLength} chars
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-muted-foreground w-6">
                                        {config.minLength}
                                    </span>
                                    <Slider
                                        value={[config.minLength, config.maxLength]}
                                        min={2}
                                        max={20}
                                        step={1}
                                        onValueChange={([min, max]) => {
                                            updateConfig("minLength", min);
                                            updateConfig("maxLength", max);
                                        }}
                                        className="flex-1"
                                    />
                                    <span className="text-xs text-muted-foreground w-6">
                                        {config.maxLength}
                                    </span>
                                </div>
                            </div>

                            {/* Strategies with Tooltips */}
                            <div className="space-y-3">
                                <Label className="text-sm">Generation Strategies</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { key: "useInitials" as const, label: "Initials" },
                                        { key: "useJoined" as const, label: "Joined" },
                                        { key: "useFirstLast" as const, label: "First+Last" },
                                        { key: "useDevowel" as const, label: "Devowel" },
                                        { key: "useChunking" as const, label: "Chunking" },
                                        { key: "usePhonetic" as const, label: "Phonetic" },
                                    ].map(({ key, label }) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <Label htmlFor={key} className="text-xs">
                                                    {label}
                                                </Label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="max-w-xs">
                                                        <p className="text-xs">{STRATEGY_DESCRIPTIONS[key]}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Switch
                                                id={key}
                                                checked={config[key]}
                                                onCheckedChange={(checked) => updateConfig(key, checked)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Affixes + Hyphen Toggle */}
                            <div className="space-y-3">
                                <Label className="text-sm">Affixes & Separators</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <Label htmlFor="prefixes" className="text-xs">
                                                Prefixes (get, try, go...)
                                            </Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">Add common prefixes like get, try, my, go</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <Switch
                                            id="prefixes"
                                            checked={config.usePrefixes}
                                            onCheckedChange={(checked) =>
                                                updateConfig("usePrefixes", checked)
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <Label htmlFor="suffixes" className="text-xs">
                                                Suffixes (app, hq, pro...)
                                            </Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">Add common suffixes like app, hq, pro, hub</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <Switch
                                            id="suffixes"
                                            checked={config.useSuffixes}
                                            onCheckedChange={(checked) =>
                                                updateConfig("useSuffixes", checked)
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between col-span-2">
                                        <div className="flex items-center gap-1">
                                            <Label htmlFor="hyphens" className="text-xs">
                                                Use Hyphens (tech-startup)
                                            </Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">Generate hyphenated variants like auto-care, tech-hub</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <Switch
                                            id="hyphens"
                                            checked={config.useHyphens}
                                            onCheckedChange={(checked) =>
                                                updateConfig("useHyphens", checked)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="space-y-3">
                                <Label className="text-sm">Filters</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="noDigits" className="text-xs">
                                            Exclude Digits
                                        </Label>
                                        <Switch
                                            id="noDigits"
                                            checked={config.excludeDigits}
                                            onCheckedChange={(checked) =>
                                                updateConfig("excludeDigits", checked)
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="noDouble" className="text-xs">
                                            No Double Letters
                                        </Label>
                                        <Switch
                                            id="noDouble"
                                            checked={config.excludeDoubleLetters}
                                            onCheckedChange={(checked) =>
                                                updateConfig("excludeDoubleLetters", checked)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Blacklist */}
                            <div className="space-y-2">
                                <Label className="text-sm">Blacklist Words</Label>
                                <Input
                                    placeholder="Comma-separated words to exclude..."
                                    value={blacklistInput}
                                    onChange={(e) => handleBlacklistChange(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Domains containing these words will be filtered out
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
