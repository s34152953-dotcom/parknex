// @ts-nocheck
import { mutation } from "./_generated/server";
import { signExitToken, generateAccessToken } from "./crypto";

/**
 * One-time migration to add missing fields to existing bookings.
 * Run once via Convex dashboard or `npx convex run migrations:migrateBookings`
 */
export const migrateBookings = mutation({
  handler: async (ctx) => {
    const bookings = await ctx.db.query("bookings").collect();
    let migrated = 0;

    for (const booking of bookings) {
      const updates: any = {};

      // Add exitPassToken if missing
      if (!booking.exitPassToken) {
        updates.exitPassToken = await signExitToken(booking.slotId + "_" + Date.now() + "_migrated");
      }

      // Add exitPassUsed if missing
      if (booking.exitPassUsed === undefined) {
        updates.exitPassUsed = booking.status === "COMPLETED";
      }

      // Add smsMessageId if missing
      if (booking.smsMessageId === undefined) {
        updates.smsMessageId = "";
      }

      // Add smsProvider if missing
      if (booking.smsProvider === undefined) {
        updates.smsProvider = "";
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(booking._id, updates);
        migrated++;
      }
    }

    return `Migrated ${migrated} bookings.`;
  },
});
