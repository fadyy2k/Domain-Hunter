/**
 * Domain Generator - Chunking Strategy
 * Takes first N letters of each word
 */

export function generateChunking(tokens: string[]): string[] {
    if (tokens.length < 1) return [];

    const results: string[] = [];

    // First 2 letters of each token
    if (tokens.length >= 2) {
        const chunk2 = tokens.map((t) => t.slice(0, 2)).join("");
        if (chunk2.length >= 4) {
            results.push(chunk2);
        }
    }

    // First 3 letters of each token
    if (tokens.length >= 2) {
        const chunk3 = tokens.map((t) => t.slice(0, 3)).join("");
        if (chunk3.length >= 4) {
            results.push(chunk3);
        }
    }

    // First 4 letters of each token
    if (tokens.length >= 2) {
        const chunk4 = tokens.map((t) => t.slice(0, 4)).join("");
        if (chunk4.length >= 5) {
            results.push(chunk4);
        }
    }

    // Variable chunking: more from first word, less from others
    if (tokens.length >= 2 && tokens[0].length >= 4) {
        const variable = tokens[0].slice(0, 4) + tokens.slice(1).map((t) => t.slice(0, 2)).join("");
        results.push(variable);
    }

    // Syllable-approximation: first 3 + first consonant after
    tokens.forEach((token) => {
        if (token.length >= 5) {
            const syllable = token.slice(0, 3);
            results.push(syllable);
        }
    });

    return results;
}
