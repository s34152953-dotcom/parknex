import { NextRequest, NextResponse } from "next/server";
import { getCustomerBookingHistory } from "@/lib/server/db";

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

    const history = getCustomerBookingHistory(token);

    return NextResponse.json({
      success: true,
      history,
      count: history.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch customer history" },
      { status: 500 }
    );
  }
}
