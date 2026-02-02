"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FolderOpen,
    Plus,
    Trash2,
    Clock,
    Globe,
    Loader2,
    MoreVertical,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface Project {
    id: string;
    name: string;
    phrases: string[];
    tlds: string[];
    settings: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    lastRunAt?: string;
    resultCount?: number;
}

interface ProjectListProps {
    onSelectProject: (project: Project) => void;
    onCreateNew: () => void;
    selectedProjectId?: string;
    className?: string;
}

export function ProjectList({
    onSelectProject,
    onCreateNew,
    selectedProjectId,
    className,
}: ProjectListProps) {
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [deletingId, setDeletingId] = React.useState<string | null>(null);

    // Fetch projects on mount
    React.useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/projects");
            if (response.ok) {
                const data = await response.json();
                setProjects(data.data || []);
            }
        } catch {
            // Silently fail
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeletingId(id);
        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setProjects((prev) => prev.filter((p) => p.id !== id));
            }
        } catch {
            // Silently fail
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <div className={cn("flex items-center justify-center py-12", className)}>
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header with New Button */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Saved Projects
                </h3>
                <Button variant="outline" size="sm" onClick={onCreateNew} className="gap-1">
                    <Plus className="h-4 w-4" />
                    New
                </Button>
            </div>

            {/* Projects List */}
            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                        <FolderOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h4 className="text-sm font-medium mb-1">No Projects Yet</h4>
                    <p className="text-xs text-muted-foreground max-w-xs mb-4">
                        Create a project to save your domain search settings and results.
                    </p>
                    <Button onClick={onCreateNew} size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        Create Project
                    </Button>
                </div>
            ) : (
                <AnimatePresence mode="popLayout">
                    <div className="space-y-2">
                        {projects.map((project) => (
                            <motion.div
                                key={project.id}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={cn(
                                    "group relative p-4 rounded-lg border transition-all cursor-pointer",
                                    selectedProjectId === project.id
                                        ? "border-primary/50 bg-primary/5"
                                        : "border-border/50 hover:border-border hover:bg-muted/30"
                                )}
                                onClick={() => onSelectProject(project)}
                            >
                                {/* Project Name */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="font-medium truncate">{project.name}</span>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={(e) => handleDelete(project.id, e)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                {deletingId === project.id ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                )}
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Project Details */}
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Globe className="h-3 w-3" />
                                        {project.tlds?.length || 0} TLDs
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDate(project.updatedAt)}
                                    </span>
                                    {project.resultCount !== undefined && (
                                        <span className="text-primary">
                                            {project.resultCount} results
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
}
