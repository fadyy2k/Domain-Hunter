/**
 * Domain Generator - Tokenizer
 * Handles phrase tokenization and stopword removal
 */

// Common English stopwords
const DEFAULT_STOPWORDS = new Set([
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
    "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
    "to", "was", "were", "will", "with", "the", "this", "but", "they",
    "have", "had", "what", "when", "where", "who", "which", "why", "how",
    "all", "each", "every", "both", "few", "more", "most", "other", "some",
    "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too",
    "very", "just", "can", "should", "now", "we", "our", "your", "my",
]);

export interface TokenizerOptions {
    lowercase?: boolean;
    removeNumbers?: boolean;
    removeStopwords?: boolean;
    customStopwords?: string[];
    minLength?: number;
}

const defaultOptions: TokenizerOptions = {
    lowercase: true,
    removeNumbers: false,
    removeStopwords: true,
    minLength: 2,
};

/**
 * Tokenize a phrase into individual words
 */
export function tokenize(
    phrase: string,
    options: TokenizerOptions = {}
): string[] {
    const opts = { ...defaultOptions, ...options };

    // Split on whitespace and punctuation
    let tokens = phrase
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);

    // Apply transformations
    if (opts.lowercase) {
        tokens = tokens.map((t) => t.toLowerCase());
    }

    if (opts.removeNumbers) {
        tokens = tokens.filter((t) => !/^\d+$/.test(t));
    }

    if (opts.removeStopwords) {
        const stopwords = opts.customStopwords
            ? new Set([...DEFAULT_STOPWORDS, ...opts.customStopwords])
            : DEFAULT_STOPWORDS;
        tokens = tokens.filter((t) => !stopwords.has(t.toLowerCase()));
    }

    if (opts.minLength) {
        tokens = tokens.filter((t) => t.length >= opts.minLength!);
    }

    return tokens;
}

/**
 * Tokenize multiple phrases
 */
export function tokenizeMultiple(
    phrases: string[],
    options: TokenizerOptions = {}
): string[][] {
    return phrases.map((phrase) => tokenize(phrase, options));
}

/**
 * Get unique tokens from multiple phrases
 */
export function getUniqueTokens(
    phrases: string[],
    options: TokenizerOptions = {}
): string[] {
    const allTokens = phrases.flatMap((phrase) => tokenize(phrase, options));
    return [...new Set(allTokens)];
}
