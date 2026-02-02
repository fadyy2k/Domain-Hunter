"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Globe,
    FolderOpen,
    Settings,
    KeyRound,
    Info,
    Palette,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApiKeysModal } from "@/components/modals/api-keys-modal";

const navItems = [
    { href: "/", icon: Globe, label: "Generator" },
    { href: "/projects", icon: FolderOpen, label: "Projects" },
    { href: "/settings", icon: Settings, label: "Settings" },
    { href: "/about", icon: Info, label: "About" },
];

const themes = [
    { id: "linear", label: "Linear", description: "Deep charcoal + neon edge" },
    { id: "stripe", label: "Stripe", description: "Aurora gradient wash" },
    { id: "notion", label: "Notion", description: "Neutral + soft accent" },
] as const;

export function Sidebar() {
    const [collapsed, setCollapsed] = React.useState(false);
    const [apiKeysOpen, setApiKeysOpen] = React.useState(false);
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();

    return (
        <TooltipProvider delayDuration={0}>
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 64 : 240 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen border-r border-border/50 bg-card/50 backdrop-blur-xl",
                    "flex flex-col"
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
                    <motion.div
                        initial={false}
                        animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                        className="overflow-hidden"
                    >
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <Globe className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-lg gradient-text whitespace-nowrap">
                                DomainHunter
                            </span>
                        </Link>
                    </motion.div>
                    {collapsed && (
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
                            <Globe className="h-5 w-5 text-white" />
                        </div>
                    )}
                </div>

                {/* Navigation - Links */}
                <nav className="flex-1 p-2 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        const button = (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                                <motion.span
                                    initial={false}
                                    animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                                    className="overflow-hidden whitespace-nowrap"
                                >
                                    {item.label}
                                </motion.span>
                            </Link>
                        );

                        if (collapsed) {
                            return (
                                <Tooltip key={item.href}>
                                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                                    <TooltipContent side="right">{item.label}</TooltipContent>
                                </Tooltip>
                            );
                        }

                        return button;
                    })}

                    {/* API Keys Button (Modal Trigger) */}
                    {(() => {
                        const apiKeysButton = (
                            <button
                                onClick={() => setApiKeysOpen(true)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full",
                                    "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <KeyRound className="h-5 w-5 shrink-0" />
                                <motion.span
                                    initial={false}
                                    animate={{
                                        opacity: collapsed ? 0 : 1,
                                        width: collapsed ? 0 : "auto",
                                    }}
                                    className="overflow-hidden whitespace-nowrap"
                                >
                                    API Keys
                                </motion.span>
                            </button>
                        );

                        if (collapsed) {
                            return (
                                <Tooltip>
                                    <TooltipTrigger asChild>{apiKeysButton}</TooltipTrigger>
                                    <TooltipContent side="right">API Keys</TooltipContent>
                                </Tooltip>
                            );
                        }

                        return apiKeysButton;
                    })()}
                </nav>

                {/* Theme Switcher */}
                <div className="p-2 border-t border-border/50">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 px-3",
                                    collapsed && "justify-center px-0"
                                )}
                            >
                                <Palette className="h-5 w-5 shrink-0" />
                                <motion.span
                                    initial={false}
                                    animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                                    className="overflow-hidden whitespace-nowrap"
                                >
                                    Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                </motion.span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="end" className="w-56">
                            {themes.map((t) => (
                                <DropdownMenuItem
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={cn(theme === t.id && "bg-accent/10")}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{t.label}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {t.description}
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Collapse Toggle */}
                <div className="p-2 border-t border-border/50">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCollapsed(!collapsed)}
                        className={cn("w-full", collapsed ? "justify-center" : "justify-end")}
                    >
                        {collapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </motion.aside>

            {/* API Keys Modal */}
            <ApiKeysModal isOpen={apiKeysOpen} onClose={() => setApiKeysOpen(false)} />
        </TooltipProvider>
    );
}
