// @ts-nocheck
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createReport = mutation({
  args: {
    bookingId: v.optional(v.id("bookings")),
    vehicleNumber: v.string(),
    issueType: v.string(),
    details: v.optional(v.string()),
    mallName: v.optional(v.string()),
    slotNumber: v.optional(v.string()),
    floor: v.optional(v.string()),
    pillar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reportId = await ctx.db.insert("reports", {
      bookingId: args.bookingId,
      vehicleNumber: args.vehicleNumber.toUpperCase(),
      issueType: args.issueType,
      details: args.details || "",
      status: "OPEN",
      createdAt: new Date().toISOString(),
      mallName: args.mallName || "Central Mall Grand",
      slotNumber: args.slotNumber || "",
      floor: args.floor || "B2",
      pillar: args.pillar || "",
    });

    return { success: true, reportId };
  },
});

export const listReports = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let reports = await ctx.db.query("reports").order("desc").collect();
    if (args.status && args.status !== "ALL") {
      reports = reports.filter((r) => r.status === args.status);
    }
    return reports;
  },
});

export const resolveReport = mutation({
  args: {
    reportId: v.id("reports"),
    status: v.optional(v.union(v.literal("OPEN"), v.literal("IN_PROGRESS"), v.literal("RESOLVED"))),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("Report not found");
    const newStatus = args.status || "RESOLVED";
    await ctx.db.patch(args.reportId, { status: newStatus });
    return { success: true, status: newStatus };
  },
});
