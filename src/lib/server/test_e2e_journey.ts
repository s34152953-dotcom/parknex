import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { sendBookingSms, formatSmsMessage } from "./sms";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://astute-pony-718.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

async function runE2ETest() {
  console.log("=== PARKNEX END-TO-END FLOW VERIFICATION ===");
  console.log(`Connecting to Convex: ${CONVEX_URL}`);

  // 1. Check Available Slots on B2
  console.log("\n[1] Querying real slots from Convex database...");
  const slotsResult = await convex.query(api.slots.getSlots, { floor: "B2" });
  const availableSlots = (slotsResult?.slots || []).filter((s: any) => s.status === "available");
  console.log(`Found ${availableSlots.length} available slots on Level B2.`);
  
  if (availableSlots.length === 0) {
    throw new Error("No available slots found on Level B2 for testing.");
  }

  const targetSlot = availableSlots[0];
  console.log(`Selected Real Slot: ${targetSlot.slotId} (${targetSlot.slotNumber}, Floor: ${targetSlot.floor}, Zone: ${targetSlot.zone}, Pillar: ${targetSlot.pillar})`);

  // 2. Create Booking
  const testPlate = `TEST-${Math.floor(1000 + Math.random() * 9000)}`;
  const testPhone = "+919876543210";
  console.log(`\n[2] Creating booking for Vehicle: ${testPlate}, Phone: ${testPhone}...`);
  
  const bookingResult = await convex.mutation(api.bookings.createBooking, {
    slotId: targetSlot.slotId,
    vehicleNumber: testPlate,
    phoneNumber: testPhone,
    mallName: targetSlot.mallName || "Central Mall Grand",
  });

  console.log("Booking successfully created in Convex:");
  console.log(`- Booking ID: ${bookingResult.bookingId}`);
  console.log(`- Customer Access Token: ${bookingResult.customerAccessToken.substring(0, 16)}...`);
  console.log(`- Exit Pass Token: ${bookingResult.exitPassToken.substring(0, 20)}...`);

  // 3. Verify Slot Status is now occupied
  console.log("\n[3] Verifying slot status in Convex transitioned to occupied...");
  const updatedSlots = await convex.query(api.slots.getSlots, { floor: "B2" });
  const bookedSlotCheck = (updatedSlots?.slots || []).find((s: any) => s.slotId === targetSlot.slotId);
  console.log(`Slot ${targetSlot.slotId} status is now: ${bookedSlotCheck?.status}`);
  if (bookedSlotCheck?.status !== "occupied") {
    throw new Error(`Expected slot to be 'occupied', but got: ${bookedSlotCheck?.status}`);
  }

  // 4. Verify Duplicate Prevention
  console.log("\n[4] Verifying duplicate active booking prevention...");
  let duplicatePrevented = false;
  try {
    // Try to book the same slot
    await convex.mutation(api.bookings.createBooking, {
      slotId: targetSlot.slotId,
      vehicleNumber: `DIFF-${Math.floor(1000 + Math.random() * 9000)}`,
      phoneNumber: "+919999988888",
      mallName: targetSlot.mallName || "Central Mall Grand",
    });
  } catch (err: any) {
    duplicatePrevented = true;
    console.log(`Duplicate booking correctly rejected: "${err.message}"`);
  }
  if (!duplicatePrevented) {
    throw new Error("Duplicate booking was not rejected on occupied slot!");
  }

  // 5. Test SMS Message Formatting & Dispatch Adapter
  console.log("\n[5] Testing SMS notification message payload...");
  const customerLink = `https://parknex.vercel.app/customer/${bookingResult.customerAccessToken}`;
  const smsBody = formatSmsMessage({
    to: testPhone,
    vehicleNumber: testPlate,
    floor: targetSlot.floor,
    zone: targetSlot.zone,
    pillar: targetSlot.pillar,
    slotNumber: targetSlot.slotNumber,
    customerLink,
  });
  console.log("Formatted SMS Body:\n---");
  console.log(smsBody);
  console.log("---");

  const smsResult = await sendBookingSms({
    to: testPhone,
    vehicleNumber: testPlate,
    floor: targetSlot.floor,
    zone: targetSlot.zone,
    pillar: targetSlot.pillar,
    slotNumber: targetSlot.slotNumber,
    customerLink,
  });
  console.log(`SMS Dispatch result: success=${smsResult.success}, provider=${smsResult.provider}, error=${smsResult.error || "none"}`);

  // 6. Test Customer Dashboard Query by Token
  console.log("\n[6] Testing Customer Dashboard query (by customerAccessToken)...");
  const customerView = await convex.query(api.bookings.getBookingByToken, {
    token: bookingResult.customerAccessToken,
  });
  if (!customerView) {
    throw new Error("Failed to load customer view using token!");
  }
  console.log("Customer View Loaded Successfully:");
  console.log(`- Vehicle: ${customerView.vehicleNumber}`);
  console.log(`- Space: ${customerView.floor} · ${customerView.zone} · ${customerView.slotNumber}`);
  console.log(`- Pillar: ${customerView.pillar}`);
  console.log(`- Status: ${customerView.status}`);
  console.log(`- Has Exit Pass Token: ${!!customerView.exitPassToken}`);
  console.log(`- Walking Directions: ${customerView.walkingDirections?.join(" -> ")}`);

  // 7. Test Exit Scanner Lookup by ExitPassToken
  console.log("\n[7] Testing Exit Scanner verification (by exitPassToken)...");
  const scannerLookup = await convex.query(api.bookings.getBookingByExitPass, {
    exitPassToken: bookingResult.exitPassToken,
  });
  if (!scannerLookup || scannerLookup.status !== "ACTIVE" || scannerLookup.exitPassUsed) {
    throw new Error("Scanner lookup by exitPassToken failed or returned invalid status!");
  }
  console.log(`Exit Scanner valid lookup for Vehicle: ${scannerLookup.vehicleNumber}, Status: ${scannerLookup.status}`);

  // 8. Test Exit Completion
  console.log("\n[8] Testing Complete Exit Mutation...");
  const completeResult = await convex.mutation(api.bookings.completeBooking, {
    token: bookingResult.exitPassToken,
  });
  console.log(`Exit completed successfully: vehicle=${completeResult.vehicleNumber}, exitTime=${completeResult.exitTime}`);

  // 9. Verify Slot Released back to available
  console.log("\n[9] Verifying slot is restored to available in Convex...");
  const postExitSlots = await convex.query(api.slots.getSlots, { floor: "B2" });
  const releasedSlotCheck = (postExitSlots?.slots || []).find((s: any) => s.slotId === targetSlot.slotId);
  console.log(`Slot ${targetSlot.slotId} status after exit is: ${releasedSlotCheck?.status}`);
  if (releasedSlotCheck?.status !== "available") {
    throw new Error(`Expected slot to be 'available' after exit, but got: ${releasedSlotCheck?.status}`);
  }

  // 10. Verify Double Scan Rejection
  console.log("\n[10] Verifying duplicate exit scan rejection (Single-Use Token)...");
  let doubleScanRejected = false;
  try {
    await convex.mutation(api.bookings.completeBooking, {
      token: bookingResult.exitPassToken,
    });
  } catch (err: any) {
    doubleScanRejected = true;
    console.log(`Second scan attempt correctly rejected: "${err.message}"`);
  }
  if (!doubleScanRejected) {
    throw new Error("Second exit scan attempt was not rejected!");
  }

  // 11. Verify Invalid Token Behavior
  console.log("\n[11] Verifying invalid token behavior...");
  const invalidResult = await convex.query(api.bookings.getBookingByToken, {
    token: "completely_fake_invalid_token_12345",
  });
  if (invalidResult !== null) {
    throw new Error("Invalid token query should return null, but returned data!");
  }
  console.log("Invalid token safely returned null (safe error handling).");

  console.log("\n=== ALL 11 END-TO-END FLOW CHECKS PASSED PERFECTLY ===");
}

runE2ETest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
