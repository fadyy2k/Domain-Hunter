/**
 * GoDaddy Registrar Adapter
 * https://developer.godaddy.com/doc/endpoint/domains
 */

import { type RegistrarAdapter, type AvailabilityResult } from "./interface";

interface GoDaddyConfig {
    apiKey: string;
    apiSecret: string;
    sandbox: boolean;
}

function getConfig(): GoDaddyConfig | null {
    const apiKey = process.env.GODADDY_API_KEY;
    const apiSecret = process.env.GODADDY_API_SECRET;

    if (!apiKey || !apiSecret) {
        return null;
    }

    return {
        apiKey,
        apiSecret,
        sandbox: process.env.GODADDY_SANDBOX === "true",
    };
}

function getBaseUrl(sandbox: boolean): string {
    return sandbox
        ? "https://api.ote-godaddy.com/v1"
        : "https://api.godaddy.com/v1";
}

interface GoDaddyAvailableResponse {
    available: boolean;
    domain: string;
    definitive: boolean;
    price?: number;
    currency?: string;
    period?: number;
}

export const godaddyAdapter: RegistrarAdapter = {
    name: "godaddy",

    isConfigured(): boolean {
        return getConfig() !== null;
    },

    async check(domain: string): Promise<AvailabilityResult> {
        const config = getConfig();

        if (!config) {
            return {
                available: false,
                premium: false,
                source: "godaddy",
                error: "GoDaddy API not configured",
            };
        }

        try {
            const baseUrl = getBaseUrl(config.sandbox);
            const url = `${baseUrl}/domains/available?domain=${encodeURIComponent(domain)}&checkType=FAST&forTransfer=false`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `sso-key ${config.apiKey}:${config.apiSecret}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                return {
                    available: false,
                    premium: false,
                    source: "godaddy",
                    error: `HTTP ${response.status}: ${errorText}`,
                };
            }

            const data: GoDaddyAvailableResponse = await response.json();

            // Determine if premium (price significantly higher than standard)
            const isPremium = data.price ? data.price > 5000 : false; // $50+ is likely premium

            return {
                available: data.available,
                premium: isPremium,
                price: data.price ? data.price / 100 : undefined, // GoDaddy returns price in cents
                currency: data.currency || "USD",
                source: "godaddy",
                raw: data as unknown as Record<string, unknown>,
            };
        } catch (error) {
            return {
                available: false,
                premium: false,
                source: "godaddy",
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    },

    async checkBatch(domains: string[]): Promise<AvailabilityResult[]> {
        const config = getConfig();

        if (!config) {
            return domains.map(() => ({
                available: false,
                premium: false,
                source: "godaddy",
                error: "GoDaddy API not configured",
            }));
        }

        // GoDaddy doesn't have a batch endpoint in the standard API
        // We need to check domains one by one with rate limiting
        const results: AvailabilityResult[] = [];

        for (const domain of domains) {
            const result = await this.check(domain);
            results.push(result);

            // Small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        return results;
    },
};
