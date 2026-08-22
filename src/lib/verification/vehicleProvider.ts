/**
 * Server-Side Vehicle Verification Provider Abstraction
 *
 * Provides a secure, production-grade abstraction for external vehicle registration
 * verification (e.g. VAHAN / API Setu) using server-side environment variables.
 *
 * Privacy & Security Constraints:
 * - Credentials are read ONLY on the server from process.env.
 * - Sensitive personal data (Owner Name, Address, Chassis/Engine numbers) are NEVER stored or returned.
 * - When unconfigured or disabled, returns status 'unavailable' without fabricating fake data.
 */

import { isValidIndianRegistration, normalizeRegistrationNumber } from "./plateValidator";

export type VehicleVerificationStatus = "verified" | "invalid" | "mismatch" | "unavailable";

export interface VehicleVerificationResult {
  status: VehicleVerificationStatus;
  normalizedRegistrationNumber: string;
  registrationStatus?: string;
  make?: string;
  model?: string;
  colour?: string;
  vehicleClass?: string;
  fuelType?: string;
  verifiedAt: string;
  providerReference?: string; // Only for server-side audit logs
  errorMessage?: string;
}

export interface VehicleProviderConfig {
  baseUrl?: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  enabled: boolean;
  timeoutMs: number;
}

/**
 * Reads server-side environment configuration safely
 */
export function getVehicleProviderConfig(): VehicleProviderConfig {
  const enabled = process.env.VEHICLE_API_ENABLED === "true";
  const baseUrl = process.env.VEHICLE_API_BASE_URL?.trim();
  const apiKey = process.env.VEHICLE_API_KEY?.trim();
  const clientId = process.env.VEHICLE_API_CLIENT_ID?.trim();
  const clientSecret = process.env.VEHICLE_API_CLIENT_SECRET?.trim();

  return {
    baseUrl,
    apiKey,
    clientId,
    clientSecret,
    enabled,
    timeoutMs: 6000, // 6-second strict timeout
  };
}

/**
 * Verifies a vehicle registration number against the configured provider
 */
export async function verifyVehicleRegistration(
  rawRegistrationNumber: string
): Promise<VehicleVerificationResult> {
  const normalizedPlate = normalizeRegistrationNumber(rawRegistrationNumber);
  const now = new Date().toISOString();

  // 1. Format Validation Check
  const formatValidation = isValidIndianRegistration(normalizedPlate);
  if (!formatValidation.isValid) {
    return {
      status: "invalid",
      normalizedRegistrationNumber: normalizedPlate,
      verifiedAt: now,
      errorMessage: formatValidation.error || "Invalid registration format",
    };
  }

  // 2. Read Configuration
  const config = getVehicleProviderConfig();

  // 3. Fallback when unconfigured or disabled
  if (!config.enabled || !config.baseUrl || (!config.apiKey && !config.clientId)) {
    return {
      status: "unavailable",
      normalizedRegistrationNumber: normalizedPlate,
      verifiedAt: now,
      errorMessage: "Online verification service is unconfigured or disabled.",
    };
  }

  // 4. Perform External Request with Timeout & Privacy Protection
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "ParkNex-Verification-Gateway/2.0",
    };

    if (config.apiKey) {
      headers["X-API-KEY"] = config.apiKey;
    }
    if (config.clientId) {
      headers["X-Client-ID"] = config.clientId;
    }
    if (config.clientSecret) {
      headers["X-Client-Secret"] = config.clientSecret;
    }

    const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/verify`, {
      method: "POST",
      headers,
      body: JSON.stringify({ registrationNumber: normalizedPlate }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 404) {
      return {
        status: "invalid",
        normalizedRegistrationNumber: normalizedPlate,
        verifiedAt: now,
        errorMessage: "Vehicle registration not found in registry records.",
      };
    }

    if (!response.ok) {
      return {
        status: "unavailable",
        normalizedRegistrationNumber: normalizedPlate,
        verifiedAt: now,
        errorMessage: `Provider returned status ${response.status}`,
      };
    }

    const data = await response.json();

    // Sanitize and extract only minimum necessary non-PII vehicle details
    return {
      status: "verified",
      normalizedRegistrationNumber: normalizedPlate,
      registrationStatus: data.registrationStatus || data.status || "ACTIVE",
      make: data.make || data.maker || undefined,
      model: data.model || data.vehicleModel || undefined,
      colour: data.colour || data.color || undefined,
      vehicleClass: data.vehicleClass || data.class || undefined,
      fuelType: data.fuelType || undefined,
      verifiedAt: now,
      providerReference: data.referenceId || data.transactionId || undefined,
    };
  } catch (err: any) {
    const isTimeout = err.name === "AbortError";
    return {
      status: "unavailable",
      normalizedRegistrationNumber: normalizedPlate,
      verifiedAt: now,
      errorMessage: isTimeout
        ? "Verification request timed out. Please retry or use manual verification."
        : "Network error connecting to verification gateway.",
    };
  }
}
