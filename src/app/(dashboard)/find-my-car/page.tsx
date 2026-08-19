"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Share2,
  Navigation,
  Crosshair,
  MapPin,
  Clock,
  Volume2,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import FindMyCar3DMap from "@/components/parking/FindMyCar3DMap";

export default function FindMyCarPage() {
  const [floors] = useState<string[]>(["B3", "B2", "B1", "G"]);
  const [selectedFloor, setSelectedFloor] = useState<string>("B2");
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [hornHonked, setHornHonked] = useState<boolean>(false);
  const [lightsFlashed, setLightsFlashed] = useState<boolean>(false);

  const handleHonk = () => {
    setHornHonked(true);
    setTimeout(() => setHornHonked(false), 2500);
  };

  const handleFlash = () => {
    setLightsFlashed(true);
    setTimeout(() => setLightsFlashed(false), 2500);
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] flex flex-col bg-[#040608] overflow-hidden">
      {/* ── Top Header Bar ─────────────────────────────────────────────────── */}
      <div className="relative z-30 flex items-center justify-between px-6 py-3.5 bg-[#05070A]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="flex items-center gap-4">
          <Link
            href="/parking"
            className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-white/20 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-[17px] font-bold text-white tracking-tight leading-tight">
              Indoor Vehicle Wayfinding
            </h1>
            <p className="text-[11px] text-white/50">Floor B2 · Zone A · Pillar 18</p>
          </div>
        </div>

        {/* Remote Vehicle Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleHonk}
            className={`h-9 px-3.5 rounded-xl border text-[12px] font-semibold flex items-center gap-1.5 transition-all shadow-md ${
              hornHonked
                ? "bg-emerald-500 text-white border-emerald-400"
                : "bg-white/[0.04] text-white/80 border-white/10 hover:border-white/25 hover:bg-white/[0.08]"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            {hornHonked ? "Honking Horn..." : "Honk Horn"}
          </button>
          <button
            onClick={handleFlash}
            className={`h-9 px-3.5 rounded-xl border text-[12px] font-semibold flex items-center gap-1.5 transition-all shadow-md ${
              lightsFlashed
                ? "bg-amber-500 text-white border-amber-400"
                : "bg-white/[0.04] text-white/80 border-white/10 hover:border-white/25 hover:bg-white/[0.08]"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {lightsFlashed ? "Flashing Lights..." : "Flash Lights"}
          </button>
        </div>
      </div>

      {/* ── Main 3D Interactive Stage ────────────────────────────────────────── */}
      <div className="relative flex-1 w-full h-full">
        {/* 3D Map */}
        <FindMyCar3DMap isNavigating={isNavigating} />

        {/* ── Left Floating Route Card ─────────────────────────────────────── */}
        <div className="absolute top-5 left-5 z-20 w-full max-w-[280px]">
          <div className="bg-[#080C14]/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl">
            {/* From */}
            <div className="mb-4">
              <p className="text-[10.5px] text-white/50 font-semibold uppercase tracking-wider">
                Start Point
              </p>
              <p className="text-[14.5px] font-bold text-white mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Mall Entrance Lobby
              </p>
            </div>

            {/* To */}
            <div className="mb-5 pb-4 border-b border-white/[0.06]">
              <p className="text-[10.5px] text-white/50 font-semibold uppercase tracking-wider">
                Vehicle Destination
              </p>
              <p className="text-[14.5px] font-bold text-cyan-300 mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Pillar 18, Slot A-18
              </p>
            </div>

            {/* Turn by turn directions */}
            <div className="flex flex-col gap-2 mb-4 text-[11.5px] text-white/70">
              <div className="flex items-start gap-2">
                <span className="text-white font-bold">1.</span>
                <span>Take Elevator to Level B2</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-white font-bold">2.</span>
                <span>Walk 40m along Main Driving Lane</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-white font-bold">3.</span>
                <span>Turn Left into Lane A (Slot on right)</span>
              </div>
            </div>

            {/* Distance & Walk Time Metrics */}
            <div className="grid grid-cols-2 gap-3 text-left border-t border-white/[0.06] pt-3">
              <div>
                <p className="text-[10.5px] text-white/50 font-medium">Distance</p>
                <p className="text-[15px] font-extrabold text-white mt-0.5">
                  120 meters
                </p>
              </div>
              <div>
                <p className="text-[10.5px] text-white/50 font-medium">Walk Time</p>
                <p className="text-[15px] font-extrabold text-emerald-400 mt-0.5">
                  ~1.5 min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Vertical Floor Switcher ────────────────────────────────── */}
        <div className="absolute top-5 right-5 z-20 flex flex-col gap-2">
          {floors.map((floor) => {
            const isActive = selectedFloor === floor;
            return (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`w-11 h-10 rounded-xl text-[12.5px] font-bold flex items-center justify-center transition-all duration-200 shadow-xl ${
                  isActive
                    ? "bg-white text-[#040608] shadow-white/10 border border-white"
                    : "bg-[#080C14]/90 text-white/60 hover:text-white border border-white/10"
                }`}
              >
                {floor}
              </button>
            );
          })}
        </div>

        {/* ── Bottom Left Start Navigation CTA ─────────────────────────────── */}
        <div className="absolute bottom-6 left-6 z-20">
          <button
            onClick={() => setIsNavigating(!isNavigating)}
            className={`h-[48px] px-6 rounded-2xl text-[13.5px] font-bold flex items-center gap-2.5 shadow-2xl transition-all duration-200 active:scale-95 ${
              isNavigating
                ? "bg-emerald-500 text-white shadow-emerald-500/20"
                : "bg-white text-[#040608] hover:bg-white/90 shadow-white/10"
            }`}
          >
            <Navigation className="w-4 h-4" />
            {isNavigating ? "Live Navigation Active" : "Start Walking Navigation"}
          </button>
        </div>
      </div>
    </div>
  );
}
