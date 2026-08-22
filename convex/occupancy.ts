// @ts-nocheck
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const recordOccupancyEvent = mutation({
  args: {
    slotId: v.string(),
    source: v.union(
      v.literal("camera_ai"),
      v.literal("physical_sensor"),
      v.literal("pillar_qr"),
      v.literal("operator_confirmation")
    ),
    confidence: v.number(),
    isOccupied: v.boolean(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Insert event into occupancy_events table
    const eventId = await ctx.db.insert("occupancy_events", {
      slotId: args.slotId,
      source: args.source,
      confidence: args.confidence,
      isOccupied: args.isOccupied,
      timestamp: new Date().toISOString(),
      details: args.details,
    });

    // 2. Update slot status with source and confidence
    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", args.slotId))
      .first();

    if (slot) {
      await ctx.db.patch(slot._id, {
        status: args.isOccupied ? "occupied" : "available",
        lastOccupancySource: args.source,
        occupancyConfidence: args.confidence,
      });
    }

    return { eventId, success: true };
  },
});

export const listOccupancyEvents = query({
  args: {
    slotId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    if (args.slotId) {
      return await ctx.db
        .query("occupancy_events")
        .withIndex("by_slotId", (q) => q.eq("slotId", args.slotId))
        .order("desc")
        .take(limit);
    }
    return await ctx.db
      .query("occupancy_events")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});
