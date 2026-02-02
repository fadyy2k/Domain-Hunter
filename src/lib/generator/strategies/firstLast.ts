/**
 * Domain Generator - First+Last Strategy
 * Combines first and last words from phrase
 */

export function generateFirstLast(tokens: string[]): string[] {
    if (tokens.length < 2) return [];

    const results: string[] = [];
    const first = tokens[0];
    const last = tokens[tokens.length - 1];

    // First + Last
    results.push(first + last);

    // Last + First
    results.push(last + first);

    // First 3 chars of first + last
    if (first.length >= 3) {
        results.push(first.slice(0, 3) + last);
    }

    // First + first 3 chars of last
    if (last.length >= 3) {
        results.push(first + last.slice(0, 3));
    }

    // First 3 of each
    if (first.length >= 3 && last.length >= 3) {
        results.push(first.slice(0, 3) + last.slice(0, 3));
    }

    // First 4 of each
    if (first.length >= 4 && last.length >= 4) {
        results.push(first.slice(0, 4) + last.slice(0, 4));
    }

    return results;
}
