// @ts-nocheck
// ── PARKNEX Crypto Module ──
// HMAC-SHA256 based token signing/verification for exit passes and access tokens.
// Uses Web Crypto API (available in Convex runtime).

const SECRET_KEY = "PARKNEX_SUPER_SECRET_KEY_FOR_JWT_HMAC_DO_NOT_SHARE";

async function getHmacKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Generate a cryptographically random access token (URL-safe base64).
 * Used for customer dashboard links - NOT the exit pass.
 */
export function generateAccessToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Sign an exit pass token with HMAC-SHA256.
 * Contains: bookingPayload (slotId + timestamp), expiry (24h).
 * This is the token embedded in the QR code.
 */
export async function signExitToken(bookingPayload: string): Promise<string> {
  const key = await getHmacKey();
  const encoder = new TextEncoder();

  const payload = JSON.stringify({
    bookingId: bookingPayload,
    exp: Date.now() + 1000 * 60 * 60 * 24, // 24 hours expiry
    iat: Date.now(),
    nonce: generateAccessToken().substring(0, 16), // Unique per token
  });
  const payloadBase64 = btoa(payload);

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadBase64)
  );

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Verify a signed exit token. Returns parsed payload or null if invalid/expired.
 */
export async function verifyExitToken(token: string): Promise<{ bookingId: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadBase64, signatureBase64] = parts;
    if (!payloadBase64 || !signatureBase64) return null;

    const key = await getHmacKey();
    const encoder = new TextEncoder();
    const signature = Uint8Array.from(atob(signatureBase64), (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      encoder.encode(payloadBase64)
    );

    if (!isValid) return null;

    const payload = JSON.parse(atob(payloadBase64));
    if (payload.exp < Date.now()) return null; // Expired

    return { bookingId: payload.bookingId };
  } catch (err) {
    return null;
  }
}
