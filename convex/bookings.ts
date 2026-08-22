// @ts-nocheck
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { signExitToken, verifyExitToken, generateAccessToken } from "./crypto";

// ── Queries ──

export const getBookingByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_customerAccessToken", (q) => q.eq("customerAccessToken", args.token))
      .first();

    if (!booking) return null;

    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", booking.slotId))
      .first();

    return {
      ...booking,
      slotDetails: slot,
      // Flatten slot fields for convenience
      floor: slot?.floor,
      zone: slot?.zone,
      pillar: slot?.pillar,
      slotNumber: slot?.slotNumber,
      distanceFromEntrance: slot?.distanceFromEntrance,
      walkingDirections: slot?.walkingDirections,
      positionX: slot?.positionX,
      positionY: slot?.positionY,
      positionZ: slot?.positionZ,
      bookingNumber: booking._id.substring(0, 8).toUpperCase(),
    };
  },
});

export const getBookingByExitPass = query({
  args: { exitPassToken: v.string() },
  handler: async (ctx, args) => {
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_exitPassToken", (q) => q.eq("exitPassToken", args.exitPassToken))
      .first();

    if (!booking) return null;

    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", booking.slotId))
      .first();

    return {
      ...booking,
      slotDetails: slot,
      floor: slot?.floor,
      zone: slot?.zone,
      pillar: slot?.pillar,
      slotNumber: slot?.slotNumber,
      distanceFromEntrance: slot?.distanceFromEntrance,
      walkingDirections: slot?.walkingDirections,
      positionX: slot?.positionX,
      positionY: slot?.positionY,
      positionZ: slot?.positionZ,
      bookingNumber: booking._id.substring(0, 8).toUpperCase(),
    };
  },
});

export const getActiveBookingByVehicle = query({
  args: { vehicleNumber: v.string() },
  handler: async (ctx, args) => {
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
      .filter((q) => q.eq(q.field("vehicleNumber"), args.vehicleNumber.toUpperCase()))
      .first();
    if (!booking) return null;
    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", booking.slotId))
      .first();
    return { ...booking, slotDetails: slot };
  },
});

export const getHistoryByVehicle = query({
  args: { vehicleNumber: v.string() },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("vehicleNumber"), args.vehicleNumber.toUpperCase()))
      .order("desc")
      .take(20);
    return history;
  },
});

export const getCustomerHistory = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_customerAccessToken", (q) => q.eq("customerAccessToken", args.token))
      .first();

    if (!booking) return [];

    const history = await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("vehicleNumber"), booking.vehicleNumber))
      .order("desc")
      .collect();

    const historyWithSlots = [];
    for (const b of history) {
      const slot = await ctx.db
        .query("slots")
        .withIndex("by_slotId", (q) => q.eq("slotId", b.slotId))
        .first();
      historyWithSlots.push({
        ...b,
        id: b._id,
        floor: slot?.floor,
        zone: slot?.zone,
        pillar: slot?.pillar,
        slotNumber: slot?.slotNumber,
        bookingNumber: b._id.substring(0, 8).toUpperCase(),
      });
    }

    return historyWithSlots;
  },
});

export const listBookings = query({
  args: {
    status: v.optional(v.string()),
    floor: v.optional(v.string()),
    query: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let bookings = await ctx.db.query("bookings").order("desc").collect();

    if (args.status && args.status !== "ALL") {
      bookings = bookings.filter((b) => b.status === args.status);
    }

    const bookingsWithSlots = [];
    for (const b of bookings) {
      const slot = await ctx.db
        .query("slots")
        .withIndex("by_slotId", (q) => q.eq("slotId", b.slotId))
        .first();
      bookingsWithSlots.push({
        ...b,
        slotDetails: slot,
        id: b._id,
        floor: slot?.floor,
        zone: slot?.zone,
        pillar: slot?.pillar,
        slotNumber: slot?.slotNumber,
        bookingNumber: b._id.substring(0, 8).toUpperCase(),
      });
    }

    let filtered = bookingsWithSlots;
    if (args.floor && args.floor !== "ALL") {
      filtered = filtered.filter((b) => b.floor === args.floor);
    }

    if (args.query) {
      const q = args.query.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.vehicleNumber.toLowerCase().includes(q) ||
          b.phoneNumber.includes(q) ||
          b.bookingNumber.toLowerCase().includes(q) ||
          (b.pillar && b.pillar.toLowerCase().includes(q))
      );
    }

    if (args.date) {
      filtered = filtered.filter((b) => b.entryTime.startsWith(args.date));
    }

    return filtered;
  },
});

// ── Mutations ──

