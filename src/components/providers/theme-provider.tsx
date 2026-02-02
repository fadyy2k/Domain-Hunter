"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "linear" | "stripe" | "notion";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("linear");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("domainhunter-theme") as Theme;
        if (savedTheme && ["linear", "stripe", "notion"].includes(savedTheme)) {
            setThemeState(savedTheme);
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            document.documentElement.setAttribute("data-theme", theme);
            localStorage.setItem("domainhunter-theme", theme);
        }
    }, [theme, mounted]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, mounted }}>
            <div className={mounted ? "" : "min-h-screen bg-[hsl(220,16%,6%)]"}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

/**
 * Safe hook for accessing theme context
 * Returns default values during SSR or when outside provider
 */
export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    // Provide safe defaults for SSR and when outside provider
    if (context === undefined) {
        return {
            theme: "linear",
            setTheme: () => { },
            mounted: false,
        };
    }
    return context;
}
