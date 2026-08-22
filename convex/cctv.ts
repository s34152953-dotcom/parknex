// @ts-nocheck
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all configured CCTV cameras, with optional filtering by type and floor.
 */
export const listCameras = query({
  args: {
    type: v.optional(v.union(v.literal("ENTRY"), v.literal("EXIT"), v.literal("FLOOR"))),
    floor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let cameras = await ctx.db.query("cameras").collect();

    if (args.type) {
      cameras = cameras.filter((c) => c.type === args.type);
    }
    if (args.floor && args.floor !== "ALL") {
      cameras = cameras.filter((c) => c.floor === args.floor || c.floor === "ALL");
    }

    return cameras;
  },
});

/**
 * Get details and status for a single camera.
 */
export const getCamera = query({
  args: {
    cameraId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cameras")
      .withIndex("by_cameraId", (q) => q.eq("cameraId", args.cameraId))
      .first();
  },
});

/**
 * List recent camera events with optional filtering.
 */
export const listRecentCameraEvents = query({
  args: {
    limit: v.optional(v.number()),
    eventType: v.optional(
      v.union(
        v.literal("PLATE_DETECTED"),
        v.literal("OCCUPANCY_CHANGED"),
        v.literal("HEARTBEAT"),
        v.literal("ZONE_TRANSIT")
      )
    ),
    cameraId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    let eventsQuery = ctx.db.query("cameraEvents").order("desc");

    let events = await eventsQuery.take(limit * 2);

    if (args.eventType) {
      events = events.filter((e) => e.eventType === args.eventType);
    }
    if (args.cameraId) {
      events = events.filter((e) => e.cameraId === args.cameraId);
    }

    return events.slice(0, limit);
  },
});

/**
 * Get latest confirmed CCTV sighting for a given vehicle plate number (used by Find My Car).
 */
export const getLatestSighting = query({
  args: {
    plateNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const cleanPlate = args.plateNumber.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    if (!cleanPlate) return null;

    const sightings = await ctx.db
      .query("vehicleSightings")
      .withIndex("by_plateNumber", (q) => q.eq("plateNumber", cleanPlate))
      .order("desc")
      .first();

    return sightings;
  },
});

/**
 * Query complete sighting history timeline for a vehicle plate (used by Operator Investigation).
 */
export const getSightingsForPlate = query({
  args: {
    plateNumber: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const cleanPlate = args.plateNumber.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    if (!cleanPlate) return [];

    const limit = args.limit || 20;
    const sightings = await ctx.db
      .query("vehicleSightings")
      .withIndex("by_plateNumber", (q) => q.eq("plateNumber", cleanPlate))
      .order("desc")
      .take(limit);

    return sightings;
  },
});

/**
 * Get live CCTV occupancy status overview and camera counts.
 */
export const getCctvOverview = query({
  args: {},
  handler: async (ctx) => {
    const cameras = await ctx.db.query("cameras").collect();
    const occupancy = await ctx.db.query("slotOccupancy").collect();
    const recentEvents = await ctx.db.query("cameraEvents").order("desc").take(10);

    const onlineCameras = cameras.filter((c) => c.status === "ONLINE").length;
    const totalCameras = cameras.length;
    const occupiedSpaces = occupancy.filter((s) => s.status === "occupied").length;
    const availableSpaces = occupancy.filter((s) => s.status === "available").length;

    return {
      totalCameras,
      onlineCameras,
      offlineCameras: totalCameras - onlineCameras,
      monitoredSpaces: occupancy.length,
      occupiedSpaces,
      availableSpaces,
      recentEventsCount: recentEvents.length,
    };
  },
});

/**
 * Register or update camera status and heartbeat.
 */
