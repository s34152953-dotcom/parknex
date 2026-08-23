import { NextRequest, NextResponse } from "next/server";
import { executeParknexAssistant } from "@/lib/server/rocketride";
import { AssistantInputSchema } from "@/lib/server/pipelines";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AssistantInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid assistant query payload.",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const userId = req.headers.get("x-user-id") || undefined;
    const result = await executeParknexAssistant(parsed.data, userId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("[API assistant Error]:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: "ParkNex Assistant execution error.",
        message: err.message,
      },
      { status: 500 }
    );
  }
}
