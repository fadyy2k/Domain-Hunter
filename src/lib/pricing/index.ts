/**
 * Domain Pricing Module
 * Provides registrar links and formatting.
 * Real-time pricing is only available via properly configured API adapters.
 */

export interface TldPricing {
    register: number;
    renew: number;
    premium?: boolean;
}

// NOTE: Hardcoded TLD prices have been removed to prevent "fake" pricing.
// Prices must come from real-time API checks if configured.

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(price);
}

// Registrar buy links
export interface RegistrarLink {
    name: string;
    url: (domain: string) => string;
    icon?: string;
}

export const REGISTRARS: RegistrarLink[] = [
    {
        name: "Namecheap",
        url: (domain) => `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`,
    },
    {
        name: "GoDaddy",
        url: (domain) => `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`,
    },
    {
        name: "Porkbun",
        url: (domain) => `https://porkbun.com/checkout/search?q=${encodeURIComponent(domain)}`,
    },
    {
        name: "Dynadot",
        url: (domain) => `https://www.dynadot.com/domain/search.html?domain=${encodeURIComponent(domain)}`,
    },
    {
        name: "NameSilo",
        url: (domain) => `https://www.namesilo.com/domain/search-results?query=${encodeURIComponent(domain)}`,
    },
    {
        name: "Cloudflare",
        url: (_domain) => `https://www.cloudflare.com/products/registrar/`, // Cloudflare doesn't have a direct deep link for unregistered search easily without login often
    },
];

/**
 * Get buy link for a domain at a specific registrar
 */
export function getBuyLink(domain: string, registrar: string = "Namecheap"): string {
    const r = REGISTRARS.find((reg) => reg.name === registrar) || REGISTRARS[0];
    return r.url(domain);
}
