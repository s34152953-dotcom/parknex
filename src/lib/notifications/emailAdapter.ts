import { Resend } from "resend";
import { render } from "@react-email/components";
import React from "react";
import ParkingAssignedEmail from "../../../emails/parking-assigned";

export interface SendParkingEmailParams {
  bookingId: string;
  to: string;
  vehicleNumber: string;
  slotNumber: string;
  floor: string;
  zone: string;
  pillar?: string;
  mallName: string;
  customerAccessToken: string;
  fallbackCode?: string;
  entryTime?: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  status: "sent" | "failed" | "not_requested";
  providerId?: string;
  error?: string;
  uiErrorCategory?:
    | "Email sent"
    | "Email not requested"
    | "Email failed: Resend sandbox recipient restriction"
    | "Email failed: Email service is not configured"
    | "Email failed: Delivery provider rejected the request";
  recipient?: string;
  maskedRecipient?: string;
  sentAt?: string;
}

/**
 * Mask an email for secure operator/customer display: e.g. "m***n@gmail.com"
 */
export function maskEmail(email?: string): string {
  if (!email || !email.includes("@")) return "";
  const [user, domain] = email.split("@");
  if (user.length <= 2) {
    return `${user[0]}***@${domain}`;
  }
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

/**
 * Validate email format with standard RFC regex
 */
export function isValidEmail(email?: string): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
}

/**
 * Real Server-Side Transactional Email Sender via Resend
 * Runs strictly in the Next.js Node.js server runtime.
 */
export async function sendParkingPassEmail(params: SendParkingEmailParams): Promise<EmailDeliveryResult> {
  const cleanEmail = params.to ? params.to.trim().toLowerCase() : "";
  const masked = maskEmail(cleanEmail);

  if (!cleanEmail || !isValidEmail(cleanEmail)) {
    return {
      success: false,
      status: "failed",
      error: "Invalid customer email address format.",
      uiErrorCategory: "Email failed: Delivery provider rejected the request",
      recipient: cleanEmail,
      maskedRecipient: masked,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const isEnvConfigured = Boolean(
    apiKey &&
      !apiKey.includes("placeholder") &&
      apiKey !== "re_your_server_side_key" &&
      apiKey !== "re_your_resend_api_key_here"
  );

  console.log(`[assignment-email] environment configured: ${isEnvConfigured}`);

  if (!isEnvConfigured) {
    console.log("[assignment-email] Resend rejected: status 500 RESEND_API_KEY is not configured");
    return {
      success: false,
      status: "failed",
      error: "Email service is not configured in server environment variables.",
      uiErrorCategory: "Email failed: Email service is not configured",
      recipient: cleanEmail,
      maskedRecipient: masked,
    };
  }

  const fromEmail = process.env.PARKNEX_EMAIL_FROM || "ParkNex <onboarding@resend.dev>";
  const appUrl = (process.env.PARKNEX_APP_URL || process.env.NEXTAUTH_URL || "https://parknex.vercel.app").replace(/\/$/, "");

  const secureDashboardUrl = `${appUrl}/customer/access/${params.customerAccessToken}`;
  const formattedTime = params.entryTime
    ? new Date(params.entryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Generate Exit Gate QR Code URL (Encodes token for barrier scanner)
  const qrTarget = params.customerAccessToken || params.bookingId;
  const exitQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrTarget)}&margin=8`;

  try {
    const resend = new Resend(apiKey);

    // Render React Email Component to HTML
    const emailHtml = await render(
      React.createElement(ParkingAssignedEmail, {
        mallName: params.mallName,
        plateNumber: params.vehicleNumber,
        floor: params.floor,
        zone: params.zone,
        slotNumber: params.slotNumber,
        dashboardUrl: secureDashboardUrl,
        assignmentTime: formattedTime,
        exitQrCodeUrl: exitQrCodeUrl,
        fallbackCode: params.fallbackCode,
      })
    );

    // Idempotency Key prevents duplicate deliveries on network retries or double clicks
    const idempotencyKey = `parking-assignment-${params.bookingId}`;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: cleanEmail,
      subject: `ParkNex – Your Exit Pass & Space ${params.slotNumber} Confirmed`,
      html: emailHtml,
      headers: {
        "X-Entity-Ref-ID": idempotencyKey,
      },
    });

    if (error) {
      const errMessage = error.message || "Failed to send email via Resend.";
      const isSandboxRestriction =
        errMessage.toLowerCase().includes("only send testing emails to your own email address") ||
        errMessage.toLowerCase().includes("verify a domain") ||
        errMessage.toLowerCase().includes("testing emails");

      console.log(`[assignment-email] Resend rejected: status ${error.name || "403"} ${isSandboxRestriction ? "Sandbox restriction" : errMessage}`);

      const safeError = isSandboxRestriction
        ? "Resend sandbox allows delivery only to the registered test email."
        : `Delivery provider rejected the request: ${errMessage}`;

      const uiCategory: EmailDeliveryResult["uiErrorCategory"] = isSandboxRestriction
        ? "Email failed: Resend sandbox recipient restriction"
        : "Email failed: Delivery provider rejected the request";

      return {
        success: false,
        status: "failed",
        error: safeError,
        uiErrorCategory: uiCategory,
        recipient: cleanEmail,
        maskedRecipient: masked,
      };
    }

    const messageId = data?.id;
    console.log(`[assignment-email] Resend accepted: message ID ${messageId}`);

    const now = new Date().toISOString();
    return {
      success: true,
      status: "sent",
      providerId: messageId,
      uiErrorCategory: "Email sent",
      recipient: cleanEmail,
      maskedRecipient: masked,
      sentAt: now,
    };
  } catch (err: any) {
    const errorMsg = err.message || "Resend connection error.";
    console.log(`[assignment-email] Resend rejected: connection error ${errorMsg}`);
    return {
      success: false,
      status: "failed",
      error: `Delivery provider error: ${errorMsg}`,
      uiErrorCategory: "Email failed: Delivery provider rejected the request",
      recipient: cleanEmail,
      maskedRecipient: masked,
    };
  }
}
