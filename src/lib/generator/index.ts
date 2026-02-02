import { tokenize, type TokenizerOptions } from "./tokenizer";
import { generateInitials } from "./strategies/initials";
import { generateJoined } from "./strategies/joined";
import { generateFirstLast } from "./strategies/firstLast";
import { generateDevowel } from "./strategies/devowel";
import { generateChunking } from "./strategies/chunking";
import { generatePhonetic } from "./strategies/phonetic";
import { addAffixes } from "./affixes";
import { scoreDomain } from "./scorer";

export interface GeneratorSettings {
    // Length constraints
    minLength: number;
    maxLength: number;

    // Strategy toggles - Clean defaults
    useJoined: boolean;     // Default: true
    useChunking: boolean;   // Default: true
    useFirstLast: boolean;  // Default: true
    usePrefixes: boolean;   // Default: true
    useSuffixes: boolean;   // Default: true

    // "Junk" strategies - Default: false
    useInitials: boolean;
    useDevowel: boolean;
    usePhonetic: boolean;

    // Options
    useHyphens: boolean;
    customPrefixes?: string[];
    customSuffixes?: string[];

    // Filters
    excludeDigits: boolean;
    excludeDoubleLetters: boolean;
    blacklist?: string[];

    tokenizerOptions?: TokenizerOptions;
}

export interface DomainCandidate {
    name: string;
    score: number;
}

export interface GeneratorResult {
    candidates: DomainCandidate[];
    totalGenerated: number;
    totalAfterFilters: number;
}

const DEFAULT_SETTINGS: GeneratorSettings = {
    minLength: 4,
    maxLength: 14, // Relaxed slightly, but scorer prefers <= 10

    // Good strategies
    useJoined: true,
    useChunking: true,
    useFirstLast: true,
    usePrefixes: true,
    useSuffixes: true,

    // Bad strategies (disabled by default)
    useInitials: false,
    useDevowel: false,
    usePhonetic: false,

    useHyphens: false, // Generally cleaner without, mostly user preference
    excludeDigits: true,
    excludeDoubleLetters: false,
};

export function generateDomains(
    phrases: string[],
    settings: Partial<GeneratorSettings> = {}
): GeneratorResult {
    const opts = { ...DEFAULT_SETTINGS, ...settings };
    const allCandidates = new Set<string>();

    phrases.forEach(phrase => {
        const cleanPhrase = phrase.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!cleanPhrase) return;

        // 1. Always add the clean phrase itself
        if (cleanPhrase.length >= opts.minLength && cleanPhrase.length <= opts.maxLength) {
            allCandidates.add(cleanPhrase);
        }

        // 2. Tokenize
        const tokens = tokenize(phrase, { ...opts.tokenizerOptions, removeStopwords: false });
        if (tokens.length === 0) return;

        // 3. Generate Base Candidates (Strategies)
        const baseCandidates: string[] = [];

        if (opts.useJoined) baseCandidates.push(...generateJoined(tokens));
        if (opts.useChunking) baseCandidates.push(...generateChunking(tokens));
        if (opts.useFirstLast && tokens.length >= 2) baseCandidates.push(...generateFirstLast(tokens));

        // Risky strategies
        if (opts.useInitials && tokens.length >= 2) baseCandidates.push(...generateInitials(tokens));
        if (opts.useDevowel) baseCandidates.push(...generateDevowel(tokens));
        if (opts.usePhonetic) baseCandidates.push(...generatePhonetic(tokens));

        // 4. Apply Affixes (Prefixes/Suffixes)
        const affixCandidates = addAffixes(baseCandidates, {
            usePrefixes: opts.usePrefixes,
            useSuffixes: opts.useSuffixes,
            customPrefixes: opts.customPrefixes,
            customSuffixes: opts.customSuffixes,
        });

        // Add both base and affixed to results
        baseCandidates.forEach(c => allCandidates.add(c));
        affixCandidates.forEach(c => allCandidates.add(c));

        // Apply affixes to the original clean phrase too
        if (cleanPhrase.length >= 3) {
            const originalAffixed = addAffixes([cleanPhrase], {
                usePrefixes: opts.usePrefixes,
                useSuffixes: opts.useSuffixes,
                customPrefixes: opts.customPrefixes,
                customSuffixes: opts.customSuffixes,
            });
            originalAffixed.forEach(c => allCandidates.add(c));
        }
    });

    const totalGenerated = allCandidates.size;

    // 5. Filtering & Scoring
    const scored: DomainCandidate[] = [];
    const minLen = opts.minLength;
    const maxLen = opts.maxLength;

    for (const name of allCandidates) {
        // Length check
        if (name.length < minLen || name.length > maxLen) continue;

        // Digits check
        if (opts.excludeDigits && /\d/.test(name)) continue;

        // Score
        const score = scoreDomain(name);
        if (score > 10) { // arbitrary quality floor
            scored.push({ name, score });
        }
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return {
        candidates: scored,
        totalGenerated,
        totalAfterFilters: scored.length
    };
}

export { scoreDomain, sortByScore } from "./scorer";
export { tokenize } from "./tokenizer";
export type { TokenizerOptions } from "./tokenizer";
