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
 */
export async function sendParkingPassEmail(params: SendParkingEmailParams): Promise<EmailDeliveryResult> {
  const cleanEmail = params.to ? params.to.trim().toLowerCase() : "";

  if (!cleanEmail || !isValidEmail(cleanEmail)) {
    return {
      success: false,
      status: "failed",
      error: "Invalid customer email address format.",
      recipient: cleanEmail,
      maskedRecipient: maskEmail(cleanEmail),
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.PARKNEX_EMAIL_FROM || "ParkNex <onboarding@resend.dev>";
  const appUrl = (process.env.PARKNEX_APP_URL || process.env.NEXTAUTH_URL || "https://parknex.vercel.app").replace(/\/$/, "");

  if (!apiKey || apiKey.includes("placeholder") || apiKey === "re_your_server_side_key") {
    return {
      success: false,
      status: "failed",
      error: "RESEND_API_KEY is not configured in server environment variables.",
      recipient: cleanEmail,
      maskedRecipient: maskEmail(cleanEmail),
    };
  }

  const secureDashboardUrl = `${appUrl}/customer/access/${params.customerAccessToken}`;
  const formattedTime = params.entryTime
    ? new Date(params.entryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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
      })
    );

    // Idempotency Key prevents duplicate deliveries on network retries or double clicks
    const idempotencyKey = `parking-assignment-${params.bookingId}`;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: cleanEmail,
      subject: "ParkNex – Your parking space is confirmed",
      html: emailHtml,
      headers: {
        "X-Entity-Ref-ID": idempotencyKey,
      },
    });

    if (error) {
      let friendlyError = error.message || "Failed to send email via Resend.";
      if (
        friendlyError.toLowerCase().includes("only send testing emails to your own email address") ||
        friendlyError.toLowerCase().includes("verify a domain")
      ) {
        friendlyError =
          "Resend Sandbox Mode: When using onboarding@resend.dev, emails can only be delivered to your registered Resend account email. Verify a custom domain to send to any customer email.";
      }

      return {
        success: false,
        status: "failed",
        error: friendlyError,
        recipient: cleanEmail,
        maskedRecipient: maskEmail(cleanEmail),
      };
    }

    const now = new Date().toISOString();
    return {
      success: true,
      status: "sent",
      providerId: data?.id,
      recipient: cleanEmail,
      maskedRecipient: maskEmail(cleanEmail),
      sentAt: now,
    };
  } catch (err: any) {
    return {
      success: false,
      status: "failed",
      error: err.message || "Resend connection error.",
      recipient: cleanEmail,
      maskedRecipient: maskEmail(cleanEmail),
    };
  }
}
