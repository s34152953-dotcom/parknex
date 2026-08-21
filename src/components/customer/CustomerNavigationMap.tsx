"use client";

import React from "react";
import { Compass, Car, Navigation, MapPin } from "lucide-react";

interface CustomerNavigationMapProps {
  floor: string;
  zone: string;
  pillar: string;
  slotNumber: string;
  distanceFromEntrance: number;
  directions?: string[];
}

export default function CustomerNavigationMap({
  floor,
  zone,
  pillar,
  slotNumber,
  distanceFromEntrance,
  directions,
}: CustomerNavigationMapProps) {
  const steps = directions && directions.length > 0 ? directions : [
    `Enter through Parking Lobby on Floor ${floor}`,
    `Proceed 20m along Main Driving Lane`,
    `Turn into ${zone} towards ${pillar}`,
    `Your vehicle is parked in Slot ${slotNumber}`,
  ];

  return (
    <div className="w-full bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-6 sm:p-7 shadow-[0_8px_32px_rgba(80,50,20,0.03)] flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D9]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center text-[#D84A2B]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-[#1C1917] tracking-tight">
              Indoor Walking Route
            </h3>
            <p className="text-[12px] text-[#78716C]">From Entrance to Vehicle ({distanceFromEntrance}m)</p>
          </div>
        </div>

        <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
          ~1.5 min walk
        </span>
      </div>

      {/* Visual Graphical Waypoint Path Map */}
      <div className="relative w-full bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl p-6 overflow-hidden">
        {/* Pathway nodes */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          {/* Start Point */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#10B981] flex items-center justify-center text-[#10B981] shadow-xs mb-2">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold uppercase text-[#10B981]">Start Point</span>
            <span className="text-[13px] font-extrabold text-[#1C1917]">Lobby Entrance</span>
          </div>

          {/* Connector Line 1 */}
          <div className="hidden sm:flex flex-1 h-1 bg-gradient-to-r from-[#10B981] to-[#D84A2B] rounded-full mx-2" />

          {/* Middle Waypoint */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#D84A2B]/40 flex items-center justify-center text-[#D84A2B] shadow-xs mb-2">
              <Navigation className="w-5 h-5 text-[#D84A2B]" />
            </div>
            <span className="text-[11px] font-bold uppercase text-[#A8A29E]">Waypoint</span>
            <span className="text-[13px] font-bold text-[#1C1917]">{pillar}</span>
          </div>

          {/* Connector Line 2 */}
          <div className="hidden sm:flex flex-1 h-1 bg-[#D84A2B] rounded-full mx-2" />

          {/* Destination */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#D84A2B] text-white flex items-center justify-center shadow-md mb-2 animate-bounce-subtle">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold uppercase text-[#D84A2B]">Your Vehicle</span>
            <span className="text-[13px] font-extrabold text-[#D84A2B]">Slot {slotNumber}</span>
          </div>
        </div>
      </div>

      {/* Turn-by-turn Directions */}
      <div className="flex flex-col gap-3">
        <p className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider">
          Turn-By-Turn Navigation Directions
        </p>
        <div className="flex flex-col gap-2.5">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-[13.5px]">
              <span className="w-6 h-6 rounded-full bg-[#FFF5F2] border border-[#FADCD5] text-[#D84A2B] flex items-center justify-center text-[11.5px] font-bold shrink-0">
                {idx + 1}
              </span>
              <span className="text-[#1C1917] font-medium leading-tight pt-0.5">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
