/**
 * Health Check API Route
 * GET /api/health - Service health status
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    const start = Date.now();

    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;

        const dbLatency = Date.now() - start;

        return NextResponse.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            checks: {
                database: {
                    status: "ok",
                    latencyMs: dbLatency,
                },
            },
            version: process.env.npm_package_version || "1.0.0",
            environment: process.env.NODE_ENV || "development",
        });
    } catch (error) {
        console.error("Health check failed:", error);

        return NextResponse.json(
            {
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                checks: {
                    database: {
                        status: "error",
                        error: error instanceof Error ? error.message : "Unknown error",
                    },
                },
            },
            { status: 503 }
        );
    }
}
