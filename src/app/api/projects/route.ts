/**
 * Projects API Route
 * GET /api/projects - List all projects
 * POST /api/projects - Create a new project
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const createProjectSchema = z.object({
    name: z.string().min(1).max(100),
    settings: z.record(z.unknown()).optional(),
    phrases: z.array(z.string()),
    tlds: z.array(z.string()),
});

export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                runs: {
                    orderBy: { startedAt: "desc" },
                    take: 1,
                    select: {
                        id: true,
                        status: true,
                        startedAt: true,
                        total: true,
                        available: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: projects.map((p) => ({
                id: p.id,
                name: p.name,
                settings: JSON.parse(p.settings || "{}"),
                phrases: JSON.parse(p.phrases || "[]"),
                tlds: JSON.parse(p.tlds || "[]"),
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                lastRun: p.runs[0] || null,
            })),
        });
    } catch (error) {
        console.error("Projects GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = createProjectSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { name, settings, phrases, tlds } = parsed.data;

        const project = await prisma.project.create({
            data: {
                name,
                settings: JSON.stringify(settings || {}),
                phrases: JSON.stringify(phrases),
                tlds: JSON.stringify(tlds),
            },
        });

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
            },
        });
    } catch (error) {
        console.error("Projects POST error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
