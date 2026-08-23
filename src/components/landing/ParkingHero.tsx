"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Car, ShieldCheck, Zap, QrCode, CheckCircle2, Navigation } from "lucide-react";
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
    const hasWebGL = checkWebGL();
    if (hasWebGL) {
      setCanRender3D(true);
    }
  }, []);

  return (
    <section className="relative min-h-[max(calc(100dvh-72px),680px)] w-full flex flex-col justify-center py-12 lg:py-20 overflow-hidden select-none bg-[#FAF7F2]">
      {/* ── 3D WebGL Underground Garage Background (Full Bleed) ── */}
      {canRender3D && (
        <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
          <ParkingScene />
        </div>
      )}

      {/* ── Seamless Multi-Directional Gradient Overlay: Fills all top, bottom, and right edge corners seamlessly ── */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none w-full h-full"
        style={{
          background: `
            linear-gradient(
              to right,
              #FAF7F2 0%,
              rgba(250, 247, 242, 0.96) 32%,
              rgba(250, 247, 242, 0.75) 50%,
              rgba(250, 247, 242, 0.25) 75%,
              rgba(250, 247, 242, 0.05) 100%
            ),
            linear-gradient(
              to bottom,
              #FAF7F2 0%,
              transparent 12%,
              transparent 88%,
              #FAF7F2 100%
            )
          `,
        }}
      />

      {/* ── HERO CONTENT (Standard HTML / CSS Layer above 3D) ── */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero Typography & CTA (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Editorial Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DED3C7] bg-[#FFFFFF]/90 backdrop-blur-md text-[#241F1B] text-[12px] font-bold uppercase shadow-xs self-start mb-5">
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
            <p className="text-[16px] sm:text-[17.5px] text-[#70675F] mt-5 text-left leading-relaxed max-w-[520px]">
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

          {/* Right Column: Live Parking Telemetry Card (Fills Right Side & Edge Corners Seamlessly) (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-[#FFFFFF]/90 backdrop-blur-md border border-[#DED3C7] rounded-2xl p-6 shadow-[0_12px_32px_rgba(70,48,35,0.08)] flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#DED3C7]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[14.5px] font-bold text-[#241F1B]">Smart Arrival Allocation</h3>
                    <span className="text-[11px] text-[#70675F]">Live Facility Gate Terminal</span>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2F7D5A]/10 text-[#2F7D5A] border border-[#2F7D5A]/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D5A] animate-pulse" />
                  Live Active
                </span>
              </div>

              {/* Sample Assigned Space Preview */}
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DED3C7] flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#70675F] block">
                    Assigned Space
                  </span>
                  <span className="text-[22px] font-black text-[#241F1B] font-mono tracking-tight">
                    Bay B-14
                  </span>
                  <span className="text-[11.5px] text-[#70675F] block mt-0.5">
                    Basement 1 · Pillar C4 (Near Lifts)
                  </span>
                </div>

                <div className="w-12 h-12 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] flex items-center justify-center text-[#C93B2F] shadow-xs">
                  <QrCode className="w-6 h-6" />
                </div>
              </div>

              {/* Live Feature Badges Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-[12px] font-bold">
                <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#DED3C7] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F7D5A] shrink-0" />
                  <span className="text-[#241F1B]">SMS Pass Direct</span>
                </div>
                <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#DED3C7] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#3569A8] shrink-0" />
                  <span className="text-[#241F1B]">EV Fast Bays</span>
                </div>
              </div>

              <p className="text-[11.5px] text-[#70675F] text-center pt-1 border-t border-[#DED3C7]">
                Arrival-triggered allocation · Zero pre-booking congestion
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
