"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Car, ShieldCheck, Atom, Zap, CheckCircle2 } from "lucide-react";
import ParkingScene from "./ParkingScene";

/**
 * WebGL availability check
 */
function checkWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function ParkingHero() {
  const [canRender3D, setCanRender3D] = useState(false);

  useEffect(() => {
    const isSmallDevice = window.innerWidth < 768;
    const hasWebGL = checkWebGL();

    if (hasWebGL && !isSmallDevice) {
      setCanRender3D(true);
    }
  }, []);

  return (
    <section className="relative min-h-[max(calc(100dvh-72px),640px)] w-full flex flex-col justify-center py-12 lg:py-20 overflow-hidden select-none bg-[#FAF7F2]">
      {/* ── 3D WebGL Underground Garage Background ── */}
      {canRender3D && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <ParkingScene />
        </div>
      )}

      {/* ── Editorial Gradient Overlay: Crisp Text on Left, 100% Crystal-Clear 3D Garage on Right ── */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: `
            linear-gradient(
              to right,
              #FAF7F2 0%,
              rgba(250, 247, 242, 0.94) 30%,
              rgba(250, 247, 242, 0.6) 48%,
              rgba(250, 247, 242, 0.1) 70%,
              transparent 100%
            )
          `,
        }}
      />

      {/* ── HERO CONTENT (Standard HTML / CSS Layer above 3D) ── */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full lg:w-[56%] flex flex-col">
          {/* Editorial Quantum Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DED3C7] bg-[#FFFFFF]/90 backdrop-blur-xs text-[#241F1B] text-[12px] font-bold shadow-xs self-start mb-5">
            <Atom className="w-3.5 h-3.5 text-[#C93B2F] animate-spin" style={{ animationDuration: "8s" }} />
            <span className="font-mono text-[#C93B2F]">QUANTUM EXPO 2026</span>
            <span className="text-[#DED3C7]">·</span>
            <span className="text-[#70675F]">QUBO Mobility OS</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-[36px] sm:text-[48px] lg:text-[54px] font-black text-[#241F1B] text-left leading-[1.05] tracking-tight drop-shadow-xs">
            Zero-congestion parking.
            <span className="block text-[#C93B2F]">Quantum-annealed</span>
            <span className="block text-[#C93B2F]">for mega expos.</span>
          </h1>

          {/* Description */}
          <p className="text-[16px] sm:text-[17px] text-[#70675F] mt-5 text-left leading-relaxed max-w-[520px]">
            Powered by Simulated Quantum Annealing (QUBO/QAOA). Globally optimizes vehicle routing, EV charging transformer loads, and VIP arrivals with zero corridor gridlock.
          </p>

          {/* Action Buttons Row */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3.5 w-full max-w-[480px]">
            <Link
              href="/admin/quantum"
              className="flex items-center justify-center gap-2.5 min-h-[48px] px-6 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[15px] font-bold transition-all shadow-[0_4px_16px_rgba(201,59,47,0.25)] cursor-pointer"
            >
              <Atom className="w-5 h-5 animate-spin" style={{ animationDuration: "10s" }} />
              <span>Quantum Annealer Lab</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/customer/login"
              className="flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-xl border border-[#DED3C7] bg-[#FFFFFF]/95 hover:bg-[#F3EAE0] text-[#241F1B] text-[15px] font-bold transition-all shadow-xs cursor-pointer"
            >
              <Car className="w-4.5 h-4.5 text-[#C93B2F]" />
              <span>Customer Pass</span>
            </Link>

            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-1.5 min-h-[48px] px-4 rounded-xl border border-[#DED3C7] bg-[#FFFFFF]/95 hover:bg-[#F3EAE0] text-[#70675F] hover:text-[#241F1B] text-[14px] font-bold transition-all shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#70675F]" />
              <span>Operator</span>
            </Link>
          </div>

          {/* Quantum Advantage Highlights */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-[12px] font-medium text-[#70675F]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2F7D5A]" />
              <span>-100% Lane Bottlenecks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C93B2F]" />
              <span>-38% Walking Distance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#B7791F]" />
              <span>Balanced 22kW EV Grid</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
