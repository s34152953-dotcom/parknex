// @ts-nocheck
import { mutation } from "./_generated/server";

const INITIAL_SLOTS = [
  { slotId: "b2-a01", mallId: "cm-grand", mallName: "Central Mall Grand", floor: "B2", zone: "Zone A", pillar: "Pillar 02", slotNumber: "A-01", status: "occupied", positionX: -6.0, positionY: 0, positionZ: -8.0, rotationY: 0, distanceFromEntrance: 24, walkingDirections: ["Exit Elevator", "Turn Left", "Slot A-01"] },
  { slotId: "b2-a02", mallId: "cm-grand", mallName: "Central Mall Grand", floor: "B2", zone: "Zone A", pillar: "Pillar 04", slotNumber: "A-02", status: "occupied", positionX: -3.0, positionY: 0, positionZ: -8.0, rotationY: 0, distanceFromEntrance: 28, walkingDirections: ["Exit Elevator", "Turn Left", "Slot A-02"] },
  { slotId: "b2-a03", mallId: "cm-grand", mallName: "Central Mall Grand", floor: "B2", zone: "Zone A", pillar: "Pillar 06", slotNumber: "A-03", status: "occupied", positionX: 0.0, positionY: 0, positionZ: -8.0, rotationY: 0, distanceFromEntrance: 32, walkingDirections: ["Exit Elevator", "Straight", "Slot A-03"] },
  { slotId: "b2-a04", mallId: "cm-grand", mallName: "Central Mall Grand", floor: "B2", zone: "Zone A", pillar: "Pillar 08", slotNumber: "A-04", status: "available", positionX: 3.0, positionY: 0, positionZ: -8.0, rotationY: 0, distanceFromEntrance: 38, walkingDirections: ["Exit Elevator", "Turn Right", "Slot A-04"] },
  { slotId: "b2-a05", mallId: "cm-grand", mallName: "Central Mall Grand", floor: "B2", zone: "Zone A", pillar: "Pillar 10", slotNumber: "A-05", status: "available", positionX: 6.0, positionY: 0, positionZ: -8.0, rotationY: 0, distanceFromEntrance: 42, walkingDirections: ["Exit Elevator", "Turn Right", "Slot A-05"] },
  { slotId: "b2-b01", mallId: "cm-grand", mallName: "Central Mall Grand", floor: "B2", zone: "Zone B", pillar: "Pillar 14", slotNumber: "B-01", status: "available", positionX: -6.0, positionY: 0, positionZ: 0.0, rotationY: Math.PI, distanceFromEntrance: 12, walkingDirections: ["Exit Elevator", "Turn Left", "Slot B-01"] },
  { slotId: "b2-b02", mallId: "cm-grand", mallName: "Central Mall Grand", floor: "B2", zone: "Zone B", pillar: "Pillar 16", slotNumber: "B-02", status: "reserved", positionX: -3.0, positionY: 0, positionZ: 0.0, rotationY: Math.PI, distanceFromEntrance: 16, walkingDirections: ["Exit Elevator", "Turn Left", "Slot B-02"] },
  { slotId: "b2-b03", mallId: "cm-grand", mallName: "Central Mall Grand", floor: "B2", zone: "Zone B", pillar: "Pillar 18", slotNumber: "B-03", status: "available", positionX: 0.0, positionY: 0, positionZ: 0.0, rotationY: Math.PI, distanceFromEntrance: 20, walkingDirections: ["Exit Elevator", "Straight", "Slot B-03"] },
  { slotId: "b2-b04", mallId: "cm-grand", mallName: "Central Mall Grand", floor: "B2", zone: "Zone B", pillar: "Pillar 20", slotNumber: "B-04", status: "available", positionX: 3.0, positionY: 0, positionZ: 0.0, rotationY: Math.PI, distanceFromEntrance: 24, walkingDirections: ["Exit Elevator", "Turn Right", "Slot B-04"] },
  { slotId: "b2-b05", mallId: "cm-grand", mallName: "Central Mall Grand", floor: "B2", zone: "Zone B", pillar: "Pillar 22", slotNumber: "B-05", status: "available", positionX: 6.0, positionY: 0, positionZ: 0.0, rotationY: Math.PI, distanceFromEntrance: 28, walkingDirections: ["Exit Elevator", "Turn Right", "Slot B-05"] },
];

export const seedSlots = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("slots").collect();
    if (existing.length === 0) {
      for (const slot of INITIAL_SLOTS) {
        await ctx.db.insert("slots", slot as any);
      }
    }

    const existingFacilities = await ctx.db.query("facilities").collect();
    if (existingFacilities.length === 0) {
      await ctx.db.insert("facilities", {
        facilityId: "cm-grand",
        name: "Central Mall Grand",
        address: "100 Innovation Boulevard, Tech District",
        totalCapacity: 10,
        ratesPerHour: 50,
        operatingHours: "24/7 Multi-Level Parking",
        zones: ["Zone A", "Zone B"],
        createdAt: new Date().toISOString(),
      });
    }

    const existingZones = await ctx.db.query("parking_zones").collect();
    if (existingZones.length === 0) {
      await ctx.db.insert("parking_zones", {
        zoneId: "zone-b2-a",
        facilityId: "cm-grand",
        name: "Zone A",
        floor: "B2",
        totalSlots: 5,
        evSlots: 1,
        handicappedSlots: 1,
        nearbyLandmarks: ["Food Court", "Main Entrance", "Elevator Core A"],
      });
      await ctx.db.insert("parking_zones", {
        zoneId: "zone-b2-b",
        facilityId: "cm-grand",
        name: "Zone B",
        floor: "B2",
        totalSlots: 5,
        evSlots: 1,
        handicappedSlots: 0,
        nearbyLandmarks: ["Cinema Complex", "Retail Corridor", "Elevator Core B"],
      });
    }

    return "Seeded successfully.";
  },
});
