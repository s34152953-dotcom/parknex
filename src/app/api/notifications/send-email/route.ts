import { NextResponse } from "next/server";
import { sendParkingPassEmail, maskEmail, isValidEmail } from "@/lib/notifications/emailAdapter";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://agreeable-tapir-530.convex.cloud";

export async function POST(req: Request) {
  console.log("[assignment-email] request started");

  try {
    const body = await req.json();
    const { bookingId, to, email } = body;

    const rawEmail = (to || email || "").trim();
    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          uiStatusMessage: "Email failed: Delivery provider rejected the request",
          error: "Missing required bookingId parameter.",
        },
        { status: 400 }
      );
    }

    if (!rawEmail) {
      return NextResponse.json({
        success: true,
        status: "not_requested",
        uiStatusMessage: "Email not requested",
        error: null,
      });
    }

    const cleanEmail = rawEmail.toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({
        success: false,
        status: "failed",
        uiStatusMessage: "Email failed: Delivery provider rejected the request",
        error: "Invalid customer email address format.",
        maskedRecipient: maskEmail(cleanEmail),
      });
    }

    // 1. Server-side verification: Load real booking and slot data directly from database
    const client = new ConvexHttpClient(convexUrl);
    const booking = await client.query(api.bookings.getBookingById, {
      bookingId: bookingId as any,
    });

    if (!booking) {
      console.log("[assignment-email] assignment not found in database");
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          uiStatusMessage: "Email failed: Delivery provider rejected the request",
          error: "Booking assignment record not found.",
        },
        { status: 404 }
      );
    }

    console.log("[assignment-email] assignment loaded");

    // 2. Application-level guard: Do not send another email when already marked as sent
    if (booking.emailStatus === "sent" && !body.isRetry) {
      console.log("[assignment-email] assignment already marked as sent; skipping duplicate dispatch");
      return NextResponse.json({
        success: true,
        status: "sent",
        uiStatusMessage: "Email sent",
        providerId: booking.emailProviderMessageId || booking.providerMessageId,
        maskedRecipient: maskEmail(cleanEmail),
        sentAt: booking.emailSentAt || booking.sentAt,
      });
    }

    const slot = booking.slotDetails;
    const targetToken = booking.customerAccessToken || booking.exitPassToken || "";

    // 3. Dispatch email through Next.js server runtime
    const result = await sendParkingPassEmail({
      bookingId: booking._id,
      to: cleanEmail,
      vehicleNumber: booking.vehicleNumber,
      slotNumber: slot?.slotNumber || booking.slotId,
      floor: slot?.floor || "B2",
      zone: slot?.zone || "Zone A",
      pillar: slot?.pillar || "Pillar",
      mallName: booking.mallName || "Central Mall Grand",
      customerAccessToken: targetToken,
      fallbackCode: booking.fallbackCode,
      entryTime: booking.entryTime,
    });

    // 4. Atomically persist notification delivery state in Convex
    try {
      await client.mutation(api.bookings.updateEmailDeliveryStatus, {
        bookingId: booking._id,
        emailStatus: result.status,
        emailRecipient: cleanEmail,
        providerMessageId: result.providerId,
        lastError: result.error,
        sentAt: result.sentAt,
      });
    } catch (syncErr: any) {
      console.warn("[assignment-email] Failed to sync status to Convex:", syncErr.message);
    }

    return NextResponse.json({
      success: result.success,
      status: result.status,
      uiStatusMessage: result.uiErrorCategory || (result.success ? "Email sent" : "Email failed: Delivery provider rejected the request"),
      providerId: result.providerId,
      maskedRecipient: result.maskedRecipient,
      error: result.error,
      sentAt: result.sentAt,
    });
  } catch (err: any) {
    const errorMsg = err.message || "Internal server error";
    console.log(`[assignment-email] Resend rejected: unhandled server exception ${errorMsg}`);
    return NextResponse.json(
      {
        success: false,
        status: "failed",
        uiStatusMessage: "Email failed: Delivery provider rejected the request",
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
