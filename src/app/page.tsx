"use client";

import Link from "next/link";
import { ArrowRight, Car, ShieldCheck, Navigation, QrCode } from "lucide-react";
import ParknexLogo from "@/components/ui/ParknexLogo";

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

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[max(calc(100dvh-72px),640px)] w-full flex flex-col justify-center py-12 lg:py-20 overflow-hidden">
        {/* Background Indian Cars Image + Warm Beige Editorial Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-no-repeat bg-[center_right_20%] sm:bg-[center_right_15%] lg:bg-[right_center] w-full h-full opacity-45"
          style={{
            backgroundImage: 'url("/images/hero-indian-cars.jpg")',
          }}
        />

        {/* Gradient Overlay for high text contrast and editorial aesthetics */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(
                to right,
                #FAF7F2 0%,
                rgba(250, 247, 242, 0.97) 38%,
                rgba(250, 247, 242, 0.75) 60%,
                rgba(250, 247, 242, 0.25) 100%
              )
            `,
          }}
        />

        {/* Hero Content Container */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full lg:w-[54%] flex flex-col">
            {/* Editorial Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DED3C7] bg-[#FFFFFF] text-[#241F1B] text-[12px] font-bold uppercase shadow-xs self-start mb-5">
              <span className="w-2 h-2 rounded-full bg-[#C93B2F]" />
              <span>Smart Mall Parking Management</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-[36px] sm:text-[48px] lg:text-[56px] font-black text-[#241F1B] text-left leading-[1.05] tracking-tight">
              Park in seconds.
              <span className="block text-[#C93B2F]">Find your car</span>
              <span className="block text-[#C93B2F]">instantly.</span>
            </h1>

            {/* Description */}
            <p className="text-[16px] sm:text-[17.5px] text-[#70675F] mt-5 text-left leading-relaxed max-w-[500px]">
              Drive in, receive your assigned parking space via SMS, and navigate back to your vehicle directly on your phone without downloading an app.
            </p>

            {/* Action Row */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3.5 w-full max-w-[440px]">
              <Link
                href="/customer/login"
                className="flex items-center justify-center gap-2.5 w-full min-h-[48px] px-6 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[15px] font-bold transition-all shadow-[0_4px_16px_rgba(201,59,47,0.25)]"
              >
                <Car className="w-5 h-5" />
                <span>Customer Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 w-full min-h-[48px] px-6 rounded-xl border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] text-[#241F1B] text-[15px] font-bold transition-all shadow-xs"
              >
                <ShieldCheck className="w-5 h-5 text-[#C93B2F]" />
                <span>Operator Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

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
