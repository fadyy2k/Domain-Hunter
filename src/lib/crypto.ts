/**
 * Cryptography Utilities
 * AES-GCM encryption for API keys at rest
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Get encryption secret from environment
 */
function getSecret(): Buffer {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret) {
        throw new Error("ENCRYPTION_SECRET environment variable is not set");
    }
    // If secret is hex, convert to buffer, otherwise use as-is
    if (/^[0-9a-fA-F]{64}$/.test(secret)) {
        return Buffer.from(secret, "hex");
    }
    // Use scrypt to derive a key from the secret
    return scryptSync(secret, "domainhunter-salt", KEY_LENGTH);
}

/**
 * Encrypt a string using AES-256-GCM
 * Returns base64 encoded string containing: salt + iv + authTag + ciphertext
 */
export function encrypt(plaintext: string): string {
    const secret = getSecret();
    const salt = randomBytes(SALT_LENGTH);
    const key = scryptSync(secret, salt, KEY_LENGTH);
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const authTag = cipher.getAuthTag();

    // Combine: salt + iv + authTag + ciphertext
    const combined = Buffer.concat([salt, iv, authTag, encrypted]);

    return combined.toString("base64");
}

/**
 * Decrypt a string encrypted with encrypt()
 */
export function decrypt(encryptedBase64: string): string {
    const secret = getSecret();
    const combined = Buffer.from(encryptedBase64, "base64");

    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const ciphertext = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const key = scryptSync(secret, salt, KEY_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
}

/**
 * Safely encrypt (returns null on error)
 */
export function safeEncrypt(plaintext: string): string | null {
    try {
        return encrypt(plaintext);
    } catch (error) {
        console.error("Encryption error:", error);
        return null;
    }
}

/**
 * Safely decrypt (returns null on error)
 */
export function safeDecrypt(encrypted: string): string | null {
    try {
        return decrypt(encrypted);
    } catch (error) {
        console.error("Decryption error:", error);
        return null;
    }
}

/**
 * Generate a random encryption secret (for .env setup)
 */
export function generateSecret(): string {
    return randomBytes(32).toString("hex");
}

/**
 * Mask sensitive data for display (show first and last 4 chars)
 */
export function maskSecret(secret: string): string {
    if (secret.length <= 8) {
        return "****";
    }
    return `${secret.slice(0, 4)}****${secret.slice(-4)}`;
}
