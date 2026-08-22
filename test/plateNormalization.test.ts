import { describe, it, expect } from "vitest";
import {
  normalizeRegistrationNumber,
  isValidIndianRegistration,
  INDIAN_STATE_CODES,
} from "../src/lib/verification/plateValidator";

describe("License Plate Normalization", () => {
  it("removes spaces, hyphens, dots, and converts to uppercase", () => {
    expect(normalizeRegistrationNumber("mh 02 ab 1234")).toBe("MH02AB1234");
    expect(normalizeRegistrationNumber("MH-02-AB-1234")).toBe("MH02AB1234");
    expect(normalizeRegistrationNumber("dl.01.a.0001")).toBe("DL01A0001");
    expect(normalizeRegistrationNumber("  ka-05-1234  ")).toBe("KA051234");
    expect(normalizeRegistrationNumber("22 bh 1234 aa")).toBe("22BH1234AA");
  });

  it("handles empty or invalid inputs gracefully", () => {
    expect(normalizeRegistrationNumber("")).toBe("");
    expect(normalizeRegistrationNumber(null as any)).toBe("");
    expect(normalizeRegistrationNumber(undefined as any)).toBe("");
  });
});

describe("Indian Registration Number Format Validation", () => {
  it("accepts valid standard Indian state registrations", () => {
    const validPlates = [
      "MH02AB1234",
      "DL01A0001",
      "KA051234",
      "TS09EA1234",
      "UP32AB0007",
      "TN07CD9999",
      "GJ01AB1234",
      "WB02K1234",
      "HR26DQ5555",
    ];

    for (const plate of validPlates) {
      const result = isValidIndianRegistration(plate);
      expect(result.isValid).toBe(true);
      expect(result.format).toBe("STANDARD");
    }
  });

  it("accepts valid Bharat (BH) Series registrations", () => {
    const validBhPlates = [
      "22BH1234AA",
      "23BH5678B",
      "21BH0001Z",
      "24BH9999AB",
    ];

    for (const plate of validBhPlates) {
      const result = isValidIndianRegistration(plate);
      expect(result.isValid).toBe(true);
      expect(result.format).toBe("BH_SERIES");
    }
  });

  it("accepts valid diplomatic registrations", () => {
    const validDiplomatic = ["77CD1234", "12CC5678"];
    for (const plate of validDiplomatic) {
      const result = isValidIndianRegistration(plate);
      expect(result.isValid).toBe(true);
      expect(result.format).toBe("DIPLOMATIC");
    }
  });

  it("rejects invalid state codes", () => {
    const invalidStatePlates = ["ZZ02AB1234", "XX01A0001", "QQ051234"];
    for (const plate of invalidStatePlates) {
      const result = isValidIndianRegistration(plate);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid state / UT code");
    }
  });

  it("rejects malformed numbers or invalid lengths", () => {
    expect(isValidIndianRegistration("A").isValid).toBe(false);
    expect(isValidIndianRegistration("MH02").isValid).toBe(false);
    expect(isValidIndianRegistration("MH02AB1234567890").isValid).toBe(false);
    expect(isValidIndianRegistration("MH02AB0000").isValid).toBe(false); // Zero number
  });
});
