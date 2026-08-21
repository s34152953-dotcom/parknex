import { NextRequest, NextResponse } from "next/server";
import { getAllSlots, getNearestSlot } from "@/lib/server/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const floor = searchParams.get("floor") || undefined;

    const slots = getAllSlots(floor);
    const nearest = getNearestSlot(floor);

    const total = slots.length;
    const available = slots.filter((s) => s.status === "available").length;
    const occupied = slots.filter((s) => s.status === "occupied").length;
    const reserved = slots.filter((s) => s.status === "reserved").length;

    return NextResponse.json({
      success: true,
      slots,
      nearestAvailableSlot: nearest,
      stats: {
        total,
        available,
        occupied,
        reserved,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch parking slots" },
      { status: 500 }
    );
  }
}
