// ── PARKNEX Server Authoritative Database & Booking Store ──
import { INITIAL_PARKING_SLOTS, ParkingSlot, findNearestAvailableSlot } from "../parking/nearestSlot";
import crypto from "crypto";

export interface BookingRecord {
  id: string;
  bookingNumber: string; // e.g. "PKX-92810"
  vehicleNumber: string; // e.g. "TS 09 AB 1234"
  phoneNumber: string; // e.g. "+91 98765 43210"
  mallId: string;
  mallName: string;
  floor: string;
  zone: string;
  pillar: string;
  slotId: string;
  slotNumber: string;
  distanceFromEntrance: number;
  entryTime: string; // ISO String
  exitTime: string | null; // ISO String
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  qrToken: string; // Cryptographic verification token for QR scanner
  customerAccessToken: string; // Cryptographic secure token for SMS URL
  smsStatus: "SENT" | "FAILED" | "PENDING";
  smsMessageId?: string;
  createdAt: string;
  completedAt: string | null;
}

// In-Memory Persistent Store across hot-reloads and API calls
interface GlobalStore {
  slots: ParkingSlot[];
  bookings: BookingRecord[];
  isInitialized: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var __PARKNEX_STORE__: GlobalStore | undefined;
}

function getStore(): GlobalStore {
  if (!global.__PARKNEX_STORE__) {
    // Seed initial active bookings to match occupied initial slots
    const initialBookings: BookingRecord[] = [];

    global.__PARKNEX_STORE__ = {
      slots: JSON.parse(JSON.stringify(INITIAL_PARKING_SLOTS)),
      bookings: initialBookings,
      isInitialized: true,
    };
  }
  return global.__PARKNEX_STORE__;
}

// ── Database Operations ──────────────────────────────────────────

export function getAllSlots(floor?: string): ParkingSlot[] {
  const store = getStore();
  if (!floor || floor === "ALL") {
    return store.slots;
  }
  return store.slots.filter((s) => s.floor === floor);
}

export function getSlotById(id: string): ParkingSlot | undefined {
  const store = getStore();
  return store.slots.find((s) => s.id === id);
}

export function getNearestSlot(floor?: string): ParkingSlot | null {
  const store = getStore();
  return findNearestAvailableSlot(store.slots, floor === "ALL" ? undefined : floor);
}

export interface CreateBookingInput {
  vehicleNumber: string;
  phoneNumber: string;
  slotId: string;
  mallId?: string;
  mallName?: string;
}

/**
 * Creates an atomic booking with collision protection & double-booking prevention.
 */
export function createBooking(input: CreateBookingInput): {
  success: boolean;
  booking?: BookingRecord;
  error?: string;
} {
  const store = getStore();
  const slotIndex = store.slots.findIndex((s) => s.id === input.slotId);

  if (slotIndex === -1) {
    return { success: false, error: "Parking slot not found." };
  }

  const slot = store.slots[slotIndex];

  // Double-booking check
  if (slot.status !== "available") {
    const nextNearest = findNearestAvailableSlot(store.slots, slot.floor);
    return {
      success: false,
      error: `This space (${slot.slotNumber}) was just occupied. Recommended nearest available space is ${
        nextNearest ? nextNearest.slotNumber : "on another level"
      }.`,
    };
  }

  // Generate cryptographic secure tokens
  const qrToken = `pkx_qr_${crypto.randomBytes(16).toString("hex")}`;
  const customerAccessToken = `pkx_cust_${crypto.randomBytes(20).toString("hex")}`;
  const bookingNumber = `PKX-${Math.floor(10000 + Math.random() * 90000)}`;
  const nowIso = new Date().toISOString();

  // Atomically update slot to occupied
  store.slots[slotIndex].status = "occupied";

  const newBooking: BookingRecord = {
    id: `bk_${crypto.randomUUID()}`,
    bookingNumber,
    vehicleNumber: input.vehicleNumber.trim().toUpperCase(),
    phoneNumber: input.phoneNumber.trim(),
    mallId: input.mallId || slot.mallId,
    mallName: input.mallName || slot.mallName,
    floor: slot.floor,
    zone: slot.zone,
    pillar: slot.pillar,
    slotId: slot.id,
    slotNumber: slot.slotNumber,
    distanceFromEntrance: slot.distanceFromEntrance,
    entryTime: nowIso,
    exitTime: null,
    status: "ACTIVE",
    qrToken,
    customerAccessToken,
    smsStatus: "PENDING",
    createdAt: nowIso,
    completedAt: null,
  };

  store.bookings.unshift(newBooking);
  return { success: true, booking: newBooking };
}

