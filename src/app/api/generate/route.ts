/**
 * Generate API Route
 * POST /api/generate - Generate domain candidates from phrases
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateDomains, type GeneratorSettings } from "@/lib/generator";

const generateSchema = z.object({
    phrases: z.array(z.string()).min(1, "At least one phrase is required"),
    tlds: z.array(z.string()).min(1, "At least one TLD is required"),
    settings: z.object({
        minLength: z.number().min(1).max(63).default(3),
        maxLength: z.number().min(1).max(63).default(15),
        useInitials: z.boolean().default(true),
        useJoined: z.boolean().default(true),
        useFirstLast: z.boolean().default(true),
        useDevowel: z.boolean().default(true),
        useChunking: z.boolean().default(true),
        usePhonetic: z.boolean().default(true),
        usePrefixes: z.boolean().default(true),
        useSuffixes: z.boolean().default(true),
        useHyphens: z.boolean().default(true),
        excludeDigits: z.boolean().default(true),
        excludeDoubleLetters: z.boolean().default(false),
        blacklist: z.array(z.string()).optional(),
    }).partial().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = generateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { phrases, tlds, settings } = parsed.data;

        // Generate domain candidates (names without TLDs)
        const result = generateDomains(phrases, settings as Partial<GeneratorSettings>);

        // Combine with TLDs
        const domains: Array<{ domain: string; name: string; tld: string; score: number }> = [];

        // Optimize: For each candidate, create entries for requested TLDs
        for (const candidate of result.candidates) {
            for (const tld of tlds) {
                // Ensure proper dot formatting
                const cleanTld = tld.replace(/^\./, "");
                const domainName = `${candidate.name}.${cleanTld}`;
                domains.push({
                    domain: domainName,
                    name: candidate.name,
                    tld: cleanTld,
                    score: candidate.score,
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                domains,
                stats: {
                    totalGenerated: result.totalGenerated,
                    totalAfterFilters: result.totalAfterFilters,
                    totalWithTlds: domains.length,
                },
            },
        });
    } catch (error) {
        console.error("Generate API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
