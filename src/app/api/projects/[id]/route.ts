/**
 * Project by ID API Route
 * GET /api/projects/[id] - Get project details
 * PUT /api/projects/[id] - Update project
 * DELETE /api/projects/[id] - Delete project
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const updateProjectSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    settings: z.record(z.unknown()).optional(),
    phrases: z.array(z.string()).optional(),
    tlds: z.array(z.string()).optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                runs: {
                    orderBy: { startedAt: "desc" },
                    include: {
                        results: {
                            where: { favorite: true },
                            select: { domain: true, score: true },
                        },
                    },
                },
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: project.id,
                name: project.name,
                settings: JSON.parse(project.settings || "{}"),
                phrases: JSON.parse(project.phrases || "[]"),
                tlds: JSON.parse(project.tlds || "[]"),
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                runs: project.runs.map((r) => ({
                    id: r.id,
                    status: r.status,
                    startedAt: r.startedAt,
                    endedAt: r.endedAt,
                    total: r.total,
                    checked: r.checked,
                    available: r.available,
                    favorites: r.results.length,
                })),
            },
        });
    } catch (error) {
        console.error("Project GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const parsed = updateProjectSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const updateData: Record<string, string> = {};
        if (parsed.data.name) updateData.name = parsed.data.name;
        if (parsed.data.settings) updateData.settings = JSON.stringify(parsed.data.settings);
        if (parsed.data.phrases) updateData.phrases = JSON.stringify(parsed.data.phrases);
        if (parsed.data.tlds) updateData.tlds = JSON.stringify(parsed.data.tlds);

        const project = await prisma.project.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            data: {
                id: project.id,
                name: project.name,
                updatedAt: project.updatedAt,
            },
        });
    } catch (error) {
        console.error("Project PUT error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.project.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Project deleted",
        });
    } catch (error) {
        console.error("Project DELETE error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
