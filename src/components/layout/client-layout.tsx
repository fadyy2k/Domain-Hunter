"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface ClientLayoutProps {
    children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
    return (
        <ThemeProvider>
            <QueryProvider>
                <TooltipProvider>
                    <div className="relative flex min-h-screen">
                        <Sidebar />
                        {children}
                    </div>
                </TooltipProvider>
            </QueryProvider>
        </ThemeProvider>
    );
}
