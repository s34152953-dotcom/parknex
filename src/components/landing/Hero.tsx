"use client";

import { motion } from "motion/react";
import { ArrowRight, Play, Clock, CheckSquare, Compass, Gift } from "lucide-react";
import Link from "next/link";
import CinematicGarageCanvas from "./CinematicGarageCanvas";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100vh-76px)] flex flex-col justify-between overflow-hidden bg-[#040608]">
      {/* ── Cinematic Parking Garage Canvas Background ── */}
      <CinematicGarageCanvas />

      {/* ── Hero Main Content ───────────────────────── */}
      <div className="relative z-20 flex-1 flex flex-col justify-center mx-auto w-full max-w-[1440px] px-6 sm:px-10 md:px-16 lg:px-20 pt-28 sm:pt-32 pb-8">
        <div className="max-w-[620px]">
          {/* Sub-badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11.5px] font-semibold text-white/70 uppercase tracking-[0.08em] mb-6 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Next-Gen Mall Parking Intelligence
          </motion.div>

          {/* Headline (strictly 2 clean bold lines) */}
          <motion.h1
            className="text-[36px] sm:text-[46px] md:text-[54px] lg:text-[62px] font-extrabold leading-[1.08] tracking-[-0.035em] text-white font-[family-name:var(--font-manrope)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2, ease }}
          >
            <span className="block whitespace-nowrap">Smart Parking.</span>
            <motion.span
              className="block whitespace-nowrap bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.32, ease }}
            >
              Without the Guesswork.
            </motion.span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            className="mt-5 sm:mt-6 text-[14.5px] sm:text-[15.5px] leading-[1.65] text-[#94A3B8] max-w-[460px] font-normal tracking-[-0.01em]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.45, ease }}
          >
            A smarter way to locate, register and retrieve your vehicle inside crowded mall parking areas with real-time 3D spatial guidance.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-8 sm:mt-9 flex flex-wrap items-center gap-3.5"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.58, ease }}
          >
            <Link
              href="/parking"
              className="group inline-flex items-center gap-2.5 h-[48px] px-6 rounded-full bg-white text-[#040608] text-[13.5px] font-bold tracking-[-0.01em] hover:bg-white/90 active:scale-[0.98] transition-all duration-200 shadow-xl shadow-white/10"
            >
              Find Parking
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="#how-it-works"
              className="group inline-flex items-center gap-2.5 h-[48px] px-6 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-white text-[13.5px] font-semibold hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98] transition-all duration-200"
            >
              See How It Works
              <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center">
                <Play className="w-2 h-2 fill-white text-white translate-x-[0.5px]" />
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Feature Strip ──────────────────────────────── */}
      <FeatureStrip />
    </section>
  );
}

/* ── Feature Strip Component ────────────────────────────── */

const features = [
  {
    icon: Clock,
    title: "Real-time Availability",
    desc: "Live parking status & slot metrics",
  },
  {
    icon: CheckSquare,
    title: "Easy Registration",
    desc: "Scan plate or enter in seconds",
  },
  {
    icon: Compass,
    title: "Find Your Car",
    desc: "Turn-by-turn indoor route navigation",
  },
  {
    icon: Gift,
    title: "Rewards & Offers",
    desc: "Redeem mall vouchers while you park",
  },
];

function FeatureStrip() {
  return (
    <motion.div
      className="relative z-20 mx-auto w-full max-w-[1440px] px-6 sm:px-10 md:px-16 lg:px-20 pb-7 pt-2"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.7, ease }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-5 border-t border-white/[0.06]">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] backdrop-blur-md hover:bg-white/[0.04] hover:border-white/[0.08] transition-colors"
          >
            <div className="w-10 h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-white shrink-0 shadow-inner">
              <f.icon className="w-4 h-4 text-sky-400" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white leading-tight">{f.title}</p>
              <p className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
