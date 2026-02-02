import { getRdapBaseUrl } from "./bootstrap";

export interface RdapFetchResult {
    statusCode: number;
    responseMs: number;
    raw?: Record<string, unknown>;
    error?: string;
}

/**
 * Fetch a single domain from RDAP
 */
export async function fetchRdap(domain: string, timeoutMs: number = 2500): Promise<RdapFetchResult> {
    const start = Date.now();
    const parts = domain.split(".");
    if (parts.length < 2) {
        return { statusCode: 400, responseMs: 0, error: "Invalid domain" };
    }
    const tld = parts[parts.length - 1];

    try {
        const baseUrl = await getRdapBaseUrl(tld);
        // baseUrl is expected to end in "domain/" based on bootstrap.ts
        const url = `${baseUrl}${domain}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(url, {
            headers: { Accept: "application/rdap+json, application/json" },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const responseMs = Date.now() - start;

        let raw: Record<string, unknown> | undefined;
        // Only parse JSON if we might care about the body (200 OK)
        if (res.status === 200) {
            try {
                raw = await res.json();
            } catch {
                // ignore json parse error
            }
        }

        return {
            statusCode: res.status,
            responseMs,
            raw
        };

    } catch (err: unknown) {
        const responseMs = Date.now() - start;
        const msg = err instanceof Error ? err.message : String(err);

        // Timeout handling
        if (msg.includes("abort") || (err instanceof Error && err.name === "AbortError")) {
            return { statusCode: 408, responseMs, error: "Timeout" };
        }

        return { statusCode: 500, responseMs, error: msg };
    }
}
