// @ts-nocheck
const SECRET_KEY = "PARKNEX_SUPER_SECRET_KEY_FOR_JWT_HMAC_DO_NOT_SHARE";

export async function signExitToken(bookingId: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(SECRET_KEY);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const payload = JSON.stringify({ bookingId, exp: Date.now() + 1000 * 60 * 60 * 24 }); // 24 hours expiry
  const payloadBase64 = btoa(payload);

  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(payloadBase64)
  );

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${payloadBase64}.${signatureBase64}`;
}

export async function verifyExitToken(token: string): Promise<{ bookingId: string } | null> {
  try {
    const [payloadBase64, signatureBase64] = token.split(".");
    if (!payloadBase64 || !signatureBase64) return null;

    const encoder = new TextEncoder();
    const keyMaterial = encoder.encode(SECRET_KEY);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyMaterial,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signature = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));
    
    const isValid = await crypto.subtle.verify(
      "HMAC",
      cryptoKey,
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
