// ── PARKNEX Real Parking Slot Data & Nearest Recommendation Engine ──

export type SlotStatus = "available" | "occupied" | "reserved";

export interface ParkingSlot {
  id: string;
  mallId: string;
  mallName: string;
  floor: string; // e.g. "B2", "B1", "G"
  zone: string; // e.g. "Zone A", "Zone B"
  pillar: string; // e.g. "Pillar 08"
  slotNumber: string; // e.g. "Slot A-04"
  status: SlotStatus;
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationY: number;
  distanceFromEntrance: number; // in meters
  walkingDirections: string[];
}

// Entrance gate coordinates (x: 0, z: -12) at each floor lobby
export const ENTRANCE_POINT = { x: 0, y: 0, z: -12 };

// Real 3D Grid of Slots for Central Mall Grand
export const INITIAL_PARKING_SLOTS: ParkingSlot[] = [
  // ── Floor B2 (Primary Luxury Zone) ──
  {
    id: "b2-a01",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "B2",
    zone: "Zone A",
    pillar: "Pillar 02",
    slotNumber: "A-01",
    status: "available",
    positionX: -6.0,
    positionY: 0,
    positionZ: -8.0,
    rotationY: 0,
    distanceFromEntrance: 24,
    walkingDirections: ["Exit Elevator Lobby B2", "Turn Left into Lane A", "Slot A-01 on Left (Pillar 02)"],
  },
  {
    id: "b2-a02",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "B2",
    zone: "Zone A",
    pillar: "Pillar 04",
    slotNumber: "A-02",
    status: "available",
    positionX: -3.0,
    positionY: 0,
    positionZ: -8.0,
    rotationY: 0,
    distanceFromEntrance: 28,
    walkingDirections: ["Exit Elevator Lobby B2", "Turn Left into Lane A", "Slot A-02 on Left (Pillar 04)"],
  },
  {
    id: "b2-a03",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "B2",
    zone: "Zone A",
    pillar: "Pillar 06",
    slotNumber: "A-03",
    status: "available",
    positionX: 0.0,
    positionY: 0,
    positionZ: -8.0,
    rotationY: 0,
    distanceFromEntrance: 32,
    walkingDirections: ["Exit Elevator Lobby B2", "Walk Straight into Lane A", "Slot A-03 (Pillar 06)"],
  },
  {
    id: "b2-a04",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "B2",
    zone: "Zone A",
    pillar: "Pillar 08",
    slotNumber: "A-04",
    status: "available",
    positionX: 3.0,
    positionY: 0,
    positionZ: -8.0,
    rotationY: 0,
    distanceFromEntrance: 38,
    walkingDirections: ["Exit Elevator Lobby B2", "Turn Right into Lane A", "Proceed 30m to Pillar 08", "Slot A-04 on Right"],
  },
  {
    id: "b2-a05",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "B2",
    zone: "Zone A",
    pillar: "Pillar 10",
    slotNumber: "A-05",
    status: "available",
    positionX: 6.0,
    positionY: 0,
    positionZ: -8.0,
    rotationY: 0,
    distanceFromEntrance: 45,
    walkingDirections: ["Exit Elevator Lobby B2", "Turn Right into Lane A", "Proceed to Pillar 10", "Slot A-05"],
  },
  {
    id: "b2-b01",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "B2",
    zone: "Zone B",
    pillar: "Pillar 14",
    slotNumber: "B-01",
    status: "available",
    positionX: -6.0,
    positionY: 0,
    positionZ: 0.0,
    rotationY: 0,
    distanceFromEntrance: 52,
    walkingDirections: ["Exit Elevator Lobby B2", "Walk South down Main Aisle", "Turn Left into Zone B", "Slot B-01 (Pillar 14)"],
  },
  {
    id: "b2-b02",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "B2",
    zone: "Zone B",
    pillar: "Pillar 16",
    slotNumber: "B-02",
    status: "available",
    positionX: -3.0,
    positionY: 0,
    positionZ: 0.0,
    rotationY: 0,
    distanceFromEntrance: 56,
    walkingDirections: ["Exit Elevator Lobby B2", "Walk down Main Aisle", "Zone B Slot B-02 (Pillar 16)"],
  },
  {
    id: "b2-b03",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "B2",
    zone: "Zone B",
    pillar: "Pillar 18",
    slotNumber: "B-03",
    status: "available",
    positionX: 0.0,
    positionY: 0,
    positionZ: 0.0,
    rotationY: 0,
    distanceFromEntrance: 60,
    walkingDirections: ["Exit Elevator Lobby B2", "Walk to Central Zone B Aisle", "Slot B-03 (Pillar 18)"],
  },
  {
    id: "b2-b04",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "B2",
    zone: "Zone B",
    pillar: "Pillar 20",
    slotNumber: "B-04",
    status: "available",
    positionX: 3.0,
    positionY: 0,
    positionZ: 0.0,
    rotationY: 0,
    distanceFromEntrance: 65,
    walkingDirections: ["Exit Elevator Lobby B2", "Walk towards Zone B East", "Slot B-04 (Pillar 20)"],
  },
  {
    id: "b2-b05",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "B2",
    zone: "Zone B",
    pillar: "Pillar 22",
    slotNumber: "B-05",
    status: "available",
    positionX: 6.0,
    positionY: 0,
    positionZ: 0.0,
    rotationY: 0,
    distanceFromEntrance: 70,
    walkingDirections: ["Exit Elevator Lobby B2", "Zone B East aisle", "Slot B-05 (Pillar 22)"],
  },

  // ── Floor B1 (Express Level) ──
  {
    id: "b1-a01",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "B1",
    zone: "Zone A",
    pillar: "Pillar 01",
    slotNumber: "A-01",
    status: "available",
    positionX: -6.0,
    positionY: 0,
    positionZ: -8.0,
    rotationY: 0,
    distanceFromEntrance: 20,
    walkingDirections: ["Exit Elevator Lobby B1", "Turn Left into Lane A", "Slot A-01 on Left (Pillar 01)"],
  },
  {
    id: "b1-a02",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "B1",
    zone: "Zone A",
    pillar: "Pillar 03",
    slotNumber: "A-02",
    status: "available",
    positionX: -3.0,
    positionY: 0,
    positionZ: -8.0,
    rotationY: 0,
    distanceFromEntrance: 25,
    walkingDirections: ["Exit Elevator Lobby B1", "Turn Left into Lane A", "Slot A-02 on Left (Pillar 03)"],
  },
  {
    id: "b1-a03",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "B1",
    zone: "Zone A",
    pillar: "Pillar 05",
    slotNumber: "A-03",
    status: "available",
    positionX: 0.0,
    positionY: 0,
    positionZ: -8.0,
    rotationY: 0,
    distanceFromEntrance: 30,
    walkingDirections: ["Exit Elevator Lobby B1", "Walk Straight into Lane A", "Slot A-03 (Pillar 05)"],
  },
  {
    id: "b1-a04",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "B1",
    zone: "Zone A",
    pillar: "Pillar 07",
    slotNumber: "A-04",
    status: "available",
    positionX: 3.0,
    positionY: 0,
    positionZ: -8.0,
    rotationY: 0,
    distanceFromEntrance: 35,
    walkingDirections: ["Exit Elevator Lobby B1", "Turn Right into Lane A", "Slot A-04 (Pillar 07)"],
  },
  {
    id: "b1-b01",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "B1",
    zone: "Zone B",
    pillar: "Pillar 11",
    slotNumber: "B-01",
    status: "available",
    positionX: -6.0,
    positionY: 0,
    positionZ: 0.0,
    rotationY: 0,
    distanceFromEntrance: 48,
    walkingDirections: ["Exit Elevator Lobby B1", "Walk South to Zone B", "Slot B-01 (Pillar 11)"],
  },
  {
    id: "b1-b02",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "B1",
    zone: "Zone B",
    pillar: "Pillar 13",
    slotNumber: "B-02",
    status: "available",
    positionX: -3.0,
    positionY: 0,
    positionZ: 0.0,
    rotationY: 0,
    distanceFromEntrance: 52,
    walkingDirections: ["Exit Elevator Lobby B1", "Walk South to Zone B", "Slot B-02 (Pillar 13)"],
  },

  // ── Ground Level (VIP / Valet) ──
  {
    id: "g-a01",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "G",
    zone: "VIP Zone",
    pillar: "VIP Pillar 01",
    slotNumber: "VIP-01",
    status: "available",
    positionX: -4.0,
    positionY: 0,
    positionZ: -6.0,
    rotationY: 0,
    distanceFromEntrance: 15,
    walkingDirections: ["Main Grand Portico Lobby", "VIP Valet Bay 1", "Slot VIP-01"],
  },
  {
    id: "g-a02",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "G",
    zone: "VIP Zone",
    pillar: "VIP Pillar 02",
    slotNumber: "VIP-02",
    status: "available",
    positionX: 0.0,
    positionY: 0,
    positionZ: -6.0,
    rotationY: 0,
    distanceFromEntrance: 18,
    walkingDirections: ["Main Grand Portico Lobby", "VIP Valet Bay 2", "Slot VIP-02"],
  },
  {
    id: "g-a03",
    mallId: "cm-grand",
    mallName: "Central Mall Grand",
    floor: "G",
    zone: "VIP Zone",
    pillar: "VIP Pillar 03",
    slotNumber: "VIP-03",
    status: "available",
    positionX: 4.0,
    positionY: 0,
    positionZ: -6.0,
    rotationY: 0,
    distanceFromEntrance: 22,
    walkingDirections: ["Main Grand Portico Lobby", "VIP Valet Bay 3", "Slot VIP-03"],
  },
];

/**
 * Calculates the exact Euclidean / layout path distance from entrance to a slot.
 */
export function computeSlotDistance(slot: ParkingSlot, entrance = ENTRANCE_POINT): number {
  const dx = slot.positionX - entrance.x;
  const dz = slot.positionZ - entrance.z;
  const euclidean = Math.sqrt(dx * dx + dz * dz);
  return Math.round(12 + euclidean * 3.2);
}

/**
 * Finds the nearest AVAILABLE slot to the entrance on a given floor or entire garage.
 */
export function findNearestAvailableSlot(
  slots: ParkingSlot[],
  floor?: string,
  entrance = ENTRANCE_POINT
): ParkingSlot | null {
  const candidateSlots = slots.filter((s) => {
    const floorMatch = floor ? s.floor === floor : true;
    return floorMatch && s.status === "available";
  });

  if (candidateSlots.length === 0) return null;

  const sorted = [...candidateSlots].sort((a, b) => {
    const distA = a.distanceFromEntrance || computeSlotDistance(a, entrance);
    const distB = b.distanceFromEntrance || computeSlotDistance(b, entrance);
    return distA - distB;
  });

  return sorted[0];
}
