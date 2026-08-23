import { z } from "zod";

// ── 1. PARKING VERIFICATION SCHEMA ──
export const VerificationInputSchema = z.object({
  vehicleNumber: z.string().min(3),
  vehicleModel: z.string().optional(),
  vehicleType: z.enum(["sedan", "suv", "hatchback", "ev", "motorcycle"]).optional(),
  facility: z.string(),
  zone: z.string(),
  pillar: z.string(),
  slotId: z.string(),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
  spaceImageUrl: z.string().optional(),
  destination: z.string().optional(),
});

export type VerificationInput = z.infer<typeof VerificationInputSchema>;

export const VerificationOutputSchema = z.object({
  verificationStatus: z.enum([
    "VERIFIED",
    "INVALID",
    "MISMATCH",
    "UNAVAILABLE",
    "MANUAL_VERIFIED",
  ]),
  confidence: z.number().min(0).max(1),
  vehicle: z.string(),
  parkingSpace: z.string(),
  zone: z.string(),
  facility: z.string(),
  explanation: z.string(),
  reviewRequired: z.boolean(),
  executionId: z.string(),
  durationMs: z.number(),
  estimatedCost: z.number().optional(),
  anomalyType: z.string().optional(),
  recommendedAction: z.string().optional(),
});

export type VerificationOutput = z.infer<typeof VerificationOutputSchema>;

// ── 2. PARKING RECOMMENDATION SCHEMA ──
export const RecommendationInputSchema = z.object({
  facilityId: z.string(),
  destination: z.string(),
  preferences: z
    .object({
      isEV: z.boolean().optional(),
      isHandicapped: z.boolean().optional(),
      fastExit: z.boolean().optional(),
      lowCongestion: z.boolean().optional(),
    })
    .optional(),
  availableSlots: z.array(
    z.object({
      slotId: z.string(),
      slotNumber: z.string(),
      floor: z.string(),
      zone: z.string(),
      pillar: z.string(),
      distanceFromEntrance: z.number().optional(),
      vehicleConstraints: z
        .object({
          isEV: z.boolean().optional(),
          isHandicapped: z.boolean().optional(),
        })
        .optional(),
    })
  ),
});

export type RecommendationInput = z.infer<typeof RecommendationInputSchema>;

export const RecommendationOutputSchema = z.object({
  recommendedSlots: z.array(
    z.object({
      slotId: z.string(),
      slotNumber: z.string(),
      floor: z.string(),
      zone: z.string(),
      pillar: z.string(),
      confidence: z.number(),
      reason: z.string(),
      relativeConvenience: z.string(),
    })
  ),
  destination: z.string(),
  executionId: z.string(),
  durationMs: z.number(),
  totalAvailableChecked: z.number(),
});

export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;

// ── 3. PARKING ANOMALY DETECTION SCHEMA ──
export const AnomalyDetectionInputSchema = z.object({
  facilityId: z.string(),
  activeSessions: z.array(z.any()),
  slots: z.array(z.any()),
  recentEntryEvents: z.array(z.any()).optional(),
  recentExitEvents: z.array(z.any()).optional(),
});

export type AnomalyDetectionInput = z.infer<typeof AnomalyDetectionInputSchema>;

export const AnomalyItemSchema = z.object({
  type: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  evidence: z.string(),
  relatedSession: z.string().optional(),
  relatedVehicle: z.string().optional(),
  parkingLocation: z.string().optional(),
  recommendedAction: z.string(),
  reviewRequired: z.boolean(),
});

export type AnomalyItem = z.infer<typeof AnomalyItemSchema>;

export const AnomalyDetectionOutputSchema = z.object({
  anomaliesDetected: z.array(AnomalyItemSchema),
  totalSessionsAudited: z.number(),
  totalSlotsAudited: z.number(),
  executionId: z.string(),
  durationMs: z.number(),
  reviewCount: z.number(),
});

export type AnomalyDetectionOutput = z.infer<typeof AnomalyDetectionOutputSchema>;

// ── 4. BATCH OCCUPANCY RECONCILIATION SCHEMA ──
export const BatchRecordSchema = z.object({
  recordId: z.string().optional(),
  vehicleNumber: z.string(),
  eventType: z.string(),
  timestamp: z.string(),
  gate: z.string().optional(),
  slotId: z.string().optional(),
  zone: z.string().optional(),
  confidence: z.number().optional(),
});

export type BatchRecord = z.infer<typeof BatchRecordSchema>;

export const BatchReconciliationInputSchema = z.object({
  facilityId: z.string(),
  batchSource: z.string().optional(),
  records: z.array(BatchRecordSchema),
});

export type BatchReconciliationInput = z.infer<typeof BatchReconciliationInputSchema>;

export const BatchReconciliationOutputSchema = z.object({
  recordsReceived: z.number(),
  recordsProcessed: z.number(),
  validRecords: z.number(),
  invalidRecords: z.number(),
  anomaliesDetected: z.number(),
  recordsRequiringReview: z.number(),
  failedRecords: z.number(),
  executionDurationMs: z.number(),
  executionId: z.string(),
  estimatedCost: z.number().optional(),
  results: z.array(
    z.object({
      recordId: z.string(),
      vehicleNumber: z.string(),
      status: z.enum(["VALID", "ANOMALY", "FAILED", "REVIEW_REQUIRED"]),
      anomalyType: z.string().optional(),
      severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      explanation: z.string(),
      actionRequired: z.string().optional(),
    })
  ),
});

export type BatchReconciliationOutput = z.infer<typeof BatchReconciliationOutputSchema>;

// ── 5. PARKNEX ASSISTANT SCHEMA ──
export const AssistantInputSchema = z.object({
  query: z.string().min(1),
  userRole: z.enum(["CUSTOMER", "ADMIN"]),
  userEmail: z.string().optional(),
  context: z.object({
    activeBooking: z.any().optional(),
    facilityStats: z.any().optional(),
    availableSlots: z.array(z.any()).optional(),
    recentAnomalies: z.array(z.any()).optional(),
    vehicleNumber: z.string().optional(),
  }),
});

export type AssistantInput = z.infer<typeof AssistantInputSchema>;

export const AssistantOutputSchema = z.object({
  answer: z.string(),
  confidence: z.number().min(0).max(1),
  sources: z.array(z.string()),
  executionId: z.string(),
  durationMs: z.number(),
  groundedFacts: z.record(z.any()).optional(),
});

export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;
