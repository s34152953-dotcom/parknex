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

export const resetDefaultOperators = mutation({
  handler: async (ctx) => {
    // Valid bcrypt hash for password "admin123"
    const validHash = "$2b$10$i4gqvOzl5jV7QJwRul5k0eJvs9uwTezQU2R9RF01i.PxaPOb5O7Mq";
    const accounts = [
      { email: "admin@parknex.com", name: "Admin Operator", role: "operator" },
      { email: "admin@parknex.io", name: "Lead Operator", role: "operator" },
    ];

    for (const acc of accounts) {
      const existing = await ctx.db
        .query("operators")
        .withIndex("by_email", (q) => q.eq("email", acc.email))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { passwordHash: validHash });
      } else {
        await ctx.db.insert("operators", {
          email: acc.email,
          name: acc.name,
          role: acc.role,
          passwordHash: validHash,
        });
      }
    }
    return "Default operators updated with valid password hash.";
  },
});

