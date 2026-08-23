import { NextRequest, NextResponse } from "next/server";
import { executeParkingAnomalyDetection } from "@/lib/server/rocketride";
import { AnomalyDetectionInputSchema } from "@/lib/server/pipelines";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AnomalyDetectionInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid anomaly detection payload.",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const userId = req.headers.get("x-user-id") || undefined;
    const result = await executeParkingAnomalyDetection(parsed.data, userId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("[API audit-anomalies Error]:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: "Parking anomaly pipeline error.",
        message: err.message,
      },
      { status: 500 }
    );
  }
}
