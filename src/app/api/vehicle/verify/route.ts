import { NextRequest, NextResponse } from "next/server";
import { normalizeRegistrationNumber, isValidIndianRegistration } from "@/lib/verification/plateValidator";
import { verifyVehicleRegistration } from "@/lib/verification/vehicleProvider";

// Simple in-memory rate limiter (max 20 verification requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 20;

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown-client";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          status: "unavailable",
          errorMessage: "Rate limit exceeded. Please wait a moment before trying again.",
          verifiedAt: new Date().toISOString(),
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const rawPlate = body.registrationNumber || body.vehicleNumber || "";

    if (!rawPlate || typeof rawPlate !== "string") {
      return NextResponse.json(
        {
          status: "invalid",
          errorMessage: "Registration number is required.",
          verifiedAt: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const normalizedPlate = normalizeRegistrationNumber(rawPlate);
    const formatCheck = isValidIndianRegistration(normalizedPlate);

    if (!formatCheck.isValid) {
      return NextResponse.json({
        status: "invalid",
        normalizedRegistrationNumber: normalizedPlate,
        errorMessage: formatCheck.error || "Invalid registration number format.",
        verifiedAt: new Date().toISOString(),
      });
    }

    // Call server-side provider abstraction
    const result = await verifyVehicleRegistration(normalizedPlate);

    // Return sanitized response with strictly zero PII
    return NextResponse.json({
      status: result.status,
      normalizedRegistrationNumber: result.normalizedRegistrationNumber,
      registrationStatus: result.registrationStatus,
      make: result.make,
      model: result.model,
      colour: result.colour,
      vehicleClass: result.vehicleClass,
      fuelType: result.fuelType,
      verifiedAt: result.verifiedAt,
      errorMessage: result.errorMessage,
    });
  } catch (err: any) {
    console.error("[Vehicle Verification Route] Error:", err.message);
    return NextResponse.json(
      {
        status: "unavailable",
        errorMessage: "Verification service temporarily unavailable.",
        verifiedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
