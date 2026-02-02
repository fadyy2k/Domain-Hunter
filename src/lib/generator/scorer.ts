/**
 * Domain Generator - Quality Scorer
 * Scores domain names based on brandability, readability, and brevity.
 */

// VOWELS removed as it was unused
const CONSONANTS = new Set([
    "b", "c", "d", "f", "g", "h", "j", "k", "l", "m",
    "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z"
]);

// Awkward consonant clusters that hurt brandability
const AWKWARD_CLUSTERS = new Set([
    "bk", "bq", "bx", "cb", "cf", "cg", "cj", "cm", "cn", "cp", "cv", "cw", "cx",
    "db", "df", "dg", "dj", "dk", "dm", "dn", "dp", "dq", "dt", "dv", "dw", "dx", "dz",
    "fb", "fc", "fd", "fg", "fj", "fk", "fm", "fn", "fp", "fq", "fv", "fw", "fx", "fz",
    "gb", "gc", "gd", "gf", "gj", "gk", "gm", "gp", "gq", "gt", "gv", "gw", "gx", "gz",
    "hb", "hc", "hd", "hf", "hg", "hj", "hk", "hl", "hm", "hn", "hp", "hq", "hr", "hs", "ht", "hv", "hw", "hx", "hz",
    "jb", "jc", "jd", "jf", "jg", "jh", "jk", "jl", "jm", "jn", "jp", "jq", "jr", "js", "jt", "jv", "jw", "jx", "jz",
    "kb", "kc", "kd", "kf", "kg", "kj", "km", "kp", "kq", "kt", "kv", "kw", "kx", "kz",
    "mq", "mx", "mz", "pq", "px", "pz", "qc", "qd", "qf", "qg", "qh", "qj", "qk", "ql", "qm", "qn", "qp", "qs", "qt", "qv", "qw", "qx", "qz",
    "sx", "sz", "tq", "tx", "tz", "vc", "vd", "vg", "vj", "vm", "vn", "vp", "vq", "vt", "vx", "vz",
    "wx", "wz", "xb", "xc", "xd", "xf", "xg", "xj", "xk", "xl", "xm", "xn", "xp", "xq", "xr", "xs", "xv", "xw", "xz",
    "z b", "zc", "zd", "zf", "zg", "zj", "zk", "zl", "zm", "zn", "zp", "zq", "zr", "zs", "zt", "zv", "zw", "zx",
]);

export interface ScoreBreakdown {
    length: number;
    readability: number;
    brandability: number;
    penalties: number;
    total: number;
}

export function scoreDomain(name: string): number {
    return getScoreBreakdown(name).total;
}

export function getScoreBreakdown(name: string): ScoreBreakdown {
    const lower = name.toLowerCase();
    const len = lower.length;

    // 1. Length Score (Max 40)
    // Prefer <= 10 chars.
    let lengthScore = 0;
    if (len >= 4 && len <= 8) lengthScore = 40;
    else if (len >= 9 && len <= 10) lengthScore = 30;
    else if (len <= 12) lengthScore = 15;
    else lengthScore = 5;

    // 2. Readability / Pronounceability (Max 30)
    // Simple check: ratio of vowels, avoiding huge consonant strings
    let consonantRun = 0;
    let maxConsonantRun = 0;
    for (const char of lower) {
        if (CONSONANTS.has(char)) {
            consonantRun++;
            maxConsonantRun = Math.max(maxConsonantRun, consonantRun);
        } else {
            consonantRun = 0;
        }
    }

    let readabilityScore = 30;
    if (maxConsonantRun >= 4) readabilityScore = 0;
    else if (maxConsonantRun === 3) readabilityScore = 10;
    else if (maxConsonantRun === 2) readabilityScore = 25;

    // 3. Brandability (Max 30)
    // Penalize digits, hyphens (unless specifically wanted, but internally we score raw name), and awkward clusters
    let brandabilityScore = 30;

    // Penalize awkward bigrams
    for (let i = 0; i < len - 1; i++) {
        const bigram = lower.slice(i, i + 2);
        if (AWKWARD_CLUSTERS.has(bigram)) brandabilityScore -= 10;
    }

    // Penalize adjacent duplicates (e.g. "aa", "tt" is okay in limited cases but "uu", "ii" often look weird, general repetition)
    // We'll trust adjacent letters are sometimes okay (google, twitter), but triple is bad.
    for (let i = 0; i < len - 2; i++) {
        if (lower[i] === lower[i + 1] && lower[i] === lower[i + 2]) {
            brandabilityScore -= 20;
        }
    }

    // Penalize repeating patterns (simple check: first half == second half)
    if (len >= 6 && len % 2 === 0) {
        const mid = len / 2;
        if (lower.slice(0, mid) === lower.slice(mid)) {
            brandabilityScore -= 10; // "wikiwiki" is okay, but "autocareautocare" is redundant
        }
    }

    let penalties = 0;
    // Check total
    if (brandabilityScore < 0) {
        penalties += Math.abs(brandabilityScore);
        brandabilityScore = 0;
    }

    const total = Math.min(100, Math.max(0, lengthScore + readabilityScore + brandabilityScore));

    return {
        length: lengthScore,
        readability: readabilityScore,
        brandability: brandabilityScore,
        penalties,
        total
    };
}

export function sortByScore(domains: string[]): string[] {
    // Perform sort with stable behavior for equal scores (shorter first)
    return [...domains].sort((a, b) => {
        const scoreA = scoreDomain(a);
        const scoreB = scoreDomain(b);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return a.length - b.length;
    });
}
