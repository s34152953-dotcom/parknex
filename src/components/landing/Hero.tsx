"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  return (
    <section className="relative w-full h-screen min-h-[680px] flex items-center overflow-hidden bg-[#FBF8F3]">
      {/* ── High-End Luxury Car Background Image on the Left Side ── */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-start items-center overflow-hidden">
        <div className="relative w-full lg:w-[65%] h-full">
          <Image
            src="/images/hero-car.jpg"
            alt="PARKNEX Luxury Automotive Experience"
            fill
            priority
            className="object-cover object-center scale-x-[-1]"
            sizes="(max-width: 1024px) 100vw, 65vw"
          />

          {/* Right Warm Ivory Gradient Blend */}
          <div className="absolute inset-y-0 right-0 w-80 sm:w-[480px] lg:w-[600px] bg-gradient-to-l from-[#FBF8F3] via-[#FBF8F3]/95 to-transparent z-10" />

          {/* Top subtle navbar shadow fade */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#FBF8F3] via-[#FBF8F3]/50 to-transparent z-10" />

          {/* Bottom subtle floor blend */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FBF8F3] via-[#FBF8F3]/40 to-transparent z-10" />
        </div>
      </div>

      {/* ── Hero Main Content (Positioned on the Right Middle Side) ── */}
      <div className="relative z-20 mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16 pt-[72px] pb-6 flex items-center justify-end">
        <div className="w-full max-w-[580px]">
          {/* Small Orange Micro-Label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FFF5F2] border border-[#FADCD5] text-[11.5px] font-bold text-[#D84A2B] uppercase tracking-[0.12em] mb-6 shadow-xs backdrop-blur-xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#D84A2B] animate-pulse" />
            SMARTER PARKING. SMOOTHER JOURNEYS.
          </motion.div>

          {/* Headline: PARK SMART. DRIVE EASY. */}
          <motion.h1
            className="text-[clamp(3.3rem,6.8vw,5.6rem)] font-bold leading-[0.95] tracking-[-0.045em] text-[#1C1917]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2, ease }}
          >
            <span className="block text-[#1C1917]">PARK SMART.</span>
            <motion.span
              className="block text-[#D84A2B]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.32, ease }}
            >
              DRIVE EASY.
            </motion.span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            className="mt-6 text-[15.5px] sm:text-[16.5px] leading-[1.65] text-[#57534E] max-w-[500px] font-normal tracking-[-0.01em]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.45, ease }}
          >
            A smarter way to locate, register and retrieve your vehicle inside crowded mall parking areas with real-time 3D spatial guidance and frictionless checkout.
          </motion.p>

          {/* Sized-up CTAs */}
          <motion.div
            className="mt-9 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.58, ease }}
          >
            <Link
              href="/admin/booking"
              className="group inline-flex items-center justify-center gap-3 h-[54px] sm:h-[56px] px-8 sm:px-9 rounded-2xl bg-[#D84A2B] text-white text-[15px] font-semibold tracking-[-0.01em] hover:bg-[#C23E21] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#D84A2B]/25 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <span>Open Admin Booking</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/customer/cust_token_demo_a01"
              className="group inline-flex items-center justify-center gap-3 h-[54px] sm:h-[56px] px-7 sm:px-8 rounded-2xl border border-[#E2D9CC] bg-white text-[#1C1917] text-[15px] font-semibold hover:border-[#D84A2B]/40 hover:bg-[#FFFDFC] active:scale-[0.98] transition-all duration-200 shadow-xs shrink-0 whitespace-nowrap cursor-pointer"
            >
              <span>Customer Demo Portal</span>
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
