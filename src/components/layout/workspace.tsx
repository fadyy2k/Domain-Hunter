"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface WorkspaceProps {
    children: React.ReactNode;
    className?: string;
}

export function Workspace({ children, className }: WorkspaceProps) {
    return (
        <main
            className={cn(
                "min-h-screen pl-16 lg:pl-60 transition-all duration-200",
                className
            )}
        >
            <div className="container mx-auto py-6 px-4 lg:px-8 max-w-7xl">
                {children}
            </div>
        </main>
    );
}
