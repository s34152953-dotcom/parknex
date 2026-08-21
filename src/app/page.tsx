"use client";

import Link from "next/link";
import { ArrowRight, Car, ShieldCheck, Navigation, QrCode } from "lucide-react";
import ParknexLogo from "@/components/ui/ParknexLogo";

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] bg-[#050507] text-[#F5F7FA] selection:bg-[#D84A2B]/20 selection:text-[#D84A2B] box-border w-full flex flex-col">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#050507]/90 backdrop-blur-md border-b border-white/[0.08] w-full">
        <div className="w-full mx-auto px-[20px] h-[64px] sm:h-[72px] flex items-center justify-between">
          <Link href="/" className="group flex items-center transition-transform hover:opacity-90 shrink-0">
            <ParknexLogo size="md" variant="dark" />
          </Link>

          <Link
            href="/auth/login"
            aria-label="Operator Sign In"
            className="flex items-center gap-[8px] px-[16px] h-[40px] rounded-xl text-[14px] font-semibold text-white hover:text-white border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] transition-all shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-[#D84A2B]" />
            <span>
              <span className="hidden sm:inline">Operator Sign In</span>
              <span className="sm:hidden">Operator</span>
            </span>
          </Link>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[max(calc(100dvh-64px),600px)] w-full flex flex-col justify-end lg:justify-center py-[48px] lg:py-[24px]">
        {/* Background Car Image + Editorial Gradient Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-no-repeat bg-[center_top] lg:bg-[left_15%_center] w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(
                to bottom,
                rgba(5, 5, 7, 0.2) 0%,
                rgba(5, 5, 7, 0.7) 40%,
                rgba(5, 5, 7, 1) 90%
              ),
              url("/images/hero-car.jpg")
            `,
          }}
        />
        
        {/* Desktop horizontal gradient overlay to guarantee text readability */}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent via-[#050507]/60 to-[#050507] pointer-events-none" />

        {/* Ambient Subtle Red Light Accent */}
        <div className="hidden lg:block absolute top-1/3 right-10 w-[500px] h-[500px] rounded-full bg-[#D84A2B]/10 blur-[130px] pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative z-10 w-full px-[20px] lg:px-[48px] max-w-[1240px] mx-auto lg:flex lg:justify-end">
          <div className="w-full lg:w-[50%] flex flex-col">
            {/* Editorial Badge */}
            <div className="inline-flex items-center gap-[8px] px-[12px] py-[6px] rounded-full border border-white/10 bg-white/[0.04] text-white text-[12px] font-semibold uppercase backdrop-blur-sm self-start mb-[16px]">
              <span className="w-2 h-2 rounded-full bg-[#D84A2B]" />
              <span>Smart Mall Parking</span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-title font-black text-white text-left break-words">
              Park in seconds.
              <span className="block text-[#D84A2B]">Find your car</span>
              <span className="block text-[#D84A2B]">instantly.</span>
            </h1>

            {/* Description */}
            <p className="hero-description text-white/70 mt-[24px] text-left">
              Drive in, receive your assigned parking space via SMS, and navigate back to your vehicle on your phone without downloading an app.
            </p>

            {/* Action Row */}
            <div className="mt-[28px] flex flex-col sm:flex-row gap-[12px] w-full max-w-[440px]">
              <Link
                href="/customer/login"
                className="flex items-center justify-center gap-[12px] w-full h-[56px] rounded-xl bg-[#D84A2B] text-white text-[16px] font-bold hover:bg-[#C23E21] transition-colors"
              >
                <Car className="w-5 h-5" />
                <span>I&apos;m a Customer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-[8px] w-full h-[56px] rounded-xl border border-white/20 bg-transparent text-white text-[16px] font-semibold hover:bg-white/[0.05] transition-colors"
              >
                <ShieldCheck className="w-5 h-5 text-white/70" />
                <span>Operator Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── INFO MICRO-DETAILS ── */}
      <section className="w-full px-[20px] bg-[#050507] pt-[28px] pb-[48px]">
        <div className="max-w-[1240px] mx-auto lg:flex lg:justify-end">
          <div className="w-full lg:w-[50%] pt-[20px] border-t border-white/[0.1] flex flex-col sm:flex-row sm:items-center gap-[12px] text-[14px] text-white/50 font-medium">
            <span>Real-time Space Allocations</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/30" />
            <span>Digital Exit Passes</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/30" />
            <span>SMS Navigation</span>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section className="w-full bg-[#050507] border-t border-white/[0.08] py-[56px] lg:py-[80px] px-[20px]">
        <div className="w-full max-w-[1240px] mx-auto">
          {/* Section Header */}
          <div className="mb-[48px]">
            <div className="text-[14px] font-bold uppercase text-[#D84A2B] mb-[8px]">
              How It Works
            </div>
            <h2 className="text-[28px] sm:text-[32px] lg:text-[42px] font-black text-white leading-[1.1] max-w-[600px]">
              Frictionless parking from arrival to departure.
            </h2>
          </div>

          {/* 3 Steps List */}
          <div className="flex flex-col gap-[36px] lg:gap-[44px]">
            {/* Step 01 */}
            <div className="flex flex-col sm:flex-row sm:items-start pt-[20px] border-t border-white/15">
              <div className="flex items-center justify-between sm:w-[120px] shrink-0 mb-[16px] sm:mb-0">
                <span className="text-[44px] sm:text-[52px] font-black leading-none text-[#D84A2B]">01</span>
                <Car className="w-6 h-6 text-white/30 sm:hidden" />
              </div>
              <div className="flex-1 flex flex-col justify-center sm:pl-[24px]">
                <div className="flex items-center justify-between mb-[8px]">
                  <h3 className="text-[26px] sm:text-[30px] font-bold text-white">Drive in</h3>
                  <Car className="w-6 h-6 text-white/30 hidden sm:block" />
                </div>
                <p className="text-[16px] text-white/70 leading-[1.6] max-w-[480px]">
                  Provide your vehicle registration plate at the entry gate operator terminal upon arrival.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="flex flex-col sm:flex-row sm:items-start pt-[20px] border-t border-white/15">
              <div className="flex items-center justify-between sm:w-[120px] shrink-0 mb-[16px] sm:mb-0">
                <span className="text-[44px] sm:text-[52px] font-black leading-none text-[#D84A2B]">02</span>
                <Navigation className="w-6 h-6 text-white/30 sm:hidden" />
              </div>
              <div className="flex-1 flex flex-col justify-center sm:pl-[24px]">
                <div className="flex items-center justify-between mb-[8px]">
                  <h3 className="text-[26px] sm:text-[30px] font-bold text-white">Get your slot</h3>
                  <Navigation className="w-6 h-6 text-white/30 hidden sm:block" />
                </div>
                <p className="text-[16px] text-white/70 leading-[1.6] max-w-[480px]">
                  Receive an immediate SMS with your exact assigned slot, floor level, pillar code and walking route.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="flex flex-col sm:flex-row sm:items-start pt-[20px] border-t border-white/15">
              <div className="flex items-center justify-between sm:w-[120px] shrink-0 mb-[16px] sm:mb-0">
                <span className="text-[44px] sm:text-[52px] font-black leading-none text-[#D84A2B]">03</span>
                <QrCode className="w-6 h-6 text-white/30 sm:hidden" />
              </div>
              <div className="flex-1 flex flex-col justify-center sm:pl-[24px]">
                <div className="flex items-center justify-between mb-[8px]">
                  <h3 className="text-[26px] sm:text-[30px] font-bold text-white">Drive out</h3>
                  <QrCode className="w-6 h-6 text-white/30 hidden sm:block" />
                </div>
                <p className="text-[16px] text-white/70 leading-[1.6] max-w-[480px]">
                  Scan your cryptographic digital exit pass at the exit gate for seamless barrier clearance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-[#050507] border-t border-white/[0.1] py-[40px] px-[20px]">
        <div className="w-full max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center sm:items-end justify-between gap-[24px]">
          <ParknexLogo size="sm" variant="dark" />
          <div className="flex flex-col sm:flex-row items-center sm:items-end text-[14px] text-white/50 text-center sm:text-right gap-[8px] sm:gap-[16px]">
            <span>PARKNEX Intelligent Parking Systems</span>
            <span className="hidden sm:inline w-[4px] h-[4px] rounded-full bg-white/20 shrink-0" />
            <span>Real-time Space Management</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
