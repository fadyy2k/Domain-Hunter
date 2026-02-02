/**
 * Domain Generator - Affixes
 * Premium prefix and suffix combinations for brand-worthy domain names
 */

// Modern, trendy prefixes
export const PREFIXES = [
    // Action prefixes
    "get", "try", "go", "use", "buy",
    // Personal prefixes
    "my", "our", "your", "we", "hey",
    // Article prefixes
    "the", "a", "one",
    // Modern/tech prefixes
    "on", "in", "up", "re",
];

// Powerful, brandable suffixes
export const SUFFIXES = [
    // Tech/SaaS
    "app", "hq", "pro", "hub", "io", "ai",
    // Action suffixes  
    "now", "go", "up", "fy", "ify",
    // Entity suffixes
    "lab", "labs", "co", "team", "ly",
    // Product suffixes
    "base", "ware", "kit", "box", "pad",
    // Tech suffixes
    "stack", "cloud", "flow", "sync", "bit",
    // Premium suffixes
    "plus", "max", "prime", "x", "zone",
];

export interface AffixOptions {
    usePrefixes?: boolean;
    useSuffixes?: boolean;
    customPrefixes?: string[];
    customSuffixes?: string[];
}

const defaultOptions: AffixOptions = {
    usePrefixes: true,
    useSuffixes: true,
};

/**
 * Add affixes to base names
 */
export function addAffixes(
    baseNames: string[],
    options: AffixOptions = {}
): string[] {
    const opts = { ...defaultOptions, ...options };
    const results: string[] = [];

    const prefixes = opts.usePrefixes
        ? [...PREFIXES, ...(opts.customPrefixes || [])]
        : opts.customPrefixes || [];

    const suffixes = opts.useSuffixes
        ? [...SUFFIXES, ...(opts.customSuffixes || [])]
        : opts.customSuffixes || [];

    baseNames.forEach((base) => {
        // Original
        results.push(base);

        // With prefixes (limit to avoid explosion)
        prefixes.slice(0, 8).forEach((prefix) => {
            // Avoid double letters at junction
            if (base[0]?.toLowerCase() !== prefix[prefix.length - 1]?.toLowerCase()) {
                results.push(prefix + base);
            }
        });

        // With suffixes (limit to avoid explosion)
        suffixes.slice(0, 10).forEach((suffix) => {
            // Avoid double letters at junction
            if (base[base.length - 1]?.toLowerCase() !== suffix[0]?.toLowerCase()) {
                results.push(base + suffix);
            }
        });
    });

    return results;
}

/**
 * Get all available prefixes
 */
export function getAllPrefixes(custom?: string[]): string[] {
    return [...PREFIXES, ...(custom || [])];
}

/**
 * Get all available suffixes
 */
export function getAllSuffixes(custom?: string[]): string[] {
    return [...SUFFIXES, ...(custom || [])];
}
