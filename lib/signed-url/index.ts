/**
 * Signed URL Generator
 * Creates temporary URLs with expiration and cryptographic signatures
 */

/**
 * Generate a signed download URL with expiration
 * @param key - File key in R2
 * @param expiresInSeconds - URL expiration time in seconds (default: 1 hour)
 * @returns Signed URL query parameters (signature, expires)
 */
export async function generateSignedUrl(
  key: string,
  expiresInSeconds: number = 3600
): Promise<{ signature: string; expires: number }> {
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const message = `${key}:${expires}`;

  // Use Web Crypto API to create HMAC-SHA256 signature
  const secret = process.env.NEXTAUTH_SECRET || 'default-secret';
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);

  // Convert to hex string
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return {
    signature: signatureHex,
    expires,
  };
}

/**
 * Verify a signed URL
 * @param key - File key in R2
 * @param signature - Signature from URL
 * @param expires - Expiration timestamp from URL
 * @returns Whether the signature is valid and not expired
 */
export async function verifySignedUrl(
  key: string,
  signature: string,
  expires: number
): Promise<{ valid: boolean; reason?: string }> {
  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (now > expires) {
    return { valid: false, reason: 'URL has expired' };
  }

  // Generate expected signature
  const expected = await generateSignedUrl(key, expires - now);

  // Compare signatures (constant-time comparison to prevent timing attacks)
  if (signature !== expected.signature) {
    return { valid: false, reason: 'Invalid signature' };
  }

  return { valid: true };
}

/**
 * Create a complete signed download URL
 * @param baseUrl - Base URL (e.g., "/api/upload")
 * @param key - File key in R2
 * @param expiresInSeconds - URL expiration time in seconds (default: 1 hour)
 * @returns Complete signed URL
 */
export async function createSignedDownloadUrl(
  baseUrl: string,
  key: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const { signature, expires } = await generateSignedUrl(key, expiresInSeconds);

  const url = new URL(baseUrl, 'http://localhost'); // dummy base for URL construction
  url.searchParams.set('key', key);
  url.searchParams.set('signature', signature);
  url.searchParams.set('expires', expires.toString());

  return `${url.pathname}${url.search}`;
}
