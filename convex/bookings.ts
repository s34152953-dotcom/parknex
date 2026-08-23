// @ts-nocheck
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  signExitToken,
  verifyExitToken,
  verifyPillarToken,
  signPillarToken,
  generateSecureFallbackCode,
} from "./crypto";

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

export const getActiveBookingByVehicle = query({
  args: { vehicleNumber: v.string() },
  handler: async (ctx, args) => {
    const cleanPlate = args.vehicleNumber.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (!cleanPlate) return null;

    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
      .filter((q) => q.eq(q.field("vehicleNumber"), cleanPlate))
      .first();

    if (!booking) return null;

    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", booking.slotId))
      .first();

    return { ...booking, slotDetails: slot };
  },
});

export const recordManualVehicleVerification = mutation({
  args: {
    vehicleNumber: v.string(),
    operatorEmail: v.string(),
    reason: v.string(),
    physicalMake: v.optional(v.string()),
    physicalModel: v.optional(v.string()),
    physicalColour: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cleanPlate = args.vehicleNumber.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const timestamp = new Date().toISOString();

    if (!args.reason || args.reason.trim().length < 4) {
      throw new Error("A valid mandatory reason (at least 4 characters) is required for manual verification.");
    }

    const auditId = await ctx.db.insert("audit_logs", {
      operatorEmail: args.operatorEmail,
      action: "MANUAL_VEHICLE_VERIFICATION",
      targetType: "vehicle",
      targetId: cleanPlate,
      reason: args.reason.trim(),
      timestamp,
      details: `Operator manually verified RC/registration for ${cleanPlate}. Physical match: ${args.physicalMake || "N/A"} ${args.physicalModel || ""} ${args.physicalColour || ""}`,
    });

    return {
      success: true,
      auditId,
      status: "MANUAL_VERIFIED",
      verifiedAt: timestamp,
    };
  },
});

export const getHistoryByVehicle = query({
  args: { vehicleNumber: v.string() },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("vehicleNumber"), args.vehicleNumber.toUpperCase()))
      .order("desc")
      .take(50);

    const historyWithSlots = [];
    for (const b of history) {
      const slot = await ctx.db
        .query("slots")
        .withIndex("by_slotId", (q) => q.eq("slotId", b.slotId))
        .first();
      historyWithSlots.push({
        ...b,
        slotDetails: slot,
        id: b._id,
        floor: slot?.floor || "B2",
        zone: slot?.zone || "Zone A",
        pillar: slot?.pillar || "Pillar",
        slotNumber: slot?.slotNumber || b.slotId,
        bookingNumber: b._id.substring(0, 8).toUpperCase(),
      });
    }

    return historyWithSlots;
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
        slotDetails: slot,
        id: b._id,
        floor: slot?.floor || "B2",
        zone: slot?.zone || "Zone A",
        pillar: slot?.pillar || "Pillar",
        slotNumber: slot?.slotNumber || b.slotId,
        bookingNumber: b._id.substring(0, 8).toUpperCase(),
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

    if (!slot || (slot.status !== "available" && slot.status !== "temporarily_held")) {
      throw new Error("Slot is not available");
    }

    const cleanPlate = args.vehicleNumber.toUpperCase().trim();

    // Check if vehicle already has an active booking
    const existingActive = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
      .filter((q) => q.eq(q.field("vehicleNumber"), cleanPlate))
      .first();

    if (existingActive) {
      throw new Error(`Vehicle ${cleanPlate} already has an active booking in space ${existingActive.slotId}`);
    }

    const fallbackCode = generateSecureFallbackCode();

    const bookingId = await ctx.db.insert("bookings", {
      slotId: args.slotId,
      vehicleNumber: cleanPlate,
      phoneNumber: args.phoneNumber,
      status: "ACTIVE",
      entryTime: new Date().toISOString(),
      mallName: args.mallName,
      customerAccessToken: "", // set below
      smsStatus: "PENDING",
      exitPassUsed: false,
      exitPassExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      fallbackCode,
    });

    // Cryptographically signed exit QR code token bound to booking & vehicle
    const token = await signExitToken(bookingId.toString(), cleanPlate);

    await ctx.db.patch(bookingId, {
      customerAccessToken: token,
      exitPassToken: token,
    });

    await ctx.db.patch(slot._id, { status: "occupied" });

    return { bookingId, token, customerAccessToken: token, exitPassToken: token, fallbackCode };
  },
});

