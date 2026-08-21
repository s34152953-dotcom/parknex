import { NextRequest, NextResponse } from "next/server";
import { completeExit } from "@/lib/server/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Booking ID or QR Token is required" },
        { status: 400 }
      );
    }

    const result = completeExit(bookingId);

    if (!result.success || !result.booking) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to complete exit" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: result.booking,
      message: "Exit authorized. Parking space is now available.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to complete exit" },
      { status: 500 }
    );
  }
}
