import { NextRequest, NextResponse } from "next/server";
// Deprecated: All data operations now use Convex real-time queries/mutations directly.
export async function GET() {
  return NextResponse.json({ success: false, error: "Endpoint deprecated. Use Convex." }, { status: 410 });
}
export async function POST() {
  return NextResponse.json({ success: false, error: "Endpoint deprecated. Use Convex." }, { status: 410 });
}
