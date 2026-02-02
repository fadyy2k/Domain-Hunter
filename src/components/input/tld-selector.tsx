"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Expanded TLD list with categories
const PRESET_TLDS = [
    // Popular - always shown first
    { tld: "com", label: ".com", category: "popular" },
    { tld: "io", label: ".io", category: "popular" },
    { tld: "co", label: ".co", category: "popular" },
    { tld: "ai", label: ".ai", category: "popular" },
    { tld: "app", label: ".app", category: "popular" },
    { tld: "dev", label: ".dev", category: "popular" },

    // Tech
    { tld: "tech", label: ".tech", category: "tech" },
    { tld: "cloud", label: ".cloud", category: "tech" },
    { tld: "software", label: ".software", category: "tech" },
    { tld: "digital", label: ".digital", category: "tech" },
    { tld: "online", label: ".online", category: "tech" },
    { tld: "systems", label: ".systems", category: "tech" },

    // Classic
    { tld: "net", label: ".net", category: "classic" },
    { tld: "org", label: ".org", category: "classic" },
    { tld: "info", label: ".info", category: "classic" },
    { tld: "biz", label: ".biz", category: "classic" },

    // Business
    { tld: "company", label: ".company", category: "business" },
    { tld: "agency", label: ".agency", category: "business" },
    { tld: "solutions", label: ".solutions", category: "business" },
    { tld: "services", label: ".services", category: "business" },

    // Short & Trendy
    { tld: "xyz", label: ".xyz", category: "trendy" },
    { tld: "me", label: ".me", category: "trendy" },
    { tld: "gg", label: ".gg", category: "trendy" },
    { tld: "sh", label: ".sh", category: "trendy" },
    { tld: "so", label: ".so", category: "trendy" },
    { tld: "to", label: ".to", category: "trendy" },

    // E-commerce
    { tld: "store", label: ".store", category: "ecommerce" },
    { tld: "shop", label: ".shop", category: "ecommerce" },
    { tld: "market", label: ".market", category: "ecommerce" },

    // Creative
    { tld: "design", label: ".design", category: "creative" },
    { tld: "studio", label: ".studio", category: "creative" },
    { tld: "media", label: ".media", category: "creative" },

    // Country codes
    { tld: "us", label: ".us", category: "country" },
    { tld: "uk", label: ".uk", category: "country" },
    { tld: "de", label: ".de", category: "country" },
    { tld: "ca", label: ".ca", category: "country" },
    { tld: "au", label: ".au", category: "country" },
    { tld: "eu", label: ".eu", category: "country" },
];

const CATEGORY_LABELS: Record<string, string> = {
    popular: "Popular",
    tech: "Tech",
    classic: "Classic",
    business: "Business",
    trendy: "Short & Trendy",
    ecommerce: "E-commerce",
    creative: "Creative",
    country: "Country",
};

interface TldSelectorProps {
    selected: string[];
    onChange: (tlds: string[]) => void;
    className?: string;
}

export function TldSelector({ selected, onChange, className }: TldSelectorProps) {
    const [customTld, setCustomTld] = React.useState("");
    const [showAll, setShowAll] = React.useState(false);

    const toggleTld = (tld: string) => {
        if (selected.includes(tld)) {
            onChange(selected.filter((t) => t !== tld));
        } else {
            onChange([...selected, tld]);
        }
    };

    const addCustomTld = () => {
        const clean = customTld.replace(/^\./, "").toLowerCase().trim();
        if (clean && !selected.includes(clean)) {
            onChange([...selected, clean]);
            setCustomTld("");
        }
    };

    const removeCustomTld = (tld: string) => {
        onChange(selected.filter((t) => t !== tld));
    };

    const selectAll = () => {
        const allTlds = PRESET_TLDS.map(t => t.tld);
        onChange([...new Set([...selected, ...allTlds])]);
    };

    const clearAll = () => {
        onChange([]);
    };

    const customTlds = selected.filter(
        (tld) => !PRESET_TLDS.some((p) => p.tld === tld)
    );

    // Group by category
    const categories = showAll
        ? Object.keys(CATEGORY_LABELS)
        : ["popular"];

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">TLD Extensions</Label>
                <div className="flex items-center gap-2">
                    <button
                        onClick={selectAll}
                        className="text-xs text-primary hover:underline"
                    >
                        All
                    </button>
                    <span className="text-xs text-muted-foreground">|</span>
                    <button
                        onClick={clearAll}
                        className="text-xs text-muted-foreground hover:text-primary"
                    >
                        Clear
                    </button>
                    <span className="text-xs text-muted-foreground ml-2">
                        {selected.length} selected
                    </span>
                </div>
            </div>

            {/* TLD Categories */}
            {categories.map((category) => (
                <div key={category} className="space-y-1">
                    {showAll && (
                        <p className="text-xs text-muted-foreground font-medium">
                            {CATEGORY_LABELS[category]}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {PRESET_TLDS.filter((t) => t.category === category).map(({ tld, label }) => (
                            <Badge
                                key={tld}
                                variant={selected.includes(tld) ? "default" : "outline"}
                                className={cn(
                                    "cursor-pointer transition-all hover:scale-105",
                                    selected.includes(tld) && "bg-primary"
                                )}
                                onClick={() => toggleTld(tld)}
                            >
                                {label}
                            </Badge>
                        ))}
                    </div>
                </div>
            ))}

            {/* Show More / Less */}
            <button
                onClick={() => setShowAll(!showAll)}
                className="text-xs text-primary hover:underline"
            >
                {showAll ? "Show Less" : `Show All (${PRESET_TLDS.length} TLDs)`}
            </button>

            {/* Custom TLDs */}
            {customTlds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {customTlds.map((tld) => (
                        <Badge
                            key={tld}
                            variant="secondary"
                            className="gap-1"
                        >
                            .{tld}
                            <X
                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                onClick={() => removeCustomTld(tld)}
                            />
                        </Badge>
                    ))}
                </div>
            )}

            {/* Add Custom TLD */}
            <div className="flex gap-2">
                <Input
                    placeholder="Add custom TLD..."
                    value={customTld}
                    onChange={(e) => setCustomTld(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomTld()}
                    className="flex-1"
                />
                <Button
                    variant="outline"
                    size="icon"
                    onClick={addCustomTld}
                    disabled={!customTld.trim()}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
