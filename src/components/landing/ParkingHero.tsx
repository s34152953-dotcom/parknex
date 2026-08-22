"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Car, ShieldCheck } from "lucide-react";
import ParkingScene from "./ParkingScene";
import LoadingFallback from "./LoadingFallback";

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
  const [isSceneReady, setIsSceneReady] = useState(false);

  useEffect(() => {
    const isSmallDevice = window.innerWidth < 768;
    const hasWebGL = checkWebGL();

    if (hasWebGL && !isSmallDevice) {
      setCanRender3D(true);
    }
  }, []);

  return (
    <section className="relative min-h-[max(calc(100dvh-72px),640px)] w-full flex flex-col justify-center py-12 lg:py-20 overflow-hidden select-none">
      {/* ── 3D WebGL Underground Garage Background ── */}
      {canRender3D && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <ParkingScene onReady={() => setIsSceneReady(true)} />
        </div>
      )}

      {/* ── Smooth Cross-Fade Loading / Fallback Layer ── */}
      <LoadingFallback isReady={canRender3D && isSceneReady} />

      {/* ── Editorial Gradient Overlay: Crisp Text on Left, 100% Crystal-Clear 3D Garage on Right ── */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: `
            linear-gradient(
              to right,
              #FAF7F2 0%,
              rgba(250, 247, 242, 0.92) 28%,
              rgba(250, 247, 242, 0.5) 46%,
              rgba(250, 247, 242, 0.05) 70%,
              transparent 100%
            )
          `,
        }}
      />

      {/* ── HERO CONTENT (Standard HTML / CSS Layer above 3D) ── */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full lg:w-[52%] flex flex-col">
          {/* Editorial Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DED3C7] bg-[#FFFFFF]/90 backdrop-blur-xs text-[#241F1B] text-[12px] font-bold uppercase shadow-xs self-start mb-5">
            <span className="w-2 h-2 rounded-full bg-[#C93B2F]" />
            <span>Smart Mall Parking Management</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-[36px] sm:text-[48px] lg:text-[56px] font-black text-[#241F1B] text-left leading-[1.05] tracking-tight drop-shadow-xs">
            Park in seconds.
            <span className="block text-[#C93B2F]">Find your car</span>
            <span className="block text-[#C93B2F]">instantly.</span>
          </h1>

          {/* Description */}
          <p className="text-[16px] sm:text-[17.5px] text-[#70675F] mt-5 text-left leading-relaxed max-w-[500px]">
            Drive in, receive your assigned parking space via SMS, and navigate back to your vehicle directly on your phone without downloading an app.
          </p>

          {/* Action Buttons Row */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3.5 w-full max-w-[440px]">
            <Link
              href="/customer/login"
              className="flex items-center justify-center gap-2.5 w-full min-h-[48px] px-6 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[15px] font-bold transition-all shadow-[0_4px_16px_rgba(201,59,47,0.25)] cursor-pointer"
            >
              <Car className="w-5 h-5" />
              <span>Customer Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 w-full min-h-[48px] px-6 rounded-xl border border-[#DED3C7] bg-[#FFFFFF]/95 hover:bg-[#F3EAE0] text-[#241F1B] text-[15px] font-bold transition-all shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-[#C93B2F]" />
              <span>Operator Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
