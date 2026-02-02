/**
 * Cloudflare Registrar Adapter
 * 
 * NOTE: Cloudflare's Registrar API requires OAuth authentication
 * which needs a user authorization flow. This adapter is a placeholder
 * that documents the architecture but is marked as "not supported"
 * until proper OAuth flow can be implemented.
 * 
 * https://developers.cloudflare.com/registrar/
 */

import { type RegistrarAdapter, type AvailabilityResult } from "./interface";

export const cloudflareAdapter: RegistrarAdapter = {
    name: "cloudflare",

    isConfigured(): boolean {
        // Always return false - not supported yet
        return false;
    },

    async check(_domain: string): Promise<AvailabilityResult> {
        return {
            available: false,
            premium: false,
            source: "cloudflare",
            error: "Cloudflare Registrar is not supported. It requires OAuth user authorization flow which is not implemented. Please use RDAP or another registrar API.",
        };
    },
};

/**
 * Implementation notes for future Cloudflare support:
 * 
 * 1. OAuth Flow Required:
 *    - User must authorize the app via Cloudflare OAuth
 *    - Need to implement /authorize and /callback routes
 *    - Store access tokens securely per user
 * 
 * 2. API Endpoints:
 *    - POST /accounts/{account_id}/registrar/domains
 *    - GET /accounts/{account_id}/registrar/domains/{domain_name}
 * 
 * 3. Required scopes:
 *    - registrar:read
 * 
 * 4. Architecture considerations:
 *    - Would need user session management
 *    - Token refresh handling
 *    - Per-user API key storage (not global)
 */
