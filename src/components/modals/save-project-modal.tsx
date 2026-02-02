"use client";

import * as React from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { X, Save, Loader2, FolderPlus, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SaveProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => Promise<void>;
    defaultName?: string;
    isUpdate?: boolean;
}

export function SaveProjectModal({
    isOpen,
    onClose,
    onSave,
    defaultName = "",
    isUpdate = false,
}: SaveProjectModalProps) {
    const [name, setName] = React.useState(defaultName);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState("");

    const dragControls = useDragControls();
    const constraintsRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (isOpen) {
            setName(defaultName);
            setError("");
        }
    }, [isOpen, defaultName]);

    const handleSave = async () => {
        if (!name.trim()) {
            setError("Project name is required");
            return;
        }

        setIsSaving(true);
        setError("");

        try {
            await onSave(name.trim());
            onClose();
        } catch {
            setError("Failed to save project");
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !isSaving) {
            handleSave();
        }
        if (e.key === "Escape") {
            onClose();
        }
    };

    if (!isOpen) return null;

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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md z-50"
                        style={{ x: "-50%", y: "-50%" }}
                    >
                        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                            {/* Draggable Header */}
                            <div
                                className="flex items-center justify-between p-6 border-b border-border cursor-move"
                                onPointerDown={(e) => dragControls.start(e)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <FolderPlus className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            {isUpdate ? "Save Project" : "New Project"}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            {isUpdate
                                                ? "Update the project name"
                                                : "Save your current search configuration"}
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

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="projectName">Project Name</Label>
                                    <Input
                                        id="projectName"
                                        placeholder="My Domain Search"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        autoFocus
                                        className={cn(error && "border-destructive")}
                                    />
                                    {error && (
                                        <p className="text-sm text-destructive">{error}</p>
                                    )}
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    {isUpdate
                                        ? "This will save your current phrases, TLDs, and settings."
                                        : "Your phrases, TLDs, and generation settings will be saved."}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    {isUpdate ? "Save Changes" : "Create Project"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
