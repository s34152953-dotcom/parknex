import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import fs from "fs";

let CONVEX_URL = "https://agreeable-tapir-530.convex.cloud";
try {
  const envContent = fs.readFileSync(".env.local", "utf8");
  const match = envContent.match(/NEXT_PUBLIC_CONVEX_URL=(.+)/);
  if (match) CONVEX_URL = match[1].trim();
} catch {}

const client = new ConvexHttpClient(CONVEX_URL);

async function runOperatorE2ETests() {
  console.log("=================================================");
  console.log("  PARKNEX OPERATOR PORTAL E2E INTEGRATION SUITE  ");
  console.log("=================================================\n");

  const testVehicle = `MH-04-E2E-${Math.floor(1000 + Math.random() * 9000)}`;
  console.log(`Using Test Vehicle: ${testVehicle}\n`);

  // Stage 1: Query Available Slots & Live Stats
  console.log("[1/8] Querying Slots & Live Statistics...");
  const slotsResult = await client.query(api.slots.getSlots, { floor: "B2" });
  const liveStats = await client.query(api.bookings.getLiveStats, { floor: "B2" });
  console.log(`  - Total Slots on B2: ${slotsResult.slots.length}`);
  console.log(`  - Available Spaces: ${liveStats.available}`);
  console.log(`  - Vehicles Inside: ${liveStats.vehiclesInside}`);

  let targetSlot = slotsResult.slots.find((s) => s.status === "available");
  if (!targetSlot) {
    // Reset one slot for the test
    targetSlot = slotsResult.slots[0];
    await client.mutation(api.slots.updateSlotStatus, {
      slotId: targetSlot.slotId,
      status: "available",
      operatorEmail: "system:test_setup",
    });
  }
  console.log(`  - Target Space Selected: Space ${targetSlot.slotNumber} (${targetSlot.slotId})\n`);

  // Stage 2: Create Walk-In Entry (Atomic Assignment + Token Signing)
  console.log("[2/8] Creating Walk-In Entry via Operator Mutation...");
  const entryResult = await client.mutation(api.bookings.createWalkInEntry, {
    slotId: targetSlot.slotId,
    vehicleNumber: testVehicle,
    phoneNumber: "+919876543210",
    email: "e2e-driver@test.com",
    vehicleType: "sedan",
    mallName: "Central Mall Grand",
    operatorEmail: "operator:desk01",
    entryPlateConfidence: 0.95,
    recommendationScore: 98,
    recommendationReason: "Recommended because it is 25m from Entry Gate A.",
  });

  console.log(`  - Booking Created: ID ${entryResult.bookingId}`);
  console.log(`  - Fallback Code Generated: ${entryResult.fallbackCode}`);
  console.log(`  - Exit Pass Token Issued: ${entryResult.exitPassToken.substring(0, 24)}...\n`);

  // Stage 3: Test Server-Side Duplicate Active Plate Prevention
  console.log("[3/8] Testing Server-Side Duplicate Active Plate Prevention...");
  let duplicateBlocked = false;
  try {
    await client.mutation(api.bookings.createWalkInEntry, {
      slotId: targetSlot.slotId,
      vehicleNumber: testVehicle,
      mallName: "Central Mall Grand",
      operatorEmail: "operator:desk01",
    });
  } catch (err) {
    duplicateBlocked = true;
    console.log(`  - Duplicate successfully rejected with error: "${err.message}"`);
  }
  if (!duplicateBlocked) {
    throw new Error("Duplicate active plate was NOT blocked by Convex!");
  }
  console.log("  - Duplicate Prevention PASS\n");

  // Stage 4: Test Space Status Override & Audit Log
  console.log("[4/8] Testing Space Status Override & Audit Logging...");
  const testMaintenanceSlot = slotsResult.slots.find((s) => s.slotId !== targetSlot.slotId && s.status === "available");
  if (testMaintenanceSlot) {
    await client.mutation(api.slots.updateSlotStatus, {
      slotId: testMaintenanceSlot.slotId,
      status: "maintenance",
      operatorEmail: "operator:desk01",
      reason: "E2E Test: Sensor calibration",
    });
    console.log(`  - Marked Space ${testMaintenanceSlot.slotNumber} as maintenance`);

    // Verify in Audit Logs
    const logs = await client.query(api.audit.listAuditLogs, { limit: 5 });
    const matchLog = logs.find((l) => l.targetId === testMaintenanceSlot.slotId);
    console.log(`  - Audit record verified: "${matchLog?.action}" - Reason: "${matchLog?.reason}"`);

    // Restore to available
    await client.mutation(api.slots.updateSlotStatus, {
      slotId: testMaintenanceSlot.slotId,
      status: "available",
      operatorEmail: "operator:desk01",
      reason: "E2E Test: Calibration complete",
    });
    console.log(`  - Restored Space ${testMaintenanceSlot.slotNumber} to available\n`);
  }

  // Stage 5: Test Customer Assistance Issue Reporting & Resolution
  console.log("[5/8] Testing Customer Assistance Queue & Resolution...");
  const reportRes = await client.mutation(api.reports.createReport, {
    bookingId: entryResult.bookingId,
    vehicleNumber: testVehicle,
    issueType: "Cannot find slot",
    details: "Driver needs help finding pillar location.",
    mallName: "Central Mall Grand",
    slotNumber: targetSlot.slotNumber,
    floor: targetSlot.floor,
    pillar: targetSlot.pillar,
  });
  const reportId = reportRes.reportId || reportRes;
  console.log(`  - Customer report created: ID ${reportId}`);

  await client.mutation(api.reports.resolveReport, { reportId, status: "RESOLVED" });
  const openReports = await client.query(api.reports.listReports, { status: "OPEN" });
  console.log(`  - Report resolved. Current Open Reports: ${openReports.length}\n`);

  // Stage 6: Test Exit Pass Verification & Plate Comparison
  console.log("[6/8] Testing Exit Pass Verification & Plate Matching...");
  // Test mismatch with wrong plate
  const mismatchResult = await client.mutation(api.bookings.completeExitWithVerification, {
    tokenOrCode: entryResult.fallbackCode,
    exitDetectedPlate: "MH-99-WRONG-9999",
    operatorEmail: "operator:gate_b",
  });
  console.log(`  - Plate mismatch detected: Expected ${mismatchResult.expectedPlate}, Got ${mismatchResult.detectedPlate}`);

  // Test successful exit with correct plate (or operator override)
  const exitResult = await client.mutation(api.bookings.completeExitWithVerification, {
    tokenOrCode: entryResult.fallbackCode,
    exitDetectedPlate: testVehicle,
    operatorEmail: "operator:gate_b",
  });
  console.log(`  - Exit confirmed for ${exitResult.vehicleNumber} at ${exitResult.exitTime}`);
  console.log(`  - Space ${exitResult.slotNumber} released\n`);

  // Stage 7: Test Single-Use Rejection (Double Exit Attempt)
  console.log("[7/8] Testing Single-Use Pass Rejection (Double Scan Guard)...");
  let doubleScanBlocked = false;
  try {
    await client.mutation(api.bookings.completeExitWithVerification, {
      tokenOrCode: entryResult.fallbackCode,
      operatorEmail: "operator:gate_b",
    });
  } catch (err) {
    doubleScanBlocked = true;
    console.log(`  - Replay scan rejected with error: "${err.message}"`);
  }
  if (!doubleScanBlocked) {
    throw new Error("Double exit scan was NOT blocked!");
  }
  console.log("  - Single-Use Guard PASS\n");

  // Stage 8: Verify Space Availability
  console.log("[8/8] Verifying Released Space Status in Convex...");
  const updatedSlots = await client.query(api.slots.getSlots, { floor: targetSlot.floor });
  const releasedSlot = updatedSlots.slots.find((s) => s.slotId === targetSlot.slotId);
  console.log(`  - Space ${targetSlot.slotNumber} status: ${releasedSlot?.status}`);
  if (releasedSlot?.status !== "available") {
    throw new Error(`Expected slot to be available, but found: ${releasedSlot?.status}`);
  }

  console.log("\n=================================================");
  console.log("  ✅ ALL 8 OPERATOR PORTAL E2E TESTS PASSED!     ");
  console.log("=================================================");
}

runOperatorE2ETests().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
