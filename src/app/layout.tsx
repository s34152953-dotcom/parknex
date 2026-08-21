import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PARKNEX — Smarter Parking. Smoother Journeys.",
  description:
    "A smarter way to locate, register and retrieve your vehicle inside crowded mall parking areas with real-time 3D guidance.",
  keywords: ["parking", "smart parking", "mall parking", "find my car", "parking rewards", "PARKNEX"],
  openGraph: {
    title: "PARKNEX — Smarter Parking. Smoother Journeys.",
    description:
      "A smarter way to locate, register and retrieve your vehicle inside crowded mall parking areas with real-time 3D guidance.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-sora)] antialiased bg-[#FBF8F3] text-[#1C1917]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
