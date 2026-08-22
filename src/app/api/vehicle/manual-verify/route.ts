import { NextRequest, NextResponse } from "next/server";
import { normalizeRegistrationNumber, isValidIndianRegistration } from "@/lib/verification/plateValidator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPlate = body.registrationNumber || body.vehicleNumber || "";
    const reason = (body.reason || "").trim();
    const operatorEmail = body.operatorEmail || "operator:control_desk";

    if (!rawPlate) {
      return NextResponse.json(
        { error: "Registration number is required." },
        { status: 400 }
      );
    }

    if (!reason || reason.length < 4) {
      return NextResponse.json(
        { error: "A mandatory justification reason (at least 4 characters) is required for manual verification." },
        { status: 400 }
      );
    }

    const normalizedPlate = normalizeRegistrationNumber(rawPlate);
    const formatCheck = isValidIndianRegistration(normalizedPlate);

    if (!formatCheck.isValid) {
      return NextResponse.json(
        { error: formatCheck.error || "Invalid registration format." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    return NextResponse.json({
      status: "MANUAL_VERIFIED",
      normalizedRegistrationNumber: normalizedPlate,
      reason,
      operatorEmail,
      verifiedAt: now,
      physicalMake: body.physicalMake || undefined,
      physicalModel: body.physicalModel || undefined,
      physicalColour: body.physicalColour || undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process manual verification." },
      { status: 500 }
    );
  }
}
