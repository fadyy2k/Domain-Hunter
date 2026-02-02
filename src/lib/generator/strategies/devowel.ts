/**
 * Domain Generator - Devowel Strategy
 * Removes vowels to create shorter names
 */

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function removeVowels(word: string, keepFirst: boolean = true): string {
    const chars = word.split("");
    return chars
        .filter((char, index) => {
            if (keepFirst && index === 0) return true;
            return !VOWELS.has(char.toLowerCase());
        })
        .join("");
}

export function generateDevowel(tokens: string[]): string[] {
    if (tokens.length < 1) return [];

    const results: string[] = [];

    // Devowel each token individually
    tokens.forEach((token) => {
        if (token.length >= 4) {
            const devoweled = removeVowels(token, true);
            if (devoweled.length >= 3 && devoweled !== token) {
                results.push(devoweled);
            }
        }
    });

    // Devowel joined tokens
    if (tokens.length >= 2) {
        const joined = tokens.join("");
        const devoweled = removeVowels(joined, true);
        if (devoweled.length >= 3 && devoweled !== joined) {
            results.push(devoweled);
        }
    }

    // Devowel all except first/last letter of each word, then join
    if (tokens.length >= 2) {
        const partial = tokens.map((t) => {
            if (t.length <= 3) return t;
            return t[0] + removeVowels(t.slice(1, -1), false) + t[t.length - 1];
        });
        const joined = partial.join("");
        if (joined.length >= 3) {
            results.push(joined);
        }
    }

    return results;
}
