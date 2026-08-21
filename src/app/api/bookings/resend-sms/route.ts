import { NextRequest, NextResponse } from "next/server";
import { getAllBookings, updateBookingSmsStatus } from "@/lib/server/db";
import { sendBookingSms } from "@/lib/server/sms";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, originUrl } = body;

    const all = getAllBookings();
    const booking = all.find((b) => b.id === bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const host = originUrl || request.headers.get("origin") || request.headers.get("host") || "https://parknex.vercel.app";
    const cleanHost = host.startsWith("http") ? host : `https://${host}`;
    const customerLink = `${cleanHost}/customer/${booking.customerAccessToken}`;

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
      success: smsRes.success,
      sms: smsRes,
      message: smsRes.success ? "SMS resent successfully" : "Failed to deliver SMS",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to resend SMS" },
      { status: 500 }
    );
  }
}
