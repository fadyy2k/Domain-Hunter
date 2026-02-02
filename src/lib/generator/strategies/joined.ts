/**
 * Domain Generator - Joined Strategy
 * Joins words together in various ways
 * Also handles single-word brand names with variations
 */

export function generateJoined(tokens: string[]): string[] {
    if (tokens.length < 1) return [];

    const results: string[] = [];

    // Single word variations (important for brand names like "autocare")
    tokens.forEach((token) => {
        const t = token.toLowerCase();
        if (t.length >= 3) {
            // The base word itself
            results.push(t);

            // Try to split compound words (autocare -> auto, care)
            const compounds = splitCompoundWord(t);
            if (compounds.length === 2) {
                const [p1, p2] = compounds;
                if (p1.length >= 3 && p2.length >= 3) {
                    // Original compound parts
                    results.push(p1);
                    results.push(p2);
                    // Recombined
                    results.push(p1 + p2);
                    results.push(p2 + p1); // Reversed
                    // With common brand patterns
                    results.push(p1 + "ly");
                    results.push(p1 + "io");
                    results.push(p1 + "hub");
                    results.push(p1 + "pro");
                    results.push(p1 + "now");
                    results.push(p1 + "hq");
                    results.push(p2 + "hub");
                    results.push(p2 + "pro");
                    results.push(p2 + "app");
                    results.push("the" + p1);
                    results.push("get" + p1);
                    results.push("my" + p1);
                    results.push("the" + p2);
                    results.push("get" + p2);
                    results.push("my" + p2);
                }
            }
        }
    });

    // Join all tokens
    if (tokens.length >= 2) {
        results.push(tokens.join(""));
    }

    // Join first two tokens
    if (tokens.length >= 2) {
        results.push(tokens[0] + tokens[1]);
    }

    // Join with overlap (if last char of word1 = first char of word2)
    for (let i = 0; i < tokens.length - 1; i++) {
        const word1 = tokens[i];
        const word2 = tokens[i + 1];
        if (word1[word1.length - 1] === word2[0]) {
            results.push(word1 + word2.slice(1));
        }
    }

    // Reverse order join
    if (tokens.length >= 2) {
        results.push([...tokens].reverse().join(""));
    }

    return results;
}

// Common word parts that form compound words
const COMMON_WORDS = [
    "auto", "car", "care", "tech", "web", "net", "app", "soft", "ware",
    "hard", "smart", "data", "cloud", "cyber", "digi", "meta", "mega",
    "micro", "nano", "super", "ultra", "hyper", "fast", "quick", "easy",
    "pro", "max", "plus", "prime", "hub", "lab", "base", "core", "zone",
    "spot", "point", "link", "sync", "flow", "stack", "craft", "work",
    "home", "shop", "store", "mail", "pay", "book", "box", "bit",
    "byte", "code", "dev", "api", "bot", "ai", "ml", "io",
];

/**
 * Try to split a compound word into two meaningful parts
 */
function splitCompoundWord(word: string): string[] {
    const w = word.toLowerCase();

    // Try to find a common word at the start
    for (const common of COMMON_WORDS) {
        if (w.startsWith(common) && w.length > common.length) {
            const remainder = w.slice(common.length);
            if (remainder.length >= 3) {
                return [common, remainder];
            }
        }
    }

    // Try to find a common word at the end
    for (const common of COMMON_WORDS) {
        if (w.endsWith(common) && w.length > common.length) {
            const prefix = w.slice(0, w.length - common.length);
            if (prefix.length >= 3) {
                return [prefix, common];
            }
        }
    }

    // Default: try to split at middle
    if (w.length >= 6) {
        const mid = Math.floor(w.length / 2);
        return [w.slice(0, mid), w.slice(mid)];
    }

    return [];
}
