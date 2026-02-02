

const RDAP_BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json";
const RDAP_FALLBACK_BASE = "https://rdap.org/domain/";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface BootstrapCache {
    tldMap: Map<string, string>;
    timestamp: number;
}

let cache: BootstrapCache | null = null;

// Known overrides for better performance/reliability
const KNOWN_OVERRIDES: Record<string, string> = {
    com: "https://rdap.verisign.com/com/v1/domain/",
    net: "https://rdap.verisign.com/net/v1/domain/",
    org: "https://rdap.publicinterestregistry.org/rdap/domain/",
    io: "https://rdap.nic.io/domain/",
    co: "https://rdap.nic.co/domain/",
    me: "https://rdap.nic.me/domain/",
    // Add more if needed
};

/**
 * Fetch and parse IANA RDAP bootstrap data
 */
async function fetchBootstrap(): Promise<Map<string, string>> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(RDAP_BOOTSTRAP_URL, {
            signal: controller.signal,
            headers: { Accept: "application/json" },
        });

        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`Bootstrap fetch failed: ${res.status}`);

        const data = await res.json();
        const map = new Map<string, string>();

        if (data.services && Array.isArray(data.services)) {
            for (const [tlds, urls] of data.services) {
                if (Array.isArray(tlds) && Array.isArray(urls) && urls.length > 0) {
                    const baseUrl = urls[0];
                    for (const tld of tlds) {
                        map.set(tld.toLowerCase(), baseUrl);
                    }
                }
            }
        }
        return map;
    } catch (err) {
        console.error("Failed to fetch RDAP bootstrap, utilizing fallbacks", err);
        return new Map();
    }
}

/**
 * Get RDAP base URL for a TLD
 */
export async function getRdapBaseUrl(tld: string): Promise<string> {
    const lowerTld = tld.toLowerCase();

    // 1. Check overrides
    if (KNOWN_OVERRIDES[lowerTld]) return KNOWN_OVERRIDES[lowerTld];

    // 2. Refresh cache if needed
    if (!cache || Date.now() - cache.timestamp > CACHE_TTL_MS) {
        const map = await fetchBootstrap();
        cache = { tldMap: map, timestamp: Date.now() };
    }

    // 3. Check bootstrap cache
    const fromBootstrap = cache?.tldMap.get(lowerTld);
    if (fromBootstrap) {
        // Ensure trailing slash structure for easy appending
        // IANA usually returns "https://rdap.example.com/"
        // helper to normalize: ensure it ends with slash, remove "domain" if we want to add it manually or keep it?
        // Let's standardise on: Base URL includes everything up to the domain parameter.
        // e.g. "https://rdap.verisign.com/com/v1/domain/"
        // But bootstrap returns "https://rdap.verisign.com/com/v1/" probably.

        // IANA spec says urls in bootstrap are base URLs.
        // Common pattern is appending "domain/example.com".
        // Let's check if it ends in "domain/" or just "/"

        let url = fromBootstrap;
        if (!url.endsWith("/")) url += "/";
        if (!url.includes("domain/")) url += "domain/";

        return url;
    }

    // 4. Fallback
    return RDAP_FALLBACK_BASE;
}
