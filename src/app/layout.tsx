import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SmartPark — Smart Parking. Without the Guesswork.",
  description:
    "A smarter way to locate, register and retrieve your vehicle inside crowded mall parking areas.",
  keywords: ["parking", "smart parking", "mall parking", "find my car", "parking rewards"],
  openGraph: {
    title: "SmartPark — Smart Parking. Without the Guesswork.",
    description:
      "A smarter way to locate, register and retrieve your vehicle inside crowded mall parking areas.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-manrope)]">
        {children}
      </body>
    </html>
  );
}
