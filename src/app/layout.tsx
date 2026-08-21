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
    "A smarter way to locate, register and retrieve your vehicle inside crowded mall parking areas with real-time guidance.",
  keywords: ["parking", "smart parking", "mall parking", "find my car", "PARKNEX"],
  openGraph: {
    title: "PARKNEX — Smarter Parking. Smoother Journeys.",
    description:
      "A smarter way to locate, register and retrieve your vehicle inside crowded mall parking areas with real-time guidance.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} h-full`}>
      <head>
        <link rel="preload" as="image" href="/images/hero-car.jpg" fetchPriority="high" />
      </head>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-sora)] antialiased bg-[#050507] text-[#F5F7FA]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
