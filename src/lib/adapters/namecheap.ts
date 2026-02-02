/**
 * Namecheap Registrar Adapter
 * https://www.namecheap.com/support/api/methods/domains/check/
 */

import { type RegistrarAdapter, type AvailabilityResult } from "./interface";

interface NamecheapConfig {
    apiUser: string;
    apiKey: string;
    username: string;
    clientIp: string;
    sandbox: boolean;
}

function getConfig(): NamecheapConfig | null {
    const apiUser = process.env.NAMECHEAP_API_USER;
    const apiKey = process.env.NAMECHEAP_API_KEY;
    const username = process.env.NAMECHEAP_USERNAME;
    const clientIp = process.env.NAMECHEAP_CLIENT_IP;

    if (!apiUser || !apiKey || !username || !clientIp) {
        return null;
    }

    return {
        apiUser,
        apiKey,
        username,
        clientIp,
        sandbox: process.env.NAMECHEAP_SANDBOX === "true",
    };
}

function getBaseUrl(sandbox: boolean): string {
    return sandbox
        ? "https://api.sandbox.namecheap.com/xml.response"
        : "https://api.namecheap.com/xml.response";
}

async function parseXmlResponse(xml: string): Promise<Record<string, unknown>> {
    // Simple XML parsing for Namecheap response
    // In production, use a proper XML parser
    const result: Record<string, unknown> = {};

    // Check for errors
    const errorMatch = xml.match(/<Error[^>]*>([\s\S]*?)<\/Error>/);
    if (errorMatch) {
        result.error = errorMatch[1];
        return result;
    }

    // Parse domain check results
    const domainMatch = xml.match(/<DomainCheckResult[^>]*Domain="([^"]*)"[^>]*Available="([^"]*)"[^>]*IsPremiumName="([^"]*)"[^>]*PremiumRegistrationPrice="([^"]*)"[^>]*/);
    if (domainMatch) {
        result.domain = domainMatch[1];
        result.available = domainMatch[2] === "true";
        result.premium = domainMatch[3] === "true";
        result.price = parseFloat(domainMatch[4]) || undefined;
    }

    return result;
}

export const namecheapAdapter: RegistrarAdapter = {
    name: "namecheap",

    isConfigured(): boolean {
        return getConfig() !== null;
    },

    async check(domain: string): Promise<AvailabilityResult> {
        const config = getConfig();

        if (!config) {
            return {
                available: false,
                premium: false,
                source: "namecheap",
                error: "Namecheap API not configured",
            };
        }

        try {
            const url = new URL(getBaseUrl(config.sandbox));
            url.searchParams.set("ApiUser", config.apiUser);
            url.searchParams.set("ApiKey", config.apiKey);
            url.searchParams.set("UserName", config.username);
            url.searchParams.set("ClientIp", config.clientIp);
            url.searchParams.set("Command", "namecheap.domains.check");
            url.searchParams.set("DomainList", domain);

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    Accept: "application/xml",
                },
            });

            if (!response.ok) {
                return {
                    available: false,
                    premium: false,
                    source: "namecheap",
                    error: `HTTP ${response.status}`,
                };
            }

            const xml = await response.text();
            const parsed = await parseXmlResponse(xml);

            if (parsed.error) {
                return {
                    available: false,
                    premium: false,
                    source: "namecheap",
                    error: String(parsed.error),
                };
            }

            return {
                available: Boolean(parsed.available),
                premium: Boolean(parsed.premium),
                price: parsed.price as number | undefined,
                currency: "USD",
                source: "namecheap",
                raw: parsed,
            };
        } catch (error) {
            return {
                available: false,
                premium: false,
                source: "namecheap",
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    },

    async checkBatch(domains: string[]): Promise<AvailabilityResult[]> {
        const config = getConfig();

        if (!config) {
            return domains.map((_domain) => ({
                available: false,
                premium: false,
                source: "namecheap",
                error: "Namecheap API not configured",
            }));
        }

        // Namecheap supports up to 50 domains per request
        const batchSize = 50;
        const results: AvailabilityResult[] = [];

        for (let i = 0; i < domains.length; i += batchSize) {
            const batch = domains.slice(i, i + batchSize);

            try {
                const url = new URL(getBaseUrl(config.sandbox));
                url.searchParams.set("ApiUser", config.apiUser);
                url.searchParams.set("ApiKey", config.apiKey);
                url.searchParams.set("UserName", config.username);
                url.searchParams.set("ClientIp", config.clientIp);
                url.searchParams.set("Command", "namecheap.domains.check");
                url.searchParams.set("DomainList", batch.join(","));

                const response = await fetch(url.toString());
                const xml = await response.text();

                // Parse all results from batch
                const domainRegex = /<DomainCheckResult[^>]*Domain="([^"]*)"[^>]*Available="([^"]*)"[^>]*IsPremiumName="([^"]*)"[^>]*PremiumRegistrationPrice="([^"]*)"[^>]*/g;
                let match;
                const parsedResults = new Map<string, AvailabilityResult>();

                while ((match = domainRegex.exec(xml)) !== null) {
                    parsedResults.set(match[1].toLowerCase(), {
                        available: match[2] === "true",
                        premium: match[3] === "true",
                        price: parseFloat(match[4]) || undefined,
                        currency: "USD",
                        source: "namecheap",
                    });
                }

                for (const domain of batch) {
                    const result = parsedResults.get(domain.toLowerCase());
                    results.push(
                        result || {
                            available: false,
                            premium: false,
                            source: "namecheap",
                            error: "Not found in response",
                        }
                    );
                }
            } catch (error) {
                // Add error results for all domains in failed batch
                for (const _domain of batch) {
                    results.push({
                        available: false,
                        premium: false,
                        source: "namecheap",
                        error: error instanceof Error ? error.message : "Unknown error",
                    });
                }
            }
        }

        return results;
    },
};
