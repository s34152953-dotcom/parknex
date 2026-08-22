import { Resend } from "resend";

export interface SendParkingEmailParams {
  to: string;
  vehicleNumber: string;
  slotNumber: string;
  floor: string;
  zone: string;
  pillar: string;
  mallName: string;
  dashboardLink: string;
  fallbackCode?: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  status: "SENT" | "NOT_CONFIGURED" | "FAILED";
  messageId?: string;
  error?: string;
}

/**
 * Resend Email Delivery Adapter
 * Strictly reports "Email provider is not configured." when RESEND_API_KEY is missing.
 */
export async function sendParkingPassEmail(params: SendParkingEmailParams): Promise<EmailDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "ParkNex Parking <notifications@parknex.io>";

  if (!apiKey || apiKey.includes("placeholder") || apiKey === "re_your_resend_api_key_here") {
    return {
      success: false,
      status: "NOT_CONFIGURED",
      error: "Email provider is not configured.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #050507; color: #F5F7FA; padding: 24px; }
            .card { background-color: #10151D; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; max-width: 500px; margin: 0 auto; }
            .title { color: #D84A2B; font-size: 20px; font-weight: bold; margin-bottom: 8px; }
            .highlight { color: #D84A2B; font-weight: bold; }
            .code { font-family: monospace; background: #151B24; padding: 8px 12px; border-radius: 8px; font-size: 16px; display: inline-block; margin: 8px 0; border: 1px solid rgba(255,255,255,0.1); }
            .btn { display: inline-block; background-color: #D84A2B; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; margin-top: 16px; }
            .footer { margin-top: 20px; font-size: 12px; color: rgba(245,247,250,0.58); }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">ParkNex Smart Parking Pass</div>
            <p>Your parking space at <strong>${params.mallName}</strong> is confirmed for vehicle <strong>${params.vehicleNumber}</strong>.</p>
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 16px 0;" />
            <p><strong>Floor:</strong> ${params.floor} &nbsp;|&nbsp; <strong>Zone:</strong> ${params.zone}</p>
            <p><strong>Space:</strong> <span class="highlight">Slot ${params.slotNumber}</span> &nbsp;|&nbsp; <strong>Pillar:</strong> ${params.pillar}</p>
            ${params.fallbackCode ? `<p><strong>Backup Exit Code:</strong> <br/><span class="code">${params.fallbackCode}</span></p>` : ""}
            <p><a href="${params.dashboardLink}" class="btn">Open Customer Dashboard &amp; Exit Pass</a></p>
            <div class="footer">
              Please present your digital pass to the barrier scanner when exiting the facility.
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: params.to,
      subject: `Your ParkNex Parking Pass: Space ${params.slotNumber} (${params.vehicleNumber})`,
      html: htmlBody,
    });

    if (error) {
      return {
        success: false,
        status: "FAILED",
        error: error.message || "Failed to send email via Resend.",
      };
    }

    return {
      success: true,
      status: "SENT",
      messageId: data?.id,
    };
  } catch (err: any) {
    return {
      success: false,
      status: "FAILED",
      error: err.message || "Resend connection error.",
    };
  }
}
