"use client";

import * as React from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
    X,
    KeyRound,
    Check,
    AlertCircle,
    Loader2,
    Eye,
    EyeOff,
    Trash2,
    ExternalLink,
    GripHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ApiKeysModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Provider = "namecheap" | "godaddy" | "cloudflare";

interface ProviderConfig {
    name: string;
    description: string;
    supported: boolean;
    docsUrl: string;
    fields: {
        key: string;
        label: string;
        type: "text" | "password";
        placeholder: string;
        required: boolean;
    }[];
}

const PROVIDERS: Record<Provider, ProviderConfig> = {
    namecheap: {
        name: "Namecheap",
        description: "Get pricing and premium domain information directly from Namecheap.",
        supported: true,
        docsUrl: "https://www.namecheap.com/support/api/intro/",
        fields: [
            {
                key: "apiUser",
                label: "API User",
                type: "text",
                placeholder: "Your Namecheap username",
                required: true,
            },
            {
                key: "apiKey",
                label: "API Key",
                type: "password",
                placeholder: "Your API key from Namecheap",
                required: true,
            },
            {
                key: "username",
                label: "Username",
                type: "text",
                placeholder: "Account username (usually same as API User)",
                required: true,
            },
            {
                key: "clientIp",
                label: "Whitelisted IP",
                type: "text",
                placeholder: "Your server's IP address",
                required: true,
            },
        ],
    },
    godaddy: {
        name: "GoDaddy",
        description: "Check domain availability with GoDaddy's API.",
        supported: true,
        docsUrl: "https://developer.godaddy.com/",
        fields: [
            {
                key: "key",
                label: "API Key",
                type: "password",
                placeholder: "Your GoDaddy API key",
                required: true,
            },
            {
                key: "secret",
                label: "API Secret",
                type: "password",
                placeholder: "Your GoDaddy API secret",
                required: true,
            },
        ],
    },
    cloudflare: {
        name: "Cloudflare",
        description:
            "Cloudflare Registrar requires OAuth authorization flow which is not yet supported.",
        supported: false,
        docsUrl: "https://developers.cloudflare.com/registrar/",
        fields: [],
    },
};

interface ProviderStatus {
    configured: boolean;
    loading: boolean;
    error?: string;
}

