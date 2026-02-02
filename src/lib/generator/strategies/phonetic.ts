/**
 * Domain Generator - Phonetic Strategy
 * Creates pronounceable names using CV (consonant-vowel) patterns
 */

const CONSONANTS = "bcdfghjklmnpqrstvwxyz";
const VOWELS = "aeiou";

// Common syllable patterns
const PREFIXES = ["ba", "be", "bi", "bo", "bu", "ca", "co", "da", "de", "di", "do",
    "fa", "fe", "fi", "fo", "ga", "ge", "go", "ha", "he", "hi", "ho",
    "ja", "je", "ji", "jo", "ka", "ke", "ki", "ko", "la", "le", "li", "lo",
    "ma", "me", "mi", "mo", "na", "ne", "ni", "no", "pa", "pe", "pi", "po",
    "ra", "re", "ri", "ro", "sa", "se", "si", "so", "ta", "te", "ti", "to",
    "va", "ve", "vi", "vo", "wa", "we", "wi", "wo", "za", "ze", "zi", "zo"];

function getFirstConsonant(word: string): string {
    for (const char of word.toLowerCase()) {
        if (CONSONANTS.includes(char)) {
            return char;
        }
    }
    return word[0] || "";
}

function getFirstVowel(word: string): string {
    for (const char of word.toLowerCase()) {
        if (VOWELS.includes(char)) {
            return char;
        }
    }
    return "a";
}

export function generatePhonetic(tokens: string[]): string[] {
    if (tokens.length < 1) return [];

    const results: string[] = [];

    // Build CV pattern from first consonant + first vowel of each word
    if (tokens.length >= 2) {
        const cv = tokens.map((t) => {
            const c = getFirstConsonant(t);
            const v = getFirstVowel(t);
            return c + v;
        }).join("");
        if (cv.length >= 4) {
            results.push(cv);
        }
    }

    // CVC pattern
    if (tokens.length >= 2) {
        const cvc = tokens.map((t) => {
            const c1 = getFirstConsonant(t);
            const v = getFirstVowel(t);
            const consonants = t.toLowerCase().split("").filter(ch => CONSONANTS.includes(ch));
            const c2 = consonants.length > 1 ? consonants[1] : "";
            return c1 + v + c2;
        }).join("");
        if (cvc.length >= 4) {
            results.push(cvc);
        }
    }

    // Use common prefix patterns with token initials
    if (tokens.length >= 2) {
        const initials = tokens.map(t => t[0]).join("");
        PREFIXES.slice(0, 5).forEach((prefix) => {
            if (prefix[0] === initials[0]?.toLowerCase()) {
                results.push(prefix + initials.slice(1));
            }
        });
    }

    // First syllable approximation (first CV or CVC pattern from each word)
    tokens.forEach((token) => {
        const lower = token.toLowerCase();
        let syllable = "";
        let hasVowel = false;

        for (const char of lower) {
            syllable += char;
            if (VOWELS.includes(char)) {
                hasVowel = true;
            } else if (hasVowel && CONSONANTS.includes(char)) {
                // Break after finding consonant after vowel - intentionally unused marker
                break;
            }
            if (syllable.length >= 4) break;
        }

        if (syllable.length >= 2 && hasVowel) {
            results.push(syllable);
        }
    });

    return results;
}
