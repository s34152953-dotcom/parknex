import { NextRequest, NextResponse } from "next/server";
import { executeParkingVerification } from "@/lib/server/rocketride";
import { VerificationInputSchema } from "@/lib/server/pipelines";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = VerificationInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parking check-in payload.",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const userId = req.headers.get("x-user-id") || undefined;
    const result = await executeParkingVerification(parsed.data, userId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("[API verify-session Error]:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: "RocketRide verification pipeline error.",
        message: err.message,
      },
      { status: 500 }
    );
  }
}
