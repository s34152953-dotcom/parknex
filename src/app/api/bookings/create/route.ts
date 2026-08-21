import { NextRequest, NextResponse } from "next/server";
import { createBooking, updateBookingSmsStatus } from "@/lib/server/db";
import { sendBookingSms } from "@/lib/server/sms";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleNumber, phoneNumber, slotId, mallName, originUrl } = body;

    if (!vehicleNumber || !phoneNumber || !slotId) {
      return NextResponse.json(
        { success: false, error: "Vehicle number plate, phone number, and parking slot are required." },
        { status: 400 }
      );
    }

    // Atomic Booking creation in DB
    const result = createBooking({
      vehicleNumber,
      phoneNumber,
      slotId,
      mallName: mallName || "Central Mall Grand",
    });

    if (!result.success || !result.booking) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to create booking" },
        { status: 409 }
      );
    }

    const booking = result.booking;

    // Build the secure customer access link
    const host = originUrl || request.headers.get("origin") || request.headers.get("host") || "https://parknex.vercel.app";
    const cleanHost = host.startsWith("http") ? host : `https://${host}`;
    const customerLink = `${cleanHost}/customer/${booking.customerAccessToken}`;

    // Dispatch real SMS
    const smsRes = await sendBookingSms({
      to: booking.phoneNumber,
      vehicleNumber: booking.vehicleNumber,
      floor: booking.floor,
      zone: booking.zone,
      pillar: booking.pillar,
      slotNumber: booking.slotNumber,
      customerLink,
    });

    updateBookingSmsStatus(booking.id, smsRes.success ? "SENT" : "FAILED", smsRes.messageId);

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        smsStatus: smsRes.success ? "SENT" : "FAILED",
        customerLink,
      },
      sms: smsRes,
      customerLink,
    });
  } catch (error: any) {
    console.error("[Booking Create API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
