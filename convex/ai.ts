// @ts-nocheck
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── 1. COMMAND CENTER METRICS & OCCUPANCY STATS ──
export const getCommandCenterStats = query({
  args: { facilityId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const slots = await ctx.db.query("slots").collect();
    const activeBookings = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
      .collect();

    const totalSpaces = slots.length;
    const occupiedSpaces = slots.filter((s) => s.status === "occupied").length;
    const reservedSpaces = slots.filter((s) => s.status === "reserved" || s.status === "temporarily_held").length;
    const maintenanceSpaces = slots.filter((s) => s.status === "maintenance").length;
    const availableSpaces = slots.filter((s) => s.status === "available").length;
    const occupancyRate = totalSpaces > 0 ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0;

    const vehiclesInside = activeBookings.length;

    // Calculate average parking duration for active bookings
    const now = Date.now();
    let totalDurationMinutes = 0;
    for (const b of activeBookings) {
      const entryMs = new Date(b.entryTime).getTime();
      if (!isNaN(entryMs)) {
        totalDurationMinutes += Math.max(0, Math.floor((now - entryMs) / 60000));
      }
    }
    const avgDurationMinutes = activeBookings.length > 0 ? Math.round(totalDurationMinutes / activeBookings.length) : 0;

    // AI Metrics
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayIso = todayStart.toISOString();

    const todayAiEvents = await ctx.db
      .query("ai_events")
      .withIndex("by_createdAt", (q) => q.gte("createdAt", todayIso))
      .collect();

    const pendingReviews = await ctx.db
      .query("ai_reviews")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const totalRuns = await ctx.db.query("rocketride_runs").collect();
    const todayRuns = totalRuns.filter((r) => r.startedAt >= todayIso);

    // Anomalies count
    const todayAnomalies = pendingReviews.filter((r) => r.createdAt >= todayIso).length;

    return {
      totalSpaces,
      availableSpaces,
      occupiedSpaces,
      reservedSpaces,
      maintenanceSpaces,
      occupancyRate,
      vehiclesInside,
      activeSessions: activeBookings.length,
      avgDurationMinutes,
      aiEventsToday: todayAiEvents.length,
      pendingAiReviews: pendingReviews.length,
      anomaliesToday: todayAnomalies,
      rocketrideRunsTotal: totalRuns.length,
      rocketrideRunsToday: todayRuns.length,
    };
  },
});

export const getZoneOccupancyStats = query({
  args: {},
  handler: async (ctx) => {
    const slots = await ctx.db.query("slots").collect();
    const activeBookings = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
      .collect();

    const zoneMap: Record<
      string,
      {
        zoneName: string;
        floor: string;
        total: number;
        occupied: number;
        available: number;
        reserved: number;
        maintenance: number;
        occupancyRate: number;
      }
    > = {};

    for (const slot of slots) {
      const key = `${slot.floor || "B2"} - ${slot.zone || "Zone A"}`;
      if (!zoneMap[key]) {
        zoneMap[key] = {
          zoneName: slot.zone || "Zone A",
          floor: slot.floor || "B2",
          total: 0,
          occupied: 0,
          available: 0,
          reserved: 0,
          maintenance: 0,
          occupancyRate: 0,
        };
      }
      zoneMap[key].total += 1;
      if (slot.status === "occupied") zoneMap[key].occupied += 1;
      else if (slot.status === "available") zoneMap[key].available += 1;
      else if (slot.status === "maintenance") zoneMap[key].maintenance += 1;
      else zoneMap[key].reserved += 1;
    }

    const zones = Object.entries(zoneMap).map(([key, data]) => {
      data.occupancyRate = data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0;
      return { id: key, ...data };
    });

    return zones;
  },
});

// ── 2. AI REVIEW QUEUE ──
export const getAiReviews = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("all"),
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("investigating"),
        v.literal("resolved")
      )
    ),
    severity: v.optional(
      v.union(
        v.literal("all"),
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("critical")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let reviewsQuery = ctx.db.query("ai_reviews");

    let reviews;
    if (args.status && args.status !== "all") {
      reviews = await reviewsQuery
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .take(args.limit || 100);
    } else {
      reviews = await reviewsQuery.order("desc").take(args.limit || 100);
    }

    if (args.severity && args.severity !== "all") {
      reviews = reviews.filter((r) => r.severity === args.severity);
    }

    return reviews;
  },
});

export const getAiReviewById = query({
  args: { reviewId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ai_reviews")
      .withIndex("by_reviewId", (q) => q.eq("reviewId", args.reviewId))
      .first();
  },
});

export const getAiReviewStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("ai_reviews").collect();
    return {
      total: all.length,
      pending: all.filter((r) => r.status === "pending").length,
      approved: all.filter((r) => r.status === "approved").length,
      rejected: all.filter((r) => r.status === "rejected").length,
      investigating: all.filter((r) => r.status === "investigating").length,
      resolved: all.filter((r) => r.status === "resolved").length,
      critical: all.filter((r) => r.severity === "critical").length,
      high: all.filter((r) => r.severity === "high").length,
    };
  },
});