export function ApiKeysModal({ isOpen, onClose }: ApiKeysModalProps) {
    const [activeTab, setActiveTab] = React.useState<Provider>("namecheap");
    const [providerStatus, setProviderStatus] = React.useState<
        Record<Provider, ProviderStatus>
    >({
        namecheap: { configured: false, loading: true },
        godaddy: { configured: false, loading: true },
        cloudflare: { configured: false, loading: false },
    });
    const [formData, setFormData] = React.useState<Record<string, string>>({});
    const [showSecrets, setShowSecrets] = React.useState<Record<string, boolean>>({});
    const [isSaving, setIsSaving] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [saveStatus, setSaveStatus] = React.useState<"idle" | "success" | "error">("idle");

    const dragControls = useDragControls();
    const constraintsRef = React.useRef<HTMLDivElement>(null);

    // Fetch provider status on mount
    React.useEffect(() => {
        if (isOpen) {
            fetchProviderStatus();
        }
    }, [isOpen]);

    const fetchProviderStatus = async () => {
        try {
            const response = await fetch("/api/keys");
            if (response.ok) {
                const data = await response.json();
                setProviderStatus({
                    namecheap: {
                        configured: data.namecheap?.configured ?? false,
                        loading: false,
                    },
                    godaddy: {
                        configured: data.godaddy?.configured ?? false,
                        loading: false,
                    },
                    cloudflare: { configured: false, loading: false },
                });
            }
        } catch {
            // Silently fail - status will show as unconfigured
            setProviderStatus({
                namecheap: { configured: false, loading: false },
                godaddy: { configured: false, loading: false },
                cloudflare: { configured: false, loading: false },
            });
        }
    };

    const handleSave = async () => {
        const provider = activeTab;
        const config = PROVIDERS[provider];

        // Validate required fields
        const missingFields = config.fields.filter(
            (f) => f.required && !formData[f.key]?.trim()
        );
        if (missingFields.length > 0) {
            setSaveStatus("error");
            return;
        }

        setIsSaving(true);
        setSaveStatus("idle");

        try {
            const response = await fetch("/api/keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider,
                    credentials: formData,
                }),
            });

            if (response.ok) {
                setSaveStatus("success");
                setFormData({});
                setProviderStatus((prev) => ({
                    ...prev,
                    [provider]: { configured: true, loading: false },
                }));

                // Reset success status after 2 seconds
                setTimeout(() => setSaveStatus("idle"), 2000);
            } else {
                setSaveStatus("error");
            }
        } catch {
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        const provider = activeTab;

        setIsDeleting(true);

        try {
            const response = await fetch("/api/keys", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider }),
            });

            if (response.ok) {
                setProviderStatus((prev) => ({
                    ...prev,
                    [provider]: { configured: false, loading: false },
                }));
                setFormData({});
            }
        } catch {
            // Silently fail
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleShowSecret = (key: string) => {
        setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    if (!isOpen) return null;

    const currentProvider = PROVIDERS[activeTab];
    const currentStatus = providerStatus[activeTab];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                        onClick={onClose}
                        ref={constraintsRef}
                    />

                    {/* Modal - Centered and Draggable */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        drag
                        dragControls={dragControls}
                        dragMomentum={false}
                        dragElastic={0}
                        dragConstraints={constraintsRef}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl z-50"
                        style={{ x: "-50%", y: "-50%" }}
                    >
                        <div className="bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
                            {/* Draggable Header */}
                            <div
                                className="flex items-center justify-between p-6 border-b border-border cursor-move"
                                onPointerDown={(e) => dragControls.start(e)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <KeyRound className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">API Keys</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Configure registrar APIs for enhanced checking
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <GripHorizontal className="h-5 w-5 text-muted-foreground" />
                                    <Button variant="ghost" size="icon" onClick={onClose}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Provider Tabs */}
                            <div className="flex border-b border-border">
                                {(Object.entries(PROVIDERS) as [Provider, ProviderConfig][]).map(
                                    ([key, provider]) => {
                                        const status = providerStatus[key];
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    setActiveTab(key);
                                                    setFormData({});
                                                    setSaveStatus("idle");
                                                }}
                                                className={cn(
                                                    "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
                                                    activeTab === key
                                                        ? "text-foreground"
                                                        : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <span>{provider.name}</span>
                                                    {status.loading ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : status.configured ? (
                                                        <Check className="h-3 w-3 text-emerald-500" />
                                                    ) : !provider.supported ? (
                                                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                                                    ) : null}
                                                </div>
                                                {activeTab === key && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                                    />
                                                )}
                                            </button>
                                        );
                                    }
                                )}
                            </div>

                            {/* Content - Scrollable */}
                            <div className="flex-1 overflow-auto p-6 space-y-6">
                                {/* Provider Description */}
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                                    <AlertCircle
                                        className={cn(
                                            "h-5 w-5 mt-0.5 flex-shrink-0",
                                            currentProvider.supported
                                                ? "text-primary"
                                                : "text-yellow-500"
                                        )}
                                    />
                                    <div className="space-y-1">
                                        <p className="text-sm">{currentProvider.description}</p>
                                        <a
                                            href={currentProvider.docsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                                        >
                                            View documentation
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                {currentProvider.supported && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Status:</span>
                                        {currentStatus.loading ? (
                                            <span className="inline-flex items-center gap-1 text-sm">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Loading...
                                            </span>
                                        ) : currentStatus.configured ? (
                                            <span className="inline-flex items-center gap-1 text-sm text-emerald-500">
                                                <Check className="h-3 w-3" />
                                                Configured
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                                <AlertCircle className="h-3 w-3" />
                                                Not configured
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Form Fields */}
                                {currentProvider.supported && (
                                    <div className="space-y-4">
                                        {currentProvider.fields.map((field) => (
                                            <div key={field.key} className="space-y-2">
                                                <Label htmlFor={field.key}>
                                                    {field.label}
                                                    {field.required && (
                                                        <span className="text-destructive ml-1">*</span>
                                                    )}
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id={field.key}
                                                        type={
                                                            field.type === "password" &&
                                                                !showSecrets[field.key]
                                                                ? "password"
                                                                : "text"
                                                        }
                                                        placeholder={
                                                            currentStatus.configured
                                                                ? "••••••••••••"
                                                                : field.placeholder
                                                        }
                                                        value={formData[field.key] || ""}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                [field.key]: e.target.value,
                                                            }))
                                                        }
                                                        className={cn(
                                                            field.type === "password" && "pr-10"
                                                        )}
                                                    />
                                                    {field.type === "password" && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                            onClick={() => toggleShowSecret(field.key)}
                                                        >
                                                            {showSecrets[field.key] ? (
                                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                            ) : (
                                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Not Supported Message */}
                                {!currentProvider.supported && (
                                    <div className="text-center py-8">
                                        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Not Supported</h3>
                                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                            {currentProvider.name} requires OAuth authorization which
                                            is not yet implemented. Please use RDAP or another
                                            registrar.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {currentProvider.supported && (
                                <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
                                    <div>
                                        {currentStatus.configured && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                )}
                                                Remove Keys
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {saveStatus === "success" && (
                                            <span className="text-sm text-emerald-500 flex items-center gap-1">
                                                <Check className="h-4 w-4" />
                                                Saved successfully
                                            </span>
                                        )}
                                        {saveStatus === "error" && (
                                            <span className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                Failed to save
                                            </span>
                                        )}
                                        <Button variant="outline" onClick={onClose}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSave} disabled={isSaving}>
                                            {isSaving && (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            )}
                                            {currentStatus.configured ? "Update Keys" : "Save Keys"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
