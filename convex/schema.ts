// @ts-nocheck
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  slots: defineTable({
    slotId: v.string(), // e.g. b2-a01
    mallId: v.string(),
    mallName: v.string(),
    floor: v.string(),
    zone: v.string(),
    pillar: v.string(),
    slotNumber: v.string(),
    status: v.union(v.literal("available"), v.literal("occupied"), v.literal("reserved"), v.literal("temporarily_held")),
    positionX: v.number(),
    positionY: v.number(),
    positionZ: v.number(),
    rotationY: v.number(),
    distanceFromEntrance: v.number(),
    walkingDirections: v.array(v.string()),
  })
    .index("by_slotId", ["slotId"])
    .index("by_floor", ["floor"])
    .index("by_status", ["status"]),

  bookings: defineTable({
    slotId: v.string(),
    vehicleNumber: v.string(),
    phoneNumber: v.string(),
    status: v.union(v.literal("ACTIVE"), v.literal("COMPLETED"), v.literal("CANCELLED")),
    entryTime: v.string(),
    exitTime: v.optional(v.string()),
    mallName: v.string(),
    customerAccessToken: v.string(),
    smsStatus: v.union(v.literal("PENDING"), v.literal("SENT"), v.literal("FAILED")),
  })
    .index("by_slotId", ["slotId"])
    .index("by_customerAccessToken", ["customerAccessToken"])
    .index("by_status", ["status"]),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    vehicleNumber: v.optional(v.string()), // Customers can register their vehicle
  })
    .index("by_email", ["email"])
    .index("by_vehicleNumber", ["vehicleNumber"]),

  operators: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.string(),
  }).index("by_email", ["email"]),
});
