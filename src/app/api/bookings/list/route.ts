import { NextRequest, NextResponse } from "next/server";
import { getAllBookings } from "@/lib/server/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const floor = searchParams.get("floor") || undefined;
    const query = searchParams.get("query") || undefined;
    const date = searchParams.get("date") || undefined;

    const bookings = getAllBookings({ status, floor, query, date });

    return NextResponse.json({
      success: true,
      bookings,
      count: bookings.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
