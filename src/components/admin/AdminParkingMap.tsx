"use client";

import React from "react";
import { ParkingSlot } from "@/lib/parking/nearestSlot";
import { Sparkles, Compass, Check, Lock } from "lucide-react";

interface AdminParkingMapProps {
  slots: ParkingSlot[];
  selectedSlot: ParkingSlot | null;
  nearestSlot: ParkingSlot | null;
  onSelectSlot: (slot: ParkingSlot) => void;
  currentFloor: string;
}

export default function AdminParkingMap({
  slots,
  selectedSlot,
  nearestSlot,
  onSelectSlot,
  currentFloor,
}: AdminParkingMapProps) {
  // Group slots by Zone
  const zones = Array.from(new Set(slots.map((s) => s.zone))).sort();

  return (
    <section
      aria-label={`Parking Grid Floor ${currentFloor}`}
      className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(80,50,20,0.03)] flex flex-col h-full"
    >
      {/* Map Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#EAE3D9] mb-6">
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1C1917] tracking-tight">
            Floor {currentFloor} 2D Parking Grid
          </h2>
          <p className="text-[13px] text-[#78716C] mt-0.5">
            Click any green available space or select the system-recommended nearest slot
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[12px]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            Available
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            Occupied
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D84A2B]/10 border border-[#D84A2B]/30 text-[#D84A2B] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#D84A2B]" />
            Nearest Recommended
          </div>
        </div>
      </div>

      {/* Entrance Gateway Marker */}
      <div className="w-full bg-[#FAF7F2] border border-[#EAE3D9] rounded-2xl p-3.5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#D84A2B]/10 border border-[#D84A2B]/20 flex items-center justify-center text-[#D84A2B]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#A8A29E]">Entrance Point</p>
            <p className="text-[13px] font-bold text-[#1C1917]">Main Parking Entry & Elevator Lobby ({currentFloor})</p>
          </div>
        </div>
        <span className="text-[11.5px] font-semibold px-3 py-1 rounded-full bg-white border border-[#E2D9CC] text-[#78716C]">
          Reference 0 m
        </span>
      </div>

      {/* Zone Blocks Layout */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
        {zones.map((zone) => {
          const zoneSlots = slots.filter((s) => s.zone === zone);
          return (
            <div key={zone} className="bg-[#FBF8F3] border border-[#EAE3D9] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-extrabold text-[#1C1917] tracking-tight uppercase">
                  {zone}
                </span>
                <span className="text-[11.5px] text-[#78716C]">
                  {zoneSlots.filter((s) => s.status === "available").length} / {zoneSlots.length} available
                </span>
              </div>

              {/* Slot Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
                {zoneSlots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const isNearest = nearestSlot?.id === slot.id && slot.status === "available";
                  const isAvailable = slot.status === "available";

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!isAvailable}
                      aria-disabled={!isAvailable}
                      aria-label={`${slot.slotNumber}, ${slot.pillar}, ${slot.status === "available" ? "Available" : "Occupied"}`}
                      onClick={() => onSelectSlot(slot)}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && isAvailable) {
                          e.preventDefault();
                          onSelectSlot(slot);
                        }
                      }}
                      className={`relative flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 min-h-[110px] focus-visible:ring-2 focus-visible:ring-[#D84A2B] focus-visible:outline-none ${
                        isSelected
                          ? "bg-[#FFF5F2] border-[#D84A2B] ring-2 ring-[#D84A2B] shadow-md scale-[1.02] cursor-pointer"
                          : isNearest
                          ? "bg-white border-[#D84A2B] ring-1 ring-[#D84A2B]/40 hover:bg-[#FFF5F2] shadow-md cursor-pointer animate-pulse-subtle"
                          : isAvailable
                          ? "bg-white border-[#10B981]/30 hover:border-[#10B981] hover:bg-[#10B981]/[0.03] hover:shadow-sm cursor-pointer"
                          : "bg-[#F3EFEA] border-[#E2D9CC] opacity-65 cursor-not-allowed"
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-md ${
                            isSelected
                              ? "bg-[#D84A2B] text-white"
                              : isAvailable
                              ? "bg-[#10B981]/15 text-[#10B981]"
                              : "bg-[#78716C]/20 text-[#78716C]"
                          }`}
                        >
                          {slot.slotNumber}
                        </span>

                        {isNearest && (
                          <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#D84A2B] text-white uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            NEAREST
                          </span>
                        )}
                      </div>

                      {/* Middle Status Indicator */}
                      <div className="my-2 flex items-center gap-1.5">
                        {isAvailable ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                            <span className="text-[11.5px] font-semibold text-[#10B981]">
                              Available
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-[#EF4444]" />
                            <span className="text-[11.5px] font-medium text-[#EF4444]">
                              Occupied
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Pillar & Distance */}
                      <div className="flex items-center justify-between text-[11px] text-[#78716C] border-t border-[#EAE3D9]/60 pt-1.5">
                        <span className="truncate">{slot.pillar}</span>
                        <span className="font-semibold text-[#1C1917]">{slot.distanceFromEntrance}m</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