export const createWalkInEntry = mutation({
  args: {
    slotId: v.string(),
    vehicleNumber: v.string(),
    phoneNumber: v.optional(v.string()),
    email: v.optional(v.string()),
    vehicleType: v.optional(v.union(v.literal("sedan"), v.literal("suv"), v.literal("hatchback"), v.literal("ev"), v.literal("motorcycle"))),
    entryType: v.optional(v.union(v.literal("preregistered"), v.literal("walk_in"))),
    mallName: v.string(),
    operatorEmail: v.optional(v.string()),
    entryPlateConfidence: v.optional(v.number()),
    recommendationScore: v.optional(v.number()),
    recommendationReason: v.optional(v.string()),
    verificationStatus: v.optional(
      v.union(
        v.literal("NOT_CHECKED"),
        v.literal("CHECKING"),
        v.literal("VERIFIED"),
        v.literal("INVALID"),
        v.literal("MISMATCH"),
        v.literal("UNAVAILABLE"),
        v.literal("MANUAL_VERIFIED")
      )
    ),
    vehicleMake: v.optional(v.string()),
    vehicleModel: v.optional(v.string()),
    vehicleColour: v.optional(v.string()),
    vehicleClass: v.optional(v.string()),
    fuelType: v.optional(v.string()),
    verifiedAt: v.optional(v.string()),
    manualVerificationReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cleanPlate = args.vehicleNumber.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    // 1. Enforce active-plate rule on the server (Block duplicate active sessions)
    const existingActive = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
      .filter((q) => q.eq(q.field("vehicleNumber"), cleanPlate))
      .first();

    if (existingActive) {
      throw new Error(`Vehicle ${cleanPlate} already has an active parking session (Assigned Space: ${existingActive.slotId}).`);
    }

    // 2. Re-check slot status inside atomic transaction
    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", args.slotId))
      .first();

    if (!slot || (slot.status !== "available" && slot.status !== "temporarily_held")) {
      throw new Error("Conflict: This parking space is no longer available. Please select another space.");
    }

    const fallbackCode = generateSecureFallbackCode();

    // 3. Insert booking
    const bookingId = await ctx.db.insert("bookings", {
      slotId: args.slotId,
      vehicleNumber: cleanPlate,
      phoneNumber: args.phoneNumber || "",
      email: args.email || "",
      entryType: args.entryType || "walk_in",
      vehicleType: args.vehicleType || "sedan",
      status: "ACTIVE",
      entryTime: new Date().toISOString(),
      mallName: args.mallName,
      customerAccessToken: "",
      smsStatus: args.phoneNumber ? "PENDING" : "SENT",
      emailStatus: args.email ? "queued" : "not_requested",
      emailRecipient: args.email ? args.email.trim().toLowerCase() : undefined,
      emailLastAttemptAt: args.email ? new Date().toISOString() : undefined,
      exitPassUsed: false,
      exitPassExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      fallbackCode,
      operatorId: args.operatorEmail,
      entryPlateConfidence: args.entryPlateConfidence,
      recommendationScore: args.recommendationScore,
      recommendationReason: args.recommendationReason,
      verificationStatus: args.verificationStatus || "NOT_CHECKED",
      vehicleMake: args.vehicleMake,
      vehicleModel: args.vehicleModel,
      vehicleColour: args.vehicleColour,
      vehicleClass: args.vehicleClass,
      fuelType: args.fuelType,
      verifiedAt: args.verifiedAt,
      manualVerificationReason: args.manualVerificationReason,
    });

    // 4. Generate signed cryptographic exit token
    const token = await signExitToken(bookingId.toString(), cleanPlate);

    await ctx.db.patch(bookingId, {
      customerAccessToken: token,
      exitPassToken: token,
    });

    // 5. Lock space atomically
    await ctx.db.patch(slot._id, {
      status: "occupied",
      lastOccupancySource: args.entryPlateConfidence ? "camera_ai" : "operator_confirmation",
      occupancyConfidence: args.entryPlateConfidence || 1.0,
    });

    // 6. Record audit log
    if (args.operatorEmail) {
      await ctx.db.insert("audit_logs", {
        operatorEmail: args.operatorEmail,
        action: "SLOT_ASSIGNMENT",
        targetType: "booking",
        targetId: bookingId.toString(),
        details: `Assigned ${cleanPlate} to Space ${slot.slotNumber} (${slot.floor} ${slot.zone})`,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      bookingId,
      token,
      customerAccessToken: token,
      exitPassToken: token,
      fallbackCode,
      slotNumber: slot.slotNumber,
      floor: slot.floor,
      zone: slot.zone,
      pillar: slot.pillar,
    };
  },
});

export const completeExitWithVerification = mutation({
  args: {
    tokenOrCode: v.string(),
    exitDetectedPlate: v.optional(v.string()),
    exitPlateConfidence: v.optional(v.number()),
    operatorEmail: v.optional(v.string()),
    overrideReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let input = (args.tokenOrCode || "").trim();
    if (!input) {
      return {
        success: false,
        error: "Please enter a parking slot name (e.g. A-01, B-12) or scan an exit pass.",
      };
    }

    // If input is a URL (e.g. https://.../customer/TOKEN or /customer/TOKEN?token=...)
    if (input.includes("/customer/")) {
      const parts = input.split("/customer/");
      if (parts[1]) {
        input = parts[1].split("?")[0].split("/")[0].trim();
      }
    } else if (input.includes("token=")) {
      const match = input.match(/[?&]token=([^&]+)/);
      if (match && match[1]) {
        input = decodeURIComponent(match[1]).trim();
      }
    }

    let booking: any = null;

    // 1. Try finding by exact customerAccessToken
    booking = await ctx.db
      .query("bookings")
      .withIndex("by_customerAccessToken", (q) => q.eq("customerAccessToken", input))
      .first();

    // 2. Try finding by fallbackCode (e.g. PNX-XXXXXX or XXXXXX)
    if (!booking) {
      const upperInput = input.toUpperCase();
      booking = await ctx.db
        .query("bookings")
        .withIndex("by_fallbackCode", (q) => q.eq("fallbackCode", upperInput))
        .first();

      if (!booking && !upperInput.startsWith("PNX-")) {
        booking = await ctx.db
          .query("bookings")
          .withIndex("by_fallbackCode", (q) => q.eq("fallbackCode", `PNX-${upperInput}`))
          .first();
      }
    }

    // 3. Try finding by Parking Slot Identifier (e.g. A-01, A01, A1, B-12, B12, b2-zonea-01)
    if (!booking) {
      const cleanSlot = input.replace(/[^A-Z0-9]/gi, "").toUpperCase();
      if (cleanSlot.length >= 1) {
        const activeBookings = await ctx.db
          .query("bookings")
          .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
          .collect();

        // Check against active booking slotId
        booking =
          activeBookings.find((b) => {
            const bSlotClean = (b.slotId || "").replace(/[^A-Z0-9]/gi, "").toUpperCase();
            return (
              bSlotClean === cleanSlot ||
              bSlotClean.endsWith(cleanSlot) ||
              cleanSlot.endsWith(bSlotClean) ||
              (b.slotId && b.slotId.toUpperCase() === input.toUpperCase())
            );
          }) || null;

        // If not found directly, match against all slots in database
        if (!booking) {
          const allSlots = await ctx.db.query("slots").collect();
          const matchedSlot = allSlots.find((s) => {
            const sNumClean = (s.slotNumber || "").replace(/[^A-Z0-9]/gi, "").toUpperCase();
            const sIdClean = (s.slotId || "").replace(/[^A-Z0-9]/gi, "").toUpperCase();
            const sPillarClean = (s.pillar || "").replace(/[^A-Z0-9]/gi, "").toUpperCase();

            // Handle variations like "A1" -> "A01", "B2" -> "B02"
            let zeroPadded = cleanSlot;
            if (/^[A-Z][1-9]$/.test(cleanSlot)) {
              zeroPadded = cleanSlot[0] + "0" + cleanSlot[1];
            }

            return (
              sNumClean === cleanSlot ||
              sNumClean === zeroPadded ||
              sIdClean === cleanSlot ||
              sIdClean.endsWith(cleanSlot) ||
              sPillarClean === cleanSlot ||
              (s.slotNumber && s.slotNumber.toUpperCase() === input.toUpperCase())
            );
          });

          if (matchedSlot) {
            booking = activeBookings.find((b) => b.slotId === matchedSlot.slotId) || null;
            if (!booking) {
              return {
                success: false,
                notFound: true,
                error: `Space "${matchedSlot.slotNumber}" (${matchedSlot.floor} · ${matchedSlot.zone}) is currently ${matchedSlot.status.toUpperCase()} with no active session.`,
              };
            }
          }
        }
      }
    }

    // 4. Try finding directly by Convex Document ID
    if (!booking) {
      try {
        const maybeBooking = await ctx.db.get(input as any);
        if (maybeBooking && (maybeBooking as any).vehicleNumber) {
          booking = maybeBooking;
        }
      } catch {}
    }

    // 5. If input is a JWT, verify signature and retrieve bookingId from payload
    if (!booking && input.includes(".")) {
      try {
        const verified = await verifyExitToken(input);
        if (verified && verified.bookingId) {
          try {
            booking = await ctx.db.get(verified.bookingId);
          } catch {}
        }
      } catch {}
    }

    // 6. Try finding by vehicle registration number (e.g. AP28 AX 7029 or MH02AB1234)
    if (!booking) {
      const normalizedPlate = input.replace(/[^A-Z0-9]/gi, "").toUpperCase();
      if (normalizedPlate.length >= 4) {
        const activeBookings = await ctx.db
          .query("bookings")
          .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
          .collect();

        booking =
          activeBookings.find(
            (b) => b.vehicleNumber.replace(/[^A-Z0-9]/gi, "").toUpperCase() === normalizedPlate
          ) || null;
      }
    }

    // 7. Search active bookings for matching exitPassToken
    if (!booking) {
      const activeBookings = await ctx.db
        .query("bookings")
        .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
        .collect();

      booking = activeBookings.find((b) => b.exitPassToken === input || b.customerAccessToken === input) || null;
    }

    if (!booking) {
      return {
        success: false,
        notFound: true,
        error: `No active parking session found for "${input}". Please check the space number (e.g. A-01) or vehicle plate.`,
      };
    }

    // Handle already completed state gracefully
    if (booking.status === "COMPLETED" || booking.exitPassUsed) {
      return {
        success: false,
        alreadyCompleted: true,
        bookingId: booking._id,
        vehicleNumber: booking.vehicleNumber,
        slotNumber: booking.slotId,
        exitTime: booking.exitTime,
        error: `This exit pass was already processed at ${booking.exitTime ? new Date(booking.exitTime).toLocaleTimeString("en-IN") : "an earlier gate"}. Space is already released.`,
      };
    }

    if (booking.status !== "ACTIVE") {
      return {
        success: false,
        bookingId: booking._id,
        vehicleNumber: booking.vehicleNumber,
        slotNumber: booking.slotId,
        error: `Booking status is ${booking.status}. Only ACTIVE bookings can exit.`,
      };
    }

    // 7. Compare detected plate with booking plate
    const cleanExitPlate = args.exitDetectedPlate ? args.exitDetectedPlate.toUpperCase().trim() : "";
    const cleanBookingPlate = booking.vehicleNumber.toUpperCase().trim();

    if (cleanExitPlate && cleanExitPlate !== cleanBookingPlate && !args.overrideReason) {
      return {
        success: false,
        mismatch: true,
        bookingId: booking._id,
        expectedPlate: cleanBookingPlate,
        detectedPlate: cleanExitPlate,
        error: `Plate mismatch: Exit camera detected ${cleanExitPlate}, but pass was issued to ${cleanBookingPlate}.`,
      };
    }

    // 8. Atomically consume exit pass
    const exitTime = new Date().toISOString();
    await ctx.db.patch(booking._id, {
      status: "COMPLETED",
      exitTime,
      exitPassUsed: true,
      exitDetectedPlate: cleanExitPlate || undefined,
      exitPlateConfidence: args.exitPlateConfidence,
    });

    // 9. Free parking space
    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", booking.slotId))
      .first();

    if (slot) {
      await ctx.db.patch(slot._id, { status: "available" });
    }

    // 10. Record audit log
    if (args.operatorEmail) {
      await ctx.db.insert("audit_logs", {
        operatorEmail: args.operatorEmail,
        action: args.overrideReason ? "MANUAL_OVERRIDE_EXIT" : "NORMAL_EXIT_COMPLETION",
        targetType: "booking",
        targetId: booking._id.toString(),
        reason: args.overrideReason,
        details: `Exit completed for ${cleanBookingPlate}. Space ${slot?.slotNumber || booking.slotId} released.`,
        timestamp: exitTime,
      });
    }

    return {
      success: true,
      status: "COMPLETED",
      bookingId: booking._id,
      vehicleNumber: cleanBookingPlate,
      slotNumber: slot?.slotNumber || booking.slotId,
      exitTime,
    };
  },
});

export const listActiveSessions = query({
  args: {
    floor: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let bookings = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
      .order("desc")
      .collect();

    const result = [];
    for (const b of bookings) {
      const slot = await ctx.db
        .query("slots")
        .withIndex("by_slotId", (q) => q.eq("slotId", b.slotId))
        .first();

      if (args.floor && args.floor !== "ALL" && slot?.floor !== args.floor) {
        continue;
      }

      if (args.search) {
        const q = args.search.toLowerCase();
        const matches =
          b.vehicleNumber.toLowerCase().includes(q) ||
          b.phoneNumber.includes(q) ||
          (b.email && b.email.toLowerCase().includes(q)) ||
          (b.fallbackCode && b.fallbackCode.toLowerCase().includes(q)) ||
          (slot?.slotNumber && slot.slotNumber.toLowerCase().includes(q)) ||
          (slot?.pillar && slot.pillar.toLowerCase().includes(q));
        if (!matches) continue;
      }

      result.push({
        ...b,
        slotDetails: slot,
        id: b._id,
        floor: slot?.floor || "B2",
        zone: slot?.zone || "Zone A",
        pillar: slot?.pillar || "Pillar",
        slotNumber: slot?.slotNumber || b.slotId,
      });
    }

    return result;
  },
});

export const getLiveStats = query({
  args: {
    floor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let slots = await ctx.db.query("slots").collect();
    if (args.floor && args.floor !== "ALL") {
      slots = slots.filter((s) => s.floor === args.floor);
    }

    let activeBookings = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
      .collect();

    if (args.floor && args.floor !== "ALL") {
      const floorSlotIds = new Set(slots.map((s) => s.slotId));
      activeBookings = activeBookings.filter((b) => floorSlotIds.has(b.slotId));
    }

    const available = slots.filter((s) => s.status === "available").length;
    const occupied = slots.filter((s) => s.status === "occupied").length;
    const reserved = slots.filter((s) => s.status === "reserved" || s.status === "temporarily_held").length;
    const maintenance = slots.filter((s) => s.status === "maintenance").length;

    return {
      total: slots.length,
      available,
      occupied,
      reserved,
      maintenance,
      vehiclesInside: activeBookings.length,
    };
  },
});

export const confirmPillarLocation = mutation({
  args: {
    bookingId: v.id("bookings"),
    pillarTokenOrCode: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "ACTIVE") throw new Error("Booking is no longer active");

    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", booking.slotId))
      .first();

    if (!slot) throw new Error("Slot details not found");

    const input = args.pillarTokenOrCode.trim();
    let confirmedPillarName = slot.pillar;

    if (input.includes(".")) {
      const verifiedPillar = await verifyPillarToken(input);
      if (!verifiedPillar) {
        throw new Error("Invalid or expired pillar QR token");
      }
      if (verifiedPillar.floor !== slot.floor) {
        throw new Error(`Wrong floor detected (${verifiedPillar.floor}). Your space is on Floor ${slot.floor}`);
      }
      confirmedPillarName = verifiedPillar.pillar || slot.pillar;
    } else {
      const normalizedInput = input.toUpperCase().replace(/\s+/g, "");
      const normalizedPillar = slot.pillar.toUpperCase().replace(/\s+/g, "");
      const normalizedSlot = slot.slotNumber.toUpperCase().replace(/\s+/g, "");
      const normalizedSlotId = slot.slotId.toUpperCase().replace(/\s+/g, "");

      const matches =
        normalizedInput.includes(normalizedPillar) ||
        normalizedPillar.includes(normalizedInput) ||
        normalizedInput === normalizedSlot ||
        normalizedInput === normalizedSlotId ||
        normalizedInput === slot.pillar.toUpperCase();

      if (!matches) {
        if (input.length >= 2) {
          confirmedPillarName = input.startsWith("Pillar") ? input : `Pillar ${input.replace(/[^0-9]/g, "") || input}`;
        } else {
          throw new Error(`Pillar code "${input}" does not match your assigned area (${slot.pillar} on Floor ${slot.floor})`);
        }
      }
    }

    const confirmedAt = new Date().toISOString();
    await ctx.db.patch(booking._id, {
      pillarConfirmedAt: confirmedAt,
      confirmedPillar: confirmedPillarName,
    });

    return {
      success: true,
      confirmedPillar: confirmedPillarName,
      floor: slot.floor,
      zone: slot.zone,
      slotNumber: slot.slotNumber,
      confirmedAt,
    };
  },
});

export const generatePillarQrToken = mutation({
  args: {
    mallId: v.string(),
    floor: v.string(),
    zone: v.string(),
    pillar: v.string(),
    slotNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await signPillarToken({
      mallId: args.mallId,
      floor: args.floor,
      zone: args.zone,
      pillar: args.pillar,
      slotNumber: args.slotNumber,
    });
  },
});

export const completeBooking = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_customerAccessToken", (q) => q.eq("customerAccessToken", args.token))
      .first();

    if (!booking) {
      throw new Error("Invalid exit pass token");
    }
    if (booking.status === "COMPLETED" || booking.exitPassUsed) {
      throw new Error("This exit pass has already been used");
    }

    const verified = await verifyExitToken(args.token);
    if (!verified) {
      throw new Error("Invalid, unverified or expired exit pass signature");
    }

    const exitTime = new Date().toISOString();
    await ctx.db.patch(booking._id, {
      status: "COMPLETED",
      exitTime,
      exitPassUsed: true,
    });

    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", booking.slotId))
      .first();

    if (slot) {
      await ctx.db.patch(slot._id, { status: "available" });
    }

    return {
      ...booking,
      status: "COMPLETED",
      exitTime,
      exitPassUsed: true,
    };
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

export const retrySms = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "ACTIVE") throw new Error("Can only retry SMS for active bookings");

    await ctx.db.patch(booking._id, { smsStatus: "PENDING" });
    return { bookingId: args.bookingId, status: "PENDING" };
  },
});

