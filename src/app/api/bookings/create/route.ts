import { NextRequest, NextResponse } from "next/server";

// Deprecated. All booking creation is now handled by Convex mutations directly.
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: "This endpoint is deprecated. Use Convex mutations instead." },
    { status: 410 }
  );
}