export const createAiReview = mutation({
  args: {
    aiEventId: v.optional(v.string()),
    pipelineExecutionId: v.string(),
    anomalyType: v.string(),
    vehicle: v.string(),
    facility: v.string(),
    parkingLocation: v.string(),
    aiConfidence: v.number(),
    aiExplanation: v.string(),
    evidence: v.string(),
    recommendedAction: v.string(),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
  },
  handler: async (ctx, args) => {
    const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const id = await ctx.db.insert("ai_reviews", {
      reviewId,
      aiEventId: args.aiEventId,
      pipelineExecutionId: args.pipelineExecutionId,
      anomalyType: args.anomalyType,
      vehicle: args.vehicle.toUpperCase().trim(),
      facility: args.facility,
      parkingLocation: args.parkingLocation,
      aiConfidence: args.aiConfidence,
      aiExplanation: args.aiExplanation,
      evidence: args.evidence,
      recommendedAction: args.recommendedAction,
      status: "pending",
      severity: args.severity,
      createdAt: now,
      updatedAt: now,
    });

    return { id, reviewId };
  },
});

export const resolveAiReview = mutation({
  args: {
    reviewId: v.string(),
    action: v.union(
      v.literal("approve"),
      v.literal("reject"),
      v.literal("investigate"),
      v.literal("resolve")
    ),
    reviewerEmail: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db
      .query("ai_reviews")
      .withIndex("by_reviewId", (q) => q.eq("reviewId", args.reviewId))
      .first();

    if (!review) {
      throw new Error(`AI Review ${args.reviewId} not found.`);
    }

    const statusMap = {
      approve: "approved",
      reject: "rejected",
      investigate: "investigating",
      resolve: "resolved",
    } as const;

    const newStatus = statusMap[args.action];
    const timestamp = new Date().toISOString();

    await ctx.db.patch(review._id, {
      status: newStatus,
      reviewer: args.reviewerEmail,
      reviewedAt: timestamp,
      notes: args.notes || review.notes,
      updatedAt: timestamp,
    });

    // Write audit log
    await ctx.db.insert("audit_logs", {
      operatorEmail: args.reviewerEmail,
      action: `AI_REVIEW_${args.action.toUpperCase()}`,
      targetType: "ai_review",
      targetId: args.reviewId,
      reason: args.notes || `Operator marked AI decision as ${newStatus}`,
      timestamp,
      details: JSON.stringify({
        reviewId: args.reviewId,
        vehicle: review.vehicle,
        anomalyType: review.anomalyType,
        pipelineExecutionId: review.pipelineExecutionId,
        action: args.action,
      }),
    });

    return { success: true, reviewId: args.reviewId, newStatus, reviewedAt: timestamp };
  },
});

// ── 3. ROCKETRIDE RUN LOGGING ──
export const getRocketRideRuns = query({
  args: {
    pipeline: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let runsQuery = ctx.db.query("rocketride_runs");

    let runs;
    if (args.pipeline && args.pipeline !== "all") {
      runs = await runsQuery
        .withIndex("by_pipeline", (q) => q.eq("pipeline", args.pipeline))
        .order("desc")
        .take(args.limit || 100);
    } else {
      runs = await runsQuery.order("desc").take(args.limit || 100);
    }

    if (args.status && args.status !== "all") {
      runs = runs.filter((r) => r.status === args.status);
    }

    return runs;
  },
});

export const getRocketRideRunById = query({
  args: { executionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rocketride_runs")
      .withIndex("by_executionId", (q) => q.eq("executionId", args.executionId))
      .first();
  },
});

export const logRocketRideRun = mutation({
  args: {
    executionId: v.string(),
    pipeline: v.string(),
    userId: v.optional(v.string()),
    facilityId: v.optional(v.string()),
    status: v.union(
      v.literal("COMPLETED"),
      v.literal("FAILED"),
      v.literal("RUNNING"),
      v.literal("CANCELLED"),
      v.literal("NOT_CONFIGURED")
    ),
    startedAt: v.string(),
    completedAt: v.optional(v.string()),
    durationMs: v.number(),
    confidence: v.optional(v.number()),
    inputRecordCount: v.number(),
    outputRecordCount: v.number(),
    failedRecordCount: v.number(),
    usage: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),
    errorCode: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    inputSummary: v.optional(v.string()),
    outputSummary: v.optional(v.string()),
    reviewCreated: v.optional(v.boolean()),
    associatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("rocketride_runs", {
      executionId: args.executionId,
      pipeline: args.pipeline,
      userId: args.userId,
      facilityId: args.facilityId || "cm-grand",
      status: args.status,
      startedAt: args.startedAt,
      completedAt: args.completedAt,
      durationMs: args.durationMs,
      confidence: args.confidence,
      inputRecordCount: args.inputRecordCount,
      outputRecordCount: args.outputRecordCount,
      failedRecordCount: args.failedRecordCount,
      usage: args.usage,
      estimatedCost: args.estimatedCost,
      errorCode: args.errorCode,
      errorMessage: args.errorMessage,
      inputSummary: args.inputSummary,
      outputSummary: args.outputSummary,
      reviewCreated: args.reviewCreated,
      associatedId: args.associatedId,
    });

    return { id, executionId: args.executionId };
  },
});

// ── 4. AI EVENTS ──
export const recordAiEvent = mutation({
  args: {
    pipeline: v.string(),
    eventType: v.string(),
    facility: v.string(),
    vehicle: v.optional(v.string()),
    slotId: v.optional(v.string()),
    confidence: v.number(),
    explanation: v.string(),
    metadata: v.optional(v.string()),
    reviewRequired: v.boolean(),
    reviewId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const eventId = `aie-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const id = await ctx.db.insert("ai_events", {
      eventId,
      pipeline: args.pipeline,
      eventType: args.eventType,
      facility: args.facility,
      vehicle: args.vehicle,
      slotId: args.slotId,
      confidence: args.confidence,
      explanation: args.explanation,
      metadata: args.metadata,
      reviewRequired: args.reviewRequired,
      reviewId: args.reviewId,
      createdAt: now,
    });

    return { id, eventId };
  },
});
