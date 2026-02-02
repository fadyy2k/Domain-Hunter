/**
 * API Keys Management Route
 * GET /api/keys - Get configured status for each provider
 * POST /api/keys - Save API credentials (encrypted)
 * DELETE /api/keys - Remove API credentials
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { encrypt } from "@/lib/crypto";

// Schema for saving credentials (flexible to accept different provider formats)
const saveKeySchema = z.object({
    provider: z.enum(["namecheap", "godaddy", "cloudflare"]),
    credentials: z.record(z.string()),
});

const deleteKeySchema = z.object({
    provider: z.enum(["namecheap", "godaddy", "cloudflare"]),
});

export async function GET() {
    try {
        const keys = await prisma.apiKey.findMany({
            select: {
                provider: true,
                enabled: true,
            },
        });

        // Build response with configured status only (no secrets returned)
        const configured: Record<string, { configured: boolean }> = {};

        for (const key of keys) {
            configured[key.provider] = {
                configured: key.enabled,
            };
        }

        // Ensure all providers have an entry
        const providers = ["namecheap", "godaddy", "cloudflare"];
        for (const provider of providers) {
            if (!configured[provider]) {
                configured[provider] = { configured: false };
            }
        }

        return NextResponse.json(configured);
    } catch (error) {
        console.error("Keys GET error:", error);
        // Return unconfigured status on error (DB might not be set up)
        return NextResponse.json({
            namecheap: { configured: false },
            godaddy: { configured: false },
            cloudflare: { configured: false },
        });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = saveKeySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { provider, credentials } = parsed.data;

        // Encrypt all credentials as a JSON blob
        const credentialsEnc = encrypt(JSON.stringify(credentials));

        // Extract specific fields for backwards compatibility
        const apiKey = credentials.apiKey || credentials.key || "";
        const apiSecret = credentials.apiSecret || credentials.secret || "";
        const username = credentials.username || credentials.apiUser || "";

        // Encrypt individual fields
        const keyEnc = apiKey ? encrypt(apiKey) : credentialsEnc;
        const secretEnc = apiSecret ? encrypt(apiSecret) : null;

        // Upsert the key
        const key = await prisma.apiKey.upsert({
            where: { provider },
            update: {
                keyEnc,
                secretEnc,
                username,
                enabled: true,
            },
            create: {
                provider,
                keyEnc,
                secretEnc,
                username,
                enabled: true,
            },
        });

        return NextResponse.json({
            success: true,
            provider: key.provider,
            configured: true,
        });
    } catch (error) {
        console.error("Keys POST error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = deleteKeySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { provider } = parsed.data;

        await prisma.apiKey.delete({
            where: { provider },
        });

        return NextResponse.json({
            success: true,
            message: `${provider} API key deleted`,
        });
    } catch (error) {
        console.error("Keys DELETE error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
