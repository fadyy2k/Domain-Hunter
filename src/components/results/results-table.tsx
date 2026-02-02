"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
    Check,
    X,
    Star,
    ExternalLink,
    Copy,
    ArrowUpDown,
    Crown,
    Search,
    ShoppingCart,
    ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatPrice, REGISTRARS } from "@/lib/pricing";

export interface DomainResult {
    domain: string;
    name: string;
    tld: string;
    status: "pending" | "checking" | "available" | "taken" | "unknown";
    score: number;
    premium?: boolean;
    price?: number;
    currency?: string;
    favorite?: boolean;
    error?: string;
}

interface ResultsTableProps {
    results: DomainResult[];
    isLoading?: boolean;
    onToggleFavorite?: (domain: string) => void;
    onCopyDomain?: (domain: string) => void;
    onSelectDomains?: (domains: string[]) => void;
    selectedDomains?: string[];
    className?: string;
    adapters?: string[];
}

type SortKey = "domain" | "score" | "status" | "price";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "available" | "taken" | "pending" | "unknown";

const ROW_HEIGHT = 56;

// Memoized row component
const ResultRow = React.memo(function ResultRow({
    result,
    isSelected,
    onToggleSelect,
    onToggleFavorite,
    onCopyDomain,
}: {
    result: DomainResult;
    isSelected: boolean;
    onToggleSelect: () => void;
    onToggleFavorite?: () => void;
    onCopyDomain?: () => void;
}) {
    // Only show price if explicitly available from backend
    const showPrice = result.status === "available" && result.price !== undefined;

    const getStatusBadge = () => {
        switch (result.status) {
            case "available":
                return (
                    <Badge variant="available" className="gap-1">
                        <Check className="h-3 w-3" />
                        Available
                    </Badge>
                );
            case "taken":
                return (
                    <Badge variant="taken" className="gap-1">
                        <X className="h-3 w-3" />
                        Taken
                    </Badge>
                );
            case "checking":
                return <Badge variant="outline" className="animate-pulse">Checking...</Badge>;
            case "pending":
                return <Badge variant="outline">Pending</Badge>;
            default:
                return (
                    <Tooltip>
                        <TooltipTrigger>
                            <Badge variant="unknown">Unknown</Badge>
                        </TooltipTrigger>
                        <TooltipContent>{result.error || "Check failed"}</TooltipContent>
                    </Tooltip>
                );
        }
    };

    return (
        <div
            className={cn(
                "flex items-center gap-3 px-4 rounded-lg border transition-all",
                result.status === "available"
                    ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
                    : "border-border/50 hover:border-border hover:bg-muted/30",
                isSelected && "bg-primary/5 border-primary/30"
            )}
            style={{ height: ROW_HEIGHT }}
        >
            <div className="w-6 flex-shrink-0">
                <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} />
            </div>

            {/* Domain Name */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className="font-mono font-medium truncate text-foreground">
                    {result.domain}
                </span>
                {result.premium && (
                    <Tooltip>
                        <TooltipTrigger>
                            <Badge variant="premium" className="gap-1 flex-shrink-0">
                                <Crown className="h-3 w-3" />
                                Premium
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            Premium pricing applies
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>

            {/* Status */}
            <div className="w-24 flex-shrink-0">{getStatusBadge()}</div>

            {/* Price */}
            <div className="w-20 flex-shrink-0 text-right">
                {showPrice ? (
                    <span className="text-sm font-medium text-emerald-500">
                        {formatPrice(result.price!, result.currency)}
                    </span>
                ) : (
                    result.status === "available" && <span className="text-sm text-muted-foreground">—</span>
                )}
            </div>

            {/* Score */}
            <div className="w-14 flex-shrink-0 text-center">
                <div
                    className={cn(
                        "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
                        result.score >= 80
                            ? "bg-emerald-500/10 text-emerald-500"
                            : result.score >= 60
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-muted text-muted-foreground"
                    )}
                >
                    {result.score}
                </div>
            </div>

            {/* Actions */}
            <div className="w-32 flex items-center justify-end gap-1 flex-shrink-0">
                {result.status === "available" && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="default"
                                size="sm"
                                className="h-7 px-2 gap-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                                <ShoppingCart className="h-3 w-3" />
                                Buy
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {REGISTRARS.map((registrar) => (
                                <DropdownMenuItem key={registrar.name} asChild>
                                    <a
                                        href={registrar.url(result.domain)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="cursor-pointer"
                                    >
                                        <ExternalLink className="h-3 w-3 mr-2" />
                                        Buy on {registrar.name}
                                    </a>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onToggleFavorite}
                >
                    <Star
                        className={cn(
                            "h-4 w-4",
                            result.favorite ? "fill-yellow-400 text-yellow-400" : ""
                        )}
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onCopyDomain}
                >
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
});

export function ResultsTable({
    results,
    isLoading = false,
    onToggleFavorite,
    onCopyDomain,
    onSelectDomains,
    selectedDomains = [],
    className,
}: ResultsTableProps) {
    const [sortKey, setSortKey] = React.useState<SortKey>("score");
    const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
    const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
    const [searchQuery, setSearchQuery] = React.useState("");
    const parentRef = React.useRef<HTMLDivElement>(null);

    // Filter and sort - Memoized
    // WARNING: This is O(N log N) inside render. For 5000 items, it's cheap enough (few ms).
    // The issue was DOM thrashing, which virtualizer solves.
    const filteredResults = React.useMemo(() => {
        let filtered = results;

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((r) => r.status === statusFilter);
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((r) =>
                r.domain.toLowerCase().includes(query)
            );
        }

        // Sort
        filtered = [...filtered].sort((a, b) => {
            let compare = 0;
            switch (sortKey) {
                case "domain":
                    compare = a.domain.localeCompare(b.domain);
                    break;
                case "score":
                    compare = a.score - b.score;
                    break;
                case "status":
                    const statusOrder = { available: 0, pending: 1, checking: 2, unknown: 3, taken: 4 };
                    compare = statusOrder[a.status] - statusOrder[b.status];
                    break;
                case "price":
                    compare = (a.price || 0) - (b.price || 0);
                    break;
            }
            return sortOrder === "asc" ? compare : -compare;
        });

        return filtered;
    }, [results, statusFilter, searchQuery, sortKey, sortOrder]);

    const virtualizer = useVirtualizer({
        count: filteredResults.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => ROW_HEIGHT + 8, // Row + margin
        overscan: 5,
    });

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortOrder("desc"); // Default to desc (best/highest first)
        }
    };

    const toggleSelectAll = () => {
        if (selectedDomains.length === filteredResults.length) {
            onSelectDomains?.([]);
        } else {
            onSelectDomains?.(filteredResults.map((r) => r.domain));
        }
    };

    const toggleSelect = (domain: string) => {
        const set = new Set(selectedDomains);
        if (set.has(domain)) set.delete(domain);
        else set.add(domain);
        onSelectDomains?.(Array.from(set));
    };

    const counts = React.useMemo(() => ({
        all: results.length,
        available: results.filter((r) => r.status === "available").length,
        taken: results.filter((r) => r.status === "taken").length,
        pending: results.filter((r) => r.status === "pending" || r.status === "checking").length,
        unknown: results.filter((r) => r.status === "unknown").length,
    }), [results]);

    if (isLoading && results.length === 0) {
        return (
            <div className={cn("space-y-2", className)}>
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className={cn("flex flex-col items-center justify-center py-12 text-center text-muted-foreground", className)}>
                Start by generating some domains!
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col h-full gap-4", className)}>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 p-1">
                {/* ... (Search and filter controls kept similar as needed) ... */}

                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Find in results..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>

                <div className="flex gap-1 bg-muted/20 p-1 rounded-lg">
                    {(["all", "available", "taken", "pending"] as StatusFilter[]).map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                            className="h-7 text-xs capitalize"
                        >
                            {status} <span className="ml-1 opacity-70">{counts[status]}</span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Header Row */}
            <div className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/40 rounded-lg">
                <div className="w-6"><Checkbox checked={selectedDomains.length > 0 && selectedDomains.length === filteredResults.length} onCheckedChange={toggleSelectAll} /></div>
                <div className="flex-1 cursor-pointer hover:text-foreground" onClick={() => toggleSort("domain")}>Domain {sortKey === "domain" && <ArrowUpDown className="inline h-3 w-3" />}</div>
                <div className="w-24 cursor-pointer hover:text-foreground" onClick={() => toggleSort("status")}>Status {sortKey === "status" && <ArrowUpDown className="inline h-3 w-3" />}</div>
                <div className="w-20 text-right cursor-pointer hover:text-foreground" onClick={() => toggleSort("price")}>Price {sortKey === "price" && <ArrowUpDown className="inline h-3 w-3" />}</div>
                <div className="w-14 text-center cursor-pointer hover:text-foreground" onClick={() => toggleSort("score")}>Score {sortKey === "score" && <ArrowUpDown className="inline h-3 w-3" />}</div>
                <div className="w-32 text-right">Actions</div>
            </div>

            {/* List */}
            <div ref={parentRef} className="flex-1 overflow-auto rounded-lg border border-border/40 bg-card/50">
                <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
                    {virtualizer.getVirtualItems().map((virtualRow) => {
                        const result = filteredResults[virtualRow.index];
                        return (
                            <div
                                key={virtualRow.key}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            >
                                <ResultRow
                                    result={result}
                                    isSelected={selectedDomains.includes(result.domain)}
                                    onToggleSelect={() => toggleSelect(result.domain)}
                                    onToggleFavorite={() => onToggleFavorite?.(result.domain)}
                                    onCopyDomain={() => onCopyDomain?.(result.domain)}
                                />
                            </div>
                        );
                    })}
                </div>
                {filteredResults.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">No domains match your filters.</div>
                )}
            </div>
        </div>
    );
}