export const updateEmailDeliveryStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    emailStatus: v.union(
      v.literal("not_requested"),
      v.literal("queued"),
      v.literal("sent"),
      v.literal("failed")
    ),
    emailRecipient: v.optional(v.string()),
    providerMessageId: v.optional(v.string()),
    lastError: v.optional(v.string()),
    sentAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    const now = new Date().toISOString();
    await ctx.db.patch(args.bookingId, {
      emailStatus: args.emailStatus,
      emailRecipient: args.emailRecipient !== undefined ? args.emailRecipient : booking.emailRecipient,
      providerMessageId: args.providerMessageId !== undefined ? args.providerMessageId : booking.providerMessageId,
      emailProviderId: args.providerMessageId !== undefined ? args.providerMessageId : booking.emailProviderId,
      lastError: args.lastError !== undefined ? args.lastError : booking.lastError,
      emailFailureReason: args.lastError !== undefined ? args.lastError : booking.emailFailureReason,
      sentAt: args.sentAt !== undefined ? args.sentAt : (args.emailStatus === "sent" ? now : booking.sentAt),
      emailLastAttemptAt: now,
    });

    return { success: true, bookingId: args.bookingId, emailStatus: args.emailStatus };
  },
});

export const retryEmailDelivery = mutation({
  args: {
    bookingId: v.id("bookings"),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "ACTIVE") throw new Error("Can only retry email for active parking sessions");

    // Rate limiting: prevent excessive retries (max 10 retries per session)
    const currentRetries = booking.retryCount || 0;
    if (currentRetries >= 10) {
      throw new Error("Maximum email retry limit reached for this parking session.");
    }

    const targetEmail = args.email ? args.email.trim().toLowerCase() : (booking.email || booking.emailRecipient);
    if (!targetEmail) throw new Error("No customer email address on record for this session");

    const slot = await ctx.db
      .query("slots")
      .withIndex("by_slotId", (q) => q.eq("slotId", booking.slotId))
      .first();

    const now = new Date().toISOString();
    await ctx.db.patch(args.bookingId, {
      email: targetEmail,
      emailRecipient: targetEmail,
      emailStatus: "queued",
      retryCount: currentRetries + 1,
      emailLastAttemptAt: now,
      lastError: undefined,
      emailFailureReason: undefined,
    });

    return {
      bookingId: booking._id,
      token: booking.customerAccessToken || booking.exitPassToken,
      email: targetEmail,
      vehicleNumber: booking.vehicleNumber,
      mallName: booking.mallName,
      slotNumber: slot?.slotNumber || booking.slotId,
      floor: slot?.floor || "B2",
      zone: slot?.zone || "Zone A",
      pillar: slot?.pillar || "Pillar",
      fallbackCode: booking.fallbackCode,
      retryCount: currentRetries + 1,
    };
  },
});
