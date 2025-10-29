/**
 * Edge-compatible password hashing utilities
 * Uses Web Crypto API for Cloudflare Workers compatibility
 */

/**
 * Hash a password using PBKDF2 (edge-compatible)
 * @param password - Plain text password
 * @param iterations - Number of iterations (default: 100000)
 * @returns Base64 encoded hash with salt, prefixed with algorithm identifier
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

  // Convert to base64 with prefix to identify format
  return 'pbkdf2:' + btoa(String.fromCharCode(...combined));
}

/**
 * Verify a password against a hash
 * Supports both new PBKDF2 format and legacy bcryptjs format
 * @param password - Plain text password to verify
 * @param hash - Password hash (either PBKDF2 or bcryptjs format)
 * @returns True if password matches, or throws error for legacy format
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Check if it's a bcryptjs hash (starts with $2a$, $2b$, $2x$, or $2y$)
  if (
    hash.startsWith('$2a$') ||
    hash.startsWith('$2b$') ||
    hash.startsWith('$2x$') ||
    hash.startsWith('$2y$')
  ) {
    // This is a legacy bcryptjs hash
    // We cannot verify it in edge runtime, so we reject it
    throw new Error(
      'LEGACY_PASSWORD_FORMAT: This account uses an old password format. Please use "Forgot Password" to reset your password.'
    );
  }

  // Handle both old format (no prefix) and new format (with prefix)
  let base64Hash = hash;
  if (hash.startsWith('pbkdf2:')) {
    base64Hash = hash.substring(7); // Remove 'pbkdf2:' prefix
  }

  try {
    // Decode base64 hash
    const combined = Uint8Array.from(atob(base64Hash), c => c.charCodeAt(0));

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
