import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get("data") || "parknex";

  try {
    const pngBuffer = await QRCode.toBuffer(data, {
      type: "png",
      width: 240,
      margin: 2,
      color: {
        dark: "#241F1B",
        light: "#FFFFFF",
      },
    });

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    return new NextResponse("Failed to generate QR code", { status: 500 });
  }
}
