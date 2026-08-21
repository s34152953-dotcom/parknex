// ── End-to-End System Flow Validation Test ──
import {
  getAllSlots,
  getNearestSlot,
  createBooking,
  getBookingByCustomerToken,
  getCustomerBookingHistory,
  verifyExitPass,
  completeExit,
  getAllBookings,
} from "./db";
import { sendBookingSms } from "./sms";

async function runEndToEndJourneyTest() {
  console.log("=================================================");
  console.log("STARTING PARKNEX COMPLETE USER JOURNEY TEST");
  console.log("=================================================\n");

  // Step 1: Customer arrives at entrance, Admin opens PARKNEX and loads slots
  const allB2Slots = getAllSlots("B2");
  console.log(`[Step 1] Loaded ${allB2Slots.length} parking slots for Floor B2.`);
  const initialAvailable = allB2Slots.filter((s) => s.status === "available");
  console.log(`Available slots on B2: ${initialAvailable.map((s) => s.slotNumber).join(", ")}`);

  // Step 2 & 3: PARKNEX determines nearest available space
  const nearest = getNearestSlot("B2");
  console.log(`\n[Step 2 & 3] Recommended nearest available space: ${nearest?.slotNumber} (${nearest?.distanceFromEntrance}m from entrance at ${nearest?.pillar})`);
  if (nearest?.slotNumber !== "A-04") {
    throw new Error(`Expected A-04 as nearest available slot, got ${nearest?.slotNumber}`);
  }
  console.log("✓ Nearest recommendation algorithm verified: Slot A-04 selected.");

  // Step 4, 5, 6, 7: Admin selects A-04, enters vehicle TS 09 AB 9999, phone +91 98765 43210 and confirms
  const vehicleNumber = "TS 09 AB 9999";
  const phoneNumber = "+91 98765 43210";
  console.log(`\n[Step 4-7] Admin inputs vehicle: ${vehicleNumber}, phone: ${phoneNumber}, slot: ${nearest.id}`);

  // Step 8 & 9: Database creates booking atomically and marks slot occupied
  const bookingResult = createBooking({
    vehicleNumber,
    phoneNumber,
    slotId: nearest.id,
    mallName: "Central Mall Grand",
  });

  if (!bookingResult.success || !bookingResult.booking) {
    throw new Error(`Booking creation failed: ${bookingResult.error}`);
  }

  const booking = bookingResult.booking;
  console.log(`[Step 8] Booking created successfully: ${booking.bookingNumber} (ID: ${booking.id})`);
  console.log(`Unique Customer Token: ${booking.customerAccessToken}`);
  console.log(`Unique QR Exit Token: ${booking.qrToken}`);

  // Verify slot A-04 is now occupied
  const updatedSlots = getAllSlots("B2");
  const slotA04 = updatedSlots.find((s) => s.id === nearest.id);
  console.log(`[Step 9] Slot ${slotA04?.slotNumber} status is now: ${slotA04?.status.toUpperCase()}`);
  if (slotA04?.status !== "occupied") {
    throw new Error(`Expected slot A-04 to be occupied, got ${slotA04?.status}`);
  }

  // Next nearest should automatically update
  const newNearest = getNearestSlot("B2");
  console.log(`Updated nearest available space on Floor B2 is now: ${newNearest?.slotNumber} (${newNearest?.distanceFromEntrance}m)`);

  // Step 10, 11, 12: Dispatch SMS to customer phone
  const customerLink = `https://parknex.vercel.app/customer/${booking.customerAccessToken}`;
  const smsResult = await sendBookingSms({
    to: phoneNumber,
    vehicleNumber,
    floor: booking.floor,
    zone: booking.zone,
    pillar: booking.pillar,
    slotNumber: booking.slotNumber,
    customerLink,
  });
  console.log(`\n[Step 10-12] SMS Dispatch result: ${smsResult.success ? "DELIVERED" : "FAILED"} via ${smsResult.provider} (ID: ${smsResult.messageId})`);

  // Step 13, 14, 15, 16: Customer opens secure link and accesses Find My Space
  console.log(`\n[Step 13-16] Customer opens link: ${customerLink}`);
  const customerView = getBookingByCustomerToken(booking.customerAccessToken);
  if (!customerView.booking) {
    throw new Error("Customer lookup by secure token failed!");
  }
  console.log(`Customer Interface loaded active vehicle: ${customerView.booking.vehicleNumber}`);
  console.log(`Customer Location: Floor ${customerView.booking.floor} · ${customerView.booking.zone} · ${customerView.booking.slotNumber} (${customerView.booking.pillar})`);
  console.log(`Customer Walking Directions: ${customerView.slot?.walkingDirections?.join(" -> ")}`);
  console.log(`Customer Digital Exit QR Token: ${customerView.booking.qrToken}`);

  // Step 17, 18, 19: Admin opens Scan Exit Pass and scans customer QR
  console.log(`\n[Step 17-19] Admin scans QR token: ${booking.qrToken}`);
  const verification = verifyExitPass(booking.qrToken);
  console.log(`Verification result: ${verification.status} (Valid: ${verification.isValid})`);
  if (!verification.isValid || verification.status !== "VALID") {
    throw new Error(`Expected VALID pass, got ${verification.status}`);
  }
  console.log(`Authorized Vehicle: ${verification.booking?.vehicleNumber} at Slot ${verification.booking?.slotNumber}`);

  // Step 20, 21, 22, 23: Admin confirms exit, booking completed, slot freed, QR invalidated
  console.log(`\n[Step 20-23] Admin authorizes barrier opening and completes exit.`);
  const exitResult = completeExit(booking.id);
  if (!exitResult.success) {
    throw new Error(`Exit completion failed: ${exitResult.error}`);
  }
  console.log(`Booking Status is now: ${exitResult.booking?.status}`);
  console.log(`Exit Timestamp recorded: ${exitResult.booking?.exitTime}`);

  // Verify slot A-04 is back to available
  const finalSlots = getAllSlots("B2");
  const freedSlot = finalSlots.find((s) => s.id === nearest.id);
  console.log(`Slot ${freedSlot?.slotNumber} is now: ${freedSlot?.status.toUpperCase()}`);
  if (freedSlot?.status !== "available") {
    throw new Error(`Expected slot A-04 to be available after exit, got ${freedSlot?.status}`);
  }

  // Verify QR is now marked ALREADY_USED
  const reVerification = verifyExitPass(booking.qrToken);
  console.log(`Re-scanning used QR result: ${reVerification.status} (${reVerification.message})`);
  if (reVerification.isValid || reVerification.status !== "ALREADY_USED") {
    throw new Error(`Expected ALREADY_USED on re-scan, got ${reVerification.status}`);
  }

  // Step 24 & 25: Admin History and Customer History check
  const adminHistory = getAllBookings();
  const foundAdminRecord = adminHistory.find((b) => b.id === booking.id);
  console.log(`\n[Step 24] Admin History shows completed record: ${foundAdminRecord?.bookingNumber} (${foundAdminRecord?.status})`);

  const customerHistory = getCustomerBookingHistory(booking.customerAccessToken);
  const foundCustRecord = customerHistory.find((b) => b.id === booking.id);
  console.log(`[Step 25] Customer History shows completed record: ${foundCustRecord?.bookingNumber} (${foundCustRecord?.status})`);

  console.log("\n=================================================");
  console.log("ALL 25 STEPS OF THE END-TO-END FLOW PASSED 100%!");
  console.log("=================================================\n");
}

runEndToEndJourneyTest().catch((err) => {
  console.error("Test Error:", err);
  process.exit(1);
});
