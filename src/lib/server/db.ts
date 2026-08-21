// ── PARKNEX Server DB (Legacy - superseded by Convex real-time database) ──
// This file is kept for type reference only.
// All real data operations now go through Convex mutations and queries.
// No in-memory store, no mock/demo bookings, no hardcoded parking slots.

export interface BookingRecord {
  id: string;
  bookingNumber: string;
  vehicleNumber: string;
  phoneNumber: string;
  mallId: string;
  mallName: string;
  floor: string;
  zone: string;
  pillar: string;
  slotId: string;
  slotNumber: string;
  distanceFromEntrance: number;
  entryTime: string;
  exitTime: string | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  qrToken: string;
  customerAccessToken: string;
  smsStatus: "SENT" | "FAILED" | "PENDING";
  smsMessageId?: string;
  createdAt: string;
  completedAt: string | null;
}
