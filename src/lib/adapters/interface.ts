/**
 * Registrar Adapter Interface
 * Defines the contract for all registrar integrations
 */

export interface AvailabilityResult {
    available: boolean;
    premium: boolean;
    price?: number;
    currency?: string;
    source: string;
    raw?: Record<string, unknown>;
    error?: string;
}

export interface RegistrarAdapter {
    /**
     * Adapter name (e.g., "namecheap", "godaddy")
     */
    name: string;

    /**
     * Check if the adapter is configured and ready
     */
    isConfigured(): boolean;

    /**
     * Check domain availability
     */
    check(domain: string): Promise<AvailabilityResult>;

    /**
     * Check multiple domains (optional batch optimization)
     */
    checkBatch?(domains: string[]): Promise<AvailabilityResult[]>;
}

/**
 * Adapter registry
 */
const adapters = new Map<string, RegistrarAdapter>();

/**
 * Register an adapter
 */
export function registerAdapter(adapter: RegistrarAdapter): void {
    adapters.set(adapter.name.toLowerCase(), adapter);
}

/**
 * Get an adapter by name
 */
export function getAdapter(name: string): RegistrarAdapter | undefined {
    return adapters.get(name.toLowerCase());
}

/**
 * Get all configured adapters
 */
export function getConfiguredAdapters(): RegistrarAdapter[] {
    return Array.from(adapters.values()).filter((a) => a.isConfigured());
}

/**
 * Get all adapter names
 */
export function getAdapterNames(): string[] {
    return Array.from(adapters.keys());
}
