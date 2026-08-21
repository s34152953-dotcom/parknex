"use client";

import Link from "next/link";
import { ArrowRight, Car, ShieldCheck, Navigation, QrCode, Sparkles } from "lucide-react";
import ParknexLogo from "@/components/ui/ParknexLogo";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050507] text-[#F5F7FA] overflow-x-hidden selection:bg-[#D84A2B]/20 selection:text-[#D84A2B]">
      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050507]/60 backdrop-blur-md border-b border-white/[0.08] transition-all">
        <div className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="group flex items-center transition-transform hover:opacity-90">
            <ParknexLogo size="md" variant="dark" />
          </Link>

          <Link
            href="/auth/login"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13.5px] font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.08] transition-all active:scale-[0.98]"
          >
            <ShieldCheck className="w-4 h-4 text-[#D84A2B]" />
            <span>Operator Sign In</span>
          </Link>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[92vh] lg:min-h-screen flex items-center pt-24 pb-16 lg:pt-20 lg:pb-0">
        {/* Background Car Image + Editorial Gradient Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-no-repeat bg-[center_top] sm:bg-[left_25%_center] lg:bg-[left_15%_center]"
          style={{
            backgroundImage: `
              linear-gradient(
                90deg,
                rgba(5, 5, 7, 0.15) 0%,
                rgba(5, 5, 7, 0.35) 38%,
                rgba(5, 5, 7, 0.88) 68%,
                rgba(5, 5, 7, 0.98) 100%
              ),
              url("/images/hero-car.jpg")
            `,
          }}
        >
          {/* Mobile vertical gradient overlay to guarantee text readability */}
          <div className="block lg:hidden absolute inset-0 bg-gradient-to-b from-[#050507]/30 via-[#050507]/75 to-[#050507]" />
        </div>

        {/* Ambient Subtle Red Light Accent */}
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] rounded-full bg-[#D84A2B]/10 blur-[130px] pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative z-10 w-full max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 flex justify-end">
          {/* Asymmetric Right-Aligned Column (46% - 50% width on Desktop) */}
          <div className="w-full lg:w-[50%] xl:w-[48%] flex flex-col items-start text-left">
            {/* Editorial Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-white/80 text-[12px] font-semibold tracking-wider uppercase mb-7 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#D84A2B] animate-pulse" />
              <span>Smart Mall Parking</span>
            </div>

            {/* Main Headline */}
            <h1
              className="text-white font-black tracking-[-0.035em] text-left"
              style={{
                fontSize: "clamp(42px, 5.2vw, 76px)",
                lineHeight: "0.96",
              }}
            >
              Park in seconds.
              <span className="block text-[#D84A2B] mt-1 sm:mt-2">
                Find your car instantly.
              </span>
            </h1>

            {/* Description (45–75 chars per line for optimal readability) */}
            <p className="mt-7 text-[16px] sm:text-[17px] text-white/60 leading-[1.65] max-w-[540px]">
              Drive in, receive your assigned parking space via SMS, and navigate back to your vehicle on your phone without downloading an app.
            </p>

            {/* Action Row */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Link
                href="/customer/login"
                className="group flex items-center justify-center gap-3 h-13 sm:h-14 px-7 rounded-2xl bg-[#D84A2B] text-white text-[15px] font-bold hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-lg shadow-[#D84A2B]/25"
              >
                <Car className="w-5 h-5" />
                <span>I&apos;m a Customer</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2.5 h-13 sm:h-14 px-6 rounded-2xl border border-white/15 bg-white/[0.04] text-white/85 text-[15px] font-semibold hover:bg-white/[0.09] hover:border-white/25 active:scale-[0.98] transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-white/60" />
                <span>Operator Portal</span>
              </Link>
            </div>

            {/* Micro Details */}
            <div className="mt-10 pt-6 border-t border-white/[0.08] w-full max-w-[540px] flex items-center justify-between text-[12.5px] text-white/40 font-medium">
              <span>Real-time Space Allocations</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>Digital Exit Passes</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>SMS Navigation</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section className="relative z-10 bg-[#050507] border-t border-white/[0.06] py-24 lg:py-32">
        <div className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 lg:mb-20">
            <div className="max-w-[560px]">
              <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#D84A2B] mb-3">
                How It Works
              </div>
              <h2 className="text-[32px] sm:text-[40px] lg:text-[46px] font-black tracking-[-0.03em] text-white leading-tight">
                Frictionless parking from arrival to departure.
              </h2>
            </div>
            <p className="text-[14.5px] text-white/50 max-w-[360px] leading-relaxed">
              Designed for busy shopping malls, airports and commercial centers with zero hardware friction for drivers.
            </p>
          </div>

          {/* 3 Steps Grid with Clean Dividers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 01 */}
            <div className="flex flex-col pt-6 border-t border-white/10 relative">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-[44px] font-black tracking-tight text-[#D84A2B]">01</span>
                <Car className="w-5 h-5 text-white/30" />
              </div>
              <h3 className="text-[20px] font-bold text-white mb-2 tracking-tight">Drive in</h3>
              <p className="text-[14px] text-white/50 leading-relaxed">
                Provide your vehicle registration plate at the entry gate operator terminal upon arrival.
              </p>
            </div>

            {/* Step 02 */}
            <div className="flex flex-col pt-6 border-t border-white/10 relative">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-[44px] font-black tracking-tight text-[#D84A2B]">02</span>
                <Navigation className="w-5 h-5 text-white/30" />
              </div>
              <h3 className="text-[20px] font-bold text-white mb-2 tracking-tight">Get your slot</h3>
              <p className="text-[14px] text-white/50 leading-relaxed">
                Receive an immediate SMS with your exact assigned slot, floor level, pillar code and walking route.
              </p>
            </div>

            {/* Step 03 */}
            <div className="flex flex-col pt-6 border-t border-white/10 relative">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-[44px] font-black tracking-tight text-[#D84A2B]">03</span>
                <QrCode className="w-5 h-5 text-white/30" />
              </div>
              <h3 className="text-[20px] font-bold text-white mb-2 tracking-tight">Drive out</h3>
              <p className="text-[14px] text-white/50 leading-relaxed">
                Scan your cryptographic digital exit pass at the exit gate for seamless barrier clearance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.08] bg-[#050507] py-12">
        <div className="w-full max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <ParknexLogo size="sm" variant="dark" />
          <div className="text-[13px] text-white/40 text-center sm:text-right">
            <span>PARKNEX Intelligent Parking Systems</span>
            <span className="mx-2.5">·</span>
            <span>Real-time Space Management</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
