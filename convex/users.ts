// @ts-nocheck
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const upsertUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    vehicleNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      if (args.vehicleNumber !== undefined) {
        await ctx.db.patch(existing._id, { vehicleNumber: args.vehicleNumber });
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      vehicleNumber: args.vehicleNumber,
    });
  },
});
