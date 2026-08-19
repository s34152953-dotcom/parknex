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
  Footprints,
} from "lucide-react";
import FindMyCar3DMap from "@/components/parking/FindMyCar3DMap";

export default function FindMyCarPage() {
  const [floors] = useState<string[]>(["B3", "B2", "B1", "G"]);
  const [selectedFloor, setSelectedFloor] = useState<string>("B2");
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] flex flex-col bg-[#040609] overflow-hidden">
      {/* ── Top Header matching screenshot ───────────────────────────────────── */}
      <div className="relative z-30 flex items-center justify-between px-6 py-3.5 bg-sp-surface/80 backdrop-blur-md border-b border-white/[0.04]">
        <div className="flex items-center gap-4">
          <Link
            href="/parking"
            className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-sp-secondary hover:text-white hover:border-white/20 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-[17px] font-bold text-white tracking-tight">
            Find My Car
          </h1>
        </div>

        <button
          className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-sp-secondary hover:text-white hover:border-white/20 transition-colors"
          aria-label="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* ── Main 3D Interactive Stage ────────────────────────────────────────── */}
      <div className="relative flex-1 w-full h-full">
        {/* 3D Map */}
        <FindMyCar3DMap isNavigating={isNavigating} />

        {/* ── Left Floating Route Card matching screenshot ─────────────────── */}
        <div className="absolute top-6 left-6 z-20 w-full max-w-[280px]">
          <div className="bg-sp-surface/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl">
            {/* From */}
            <div className="mb-4">
              <p className="text-[11px] text-sp-muted font-medium uppercase tracking-wider">
                From
              </p>
              <p className="text-[15px] font-bold text-white mt-0.5">
                Mall Entrance
              </p>
            </div>

            {/* To */}
            <div className="mb-5 pb-4 border-b border-white/[0.06]">
              <p className="text-[11px] text-sp-muted font-medium uppercase tracking-wider">
                To
              </p>
              <p className="text-[15px] font-bold text-sp-cyan mt-0.5">
                Pillar 18, Slot A-18
              </p>
            </div>

            {/* Distance & Walk Time Metrics */}
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-[11px] text-sp-muted font-medium">Distance</p>
                <p className="text-[16px] font-extrabold text-white mt-0.5">
                  120 m
                </p>
              </div>
              <div>
                <p className="text-[11px] text-sp-muted font-medium">Walk Time</p>
                <p className="text-[16px] font-extrabold text-white mt-0.5">
                  2 min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Vertical Floor Switcher matching screenshot ────────────── */}
        <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
          {floors.map((floor) => {
            const isActive = selectedFloor === floor;
            return (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`w-11 h-10 rounded-xl text-[13px] font-bold flex items-center justify-center transition-all duration-200 shadow-lg ${
                  isActive
                    ? "bg-sp-blue text-white shadow-sp-blue/30 border border-sp-blue/50"
                    : "bg-sp-surface/90 text-sp-secondary hover:text-white border border-white/10"
                }`}
              >
                {floor}
              </button>
            );
          })}
        </div>

        {/* ── Bottom Left Start Navigation CTA matching screenshot ─────────── */}
        <div className="absolute bottom-6 left-6 z-20">
          <button
            onClick={() => setIsNavigating(!isNavigating)}
            className={`h-[48px] px-6 rounded-2xl text-[14px] font-bold flex items-center gap-2.5 shadow-2xl transition-all duration-200 active:scale-95 ${
              isNavigating
                ? "bg-sp-green text-white shadow-sp-green/20"
                : "bg-sp-blue text-white hover:bg-sp-blue-hover shadow-sp-blue/30"
            }`}
          >
            <Navigation className="w-4 h-4 fill-white" />
            {isNavigating ? "Navigating Live..." : "Start Navigation"}
          </button>
        </div>

        {/* ── Bottom Right Recenter / Target Button ────────────────────────── */}
        <div className="absolute bottom-6 right-6 z-20">
          <button
            className="w-12 h-12 rounded-2xl bg-sp-surface/90 backdrop-blur-xl border border-white/10 flex items-center justify-center text-sp-nav hover:text-white shadow-2xl active:scale-95 transition-all"
            aria-label="Recenter Map"
          >
            <Crosshair className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
