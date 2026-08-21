import { NextRequest, NextResponse } from "next/server";
import { verifyExitPass } from "@/lib/server/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrToken } = body;

    if (!qrToken) {
      return NextResponse.json(
        { success: false, error: "QR verification token is required" },
        { status: 400 }
      );
    }

    const verification = verifyExitPass(qrToken);

    return NextResponse.json({
      success: true,
      verification,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify exit pass" },
      { status: 500 }
    );
  }
}
