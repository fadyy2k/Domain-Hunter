/**
 * Domain Generator - Initials Strategy
 * Creates domain from first letters of each word
 */

export function generateInitials(tokens: string[]): string[] {
    if (tokens.length < 2) return [];

    const results: string[] = [];

    // Basic initials (first letter of each word)
    const basic = tokens.map((t) => t[0]).join("");
    if (basic.length >= 2) {
        results.push(basic);
    }

    // First two letters of first word + initials of rest
    if (tokens[0].length >= 2 && tokens.length >= 2) {
        const extended = tokens[0].slice(0, 2) + tokens.slice(1).map((t) => t[0]).join("");
        results.push(extended);
    }

    // Initials with first word spelled out more
    if (tokens[0].length >= 3 && tokens.length >= 2) {
        const spelled = tokens[0].slice(0, 3) + tokens.slice(1).map((t) => t[0]).join("");
        results.push(spelled);
    }

    return results;
}
