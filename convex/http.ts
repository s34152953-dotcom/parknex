// @ts-nocheck
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

const SHARED_SECRET = process.env.AI_EDGE_SHARED_SECRET || "PARKNEX_EDGE_AI_SHARED_SECRET_2026";

async function verifyHmacSignature(
  bodyText: string,
  signatureHeader: string | null,
  timestampHeader?: string | null
): Promise<{ valid: boolean; error?: string }> {
  if (!signatureHeader) {
    return { valid: false, error: "Missing x-parknex-signature header" };
  }

  // Verify timestamp freshness (< 5 minutes) if timestamp provided
  if (timestampHeader) {
    const timestampMs = parseInt(timestampHeader, 10);
    if (!isNaN(timestampMs)) {
      const diff = Math.abs(Date.now() - timestampMs);
      if (diff > 5 * 60 * 1000) {
        return { valid: false, error: "Request timestamp expired (clock drift > 5m)" };
      }
    }
  }

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
    const payloadToVerify = timestampHeader ? `${timestampHeader}.${bodyText}` : bodyText;
    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, encoder.encode(payloadToVerify));

    // Also support fallback direct bodyText verification for legacy clients
    if (!isValid && timestampHeader) {
      const fallbackValid = await crypto.subtle.verify("HMAC", key, signatureBytes, encoder.encode(bodyText));
      return { valid: fallbackValid };
    }

    return { valid: isValid };
  } catch (err: any) {
    return { valid: false, error: err.message || "Cryptographic verification failed" };
  }
}

/**
 * Route: POST /cctv/events
 * Primary secured webhook for local CCTV Python edge service.
 * Supports both single event payloads and batched offline-recovery event arrays.
 */
http.route({
  path: "/cctv/events",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("x-parknex-signature");
    const timestamp = request.headers.get("x-parknex-timestamp");
    const bodyText = await request.text();

    const verification = await verifyHmacSignature(bodyText, signature, timestamp);
    if (!verification.valid) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Invalid or missing HMAC signature",
          details: verification.error,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(bodyText);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON payload format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Batch sync processing
    if (Array.isArray(payload)) {
      const results = [];
      for (const item of payload) {
        if (!item.eventId || !item.cameraId || !item.eventType) continue;
        const res = await ctx.runMutation(api.cctv.recordCameraEvent, {
          eventId: item.eventId,
          cameraId: item.cameraId,
          eventType: item.eventType,
          timestamp: item.timestamp || new Date().toISOString(),
          plateNumber: item.plateNumber,
          confidence: item.confidence,
          floor: item.floor,
          zone: item.zone,
          slotId: item.slotId,
          occupancyStatus: item.occupancyStatus,
          rawText: item.rawText,
          requiresConfirmation: item.requiresConfirmation,
        });
        results.push(res);
      }

      return new Response(
        JSON.stringify({
          success: true,
          processed: results.length,
          receivedAt: Date.now(),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Single event processing
    if (!payload.eventId || !payload.cameraId || !payload.eventType) {
      return new Response(
        JSON.stringify({
          error: "Missing required event fields: eventId, cameraId, eventType",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await ctx.runMutation(api.cctv.recordCameraEvent, {
      eventId: payload.eventId,
      cameraId: payload.cameraId,
      eventType: payload.eventType,
      timestamp: payload.timestamp || new Date().toISOString(),
      plateNumber: payload.plateNumber,
      confidence: payload.confidence,
      floor: payload.floor,
      zone: payload.zone,
      slotId: payload.slotId,
      occupancyStatus: payload.occupancyStatus,
      rawText: payload.rawText,
      requiresConfirmation: payload.requiresConfirmation,
    });

    return new Response(
      JSON.stringify({
        success: true,
        result,
        receivedAt: Date.now(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

/**
 * Route: POST /cctv/cameras/register
 * Edge agent registers or sends heartbeat for a camera feed.
 */
http.route({
  path: "/cctv/cameras/register",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("x-parknex-signature");
    const timestamp = request.headers.get("x-parknex-timestamp");
    const bodyText = await request.text();

    const verification = await verifyHmacSignature(bodyText, signature, timestamp);
    if (!verification.valid) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Invalid or missing HMAC signature",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(bodyText);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!payload.cameraId || !payload.name || !payload.type) {
      return new Response(
        JSON.stringify({
          error: "Missing required camera fields: cameraId, name, type",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const cameraDocId = await ctx.runMutation(api.cctv.registerOrUpdateCamera, {
      cameraId: payload.cameraId,
      name: payload.name,
      type: payload.type,
      floor: payload.floor || "B2",
      zone: payload.zone || "Zone A",
      status: payload.status || "ONLINE",
      rtspStreamPath: payload.rtspStreamPath,
      webrtcUrl: payload.webrtcUrl,
      hlsUrl: payload.hlsUrl,
      fps: payload.fps,
      resolution: payload.resolution,
      ipAddress: payload.ipAddress,
      slotIds: payload.slotIds,
      roiCoordinates: payload.roiCoordinates,
    });

    return new Response(
      JSON.stringify({
        success: true,
        cameraDocId,
        registeredAt: Date.now(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

/**
 * Legacy webhook compatibility route
 */
http.route({
  path: "/api/edge-ai/detection",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("x-parknex-signature");
    const bodyText = await request.text();

    const verification = await verifyHmacSignature(bodyText, signature);
    if (!verification.valid) {
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

    const { normalizedPlate, confidence, cameraId, gateType } = payload;

    await ctx.runMutation(api.audit.logAction, {
      operatorEmail: "system:edge-ai",
      action: gateType === "entry" ? "AI_ENTRY_PLATE_DETECTED" : "AI_EXIT_PLATE_DETECTED",
      targetType: "camera_event",
      targetId: cameraId || "cam-01",
      details: `Plate: ${normalizedPlate} (${((confidence || 0) * 100).toFixed(1)}% confidence, gate: ${gateType})`,
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