export const createBooking = mutation({
  args: {
    slotId: v.string(),
    vehicleNumber: v.string(),
    phoneNumber: v.string(),
    mallName: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Validate slot exists and is available
    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", args.slotId))
      .first();

    if (!slot) {
      throw new Error("Parking space does not exist.");
    }
    if (slot.status !== "available" && slot.status !== "temporarily_held") {
      throw new Error("Parking space is not available. It may have been taken by another vehicle.");
    }

    // 2. Check for duplicate active booking with same vehicle
    const existingActive = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
      .filter((q) => q.eq(q.field("vehicleNumber"), args.vehicleNumber.toUpperCase()))
      .first();
    if (existingActive) {
      throw new Error(`Vehicle ${args.vehicleNumber.toUpperCase()} already has an active booking.`);
    }

    // 3. Generate cryptographic tokens
    const customerAccessToken = generateAccessToken();
    const exitPassToken = await signExitToken(args.slotId + "_" + Date.now());

    // 4. Create booking record atomically
    const bookingId = await ctx.db.insert("bookings", {
      slotId: args.slotId,
      vehicleNumber: args.vehicleNumber.toUpperCase().trim(),
      phoneNumber: args.phoneNumber.trim(),
      status: "ACTIVE",
      entryTime: new Date().toISOString(),
      mallName: args.mallName,
      customerAccessToken,
      exitPassToken,
      exitPassUsed: false,
      smsStatus: "PENDING",
    });

    // 5. Mark slot as occupied
    await ctx.db.patch(slot._id, { status: "occupied" });

    return {
      bookingId,
      customerAccessToken,
      exitPassToken,
      slotNumber: slot.slotNumber,
      floor: slot.floor,
      zone: slot.zone,
      pillar: slot.pillar,
      distanceFromEntrance: slot.distanceFromEntrance,
    };
  },
});

export const updateSmsStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    smsStatus: v.union(v.literal("SENT"), v.literal("FAILED"), v.literal("PENDING")),
    smsMessageId: v.optional(v.string()),
    smsProvider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    const patch: any = { smsStatus: args.smsStatus };
    if (args.smsMessageId) patch.smsMessageId = args.smsMessageId;
    if (args.smsProvider) patch.smsProvider = args.smsProvider;

    await ctx.db.patch(booking._id, patch);
    return { success: true };
  },
});

export const completeBooking = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Look up by exitPassToken first
    let booking = await ctx.db
      .query("bookings")
      .withIndex("by_exitPassToken", (q) => q.eq("exitPassToken", args.token))
      .first();

    // Fallback: look up by customerAccessToken for backwards compatibility
    if (!booking) {
      booking = await ctx.db
        .query("bookings")
        .withIndex("by_customerAccessToken", (q) => q.eq("customerAccessToken", args.token))
        .first();
    }

    if (!booking) {
      throw new Error("Invalid exit pass. No booking found.");
    }
    if (booking.status === "COMPLETED") {
      throw new Error("This exit pass has already been used. Booking is completed.");
    }
    if (booking.status === "CANCELLED") {
      throw new Error("This booking has been cancelled.");
    }
    if (booking.exitPassUsed) {
      throw new Error("This exit pass has already been scanned.");
    }

    // Verify the cryptographic signature of the exit pass
    const verified = await verifyExitToken(booking.exitPassToken);
    if (!verified) {
      throw new Error("Exit pass signature is invalid or expired.");
    }

    // Atomically mark booking as completed and exit pass as used
    await ctx.db.patch(booking._id, {
      status: "COMPLETED",
      exitTime: new Date().toISOString(),
      exitPassUsed: true,
    });

    // Release the parking space
    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", booking.slotId))
      .first();

    if (slot) {
      await ctx.db.patch(slot._id, { status: "available" });
    }

    return {
      success: true,
      vehicleNumber: booking.vehicleNumber,
      slotId: booking.slotId,
      entryTime: booking.entryTime,
      exitTime: new Date().toISOString(),
    };
  },
});

export const retrySms = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "ACTIVE") throw new Error("Can only retry SMS for active bookings");

    // Mark as pending before retry
    await ctx.db.patch(booking._id, { smsStatus: "PENDING" });

    // Return the booking details needed for the Next.js API to send SMS
    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", booking.slotId))
      .first();

    return {
      bookingId: args.bookingId,
      phoneNumber: booking.phoneNumber,
      vehicleNumber: booking.vehicleNumber,
      customerAccessToken: booking.customerAccessToken,
      floor: slot?.floor || "",
      zone: slot?.zone || "",
      pillar: slot?.pillar || "",
      slotNumber: slot?.slotNumber || "",
      status: "PENDING",
    };
  },
});
