/**
 * Registrar Adapters - Main Export
 */

export {
    type RegistrarAdapter,
    type AvailabilityResult,
    registerAdapter,
    getAdapter,
    getConfiguredAdapters,
    getAdapterNames,
} from "./interface";

export { namecheapAdapter } from "./namecheap";
export { godaddyAdapter } from "./godaddy";
export { cloudflareAdapter } from "./cloudflare";

// Auto-register adapters
import { registerAdapter } from "./interface";
import { namecheapAdapter } from "./namecheap";
import { godaddyAdapter } from "./godaddy";
import { cloudflareAdapter } from "./cloudflare";

registerAdapter(namecheapAdapter);
registerAdapter(godaddyAdapter);
registerAdapter(cloudflareAdapter);
