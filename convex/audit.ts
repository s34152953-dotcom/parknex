// @ts-nocheck
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logAction = mutation({
  args: {
    operatorEmail: v.string(),
    action: v.string(),
    targetType: v.string(),
    targetId: v.string(),
    reason: v.optional(v.string()),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("audit_logs", {
      operatorEmail: args.operatorEmail,
      action: args.action,
      targetType: args.targetType,
      targetId: args.targetId,
      reason: args.reason,
      details: args.details,
      timestamp: new Date().toISOString(),
    });
  },
});

export const listAuditLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    return await ctx.db
      .query("audit_logs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});
