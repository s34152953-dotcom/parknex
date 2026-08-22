// @ts-nocheck
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

const SHARED_SECRET = process.env.AI_EDGE_SHARED_SECRET || "PARKNEX_EDGE_AI_SHARED_SECRET_2026";

async function verifyHmacSignature(bodyText: string, signatureHeader: string | null): Promise<boolean> {
  if (!signatureHeader) return false;
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SHARED_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const signatureBytes = Uint8Array.from(atob(signatureHeader), (c) => c.charCodeAt(0));
    return await crypto.subtle.verify("HMAC", key, signatureBytes, encoder.encode(bodyText));
  } catch {
    return false;
  }
}

http.route({
  path: "/api/edge-ai/detection",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("x-parknex-signature");
    const bodyText = await request.text();

    const isVerified = await verifyHmacSignature(bodyText, signature);
    if (!isVerified) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid or missing HMAC signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { normalizedPlate, confidence, cameraId, gateType, detectedAt } = payload;

    // Log the detection event to audit_logs
    await ctx.runMutation(api.audit.logAction, {
      operatorEmail: "system:edge-ai",
      action: gateType === "entry" ? "AI_ENTRY_PLATE_DETECTED" : "AI_EXIT_PLATE_DETECTED",
      targetType: "camera_event",
      targetId: cameraId || "cam-01",
      details: `Plate: ${normalizedPlate} (${(confidence * 100).toFixed(1)}% confidence, gate: ${gateType})`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        receivedAt: Date.now(),
        normalizedPlate,
        gateType,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

export default http;
