import { NextRequest, NextResponse } from "next/server";

// This route is deprecated. All slot data is now served via Convex real-time queries directly.
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: "This endpoint is deprecated. Use Convex real-time queries instead." },
    { status: 410 }
  );
}
