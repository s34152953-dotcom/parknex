// @ts-nocheck
const SECRET_KEY = process.env.PASS_SIGNING_SECRET || "PARKNEX_SUPER_SECRET_KEY_FOR_JWT_HMAC_DO_NOT_SHARE";

async function getCryptoKey(usage: "sign" | "verify"): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(SECRET_KEY);
  return await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage]
  );
}

export async function signExitToken(bookingId: string, vehicleNumber?: string, expHours: number = 24): Promise<string> {
  const cryptoKey = await getCryptoKey("sign");
  const encoder = new TextEncoder();

  const payload = JSON.stringify({
    type: "vehicle_exit",
    bookingId,
    vehicleNumber: vehicleNumber?.toUpperCase() || "",
    exp: Date.now() + 1000 * 60 * 60 * expHours,
    iat: Date.now(),
  });
  const payloadBase64 = btoa(payload);

  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(payloadBase64)
  );

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${payloadBase64}.${signatureBase64}`;
}

export async function signEntryToken(vehicleNumber: string, email?: string, expHours: number = 72): Promise<string> {
  const cryptoKey = await getCryptoKey("sign");
  const encoder = new TextEncoder();

  const payload = JSON.stringify({
    type: "preregistered_entry",
    vehicleNumber: vehicleNumber.toUpperCase(),
    email: email || "",
    exp: Date.now() + 1000 * 60 * 60 * expHours,
    iat: Date.now(),
  });
  const payloadBase64 = btoa(payload);

  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(payloadBase64)
  );

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${payloadBase64}.${signatureBase64}`;
}

export async function signPillarToken(pillarData: {
  mallId: string;
  floor: string;
  zone: string;
  pillar: string;
  slotNumber?: string;
}): Promise<string> {
  const cryptoKey = await getCryptoKey("sign");
  const encoder = new TextEncoder();

  const payload = JSON.stringify({
    type: "pillar_location",
    ...pillarData,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 365, // 1 year for physical pillar signs
    iat: Date.now(),
  });
  const payloadBase64 = btoa(payload);

  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(payloadBase64)
  );

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${payloadBase64}.${signatureBase64}`;
}

export async function verifyTypedToken(
  token: string,
  expectedType: "vehicle_exit" | "pillar_location" | "preregistered_entry"
): Promise<any | null> {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 2) return null;
    const [payloadBase64, signatureBase64] = parts;
    if (!payloadBase64 || !signatureBase64) return null;

    const cryptoKey = await getCryptoKey("verify");
    const encoder = new TextEncoder();
    const signature = Uint8Array.from(atob(signatureBase64), (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify(
      "HMAC",
      cryptoKey,
      signature,
      encoder.encode(payloadBase64)
    );

    if (!isValid) return null;

    const payload = JSON.parse(atob(payloadBase64));
    if (payload.exp && payload.exp < Date.now()) return null; // Expired

    // Enforce strict token type segregation
    if (expectedType === "vehicle_exit") {
      if (payload.type && payload.type !== "vehicle_exit") return null;
      if (!payload.bookingId) return null;
    } else if (expectedType === "pillar_location") {
      if (payload.type !== "pillar_location") return null;
    } else if (expectedType === "preregistered_entry") {
      if (payload.type !== "preregistered_entry") return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function verifyExitToken(token: string): Promise<any | null> {
  return verifyTypedToken(token, "vehicle_exit");
}

export async function verifyPillarToken(token: string): Promise<any | null> {
  return verifyTypedToken(token, "pillar_location");
}

export async function verifyEntryToken(token: string): Promise<any | null> {
  return verifyTypedToken(token, "preregistered_entry");
}

/**
 * Generates a cryptographically secure, non-guessable fallback code (e.g. PNX-7A9K2M)
 * Uses crypto.getRandomValues (never Math.random())
 */
export function generateSecureFallbackCode(prefix = "PNX"): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Excludes ambiguous 0, 1, O, I
  const randomBytes = new Uint8Array(6);
  crypto.getRandomValues(randomBytes);
  let code = "";
  for (let i = 0; i < randomBytes.length; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  return `${prefix}-${code}`;
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP
 * Uses crypto.getRandomValues (never Math.random())
 */
export function generateSecureOtp(): string {
  const randomValues = new Uint32Array(1);
  crypto.getRandomValues(randomValues);
  const otpNum = 100000 + (randomValues[0] % 900000);
  return otpNum.toString();
}
