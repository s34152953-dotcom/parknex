export interface SendParkingSmsParams {
  to: string; // e.g. "+919876543210"
  vehicleNumber: string;
  slotNumber: string;
  floor: string;
  zone: string;
  pillar: string;
  mallName: string;
  dashboardLink: string;
  fallbackCode?: string;
}

export interface SmsDeliveryResult {
  success: boolean;
  status: "SENT" | "NOT_CONFIGURED" | "FAILED";
  messageId?: string;
  error?: string;
  manualSmsUri?: string;
}

/**
 * Generates a pre-filled manual sms: link that operators can tap to send directly
 */
export function generateManualSmsUri(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  return `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
}

/**
 * TextBee Android SMS Gateway Adapter
 * Sends SMS through a real Android device and SIM card via TextBee REST API.
 * Returns NOT_CONFIGURED state if API credentials are not set.
 */
export async function sendParkingPassSms(params: SendParkingSmsParams): Promise<SmsDeliveryResult> {
  const apiKey = process.env.TEXTBEE_API_KEY;
  const deviceId = process.env.TEXTBEE_DEVICE_ID;

  const smsText = `ParkNex: Space ${params.slotNumber} (${params.floor}, ${params.pillar}) assigned to ${params.vehicleNumber} at ${params.mallName}. Pass: ${params.dashboardLink}${params.fallbackCode ? ` | Code: ${params.fallbackCode}` : ""}`;
  const manualSmsUri = generateManualSmsUri(params.to, smsText);

  if (!apiKey || !deviceId || apiKey.includes("placeholder") || apiKey === "your_textbee_api_key_here") {
    return {
      success: false,
      status: "NOT_CONFIGURED",
      error: "TextBee SMS gateway is not configured. Real Android device & SIM required.",
      manualSmsUri,
    };
  }

  try {
    const cleanPhone = params.to.replace(/[^0-9+]/g, "");
    const response = await fetch(`https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/sendSMS`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        recipients: [cleanPhone],
        message: smsText,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        status: "FAILED",
        error: errData.message || `TextBee SMS failed with HTTP ${response.status}`,
        manualSmsUri,
      };
    }

    const data = await response.json();
    return {
      success: true,
      status: "SENT",
      messageId: data?.data?.messageId || data?.id || "textbee-sent",
      manualSmsUri,
    };
  } catch (err: any) {
    return {
      success: false,
      status: "FAILED",
      error: err.message || "Network error connecting to TextBee gateway.",
      manualSmsUri,
    };
  }
}
