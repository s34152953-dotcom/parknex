"use client";

import React from "react";
import { Compass, Car, Navigation, MapPin, ArrowRight } from "lucide-react";

interface CustomerFloorPlan2DProps {
  floor: string;
  zone: string;
  pillar: string;
  slotNumber: string;
  distanceFromEntrance: number;
}

export default function CustomerFloorPlan2D({
  floor,
  zone,
  pillar,
  slotNumber,
  distanceFromEntrance,
}: CustomerFloorPlan2DProps) {
  return (
    <div className="w-full bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-6 sm:p-7 shadow-[0_8px_32px_rgba(80,50,20,0.03)] flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D9]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center text-[#D84A2B]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-[#1C1917] tracking-tight">
              Indoor Floor Guidance Map
            </h3>
            <p className="text-[12px] text-[#78716C]">
              Floor {floor} · {zone} · {pillar}
            </p>
          </div>
        </div>

        <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
          {distanceFromEntrance}m walking route
        </span>
      </div>

      {/* 2D Floor Visual Diagram */}
      <div className="relative w-full bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl p-5 sm:p-6 overflow-hidden">
        {/* Floor Schematic Diagram */}
        <div className="flex flex-col gap-6 relative z-10">
          {/* Top Corridor: Entrance Lobby */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#E2D9CC] shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#10B981]">Start</span>
                <p className="text-[13px] font-bold text-[#1C1917]">Elevator Lobby & Entrance Gate ({floor})</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#78716C] font-semibold">0 m</span>
          </div>

          {/* Dotted Walking Path Visual */}
          <div className="flex items-center justify-center relative py-1">
            <div className="w-full h-0.5 border-t-2 border-dashed border-[#D84A2B]/60" />
            <div className="absolute px-3 py-1 rounded-full bg-[#FFF5F2] border border-[#FADCD5] text-[#D84A2B] text-[11px] font-bold flex items-center gap-1">
              <Navigation className="w-3 h-3 text-[#D84A2B]" />
              <span>Follow Floor Markings</span>
            </div>
          </div>

          {/* Destination Bay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Waypoint Pillar */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E2D9CC] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-center font-bold text-[12px] text-[#1C1917]">
                P
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#A8A29E]">Reference Pillar</span>
                <p className="text-[13.5px] font-extrabold text-[#1C1917]">{pillar}</p>
              </div>
            </div>

            {/* Destination Slot */}
            <div className="bg-[#FFF5F2] p-3.5 rounded-xl border border-[#FADCD5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#D84A2B] text-white flex items-center justify-center shadow-xs">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#D84A2B]">Your Vehicle</span>
                  <p className="text-[14px] font-extrabold text-[#1C1917]">Slot {slotNumber}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#D84A2B] bg-white px-2 py-0.5 rounded-md border border-[#FADCD5]">
                HERE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
