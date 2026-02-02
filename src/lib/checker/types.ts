/**
 * Domain Status Types
 */
export type DomainStatus = "available" | "taken" | "unknown";

export interface CheckResult {
    domain: string;
    status: DomainStatus;
    confidence: number;
    source: "rdap" | "cache";
    responseMs: number;
    raw?: Record<string, unknown>;
    error?: string;
}

export interface CheckerOptions {
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
}
