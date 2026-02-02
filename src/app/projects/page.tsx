"use client";

import * as React from "react";
import { ProjectList, type Project } from "@/components/projects/project-list";
import { SaveProjectModal } from "@/components/modals/save-project-modal";
import { motion } from "framer-motion";

export default function ProjectsPage() {
    const [saveModalOpen, setSaveModalOpen] = React.useState(false);
    const [refreshKey, setRefreshKey] = React.useState(0);

    const handleProjectSaved = async (name: string) => {
        // Create new project via API
        const response = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                phrases: [],
                tlds: ["com", "io", "co"],
                settings: {},
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to create project");
        }

        setRefreshKey((k) => k + 1);
    };

    const handleProjectSelect = (project: Project) => {
        // Navigate to the generator with project loaded
        window.location.href = `/?project=${project.id}`;
    };

    const handleCreateNew = () => {
        setSaveModalOpen(true);
    };

    const handleCloseModal = () => {
        setSaveModalOpen(false);
    };

    return (
        <div className="flex-1 min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold mb-2">Projects</h1>
                    <p className="text-muted-foreground">
                        Save and manage your domain search configurations
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <ProjectList
                        key={refreshKey}
                        onSelectProject={handleProjectSelect}
                        onCreateNew={handleCreateNew}
                        selectedProjectId={undefined}
                    />
                </motion.div>
            </div>

            <SaveProjectModal
                isOpen={saveModalOpen}
                onClose={handleCloseModal}
                onSave={handleProjectSaved}
                defaultName=""
                isUpdate={false}
            />
        </div>
    );
}
