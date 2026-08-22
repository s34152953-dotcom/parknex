// ── PARKNEX SMS Notification Service ──
// Secure server-side SMS dispatch with multi-provider integration

export interface SendSmsParams {
  to: string; // Recipient phone number (e.g. "+919876543210")
  vehicleNumber: string;
  floor: string;
  zone: string;
  pillar: string;
  slotNumber: string;
  customerLink: string;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
}

/**
 * Formats the official PARKNEX booking confirmation SMS body.
 */
export function formatSmsMessage(params: SendSmsParams): string {
  return `PARKNEX: Your parking space is confirmed.\n\nVehicle: ${params.vehicleNumber}\nSlot: ${params.floor} · ${params.zone} · ${params.slotNumber}\nPillar: ${params.pillar}\n\nFind your parking space and access your exit pass:\n${params.customerLink}`;
}

/**
 * Sends SMS via configured SMS provider (Twilio, Fast2SMS, Vonage, Generic Webhook)
 * with robust error handling and delivery reporting.
 */
export async function sendBookingSms(params: SendSmsParams): Promise<SmsResult> {
  const messageBody = formatSmsMessage(params);
  const cleanPhone = params.to.replace(/[^\d+]/g, "");

  // 1. Check for Twilio Credentials
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioAuthToken && twilioFromNumber) {
    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString("base64");

      const bodyParams = new URLSearchParams();
      bodyParams.append("To", cleanPhone);
      bodyParams.append("From", twilioFromNumber);
      bodyParams.append("Body", messageBody);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyParams.toString(),
      });

      const data = await res.json();
      if (res.ok && data.sid) {
        return {
          success: true,
          messageId: data.sid,
          provider: "Twilio",
        };
      } else {
        return {
          success: false,
          provider: "Twilio",
          error: data.message || "Twilio delivery error",
        };
      }
    } catch (err: any) {
      console.error("[SMS Service] Twilio Error:", err);
      return {
        success: false,
        provider: "Twilio",
        error: err.message || "Network error dispatching Twilio SMS",
      };
    }
  }

  // 2. Check for Fast2SMS (Indian carrier direct gateway)
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsKey) {
    try {
      const numbers = cleanPhone.replace("+91", "").replace("+", "");
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2SmsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message: messageBody,
          language: "english",
          flash: 0,
          numbers: numbers,
        }),
      });

      const data = await res.json();
      if (data.return === true || data.status_code === 200) {
        return {
          success: true,
          messageId: data.request_id || `f2s_${Date.now()}`,
          provider: "Fast2SMS",
        };
      } else {
        const errorMessage = Array.isArray(data.message)
          ? data.message.join(", ")
          : typeof data.message === "string"
          ? data.message
          : JSON.stringify(data.message || data);

        return {
          success: false,
          provider: "Fast2SMS",
          error: errorMessage || "Fast2SMS delivery error",
        };
      }
    } catch (err: any) {
      console.error("[SMS Service] Fast2SMS Error:", err);
      return {
        success: false,
        provider: "Fast2SMS",
        error: err.message,
      };
    }
  }

  // 3. Check for Generic SMS Webhook
  const customSmsWebhook = process.env.SMS_WEBHOOK_URL;
  if (customSmsWebhook) {
    try {
      const res = await fetch(customSmsWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: cleanPhone,
          message: messageBody,
          metadata: {
            vehicle: params.vehicleNumber,
            slot: params.slotNumber,
            link: params.customerLink,
          },
        }),
      });
      if (res.ok) {
        return {
          success: true,
          messageId: `wh_${Date.now()}`,
          provider: "CustomWebhook",
        };
      }
    } catch (err: any) {
      console.error("[SMS Service] Webhook Error:", err);
    }
  }

  // No SMS provider configured — report failure honestly
  // Set TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER, or
  // FAST2SMS_API_KEY, or SMS_WEBHOOK_URL in your environment to enable SMS.
  console.warn("[PARKNEX SMS] No SMS provider configured. Booking created but SMS not sent.");

  return {
    success: false,
    provider: "none",
    error: "No SMS provider configured. Set TWILIO_ACCOUNT_SID, FAST2SMS_API_KEY, or SMS_WEBHOOK_URL.",
  };
}
