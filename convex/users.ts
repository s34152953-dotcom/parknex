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
    vehicleType: v.optional(
      v.union(
        v.literal("sedan"),
        v.literal("suv"),
        v.literal("hatchback"),
        v.literal("ev"),
        v.literal("motorcycle")
      )
    ),
    vehicleMake: v.optional(v.string()),
    vehicleModel: v.optional(v.string()),
    vehicleColour: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    const patchData: any = {};
    if (args.name) patchData.name = args.name;
    if (args.vehicleNumber !== undefined) patchData.vehicleNumber = args.vehicleNumber;
    if (args.vehicleType !== undefined) patchData.vehicleType = args.vehicleType;
    if (args.vehicleMake !== undefined) patchData.vehicleMake = args.vehicleMake;
    if (args.vehicleModel !== undefined) patchData.vehicleModel = args.vehicleModel;
    if (args.vehicleColour !== undefined) patchData.vehicleColour = args.vehicleColour;
    if (args.phoneNumber !== undefined) patchData.phoneNumber = args.phoneNumber;

    if (existing) {
      if (Object.keys(patchData).length > 0) {
        await ctx.db.patch(existing._id, patchData);
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      vehicleNumber: args.vehicleNumber,
      vehicleType: args.vehicleType,
      vehicleMake: args.vehicleMake,
      vehicleModel: args.vehicleModel,
      vehicleColour: args.vehicleColour,
      phoneNumber: args.phoneNumber,
    });
  },
});

export const updateVehicleDetails = mutation({
  args: {
    email: v.string(),
    vehicleNumber: v.string(),
    vehicleType: v.optional(
      v.union(
        v.literal("sedan"),
        v.literal("suv"),
        v.literal("hatchback"),
        v.literal("ev"),
        v.literal("motorcycle")
      )
    ),
    vehicleMake: v.optional(v.string()),
    vehicleModel: v.optional(v.string()),
    vehicleColour: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cleanPlate = args.vehicleNumber.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().trim();
    if (!cleanPlate) {
      throw new Error("A valid vehicle license plate number is required.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    const updatePayload: any = {
      vehicleNumber: cleanPlate,
      vehicleType: args.vehicleType || "sedan",
      vehicleMake: args.vehicleMake || "",
      vehicleModel: args.vehicleModel || "",
      vehicleColour: args.vehicleColour || "",
      phoneNumber: args.phoneNumber || "",
    };

    if (user) {
      await ctx.db.patch(user._id, updatePayload);
      return { success: true, userId: user._id, vehicleNumber: cleanPlate };
    } else {
      const newUserId = await ctx.db.insert("users", {
        email: args.email,
        name: args.email.split("@")[0],
        ...updatePayload,
      });
      return { success: true, userId: newUserId, vehicleNumber: cleanPlate };
    }
  },
});
