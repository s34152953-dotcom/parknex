/**
 * Indian License Plate Normalization & Validation Utility
 *
 * Normalizes vehicle registration strings and enforces standard Indian RTO
 * registration formats (State code, BH-Series, Commercial, Diplomatic).
 */

// 2-Letter State & Union Territory Codes in India
export const INDIAN_STATE_CODES = new Set([
  "AN", "AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN",
  "GA", "GJ", "HP", "HR", "JH", "JK", "KA", "KL", "LA", "LD",
  "MH", "ML", "MN", "MP", "MZ", "NL", "OD", "OR", "PB", "PY",
  "RJ", "SK", "TN", "TR", "TS", "UK", "UA", "UP", "WB"
]);

export interface PlateValidationResult {
  isValid: boolean;
  normalizedPlate: string;
  format?: "STANDARD" | "BH_SERIES" | "DIPLOMATIC" | "TEMPORARY" | "VINTAGE";
  error?: string;
  stateCode?: string;
  rtoCode?: string;
}

/**
 * Normalizes a raw license plate input:
 * - Strips all spaces, hyphens, dots, slashes, and special characters
 * - Converts to uppercase
 * - Rejects non-alphanumeric characters
 */
export function normalizeRegistrationNumber(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  return raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().trim();
}

/**
 * Validates a normalized Indian registration number against official formats:
 *
 * 1. Standard State Format:
 *    [2-Letter State] + [1-2 Digit RTO] + [0-3 Letter Series] + [4-Digit Number]
 *    Examples: MH02AB1234, DL01A0001, KA051234, TS09EA1234, UP32AB0007
 *
 * 2. Bharat (BH) Series:
 *    [2-Digit Year] + "BH" + [4-Digit Number] + [1-2 Letter Series]
 *    Examples: 22BH1234AA, 23BH5678B, 21BH0001Z
 *
 * 3. Diplomatic / CD / CC Series:
 *    [1-3 Digit Country] + "CD" / "CC" / "UN" + [1-4 Digit Number]
 *    Examples: 77CD1234, 12CC5678
 */
export function isValidIndianRegistration(rawOrNormalized: string): PlateValidationResult {
  const normalized = normalizeRegistrationNumber(rawOrNormalized);

  if (!normalized) {
    return {
      isValid: false,
      normalizedPlate: "",
      error: "Registration number is required",
    };
  }

  if (normalized.length < 6 || normalized.length > 12) {
    return {
      isValid: false,
      normalizedPlate: normalized,
      error: "Registration number length must be between 6 and 12 characters",
    };
  }

  // 1. Check Bharat (BH) Series: YY BH #### XX
  const bhRegex = /^([0-9]{2})BH([0-9]{4})([A-Z]{1,2})$/;
  const bhMatch = normalized.match(bhRegex);
  if (bhMatch) {
    const year = parseInt(bhMatch[1], 10);
    // BH series started in 2021 (21)
    if (year >= 21 && year <= 35) {
      return {
        isValid: true,
        normalizedPlate: normalized,
        format: "BH_SERIES",
      };
    }
  }

  // 2. Check Diplomatic / Consular Series
  const diplomaticRegex = /^[0-9]{1,3}(CD|CC|UN)[0-9]{1,4}[A-Z]?$/;
  if (diplomaticRegex.test(normalized)) {
    return {
      isValid: true,
      normalizedPlate: normalized,
      format: "DIPLOMATIC",
    };
  }

  // 3. Standard State Format:
  // Group 1: 2-Letter State Code
  // Group 2: 1-2 Digit RTO Code
  // Group 3: 0-3 Letter Series Code
  // Group 4: 1-4 Digit Number
  const standardRegex = /^([A-Z]{2})([0-9]{1,2})([A-Z]{0,3})([0-9]{1,4})$/;
  const standardMatch = normalized.match(standardRegex);

  if (standardMatch) {
    const state = standardMatch[1];
    const rto = standardMatch[2];
    const series = standardMatch[3];
    const numberStr = standardMatch[4];

    if (!INDIAN_STATE_CODES.has(state)) {
      return {
        isValid: false,
        normalizedPlate: normalized,
        error: `Invalid state / UT code '${state}'`,
      };
    }

    // Number must be valid integer > 0
    const num = parseInt(numberStr, 10);
    if (isNaN(num) || num <= 0) {
      return {
        isValid: false,
        normalizedPlate: normalized,
        error: "Vehicle registration number must be greater than zero",
      };
    }

    // Standard plate numbers are padded to 4 digits or 1-4 digits
    return {
      isValid: true,
      normalizedPlate: normalized,
      format: "STANDARD",
      stateCode: state,
      rtoCode: rto,
    };
  }

  return {
    isValid: false,
    normalizedPlate: normalized,
    error: "Invalid registration number format. Expected format e.g. MH02AB1234 or 22BH1234AA",
  };
}
