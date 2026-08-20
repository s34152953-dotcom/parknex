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
    <div className="relative w-full h-[calc(100vh-68px)] flex flex-col bg-[#FBF8F3] overflow-hidden">
      {/* ── Top Header Bar ─────────────────────────────────────────────────── */}
      <div className="relative z-30 flex items-center justify-between px-6 lg:px-8 py-3.5 bg-white/85 backdrop-blur-md border-b border-[#EAE3D9] select-none">
        <div className="flex items-center gap-4">
          <Link
            href="/parking"
            className="w-10 h-10 rounded-lg border border-[#E2D9CC] bg-white flex items-center justify-center text-[#78716C] hover:text-[#D84A2B] hover:border-[#D84A2B]/40 transition-colors shadow-xs"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-[18px] font-bold text-[#1C1917] tracking-tight leading-tight">
              Indoor Vehicle Wayfinding
            </h1>
            <p className="text-[12px] text-[#78716C]">Floor B2 · Zone A · Pillar 18</p>
          </div>
        </div>

        {/* Remote Vehicle Triggers */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleHonk}
            className={`h-10 px-4 rounded-lg border text-[13px] font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-xs ${
              hornHonked
                ? "bg-[#10B981] text-white border-[#10B981]"
                : "bg-white text-[#1C1917] border-[#E2D9CC] hover:border-[#D84A2B]/40 hover:text-[#D84A2B]"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            {hornHonked ? "Honking Horn..." : "Honk Horn"}
          </button>
          <button
            onClick={handleFlash}
            className={`h-10 px-4 rounded-lg border text-[13px] font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-xs ${
              lightsFlashed
                ? "bg-[#F59E0B] text-white border-[#F59E0B]"
                : "bg-white text-[#1C1917] border-[#E2D9CC] hover:border-[#D84A2B]/40 hover:text-[#D84A2B]"
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            {lightsFlashed ? "Flashing Lights..." : "Flash Lights"}
          </button>
        </div>
      </div>

      {/* ── Main 3D Interactive Stage ────────────────────────────────────────── */}
      <div className="relative flex-1 w-full h-full">
        {/* 3D Map */}
        <FindMyCar3DMap isNavigating={isNavigating} />

        {/* ── Left Floating Route Card ─────────────────────────────────────── */}
        <div className="absolute top-6 left-6 z-20 w-full max-w-[310px] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xl border border-[rgba(80,60,40,0.10)] rounded-2xl p-5 shadow-[0_6px_24px_rgba(80,50,20,0.04)] pointer-events-auto">
            {/* From */}
            <div className="mb-4">
              <p className="text-[11px] text-[#A8A29E] font-bold uppercase tracking-wider">
                START POINT
              </p>
              <p className="text-[14.5px] font-bold text-[#1C1917] mt-0.5 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                Mall Entrance Lobby
              </p>
            </div>

            {/* To */}
            <div className="mb-4 pb-3.5 border-b border-[#EAE3D9]">
              <p className="text-[11px] text-[#A8A29E] font-bold uppercase tracking-wider">
                DESTINATION
              </p>
              <p className="text-[14.5px] font-bold text-[#D84A2B] mt-0.5 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D84A2B] animate-pulse" />
                Pillar 18, Slot A-14
              </p>
            </div>

            {/* Turn by turn directions */}
            <div className="flex flex-col gap-2 mb-4 text-[12.5px] text-[#57534E]">
              <div className="flex items-start gap-2">
                <span className="text-[#1C1917] font-bold">1.</span>
                <span>Take Elevator to Level B2</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#1C1917] font-bold">2.</span>
                <span>Walk 40m along Main Driving Lane</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#1C1917] font-bold">3.</span>
                <span>Turn Left into Lane A (Slot on right)</span>
              </div>
            </div>

            {/* Distance & Walk Time Metrics */}
            <div className="grid grid-cols-2 gap-3 text-left border-t border-[#EAE3D9] pt-3">
              <div>
                <p className="text-[11px] text-[#A8A29E] font-bold uppercase">Distance</p>
                <p className="text-[16px] font-extrabold text-[#1C1917] mt-0.5">
                  120 meters
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#A8A29E] font-bold uppercase">Walk Time</p>
                <p className="text-[16px] font-extrabold text-[#10B981] mt-0.5">
                  ~1.5 min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Vertical Floor Switcher ────────────────────────────────── */}
        <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
          {floors.map((floor) => {
            const isActive = selectedFloor === floor;
            return (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`w-10 h-10 rounded-xl text-[12.5px] font-bold inline-flex items-center justify-center transition-all duration-180 shadow-md ${
                  isActive
                    ? "bg-[#D84A2B] text-white shadow-[#D84A2B]/20 border border-[#D84A2B]"
                    : "bg-white text-[#78716C] hover:text-[#1C1917] border border-[#E2D9CC]"
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
            className={`h-[48px] px-6 rounded-lg text-[14px] font-semibold flex items-center gap-2.5 shadow-lg transition-all duration-180 active:scale-95 ${
              isNavigating
                ? "bg-[#10B981] text-white shadow-[#10B981]/20"
                : "bg-[#D84A2B] text-white hover:bg-[#C23E21] shadow-[#D84A2B]/20"
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
