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
    status: v.union(
      v.literal("available"),
      v.literal("occupied"),
      v.literal("reserved"),
      v.literal("temporarily_held"),
      v.literal("maintenance")
    ),
    positionX: v.number(),
    positionY: v.number(),
    positionZ: v.number(),
    rotationY: v.number(),
    distanceFromEntrance: v.number(),
    walkingDirections: v.array(v.string()),
    vehicleConstraints: v.optional(
      v.object({
        maxVehicleSize: v.string(), // "compact" | "standard" | "large_suv" | "any"
        isEV: v.boolean(),
        isHandicapped: v.boolean(),
      })
    ),
    lastOccupancySource: v.optional(
      v.union(
        v.literal("camera_ai"),
        v.literal("physical_sensor"),
        v.literal("pillar_qr"),
        v.literal("operator_confirmation")
      )
    ),
    occupancyConfidence: v.optional(v.number()),
  })
    .index("by_slotId", ["slotId"])
    .index("by_floor", ["floor"])
    .index("by_status", ["status"]),

  bookings: defineTable({
    slotId: v.string(),
    vehicleNumber: v.string(),
    phoneNumber: v.string(),
    email: v.optional(v.string()),
    entryType: v.optional(v.union(v.literal("preregistered"), v.literal("walk_in"))),
    vehicleType: v.optional(
      v.union(
        v.literal("sedan"),
        v.literal("suv"),
        v.literal("hatchback"),
        v.literal("ev"),
        v.literal("motorcycle")
      )
    ),
    status: v.union(v.literal("ACTIVE"), v.literal("COMPLETED"), v.literal("CANCELLED")),
    entryTime: v.string(),
    exitTime: v.optional(v.string()),
    mallName: v.string(),
    customerAccessToken: v.string(),
    smsStatus: v.union(v.literal("PENDING"), v.literal("SENT"), v.literal("FAILED")),
    emailStatus: v.optional(v.union(v.literal("PENDING"), v.literal("SENT"), v.literal("FAILED"), v.literal("NOT_CONFIGURED"))),
    pillarConfirmedAt: v.optional(v.string()),
    confirmedPillar: v.optional(v.string()),
    exitPassToken: v.optional(v.string()),
    exitPassUsed: v.optional(v.boolean()),
    exitPassExpiresAt: v.optional(v.string()),
    fallbackCode: v.optional(v.string()),
    operatorId: v.optional(v.string()),
    entryPlateConfidence: v.optional(v.number()),
    exitPlateConfidence: v.optional(v.number()),
    exitDetectedPlate: v.optional(v.string()),
    recommendationScore: v.optional(v.number()),
    recommendationReason: v.optional(v.string()),
    verificationStatus: v.optional(
      v.union(
        v.literal("NOT_CHECKED"),
        v.literal("CHECKING"),
        v.literal("VERIFIED"),
        v.literal("INVALID"),
        v.literal("MISMATCH"),
        v.literal("UNAVAILABLE"),
        v.literal("MANUAL_VERIFIED")
      )
    ),
    vehicleMake: v.optional(v.string()),
    vehicleModel: v.optional(v.string()),
    vehicleColour: v.optional(v.string()),
    vehicleClass: v.optional(v.string()),
    fuelType: v.optional(v.string()),
    verifiedAt: v.optional(v.string()),
    manualVerificationReason: v.optional(v.string()),
  })
    .index("by_slotId", ["slotId"])
    .index("by_customerAccessToken", ["customerAccessToken"])
    .index("by_status", ["status"])
    .index("by_vehicleNumber", ["vehicleNumber"])
    .index("by_fallbackCode", ["fallbackCode"]),

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

  reports: defineTable({
    bookingId: v.optional(v.id("bookings")),
    vehicleNumber: v.string(),
    issueType: v.string(),
    details: v.optional(v.string()),
    status: v.union(v.literal("OPEN"), v.literal("IN_PROGRESS"), v.literal("RESOLVED")),
    createdAt: v.string(),
    mallName: v.optional(v.string()),
    slotNumber: v.optional(v.string()),
    floor: v.optional(v.string()),
    pillar: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_vehicleNumber", ["vehicleNumber"])
    .index("by_createdAt", ["createdAt"]),

  audit_logs: defineTable({
    operatorEmail: v.string(),
    action: v.string(), // "SLOT_ASSIGNMENT" | "MANUAL_OVERRIDE_EXIT" | "SLOT_STATUS_OVERRIDE" | "SMS_RESEND" | "PROBLEM_RESOLVED"
    targetType: v.string(), // "booking" | "slot" | "report"
    targetId: v.string(),
    reason: v.optional(v.string()),
    timestamp: v.string(),
    details: v.optional(v.string()),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_operatorEmail", ["operatorEmail"])
    .index("by_action", ["action"]),

  occupancy_events: defineTable({
    slotId: v.string(),
    source: v.union(
      v.literal("camera_ai"),
      v.literal("physical_sensor"),
      v.literal("pillar_qr"),
      v.literal("operator_confirmation")
    ),
    confidence: v.number(),
    isOccupied: v.boolean(),
    timestamp: v.string(),
    details: v.optional(v.string()),
  })
    .index("by_slotId", ["slotId"])
    .index("by_timestamp", ["timestamp"]),

  cameras: defineTable({
    cameraId: v.string(), // e.g. "cam-entry-01", "cam-floor-b2-zonea", "cam-exit-01"
    name: v.string(), // e.g. "Gate A Entry ANPR Camera", "Floor B2 Zone A Overhead Camera"
    type: v.union(v.literal("ENTRY"), v.literal("EXIT"), v.literal("FLOOR")),
    floor: v.string(), // "B2", "B1", "G", "ALL"
    zone: v.string(), // "Zone A", "Zone B", "Entry Gate", "Exit Gate"
    status: v.union(v.literal("ONLINE"), v.literal("OFFLINE"), v.literal("NOT_CONFIGURED"), v.literal("ERROR")),
    lastHeartbeat: v.optional(v.string()),
    rtspStreamPath: v.optional(v.string()),
    webrtcUrl: v.optional(v.string()),
    hlsUrl: v.optional(v.string()),
    fps: v.optional(v.number()),
    resolution: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    slotIds: v.optional(v.array(v.string())),
    roiCoordinates: v.optional(
      v.object({
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
      })
    ),
  })
    .index("by_cameraId", ["cameraId"])
    .index("by_type", ["type"])
    .index("by_floor", ["floor"])
    .index("by_status", ["status"]),

  cameraEvents: defineTable({
    eventId: v.string(), // Unique UUID generated by Edge device for deduping
    cameraId: v.string(),
    eventType: v.union(
      v.literal("PLATE_DETECTED"),
      v.literal("OCCUPANCY_CHANGED"),
      v.literal("HEARTBEAT"),
      v.literal("ZONE_TRANSIT")
    ),
    timestamp: v.string(), // ISO string
    plateNumber: v.optional(v.string()),
    confidence: v.optional(v.number()), // Real confidence 0.0 - 1.0
    floor: v.optional(v.string()),
    zone: v.optional(v.string()),
    slotId: v.optional(v.string()),
    occupancyStatus: v.optional(v.union(v.literal("available"), v.literal("occupied"), v.literal("maintenance"))),
    rawText: v.optional(v.string()),
    requiresConfirmation: v.optional(v.boolean()),
    processedAt: v.string(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_cameraId", ["cameraId"])
    .index("by_eventType", ["eventType"])
    .index("by_timestamp", ["timestamp"])
    .index("by_plateNumber", ["plateNumber"]),

  vehicleSightings: defineTable({
    plateNumber: v.string(),
    cameraId: v.string(),
    cameraName: v.string(),
    floor: v.string(),
    zone: v.string(),
    timestamp: v.string(),
    confidence: v.number(),
    sightingType: v.union(v.literal("ENTRY"), v.literal("TRANSIT"), v.literal("SLOT_PARKED"), v.literal("EXIT")),
    slotId: v.optional(v.string()),
  })
    .index("by_plateNumber", ["plateNumber"])
    .index("by_timestamp", ["timestamp"])
    .index("by_cameraId", ["cameraId"])
    .index("by_floor", ["floor"]),

  slotOccupancy: defineTable({
    slotId: v.string(),
    floor: v.string(),
    zone: v.string(),
    status: v.union(v.literal("available"), v.literal("occupied"), v.literal("maintenance")),
    lastDetectedAt: v.string(),
    confidence: v.number(),
    source: v.literal("cctv_ai"),
    cameraId: v.string(),
    consecutiveFrames: v.optional(v.number()),
  })
    .index("by_slotId", ["slotId"])
    .index("by_floor", ["floor"])
    .index("by_status", ["status"])
    .index("by_lastDetectedAt", ["lastDetectedAt"]),
});
