"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface Settings {
    concurrency: number;
    cacheAvailTTL: number;
    cacheTakenTTL: number;
    defaultTlds: string[];
}

const DEFAULT_SETTINGS: Settings = {
    concurrency: 10,
    cacheAvailTTL: 3600,
    cacheTakenTTL: 86400,
    defaultTlds: ["com", "io", "co", "ai", "app", "dev"],
};

export default function SettingsPage() {
    const [settings, setSettings] = React.useState<Settings | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(
        null
    );

    React.useEffect(() => {
        // For now, use default settings since we don't have a settings API
        setSettings(DEFAULT_SETTINGS);
        setIsLoading(false);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);

        try {
            // TODO: Implement settings API
            await new Promise((resolve) => setTimeout(resolve, 500));
            setMessage({ type: "success", text: "Settings saved successfully!" });
        } catch {
            setMessage({ type: "error", text: "Failed to save settings" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setSettings(DEFAULT_SETTINGS);
        setMessage({ type: "success", text: "Settings reset to defaults" });
    };

    if (isLoading) {
        return (
            <div className="flex-1 min-h-screen p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen p-8">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-muted-foreground mb-8">
                        Configure DomainHunter preferences
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="space-y-8"
                >
                    {/* Checking Settings */}
                    <div className="p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-sm">
                        <h2 className="text-lg font-semibold mb-4">Domain Checking</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="concurrency">Concurrency</Label>
                                <Input
                                    id="concurrency"
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={settings?.concurrency || 10}
                                    onChange={(e) =>
                                        setSettings((s) =>
                                            s ? { ...s, concurrency: parseInt(e.target.value) || 10 } : s
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Number of concurrent domain checks (1-50)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Cache Settings */}
                    <div className="p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-sm">
                        <h2 className="text-lg font-semibold mb-4">Cache Settings</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="cacheAvail">Available Domain Cache (seconds)</Label>
                                <Input
                                    id="cacheAvail"
                                    type="number"
                                    min={60}
                                    value={settings?.cacheAvailTTL || 3600}
                                    onChange={(e) =>
                                        setSettings((s) =>
                                            s
                                                ? { ...s, cacheAvailTTL: parseInt(e.target.value) || 3600 }
                                                : s
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    How long to cache &quot;available&quot; results (default: 1 hour)
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cacheTaken">Taken Domain Cache (seconds)</Label>
                                <Input
                                    id="cacheTaken"
                                    type="number"
                                    min={60}
                                    value={settings?.cacheTakenTTL || 86400}
                                    onChange={(e) =>
                                        setSettings((s) =>
                                            s
                                                ? { ...s, cacheTakenTTL: parseInt(e.target.value) || 86400 }
                                                : s
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    How long to cache &quot;taken&quot; results (default: 24 hours)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-lg ${message.type === "success"
                                    ? "bg-success/10 text-success border border-success/30"
                                    : "bg-destructive/10 text-destructive border border-destructive/30"
                                }`}
                        >
                            {message.text}
                        </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Button onClick={handleSave} disabled={isSaving}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? "Saving..." : "Save Settings"}
                        </Button>
                        <Button variant="outline" onClick={handleReset}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset to Defaults
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