export const registerOrUpdateCamera = mutation({
  args: {
    cameraId: v.string(),
    name: v.string(),
    type: v.union(v.literal("ENTRY"), v.literal("EXIT"), v.literal("FLOOR")),
    floor: v.string(),
    zone: v.string(),
    status: v.union(v.literal("ONLINE"), v.literal("OFFLINE"), v.literal("NOT_CONFIGURED"), v.literal("ERROR")),
    rtspStreamPath: v.optional(v.string()),
    webrtcUrl: v.optional(v.string()),
    hlsUrl: v.optional(v.string()),
    fps: v.optional(v.number()),
    resolution: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    slotIds: v.optional(v.array(v.string())),
    roiCoordinates: v.optional(
      v.object({
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("cameras")
      .withIndex("by_cameraId", (q) => q.eq("cameraId", args.cameraId))
      .first();

    const now = new Date().toISOString();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        type: args.type,
        floor: args.floor,
        zone: args.zone,
        status: args.status,
        lastHeartbeat: now,
        rtspStreamPath: args.rtspStreamPath ?? existing.rtspStreamPath,
        webrtcUrl: args.webrtcUrl ?? existing.webrtcUrl,
        hlsUrl: args.hlsUrl ?? existing.hlsUrl,
        fps: args.fps ?? existing.fps,
        resolution: args.resolution ?? existing.resolution,
        ipAddress: args.ipAddress ?? existing.ipAddress,
        slotIds: args.slotIds ?? existing.slotIds,
        roiCoordinates: args.roiCoordinates ?? existing.roiCoordinates,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("cameras", {
        ...args,
        lastHeartbeat: now,
      });
    }
  },
});

/**
 * Record a verified CCTV camera event with deduplication and reactive sync.
 */
export const recordCameraEvent = mutation({
  args: {
    eventId: v.string(),
    cameraId: v.string(),
    eventType: v.union(
      v.literal("PLATE_DETECTED"),
      v.literal("OCCUPANCY_CHANGED"),
      v.literal("HEARTBEAT"),
      v.literal("ZONE_TRANSIT")
    ),
    timestamp: v.string(),
    plateNumber: v.optional(v.string()),
    confidence: v.optional(v.number()),
    floor: v.optional(v.string()),
    zone: v.optional(v.string()),
    slotId: v.optional(v.string()),
    occupancyStatus: v.optional(v.union(v.literal("available"), v.literal("occupied"), v.literal("maintenance"))),
    rawText: v.optional(v.string()),
    requiresConfirmation: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // 1. Deduplication by eventId
    const existing = await ctx.db
      .query("cameraEvents")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .first();

    if (existing) {
      return { duplicate: true, eventId: args.eventId };
    }

    const processedAt = new Date().toISOString();

    // 2. Insert event record
    await ctx.db.insert("cameraEvents", {
      ...args,
      processedAt,
    });

    // 3. Update camera status to ONLINE & heartbeat
    const camera = await ctx.db
      .query("cameras")
      .withIndex("by_cameraId", (q) => q.eq("cameraId", args.cameraId))
      .first();

    if (camera) {
      await ctx.db.patch(camera._id, {
        status: "ONLINE",
        lastHeartbeat: args.timestamp || processedAt,
      });
    }

    // 4. If PLATE_DETECTED or ZONE_TRANSIT, record vehicle sighting
    if (args.plateNumber && (args.eventType === "PLATE_DETECTED" || args.eventType === "ZONE_TRANSIT")) {
      const cleanPlate = args.plateNumber.replace(/[^A-Z0-9]/gi, "").toUpperCase();
      const sightingType =
        args.eventType === "ZONE_TRANSIT"
          ? "TRANSIT"
          : camera?.type === "ENTRY"
            ? "ENTRY"
            : camera?.type === "EXIT"
              ? "EXIT"
              : "SLOT_PARKED";

      await ctx.db.insert("vehicleSightings", {
        plateNumber: cleanPlate,
        cameraId: args.cameraId,
        cameraName: camera?.name || args.cameraId,
        floor: args.floor || camera?.floor || "B2",
        zone: args.zone || camera?.zone || "Zone A",
        timestamp: args.timestamp || processedAt,
        confidence: args.confidence || 0.9,
        sightingType,
        slotId: args.slotId,
      });
    }

    // 5. If OCCUPANCY_CHANGED, update slotOccupancy and reactive slots table
    if (args.eventType === "OCCUPANCY_CHANGED" && args.slotId && args.occupancyStatus) {
      const existingOccupancy = await ctx.db
        .query("slotOccupancy")
        .withIndex("by_slotId", (q) => q.eq("slotId", args.slotId))
        .first();

      if (existingOccupancy) {
        await ctx.db.patch(existingOccupancy._id, {
          status: args.occupancyStatus,
          lastDetectedAt: args.timestamp || processedAt,
          confidence: args.confidence || 0.95,
          cameraId: args.cameraId,
        });
      } else {
        await ctx.db.insert("slotOccupancy", {
          slotId: args.slotId,
          floor: args.floor || camera?.floor || "B2",
          zone: args.zone || camera?.zone || "Zone A",
          status: args.occupancyStatus,
          lastDetectedAt: args.timestamp || processedAt,
          confidence: args.confidence || 0.95,
          source: "cctv_ai",
          cameraId: args.cameraId,
        });
      }

      // Sync with main slots table if status is available or occupied
      const mainSlot = await ctx.db
        .query("slots")
        .withIndex("by_slotId", (q) => q.eq("slotId", args.slotId))
        .first();

      if (mainSlot) {
        // Only update if not under manual maintenance lock
        if (mainSlot.status !== "maintenance") {
          await ctx.db.patch(mainSlot._id, {
            status: args.occupancyStatus,
            lastOccupancySource: "camera_ai",
            occupancyConfidence: args.confidence || 0.95,
          });
        }
      }
    }

    return { success: true, eventId: args.eventId };
  },
});

/**
 * Batch sync events from local Edge SQLite queue after network reconnection.
 */
export const syncOfflineEventsBatch = mutation({
  args: {
    events: v.array(
      v.object({
        eventId: v.string(),
        cameraId: v.string(),
        eventType: v.union(
          v.literal("PLATE_DETECTED"),
          v.literal("OCCUPANCY_CHANGED"),
          v.literal("HEARTBEAT"),
          v.literal("ZONE_TRANSIT")
        ),
        timestamp: v.string(),
        plateNumber: v.optional(v.string()),
        confidence: v.optional(v.number()),
        floor: v.optional(v.string()),
        zone: v.optional(v.string()),
        slotId: v.optional(v.string()),
        occupancyStatus: v.optional(v.union(v.literal("available"), v.literal("occupied"), v.literal("maintenance"))),
        rawText: v.optional(v.string()),
        requiresConfirmation: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let synced = 0;
    let duplicates = 0;

    for (const evt of args.events) {
      // Check for duplicate
      const existing = await ctx.db
        .query("cameraEvents")
        .withIndex("by_eventId", (q) => q.eq("eventId", evt.eventId))
        .first();

      if (existing) {
        duplicates++;
        continue;
      }

      // Record event
      await ctx.db.insert("cameraEvents", {
        ...evt,
        processedAt: new Date().toISOString(),
      });
      synced++;
    }

    return { synced, duplicates, total: args.events.length };
  },
});
