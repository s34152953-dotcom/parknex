import { describe, it, expect } from "vitest";
import { getTop3Recommendations, SlotRecommendationInput } from "../src/lib/parking/recommendation";

const sampleSlots: SlotRecommendationInput[] = [
  {
    slotId: "b2-a01",
    slotNumber: "A-01",
    floor: "B2",
    zone: "Zone A",
    pillar: "Pillar 01",
    status: "available",
    distanceFromEntrance: 15,
    positionX: -20,
    positionZ: 10,
    vehicleConstraints: { maxVehicleSize: "large_suv", isEV: false, isHandicapped: false },
  },
  {
    slotId: "b2-a02",
    slotNumber: "A-02",
    floor: "B2",
    zone: "Zone A",
    pillar: "Pillar 02",
    status: "occupied",
    distanceFromEntrance: 18,
    positionX: -15,
    positionZ: 10,
  },
  {
    slotId: "b2-c01",
    slotNumber: "C-01",
    floor: "B2",
    zone: "Zone C",
    pillar: "Pillar 13",
    status: "available",
    distanceFromEntrance: 35,
    positionX: 5,
    positionZ: 5,
    vehicleConstraints: { maxVehicleSize: "standard", isEV: true, isHandicapped: false },
  },
  {
    slotId: "b2-d01",
    slotNumber: "D-01",
    floor: "B2",
    zone: "Zone D",
    pillar: "Pillar 19",
    status: "available",
    distanceFromEntrance: 12,
    positionX: 0,
    positionZ: 2,
    vehicleConstraints: { maxVehicleSize: "standard", isEV: false, isHandicapped: true },
  },
  {
    slotId: "b2-a05",
    slotNumber: "A-05",
    floor: "B2",
    zone: "Zone A",
    pillar: "Pillar 05",
    status: "maintenance",
    distanceFromEntrance: 22,
    positionX: -5,
    positionZ: 10,
  },
];

describe("AI Smart Parking Recommendation Engine", () => {
  it("filters out occupied and maintenance spaces", () => {
    const recommendations = getTop3Recommendations(sampleSlots);
    const recommendedIds = recommendations.map((r) => r.slot.slotId);

    expect(recommendedIds).not.toContain("b2-a02"); // occupied
    expect(recommendedIds).not.toContain("b2-a05"); // maintenance
    expect(recommendations.length).toBeLessThanOrEqual(3);
  });

  it("prioritizes dedicated EV spaces when vehicle is EV", () => {
    const recommendations = getTop3Recommendations(sampleSlots, { isEV: true, vehicleType: "ev" });
    expect(recommendations.length).toBeGreaterThan(0);
    // EV slot should be ranked #1
    expect(recommendations[0].slot.slotId).toBe("b2-c01");
    expect(recommendations[0].reason).toContain("EV charging");
  });

  it("prioritizes accessible bays near the lift when driver requires accessibility", () => {
    const recommendations = getTop3Recommendations(sampleSlots, { isHandicapped: true });
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].slot.slotId).toBe("b2-d01");
    expect(recommendations[0].reason).toContain("accessible");
  });

  it("generates natural language explanation for every recommendation", () => {
    const recommendations = getTop3Recommendations(sampleSlots);
    recommendations.forEach((rec) => {
      expect(rec.reason).toBeDefined();
      expect(rec.reason.length).toBeGreaterThan(15);
      expect(rec.reason).toContain("Recommended because");
      expect(rec.score).toBeGreaterThanOrEqual(10);
      expect(rec.score).toBeLessThanOrEqual(100);
    });
  });
});
