import { NextResponse } from "next/server";
import { sendParkingPassEmail, maskEmail } from "@/lib/notifications/emailAdapter";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://agreeable-tapir-530.convex.cloud";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      bookingId,
      to,
      vehicleNumber,
      slotNumber,
      floor,
      zone,
      pillar,
      mallName,
      customerAccessToken,
      fallbackCode,
    } = body;

    if (!bookingId || !to || !vehicleNumber || !slotNumber) {
      return NextResponse.json(
        { success: false, error: "Missing required booking details for email notification." },
        { status: 400 }
      );
    }

    // 1. Dispatch real email via Resend
    const result = await sendParkingPassEmail({
      bookingId,
      to,
      vehicleNumber,
      slotNumber,
      floor: floor || "B2",
      zone: zone || "Zone A",
      pillar: pillar || "Pillar",
      mallName: mallName || "Central Mall Grand",
      customerAccessToken,
      fallbackCode,
    });

    // 2. Synchronize email delivery status with Convex atomically
    try {
      const client = new ConvexHttpClient(convexUrl);
      await client.mutation(api.bookings.updateEmailDeliveryStatus, {
        bookingId: bookingId as any,
        emailStatus: result.status,
        emailRecipient: to.trim().toLowerCase(),
        emailProviderId: result.providerId,
        emailFailureReason: result.error,
      });
    } catch (syncErr: any) {
      console.warn("Failed to sync email status to Convex:", syncErr.message);
    }

    return NextResponse.json({
      success: result.success,
      status: result.status,
      providerId: result.providerId,
      maskedRecipient: maskEmail(to),
      error: result.error,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, status: "failed", error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
