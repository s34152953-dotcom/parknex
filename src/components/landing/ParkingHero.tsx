"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Car,
  ShieldCheck,
  MapPin,
  Zap,
  CheckCircle2,
  Navigation,
  Clock,
  Building2,
} from "lucide-react";
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
  const [quickPlate, setQuickPlate] = useState("");

  useEffect(() => {
    const isSmallDevice = window.innerWidth < 768;
    const hasWebGL = checkWebGL();

    if (hasWebGL && !isSmallDevice) {
      setCanRender3D(true);
    }
  }, []);

  return (
    <section className="relative min-h-[max(calc(100dvh-72px),680px)] w-full flex flex-col justify-center py-10 lg:py-16 overflow-hidden select-none">
      {/* ── 3D WebGL Underground Garage Background ── */}
      {canRender3D && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <ParkingScene onReady={() => setIsSceneReady(true)} />
        </div>
      )}

      {/* ── Smooth Cross-Fade Loading / Fallback Layer ── */}
      <LoadingFallback isReady={canRender3D && isSceneReady} />

      {/* ── Subtle Background Gradient Overlay: Preserves High Contrast ── */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: `
            linear-gradient(
              to right,
              #FAF7F2 0%,
              rgba(250, 247, 242, 0.94) 30%,
              rgba(250, 247, 242, 0.65) 55%,
              rgba(250, 247, 242, 0.2) 85%,
              transparent 100%
            )
          `,
        }}
      />

      {/* ── HERO CONTENT CONTAINER ── */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ── Left Column: Editorial Headline & Actions (7 Cols) ── */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Editorial Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DED3C7] bg-[#FFFFFF]/90 backdrop-blur-xs text-[#241F1B] text-[12px] font-bold uppercase shadow-xs self-start mb-5">
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
            <p className="text-[16px] sm:text-[17.5px] text-[#70675F] mt-5 text-left leading-relaxed max-w-[540px]">
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

            {/* Quick Feature Stats Strip */}
            <div className="mt-8 pt-6 border-t border-[#DED3C7]/80 flex flex-wrap items-center gap-6 text-[13px] text-[#70675F]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C93B2F]" />
                <span className="font-semibold text-[#241F1B]">30-sec Entry Pass</span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#2F7D5A]" />
                <span className="font-semibold text-[#241F1B]">Turn-by-Turn Wayfinding</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D97706]" />
                <span className="font-semibold text-[#241F1B]">EV Bay Allocation</span>
              </div>
            </div>
          </div>

          {/* ── Right Column: Live Parking Terminal Card (5 Cols) ── */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-[#FFFFFF]/95 backdrop-blur-md border border-[#DED3C7] rounded-3xl p-6 sm:p-7 shadow-[0_12px_36px_rgba(70,48,35,0.09)] flex flex-col gap-5">
              
              {/* Card Header: Live Facility Status */}
              <div className="flex items-center justify-between pb-4 border-b border-[#DED3C7]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-black text-[#241F1B]">Central Mall Grand</h3>
                    <p className="text-[12px] text-[#70675F]">Underground Cellar · Levels B1 &amp; B2</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2F7D5A]/10 border border-[#2F7D5A]/30 text-[#2F7D5A] text-[11.5px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#2F7D5A] animate-pulse" />
                  <span>Live Online</span>
                </div>
              </div>

              {/* Occupancy Status Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-3 flex flex-col">
                  <span className="text-[11px] font-bold text-[#70675F] uppercase">Available</span>
                  <span className="text-[20px] font-black text-[#2F7D5A] mt-0.5">44</span>
                  <span className="text-[10.5px] text-[#70675F]">98% Capacity</span>
                </div>
                <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-3 flex flex-col">
                  <span className="text-[11px] font-bold text-[#70675F] uppercase">Floor B1</span>
                  <span className="text-[20px] font-black text-[#241F1B] mt-0.5">22</span>
                  <span className="text-[10.5px] text-[#70675F]">Near Lift A</span>
                </div>
                <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-3 flex flex-col">
                  <span className="text-[11px] font-bold text-[#70675F] uppercase">Floor B2</span>
                  <span className="text-[20px] font-black text-[#241F1B] mt-0.5">22</span>
                  <span className="text-[10.5px] text-[#70675F]">EV Fast Charge</span>
                </div>
              </div>

              {/* Quick Space Finder Interactive Form */}
              <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-[#241F1B] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C93B2F]" />
                    <span>Instant Space &amp; Pass Lookup</span>
                  </span>
                  <span className="text-[11px] text-[#70675F]">No App Download</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quickPlate}
                    onChange={(e) => setQuickPlate(e.target.value.toUpperCase())}
                    placeholder="Enter License Plate (e.g. MH02AB1234)"
                    className="flex-1 h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] font-mono text-[13.5px] font-bold uppercase focus:outline-none focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] placeholder:text-[#938980]"
                  />
                  <Link
                    href={`/customer/login${quickPlate ? `?plate=${encodeURIComponent(quickPlate)}` : ""}`}
                    className="h-11 px-4 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <span>Find</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Live Capabilities Feature List */}
              <div className="flex flex-col gap-2 text-[12.5px] text-[#70675F]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F7D5A] shrink-0" />
                  <span>Automated AI Plate Verification on Entry &amp; Exit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F7D5A] shrink-0" />
                  <span>Interactive 3D &amp; 2D Indoor Navigation to Vehicle</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F7D5A] shrink-0" />
                  <span>Single-Use QR Exit Clearance Gate Lifting</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
