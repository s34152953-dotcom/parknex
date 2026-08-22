import { NextRequest, NextResponse } from "next/server";
import { sendBookingSms } from "@/lib/server/sms";

/**
 * POST /api/bookings/send-sms
 * Called after Convex createBooking succeeds to dispatch SMS via configured provider.
 * Updates Convex booking smsStatus via a follow-up mutation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingId,
      phoneNumber,
      vehicleNumber,
      customerAccessToken,
      floor,
      zone,
      pillar,
      slotNumber,
    } = body;

    if (!phoneNumber || !vehicleNumber || !customerAccessToken) {
      return NextResponse.json(
        { success: false, error: "Missing required fields for SMS dispatch." },
        { status: 400 }
      );
    }

    // Build the customer link
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const customerLink = `${baseUrl}/customer/${customerAccessToken}`;

    // Dispatch SMS via configured provider
    const smsResult = await sendBookingSms({
      to: phoneNumber,
      vehicleNumber,
      floor: floor || "",
      zone: zone || "",
      pillar: pillar || "",
      slotNumber: slotNumber || "",
      customerLink,
    });

    return NextResponse.json({
      success: smsResult.success,
      provider: smsResult.provider,
      messageId: smsResult.messageId || null,
      error: smsResult.error || null,
      smsStatus: smsResult.success ? "SENT" : "FAILED",
    });
  } catch (err: any) {
    console.error("[API /bookings/send-sms] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error dispatching SMS." },
      { status: 500 }
    );
  }
}
