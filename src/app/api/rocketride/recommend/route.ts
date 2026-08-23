import { NextRequest, NextResponse } from "next/server";
import { executeParkingRecommendation } from "@/lib/server/rocketride";
import { RecommendationInputSchema } from "@/lib/server/pipelines";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RecommendationInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid recommendation payload.",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const userId = req.headers.get("x-user-id") || undefined;
    const result = await executeParkingRecommendation(parsed.data, userId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("[API recommend Error]:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: "RocketRide recommendation pipeline error.",
        message: err.message,
      },
      { status: 500 }
    );
  }
}
