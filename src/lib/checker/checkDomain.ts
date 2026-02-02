import { fetchRdap } from "./rdapClient";
import { type CheckResult, type DomainStatus } from "./types";

/**
 * Check a single domain via RDAP and interpret the result
 */
export async function checkDomain(domain: string, timeoutMs: number = 2500): Promise<CheckResult> {
    const { statusCode, responseMs, raw, error } = await fetchRdap(domain, timeoutMs);
    let status: DomainStatus = "unknown";
    let confidence = 0;

    switch (statusCode) {
        case 200:
            status = "taken";
            confidence = 1; // RDAP 200 is authoritative
            break;
        case 404:
            status = "available";
            confidence = 1; // RDAP 404 is authoritative
            break;
        case 429:
            status = "unknown";
            confidence = 0;
            // 429 is rate limit, we might want to flag this but "unknown" is safe
            break;
        default:
            status = "unknown";
            confidence = 0;
    }

    return {
        domain,
        status,
        confidence,
        source: "rdap",
        responseMs,
        raw: raw, // Pass through raw RDAP data if available (for 200)
        error: error || (status === "unknown" ? `HTTP ${statusCode}` : undefined),
    };
}
