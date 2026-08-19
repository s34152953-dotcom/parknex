"use client";

import { motion } from "motion/react";
import { ArrowRight, Play, Clock, CheckSquare, Compass, Gift } from "lucide-react";
import Link from "next/link";
import CinematicGarageCanvas from "./CinematicGarageCanvas";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100vh-76px)] flex flex-col justify-between overflow-hidden bg-sp-black">
      {/* ── Cinematic Parking Garage Canvas Background ── */}
      <CinematicGarageCanvas />

      {/* ── Hero Main Content ───────────────────────── */}
      <div className="relative z-20 flex-1 flex flex-col justify-center mx-auto w-full max-w-[1440px] px-6 sm:px-10 md:px-16 lg:px-20 pt-32 pb-8">
        <div className="max-w-[580px]">
          {/* Headline (strictly 2 lines) */}
          <motion.h1
            className="text-[34px] sm:text-[44px] md:text-[52px] lg:text-[58px] font-bold leading-[1.12] tracking-[-0.03em] text-sp-white font-[family-name:var(--font-manrope)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2, ease }}
          >
            <span className="block whitespace-nowrap">Smart Parking.</span>
            <motion.span
              className="block whitespace-nowrap"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.35, ease }}
            >
              Without the Guesswork.
            </motion.span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            className="mt-5 text-[14.5px] sm:text-[15.5px] leading-[1.65] text-sp-secondary max-w-[430px] font-normal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.5, ease }}
          >
            A smarter way to locate, register and retrieve your vehicle inside crowded mall parking areas.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3.5"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.65, ease }}
          >
            <Link
              href="/parking"
              className="group inline-flex items-center gap-2.5 h-[46px] px-6 rounded-full bg-sp-cta text-sp-cta-text text-[13.5px] font-semibold tracking-[-0.01em] hover:bg-white/90 active:scale-[0.98] transition-all duration-200 shadow-md shadow-white/5"
            >
              Find Parking
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="#how-it-works"
              className="group inline-flex items-center gap-2.5 h-[46px] px-6 rounded-full border border-white/10 bg-sp-elevated/50 backdrop-blur-md text-sp-white text-[13.5px] font-medium hover:border-white/20 hover:bg-sp-elevated/80 active:scale-[0.98] transition-all duration-200"
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
    desc: "Live parking status",
  },
  {
    icon: CheckSquare,
    title: "Easy Registration",
    desc: "Register in seconds",
  },
  {
    icon: Compass,
    title: "Find Your Car",
    desc: "Navigate back easily",
  },
  {
    icon: Gift,
    title: "Rewards & Offers",
    desc: "Earn while you park",
  },
];

function FeatureStrip() {
  return (
    <motion.div
      className="relative z-20 mx-auto w-full max-w-[1440px] px-6 sm:px-10 md:px-16 lg:px-20 pb-6 pt-2"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.8, ease }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-5 border-t border-white/[0.05]">
        {features.map((f) => (
          <div key={f.title} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-white/[0.08] bg-sp-surface/70 backdrop-blur-sm flex items-center justify-center text-sp-secondary shrink-0">
              <f.icon className="w-4 h-4 text-sp-nav" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-sp-white leading-tight">{f.title}</p>
              <p className="text-[11px] text-sp-muted leading-tight mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
