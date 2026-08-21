// @ts-nocheck
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { signExitToken, verifyExitToken } from "./crypto";
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
      
    return { ...booking, slotDetails: slot };
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

    // Find all bookings with the same vehicle number
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
        bookingNumber: b._id.substring(0, 8).toUpperCase()
      });
    }
    
    return historyWithSlots;
  },
});


export const createBooking = mutation({
  args: {
    slotId: v.string(),
    vehicleNumber: v.string(),
    phoneNumber: v.string(),
    mallName: v.string(),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", args.slotId))
      .first();

    if (!slot || slot.status !== "available") {
      throw new Error("Slot is not available");
    }

    // Cryptographically signed exit QR code token
    const token = await signExitToken(args.slotId + "_" + Date.now());

    const bookingId = await ctx.db.insert("bookings", {
      slotId: args.slotId,
      vehicleNumber: args.vehicleNumber,
      phoneNumber: args.phoneNumber,
      status: "ACTIVE",
      entryTime: new Date().toISOString(),
      mallName: args.mallName,
      customerAccessToken: token,
      smsStatus: "PENDING",
    });

    await ctx.db.patch(slot._id, { status: "occupied" });

    return { bookingId, token };
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
      bookings = bookings.filter(b => b.status === args.status);
    }
    
    // We need slot details to filter by floor and search by pillar
    const bookingsWithSlots = [];
    for (const b of bookings) {
      const slot = await ctx.db
        .query("slots")
        .withIndex("by_slotId", (q) => q.eq("slotId", b.slotId))
        .first();
      bookingsWithSlots.push({ ...b, slotDetails: slot, id: b._id, floor: slot?.floor, zone: slot?.zone, pillar: slot?.pillar, slotNumber: slot?.slotNumber, bookingNumber: b._id.substring(0, 8).toUpperCase() });
    }
    
    let filtered = bookingsWithSlots;
    if (args.floor && args.floor !== "ALL") {
      filtered = filtered.filter(b => b.floor === args.floor);
    }
    
    if (args.query) {
      const q = args.query.toLowerCase();
      filtered = filtered.filter(b => 
        b.vehicleNumber.toLowerCase().includes(q) || 
        b.phoneNumber.includes(q) || 
        b.bookingNumber.toLowerCase().includes(q) ||
        (b.pillar && b.pillar.toLowerCase().includes(q))
      );
    }
    
    if (args.date) {
      filtered = filtered.filter(b => b.entryTime.startsWith(args.date));
    }
    
    return filtered;
  }
});

export const completeBooking = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_customerAccessToken", (q) => q.eq("customerAccessToken", args.token))
      .first();

    if (!booking) {
      throw new Error("Invalid token");
    }
    if (booking.status === "COMPLETED") {
      throw new Error("Booking already completed");
    }

    // Server-side validation of cryptographically signed JWT token
    const verified = await verifyExitToken(args.token);
    if (!verified) {
      throw new Error("Invalid or expired exit pass signature");
    }

    await ctx.db.patch(booking._id, {
      status: "COMPLETED",
      exitTime: new Date().toISOString(),
    });

    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", booking.slotId))
      .first();

    if (slot) {
      await ctx.db.patch(slot._id, { status: "available" });
    }

    return booking;
  },
});

export const retrySms = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "ACTIVE") throw new Error("Can only retry SMS for active bookings");

    // Mark as pending before retry attempt
    await ctx.db.patch(booking._id, { smsStatus: "PENDING" });

    // SMS sending is handled by the server action via configured credentials.
    // If no SMS provider is configured, status stays PENDING and the operator
    // can copy the customer URL manually from the booking panel.
    return { bookingId: args.bookingId, status: "PENDING" };
  },
});

