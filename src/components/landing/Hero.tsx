"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100vh-72px)] flex items-center overflow-hidden bg-[#FBF8F3] py-12 lg:py-0">
      {/* ── Background Image Layer on Desktop / Ambient Layer on Mobile ── */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-start items-center overflow-hidden">
        <div className="relative w-full lg:w-[60%] h-full opacity-35 sm:opacity-50 lg:opacity-100">
          <Image
            src="/images/hero-car.jpg"
            alt="PARKNEX Smart Parking Management Vehicle Visual"
            fill
            priority
            className="object-cover object-center scale-x-[-1]"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />

          {/* Right Warm Ivory Gradient Blend */}
          <div className="absolute inset-y-0 right-0 w-80 sm:w-[480px] lg:w-[580px] bg-gradient-to-l from-[#FBF8F3] via-[#FBF8F3]/95 to-transparent z-10" />

          {/* Top and Bottom Gradients */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#FBF8F3] via-[#FBF8F3]/60 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FBF8F3] via-[#FBF8F3]/60 to-transparent z-10" />
        </div>
      </div>

      {/* ── Hero Main Content (Positioned on the Right Side, 2-Column Responsive) ── */}
      <div className="relative z-20 mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16 flex items-center justify-end">
        <div className="w-full max-w-[620px] bg-[#FBF8F3]/80 lg:bg-transparent backdrop-blur-xs lg:backdrop-blur-none p-6 sm:p-8 lg:p-0 rounded-3xl lg:rounded-none border border-[#EAE3D9]/60 lg:border-none shadow-xs lg:shadow-none">
          {/* Small Orange Micro-Label */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FFF5F2] border border-[#FADCD5] text-[11.5px] font-bold text-[#D84A2B] uppercase tracking-[0.12em] mb-5 shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#D84A2B] animate-pulse" />
            SMARTER PARKING. SMOOTHER JOURNEYS.
          </motion.div>

          {/* Headline: PARK SMART. DRIVE EASY. */}
          <motion.h1
            className="text-[clamp(2.6rem,5.6vw,4.8rem)] font-extrabold leading-[1.0] tracking-[-0.04em] text-[#1C1917] break-words"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease }}
          >
            <span className="block text-[#1C1917]">PARK SMART.</span>
            <span className="block text-[#D84A2B]">DRIVE EASY.</span>
          </motion.h1>

          {/* Supporting Description */}
          <motion.p
            className="mt-5 text-[15px] sm:text-[16.5px] leading-[1.6] text-[#57534E] max-w-[520px] font-normal"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22, ease }}
          >
            Real-time parking assignment with automated nearest space recommendation, SMS navigation links, 3D spatial floor guidance, and instant exit pass validation.
          </motion.p>

          {/* Interactive CTAs */}
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3.5"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3, ease }}
          >
            <Link
              href="/admin/booking"
              className="group inline-flex items-center justify-center gap-3 h-[52px] sm:h-[56px] px-7 sm:px-8 rounded-2xl bg-[#D84A2B] text-white text-[14.5px] font-bold tracking-[-0.01em] hover:bg-[#C23E21] active:scale-[0.98] transition-all duration-200 shadow-md shadow-[#D84A2B]/20 shrink-0 cursor-pointer min-w-[44px]"
            >
              <span>Open Admin Booking</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/customer/cust_token_demo_a01"
              className="group inline-flex items-center justify-center gap-2.5 h-[52px] sm:h-[56px] px-6 sm:px-7 rounded-2xl border border-[#E2D9CC] bg-white text-[#1C1917] text-[14.5px] font-semibold hover:border-[#D84A2B]/40 hover:bg-[#FFFDFC] active:scale-[0.98] transition-all duration-200 shadow-xs shrink-0 cursor-pointer min-w-[44px]"
            >
              <span>Customer Demo View</span>
              <div className="w-5 h-5 rounded-full bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-center group-hover:border-[#D84A2B]/30">
                <Play className="w-2.5 h-2.5 fill-[#1C1917] text-[#1C1917] translate-x-[0.5px]" />
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
