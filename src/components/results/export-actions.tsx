"use client";

import * as React from "react";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { DomainResult } from "./results-table";

interface ExportActionsProps {
    results: DomainResult[];
    selectedDomains?: string[];
    onExport?: (format: "csv" | "json", onlySelected: boolean) => void;
}

export function ExportActions({
    results,
    selectedDomains = [],
    onExport,
}: ExportActionsProps) {
    const hasSelection = selectedDomains.length > 0;
    const exportCount = hasSelection ? selectedDomains.length : results.length;

    const handleExportCSV = (onlySelected: boolean) => {
        const data = onlySelected
            ? results.filter((r) => selectedDomains.includes(r.domain))
            : results;

        const header = "domain,name,tld,status,score,premium,price,currency\n";
        const rows = data
            .map(
                (r) =>
                    `${r.domain},${r.name},${r.tld},${r.status},${r.score},${r.premium || false},${r.price || ""
                    },${r.currency || ""}`
            )
            .join("\n");

        const csv = header + rows;
        downloadFile(csv, "domains.csv", "text/csv");
        onExport?.("csv", onlySelected);
    };

    const handleExportJSON = (onlySelected: boolean) => {
        const data = onlySelected
            ? results.filter((r) => selectedDomains.includes(r.domain))
            : results;

        const json = JSON.stringify(data, null, 2);
        downloadFile(json, "domains.json", "application/json");
        onExport?.("json", onlySelected);
    };

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (results.length === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export {hasSelection && `(${exportCount})`}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportCSV(false)}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export All as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportJSON(false)}>
                    <FileJson className="h-4 w-4 mr-2" />
                    Export All as JSON
                </DropdownMenuItem>
                {hasSelection && (
                    <>
                        <DropdownMenuItem onClick={() => handleExportCSV(true)}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Export Selected as CSV ({selectedDomains.length})
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportJSON(true)}>
                            <FileJson className="h-4 w-4 mr-2" />
                            Export Selected as JSON ({selectedDomains.length})
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
