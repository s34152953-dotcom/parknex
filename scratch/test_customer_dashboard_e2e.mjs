import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://astute-pony-718.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

async function runE2E() {
  console.log("=== PARKNEX CUSTOMER DASHBOARD END-TO-END VERIFICATION ===");
  console.log(`Connecting to Convex: ${CONVEX_URL}`);

  const testPlate = `DASH-${Math.floor(1000 + Math.random() * 9000)}`;
  const testEmail = `driver-${Date.now()}@example.com`;
  const testPhone = "+919876543210";

  // 1. User profile and vehicle registration
  console.log(`\n[1] Registering user ${testEmail} with vehicle ${testPlate}...`);
  const userId = await convex.mutation(api.users.upsertUser, {
    email: testEmail,
    name: "Alex Rivera",
    vehicleNumber: testPlate,
  });
  console.log(`User created: ${userId}`);

  const userRecord = await convex.query(api.users.getUser, { email: testEmail });
  if (!userRecord || userRecord.vehicleNumber !== testPlate) {
    throw new Error("User vehicle registration failed in Convex");
  }
  console.log(`User confirmed with vehicle: ${userRecord.vehicleNumber}`);

  // 2. Query available slots on Level B2
  console.log("\n[2] Finding available slot on Level B2...");
  const slotsResult = await convex.query(api.slots.getSlots, { floor: "B2" });
  const availableSlots = (slotsResult?.slots || []).filter((s) => s.status === "available");
  if (availableSlots.length === 0) {
    throw new Error("No available slots found on Level B2");
  }
  const targetSlot = availableSlots[0];
  console.log(`Selected Space: ${targetSlot.slotId} (Slot: ${targetSlot.slotNumber}, Pillar: ${targetSlot.pillar})`);

  // 3. Create active booking for customer
  console.log(`\n[3] Creating active booking for ${testPlate} at slot ${targetSlot.slotId}...`);
  const booking = await convex.mutation(api.bookings.createBooking, {
    slotId: targetSlot.slotId,
    vehicleNumber: testPlate,
    phoneNumber: testPhone,
    mallName: targetSlot.mallName || "Central Mall Grand",
  });
  console.log(`Booking created successfully: ID=${booking.bookingId}`);
  console.log(`Exit Pass Token: ${booking.exitPassToken.substring(0, 20)}...`);

  // 4. Query active booking for dashboard
  console.log("\n[4] Querying active booking by vehicle number...");
  const activeBooking = await convex.query(api.bookings.getActiveBookingByVehicle, {
    vehicleNumber: testPlate,
  });
  if (!activeBooking || activeBooking.status !== "ACTIVE") {
    throw new Error("Active booking query failed");
  }
  console.log(`Active booking verified: ${activeBooking.slotDetails?.slotNumber} on Floor ${activeBooking.slotDetails?.floor}`);
  console.log(`Initial Pillar Confirmed At: ${activeBooking.pillarConfirmedAt || "None (Expected)"}`);

  // 5. Test Pillar QR confirmation (Feature 2: Scan QR)
  console.log("\n[5] Testing Pillar QR confirmation with signed pillar token...");
  const pillarToken = await convex.mutation(api.bookings.generatePillarQrToken, {
    mallId: targetSlot.mallId || "cm-grand",
    floor: targetSlot.floor,
    zone: targetSlot.zone,
    pillar: targetSlot.pillar,
    slotNumber: targetSlot.slotNumber,
  });
  console.log(`Generated signed pillar token: ${pillarToken.substring(0, 20)}...`);

  const confirmRes = await convex.mutation(api.bookings.confirmPillarLocation, {
    bookingId: booking.bookingId,
    pillarTokenOrCode: pillarToken,
  });
  if (!confirmRes.success || !confirmRes.confirmedAt) {
    throw new Error("Pillar confirmation mutation failed");
  }
  console.log(`Pillar confirmed: ${confirmRes.confirmedPillar} at ${confirmRes.confirmedAt}`);

  // Verify updated active booking
  const updatedActive = await convex.query(api.bookings.getActiveBookingByVehicle, {
    vehicleNumber: testPlate,
  });
  if (!updatedActive?.pillarConfirmedAt) {
    throw new Error("Active booking did not persist pillar confirmation");
  }
  console.log(`Timeline state 3 (Pillar Confirmed) verified active in Convex.`);

  // 6. Test Customer Assistance Problem Report (Feature 5)
  console.log("\n[6] Testing Customer Assistance problem reporting...");
  const reportRes = await convex.mutation(api.reports.createReport, {
    bookingId: booking.bookingId,
    vehicleNumber: testPlate,
    issueType: "Cannot find my car",
    details: "Looking for lift exit towards Zone B",
    mallName: targetSlot.mallName || "Central Mall Grand",
    slotNumber: targetSlot.slotNumber,
    floor: targetSlot.floor,
    pillar: targetSlot.pillar,
  });
  if (!reportRes.success || !reportRes.reportId) {
    throw new Error("Problem report submission failed");
  }
  console.log(`Report created in Convex: ID=${reportRes.reportId}`);

  const openReports = await convex.query(api.reports.listReports, { status: "OPEN" });
  const myReport = openReports.find((r) => r.vehicleNumber === testPlate);
  if (!myReport) {
    throw new Error("Report not found in open reports list");
  }
  console.log(`Report confirmed in operator queue: "${myReport.issueType}" - ${myReport.details}`);

  // 7. Test Exit Pass completion (Feature 4: Exit Pass)
  console.log("\n[7] Testing single-use exit pass validation and exit completion...");
  const exitRes = await convex.mutation(api.bookings.completeBooking, {
    token: booking.exitPassToken,
  });
  if (exitRes.status !== "COMPLETED" || !exitRes.exitPassUsed) {
    throw new Error("Exit pass completion failed");
  }
  console.log(`Exit pass validated & marked USED at: ${exitRes.exitTime}`);

  // Verify double scan rejection
  let doubleScanRejected = false;
  try {
    await convex.mutation(api.bookings.completeBooking, {
      token: booking.exitPassToken,
    });
  } catch (err) {
    doubleScanRejected = true;
    console.log(`Second exit scan correctly rejected: "${err.message}"`);
  }
  if (!doubleScanRejected) {
    throw new Error("Single-use token allowed double scan!");
  }

  // 8. Test Customer History (Feature 3: History)
  console.log("\n[8] Testing customer history query...");
  const history = await convex.query(api.bookings.getHistoryByVehicle, {
    vehicleNumber: testPlate,
  });
  if (!history || history.length === 0) {
    throw new Error("Customer history returned no records");
  }
  const completedRecord = history.find((h) => h._id === booking.bookingId);
  if (!completedRecord || completedRecord.status !== "COMPLETED") {
    throw new Error("Completed booking not found in history");
  }
  console.log(`History verified: Found ${history.length} record(s), completed session for Slot ${completedRecord.slotNumber}`);

  console.log("\n=== ALL 8 END-TO-END CONVEX TESTS PASSED PERFECTLY ===");
}

runE2E().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