export function updateBookingSmsStatus(
  bookingId: string,
  status: "SENT" | "FAILED",
  messageId?: string
) {
  const store = getStore();
  const booking = store.bookings.find((b) => b.id === bookingId);
  if (booking) {
    booking.smsStatus = status;
    if (messageId) booking.smsMessageId = messageId;
  }
}

export function getBookingByCustomerToken(token: string): {
  booking: BookingRecord | null;
  slot: ParkingSlot | null;
} {
  const store = getStore();
  const booking = store.bookings.find((b) => b.customerAccessToken === token);
  if (!booking) return { booking: null, slot: null };
  const slot = store.slots.find((s) => s.id === booking.slotId) || null;
  return { booking, slot };
}

export function getCustomerBookingHistory(token: string): BookingRecord[] {
  const store = getStore();
  const current = store.bookings.find((b) => b.customerAccessToken === token);
  if (!current) return [];

  // Return all bookings for this customer's phone number or vehicle number
  return store.bookings.filter(
    (b) => b.phoneNumber === current.phoneNumber || b.vehicleNumber === current.vehicleNumber
  );
}

export function getAllBookings(filters?: {
  status?: string;
  floor?: string;
  query?: string;
  date?: string;
}): BookingRecord[] {
  const store = getStore();
  let list = [...store.bookings];

  if (filters?.status && filters.status !== "ALL") {
    list = list.filter((b) => b.status === filters.status);
  }
  if (filters?.floor && filters.floor !== "ALL") {
    list = list.filter((b) => b.floor === filters.floor);
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase().trim();
    list = list.filter(
      (b) =>
        b.vehicleNumber.toLowerCase().includes(q) ||
        b.phoneNumber.includes(q) ||
        b.bookingNumber.toLowerCase().includes(q) ||
        b.slotNumber.toLowerCase().includes(q) ||
        b.pillar.toLowerCase().includes(q)
    );
  }
  if (filters?.date) {
    list = list.filter((b) => b.entryTime.startsWith(filters.date!));
  }

  return list;
}

export function verifyExitPass(qrToken: string): {
  isValid: boolean;
  status: "VALID" | "ALREADY_USED" | "INVALID" | "EXPIRED";
  booking?: BookingRecord;
  message?: string;
} {
  const store = getStore();
  const cleanToken = qrToken.trim();
  const booking = store.bookings.find((b) => b.qrToken === cleanToken);

  if (!booking) {
    return {
      isValid: false,
      status: "INVALID",
      message: "Invalid or unrecognized Exit Pass token.",
    };
  }

  if (booking.status === "COMPLETED") {
    return {
      isValid: false,
      status: "ALREADY_USED",
      booking,
      message: `Pass already used. Exit was completed at ${new Date(
        booking.completedAt || booking.exitTime || ""
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
    };
  }

  if (booking.status === "CANCELLED") {
    return {
      isValid: false,
      status: "EXPIRED",
      booking,
      message: "This parking booking was cancelled.",
    };
  }

  return {
    isValid: true,
    status: "VALID",
    booking,
  };
}

export function completeExit(bookingId: string): {
  success: boolean;
  booking?: BookingRecord;
  error?: string;
} {
  const store = getStore();
  const bookingIndex = store.bookings.findIndex((b) => b.id === bookingId || b.qrToken === bookingId);

  if (bookingIndex === -1) {
    return { success: false, error: "Booking not found." };
  }

  const booking = store.bookings[bookingIndex];
  if (booking.status === "COMPLETED") {
    return { success: false, error: "Booking has already been completed." };
  }

  const nowIso = new Date().toISOString();
  booking.status = "COMPLETED";
  booking.exitTime = nowIso;
  booking.completedAt = nowIso;

  // Free up the parking slot
  const slotIndex = store.slots.findIndex((s) => s.id === booking.slotId);
  if (slotIndex !== -1) {
    store.slots[slotIndex].status = "available";
  }

  return { success: true, booking };
}
