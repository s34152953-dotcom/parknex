"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Car, ShieldCheck, Navigation, QrCode } from "lucide-react";
import ParknexLogo from "@/components/ui/ParknexLogo";
import LoadingFallback from "@/components/landing/LoadingFallback";

// Dynamic import of ParkingHero to prevent SSR canvas issues and ensure fast load
const ParkingHero = dynamic(() => import("@/components/landing/ParkingHero"), {
  ssr: false,
  loading: () => <LoadingFallback isReady={false} />,
});

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] bg-[#FAF7F2] text-[#241F1B] selection:bg-[#F9E3DE] selection:text-[#C93B2F] box-border w-full flex flex-col">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#DED3C7] w-full">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] sm:h-[72px] flex items-center justify-between">
          <Link href="/" className="group flex items-center transition-transform hover:opacity-90 shrink-0">
            <ParknexLogo size="md" variant="light" />
          </Link>

          <Link
            href="/auth/login"
            aria-label="Operator Sign In"
            className="flex items-center gap-2 px-4 h-[44px] rounded-xl text-[13.5px] font-bold text-[#241F1B] hover:text-[#C93B2F] border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] transition-all shadow-[0_2px_8px_rgba(70,48,35,0.04)] shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-[#C93B2F]" />
            <span>
              <span className="hidden sm:inline">Operator Sign In</span>
              <span className="sm:hidden">Operator</span>
            </span>
          </Link>
        </div>
      </header>

      {/* ── 3D WEBGL HERO SECTION ── */}
      <ParkingHero />

      {/* ── INFO MICRO-DETAILS ── */}
      <section className="w-full px-4 sm:px-6 lg:px-8 bg-[#F3EAE0] py-6 border-y border-[#DED3C7]">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4 text-[13.5px] text-[#70675F] font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2F7D5A]" />
            <span>Real-time Space Allocations</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3569A8]" />
            <span>Digital QR Exit Passes</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C93B2F]" />
            <span>SMS-Link Turn-by-Turn Guidance</span>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section className="w-full bg-[#FAF7F2] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1440px] mx-auto">
          {/* Section Header */}
          <div className="mb-10 sm:mb-14">
            <div className="text-[13px] font-bold uppercase text-[#C93B2F] tracking-wider mb-2">
              How It Works
            </div>
            <h2 className="text-[28px] sm:text-[36px] lg:text-[40px] font-black text-[#241F1B] leading-tight max-w-[620px]">
              Frictionless parking from arrival to departure.
            </h2>
          </div>

          {/* 3 Step Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 01 */}
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_24px_rgba(70,48,35,0.06)] hover:border-[#CBBCAE] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[36px] font-black text-[#C93B2F]">01</span>
                  <div className="w-10 h-10 rounded-xl bg-[#F9E3DE] flex items-center justify-center text-[#C93B2F]">
                    <Car className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-[20px] font-bold text-[#241F1B] mb-2">Drive In</h3>
                <p className="text-[14.5px] text-[#70675F] leading-relaxed">
                  Provide your vehicle registration plate at the entry gate operator terminal upon arrival.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_24px_rgba(70,48,35,0.06)] hover:border-[#CBBCAE] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[36px] font-black text-[#C93B2F]">02</span>
                  <div className="w-10 h-10 rounded-xl bg-[#F9E3DE] flex items-center justify-center text-[#C93B2F]">
                    <Navigation className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-[20px] font-bold text-[#241F1B] mb-2">Get Your Slot</h3>
                <p className="text-[14.5px] text-[#70675F] leading-relaxed">
                  Receive an immediate SMS with your exact assigned slot, floor level, pillar code and walking route.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_24px_rgba(70,48,35,0.06)] hover:border-[#CBBCAE] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[36px] font-black text-[#C93B2F]">03</span>
                  <div className="w-10 h-10 rounded-xl bg-[#F9E3DE] flex items-center justify-center text-[#C93B2F]">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-[20px] font-bold text-[#241F1B] mb-2">Drive Out</h3>
                <p className="text-[14.5px] text-[#70675F] leading-relaxed">
                  Scan your digital exit pass at the exit gate for seamless barrier clearance without delays.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-[#F3EAE0] border-t border-[#DED3C7] py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <ParknexLogo size="sm" variant="light" />
          <div className="text-[13px] text-[#70675F] text-center sm:text-right">
            <span>PARKNEX Intelligent Parking Systems · Real-time Space Management</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
