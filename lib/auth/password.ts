/**
 * Edge-compatible password hashing utilities
 * Uses Web Crypto API for Cloudflare Workers compatibility
 */

/**
 * Hash a password using PBKDF2 (edge-compatible)
 * @param password - Plain text password
 * @param iterations - Number of iterations (default: 100000)
 * @returns Base64 encoded hash with salt
 */
export async function hashPassword(password: string, iterations = 100000): Promise<string> {
  // Generate random salt (16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Convert password to buffer
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key
  const key = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, ['deriveBits']);

  // Derive key using PBKDF2
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    key,
    256 // 32 bytes = 256 bits
  );

  // Combine salt + hash
  const combined = new Uint8Array(salt.length + hashBuffer.byteLength);
  combined.set(salt, 0);
  combined.set(new Uint8Array(hashBuffer), salt.length);

  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Base64 encoded hash (with salt)
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Decode base64 hash
    const combined = Uint8Array.from(atob(hash), c => c.charCodeAt(0));

    // Extract salt (first 16 bytes)
    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);

    // Convert password to buffer
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as key
    const key = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, [
      'deriveBits',
    ]);

    // Derive key using same parameters
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      key,
      256
    );

    // Compare hashes using constant-time comparison
    const newHash = new Uint8Array(hashBuffer);

    if (newHash.length !== storedHash.length) {
      return false;
    }

    // Constant-time comparison to prevent timing attacks
    let diff = 0;
    for (let i = 0; i < newHash.length; i++) {
      diff |= newHash[i] ^ storedHash[i];
    }

    return diff === 0;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}
