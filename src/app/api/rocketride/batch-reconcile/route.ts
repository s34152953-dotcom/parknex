import { NextRequest, NextResponse } from "next/server";
import { executeBatchReconciliation } from "@/lib/server/rocketride";
import { BatchReconciliationInputSchema } from "@/lib/server/pipelines";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BatchReconciliationInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid batch reconciliation payload.",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const userId = req.headers.get("x-user-id") || undefined;
    const result = await executeBatchReconciliation(parsed.data, userId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("[API batch-reconcile Error]:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: "Batch reconciliation pipeline error.",
        message: err.message,
      },
      { status: 500 }
    );
  }
}
