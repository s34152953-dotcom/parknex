import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  verifyVehicleRegistration,
  getVehicleProviderConfig,
} from "../src/lib/verification/vehicleProvider";

describe("Vehicle Verification Provider Abstraction", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns UNAVAILABLE when API credentials are not configured", async () => {
    vi.stubEnv("VEHICLE_API_ENABLED", "false");
    vi.stubEnv("VEHICLE_API_BASE_URL", "");

    const result = await verifyVehicleRegistration("MH02AB1234");
    expect(result.status).toBe("unavailable");
    expect(result.normalizedRegistrationNumber).toBe("MH02AB1234");
    expect(result.errorMessage).toContain("unconfigured or disabled");
    expect(result.make).toBeUndefined(); // Never fabricates fake data
  });

  it("returns INVALID when plate format is invalid before querying external provider", async () => {
    vi.stubEnv("VEHICLE_API_ENABLED", "true");
    vi.stubEnv("VEHICLE_API_BASE_URL", "https://api.vahan.example.com");
    vi.stubEnv("VEHICLE_API_KEY", "test-key");

    const result = await verifyVehicleRegistration("INVALID-PLATE");
    expect(result.status).toBe("invalid");
    expect(result.errorMessage).toBeDefined();
  });

  it("handles network failure or 404 cleanly", async () => {
    vi.stubEnv("VEHICLE_API_ENABLED", "true");
    vi.stubEnv("VEHICLE_API_BASE_URL", "https://mock-provider.invalid");
    vi.stubEnv("VEHICLE_API_KEY", "test-key");

    const result = await verifyVehicleRegistration("MH02AB1234");
    expect(result.status).toBe("unavailable");
  });

  it("omits sensitive personal data (Owner Name, Address, Engine, Chassis) from result structure", async () => {
    vi.stubEnv("VEHICLE_API_ENABLED", "false");

    const result = await verifyVehicleRegistration("DL01A0001");
    // Verify TypeScript interface has no PII fields
    expect((result as any).ownerName).toBeUndefined();
    expect((result as any).ownerAddress).toBeUndefined();
    expect((result as any).chassisNumber).toBeUndefined();
    expect((result as any).engineNumber).toBeUndefined();
  });
});
