import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getOperatorByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("operators")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const createOperator = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("operators")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error(`Operator with email ${args.email} already exists.`);
    }

    return await ctx.db.insert("operators", {
      email: args.email.toLowerCase(),
      passwordHash: args.passwordHash,
      name: args.name,
      role: args.role,
    });
  },
});
