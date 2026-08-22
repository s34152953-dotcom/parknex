export interface SlotRecommendationInput {
  slotId: string;
  slotNumber: string;
  floor: string;
  zone: string;
  pillar: string;
  status: "available" | "occupied" | "reserved" | "temporarily_held" | "maintenance";
  distanceFromEntrance: number;
  positionX: number;
  positionZ: number;
  vehicleConstraints?: {
    maxVehicleSize?: string; // "compact" | "standard" | "large_suv" | "any";
    isEV?: boolean;
    isHandicapped?: boolean;
  };
}

export interface VehicleRequirement {
  vehicleType?: "sedan" | "suv" | "hatchback" | "ev" | "motorcycle";
  isEV?: boolean;
  isHandicapped?: boolean;
  preferredGate?: "A" | "B";
}

export interface RecommendationResult {
  slot: SlotRecommendationInput;
  score: number; // 0 to 100
  rank: number;
  reason: string;
  distanceMeters: number;
  walkingDistanceMeters: number;
  isEV: boolean;
  isHandicapped: boolean;
}

/**
 * Calculates the top 3 AI-assisted parking bay recommendations
 * based on multi-factor constraint satisfaction & spatial routing.
 */
export function getTop3Recommendations(
  slots: SlotRecommendationInput[],
  req: VehicleRequirement = {}
): RecommendationResult[] {
  // 1. Hard filter: Must be available (exclude occupied, reserved, maintenance)
  const availableSlots = slots.filter((s) => s.status === "available");

  if (availableSlots.length === 0) {
    return [];
  }

  // Gate reference coordinates
  const entryGatePos = req.preferredGate === "B" ? { x: 40, z: 20 } : { x: -40, z: 20 };
  const mainLiftPos = { x: 0, z: 0 }; // Central lift at origin

  // 2. Score each available space
  const scoredSlots = availableSlots.map((slot) => {
    let score = 100;
    const reasons: string[] = [];

    // Distance from entry gate (driving distance)
    const dxEntry = slot.positionX - entryGatePos.x;
    const dzEntry = slot.positionZ - entryGatePos.z;
    const drivingDistance = Math.round(Math.sqrt(dxEntry * dxEntry + dzEntry * dzEntry) + (slot.distanceFromEntrance || 20));

    // Walking distance to central lift / mall entrance
    const dxLift = slot.positionX - mainLiftPos.x;
    const dzLift = slot.positionZ - mainLiftPos.z;
    const walkingDistance = Math.round(Math.sqrt(dxLift * dxLift + dzLift * dzLift));

    // Factor 1: Proximity to Entry Gate (shorter is better)
    const entryDistancePenalty = Math.min(30, (drivingDistance / 100) * 25);
    score -= entryDistancePenalty;

    // Factor 2: Proximity to Main Lift / Mall Entrance
    const liftDistancePenalty = Math.min(25, (walkingDistance / 80) * 20);
    score -= liftDistancePenalty;

    // Factor 3: Floor Preference (Level B2 is fast entry, lower levels have small penalty)
    if (slot.floor === "B2") {
      score += 5;
    } else if (slot.floor === "B1") {
      score += 2;
    }

    // Factor 4: Vehicle Type & Size Compatibility
    const isSlotEV = Boolean(slot.vehicleConstraints?.isEV || slot.zone === "Zone C");
    const isSlotHandicapped = Boolean(slot.vehicleConstraints?.isHandicapped || slot.zone === "Zone D");

    if (req.isHandicapped) {
      if (isSlotHandicapped) {
        score += 60;
        reasons.push("dedicated accessible bay with step-free lift access");
      } else if (walkingDistance <= 25) {
        score += 25;
        reasons.push("close step-free lift access");
      } else {
        score -= 40;
      }
    } else if (isSlotHandicapped) {
      // Reserve accessible spots for those who need them
      score -= 30;
    }

    if (req.isEV || req.vehicleType === "ev") {
      if (isSlotEV) {
        score += 30;
        reasons.push("dedicated EV charging terminal available");
      } else {
        score -= 15;
      }
    } else if (isSlotEV) {
      // Prefer non-EV slots for non-EV cars
      score -= 10;
    }

    if (req.vehicleType === "suv") {
      if (slot.vehicleConstraints?.maxVehicleSize === "large_suv" || slot.zone === "Zone A") {
        score += 8;
        reasons.push("wide turning radius & spacious pillar clearance");
      }
    }

    // Default proximity description
    const gateName = req.preferredGate === "B" ? "Gate B" : "Gate A";
    if (reasons.length === 0) {
      if (walkingDistance <= 28) {
        reasons.push(`available, ${drivingDistance}m from Entry ${gateName} and right near the main lift`);
      } else {
        reasons.push(`available, ${drivingDistance}m from Entry ${gateName} in quiet ${slot.zone}`);
      }
    } else {
      reasons.unshift(`available, ${drivingDistance}m from Entry ${gateName}`);
    }

    const reasonText = `Recommended because it is ${reasons.join(", ")}.`;

    return {
      slot,
      rawScore: score,
      score: Math.max(10, Math.min(100, Math.round(score))),
      distanceMeters: drivingDistance,
      walkingDistanceMeters: walkingDistance,
      isEV: isSlotEV,
      isHandicapped: isSlotHandicapped,
      reason: reasonText,
    };
  });

  // 3. Sort by raw score descending and pick top 3
  scoredSlots.sort((a, b) => b.rawScore - a.rawScore);

  return scoredSlots.slice(0, 3).map((item, index) => ({
    slot: item.slot,
    score: item.score,
    distanceMeters: item.distanceMeters,
    walkingDistanceMeters: item.walkingDistanceMeters,
    isEV: item.isEV,
    isHandicapped: item.isHandicapped,
    reason: item.reason,
    rank: index + 1,
  }));
}
