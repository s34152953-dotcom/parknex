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
});export const seedDefaultOperators = mutation({
  args: {},
  handler: async (ctx) => {
    // Bcrypt hash for "admin123"
    const hash = "$2a$10$e8N8VwzG7yC71Q0w75Erv.w8m6aE69d1dG3QoXmN5K8aM3fR2Xp.m"; // fallback
    const emails = ["parknexadmin.com", "admin@parknexadmin.com", "operator@parknexadmin.com", "admin@parknex.io"];
    
    for (const email of emails) {
      const existing = await ctx.db
        .query("operators")
        .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
        .first();

      if (!existing) {
        await ctx.db.insert("operators", {
          email: email.toLowerCase(),
          passwordHash: "$2a$10$8g4u9B2yMvK2wz8X3w3q5.3F3f3F3f3F3f3F3f3F3f3F3f3F3f3F3",
          name: "ParkNex Administrator",
          role: "admin",
        });
      }
    }
    return { success: true };
  },
});
