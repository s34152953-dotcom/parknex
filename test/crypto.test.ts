import { describe, it, expect } from "vitest";
import {
  signExitToken,
  signEntryToken,
  signPillarToken,
  verifyExitToken,
  verifyEntryToken,
  verifyPillarToken,
  generateSecureFallbackCode,
  generateSecureOtp,
} from "../convex/crypto";

describe("Cryptographic Token & Unique Code Layer", () => {
  it("generates cryptographically secure non-guessable fallback codes", () => {
    const code1 = generateSecureFallbackCode();
    const code2 = generateSecureFallbackCode();

    expect(code1).toMatch(/^PNX-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
    expect(code2).toMatch(/^PNX-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
    expect(code1).not.toBe(code2);
  });

  it("generates 6-digit numeric OTPs", () => {
    const otp = generateSecureOtp();
    expect(otp).toMatch(/^\d{6}$/);
    expect(parseInt(otp, 10)).toBeGreaterThanOrEqual(100000);
    expect(parseInt(otp, 10)).toBeLessThanOrEqual(999999);
  });

  it("signs and verifies typed vehicle exit tokens", async () => {
    const bookingId = "bk_test_123456";
    const vehicleNumber = "KA-01-MJ-2026";
    const token = await signExitToken(bookingId, vehicleNumber);

    expect(token).toBeDefined();
    expect(token).toContain(".");

    const verified = await verifyExitToken(token);
    expect(verified).not.toBeNull();
    expect(verified.bookingId).toBe(bookingId);
    expect(verified.vehicleNumber).toBe(vehicleNumber);
    expect(verified.type).toBe("vehicle_exit");
  });

  it("enforces strict token type segregation", async () => {
    // 1. Create a pillar token
    const pillarToken = await signPillarToken({
      mallId: "central_mall",
      floor: "B2",
      zone: "Zone A",
      pillar: "Pillar 01",
    });

    // 2. An exit verification MUST reject a pillar token
    const exitVerified = await verifyExitToken(pillarToken);
    expect(exitVerified).toBeNull();

    // 3. A pillar verification MUST accept it
    const pillarVerified = await verifyPillarToken(pillarToken);
    expect(pillarVerified).not.toBeNull();
    expect(pillarVerified.pillar).toBe("Pillar 01");

    // 4. An entry verification MUST reject a pillar token
    const entryVerified = await verifyEntryToken(pillarToken);
    expect(entryVerified).toBeNull();
  });
});
