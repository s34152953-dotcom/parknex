// ── PARKNEX Real Parking Slot Data & Nearest Recommendation Engine ──

export type SlotStatus = "available" | "occupied" | "reserved" | "temporarily_held";

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

export const INITIAL_PARKING_SLOTS: ParkingSlot[] = [];


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
