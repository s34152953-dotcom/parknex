import { NextRequest, NextResponse } from "next/server";
import { getBookingByCustomerToken } from "@/lib/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Customer access token is required" },
        { status: 400 }
      );
    }

    const { booking, slot } = getBookingByCustomerToken(token);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "No booking found for this customer access token" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
      slot,
      isSessionActive: booking.status === "ACTIVE",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
