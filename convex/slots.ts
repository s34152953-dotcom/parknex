// @ts-nocheck
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const getSlots = query({
  args: { floor: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let slots;
    if (args.floor) {
      slots = await ctx.db
        .query("slots")
        .withIndex("by_floor", (q) => q.eq("floor", args.floor as string))
        .collect();
    } else {
      slots = await ctx.db.query("slots").collect();
    }
    
    // Nearest available slot logic
    const availableSlots = slots.filter(s => s.status === "available");
    const nearestAvailableSlot = availableSlots.length > 0 
      ? availableSlots.reduce((prev, curr) => (prev.distanceFromEntrance < curr.distanceFromEntrance ? prev : curr))
      : null;

    const stats = {
      total: slots.length,
      available: slots.filter(s => s.status === "available").length,
      occupied: slots.filter(s => s.status === "occupied").length,
      reserved: slots.filter(s => s.status === "reserved" || s.status === "temporarily_held").length,
    };

    return { slots, nearestAvailableSlot, stats };
  },
});

export const updateSlotStatus = mutation({
  args: { slotId: v.string(), status: v.union(v.literal("available"), v.literal("occupied"), v.literal("reserved"), v.literal("temporarily_held")) },
  handler: async (ctx, args) => {
    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", args.slotId))
      .first();

    if (!slot) {
      throw new Error("Slot not found");
    }

    await ctx.db.patch(slot._id, { status: args.status });
  },
});

export const holdSlot = mutation({
  args: { slotId: v.string() },
  handler: async (ctx, args) => {
    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", args.slotId))
      .first();

    if (!slot || slot.status !== "available") {
      throw new Error("Slot is not available to hold");
    }

    await ctx.db.patch(slot._id, { status: "temporarily_held" });

    // Schedule auto-release after 3 minutes (180000 ms)
    await ctx.scheduler.runAfter(180000, internal.slots.releaseHold, {
      slotId: args.slotId,
    });
  },
});

export const releaseHold = internalMutation({
  args: { slotId: v.string() },
  handler: async (ctx, args) => {
    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", args.slotId))
      .first();

    // Only release if it's still held (not if they completed booking)
    if (slot && slot.status === "temporarily_held") {
      await ctx.db.patch(slot._id, { status: "available" });
    }
  },
});

export const upsertSlot = mutation({
  args: {
    slotId: v.string(),
    mallId: v.string(),
    mallName: v.string(),
    floor: v.string(),
    zone: v.string(),
    pillar: v.string(),
    slotNumber: v.string(),
    status: v.union(v.literal("available"), v.literal("occupied"), v.literal("reserved"), v.literal("temporarily_held")),
    positionX: v.number(),
    positionY: v.number(),
    positionZ: v.number(),
    rotationY: v.number(),
    distanceFromEntrance: v.number(),
    walkingDirections: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", args.slotId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("slots", args);
    }
  },
});
