"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Compass,
  Plus,
  Minus,
  Maximize2,
  ChevronDown,
  Check,
  ArrowRight,
  Info,
  Car,
  Filter,
} from "lucide-react";
import InteractiveParkingMap3D, {
  ParkingSlotData,
} from "@/components/parking/InteractiveParkingMap3D";
import { createClient } from "@/lib/supabase/client";

// Rich floor slots generator with multiple aisles
function generateFloorSlots(floorName: string = "B2"): ParkingSlotData[] {
  const slots: ParkingSlotData[] = [];
  const zRows = [-14, -10, -6, -2, 2, 6, 10, 14];

  // 1. Zone A - Center Left Row (X = -3.8)
  zRows.forEach((z, i) => {
    const slotNum = `A-${10 + i}`;
    const status =
      i === 4
        ? "my_vehicle" // Pillar 18 / Slot A-14 is user's vehicle
        : i % 3 === 0
          ? "available"
          : i % 5 === 0
            ? "reserved"
            : "occupied";

    slots.push({
      id: `slot-a-left-${i}`,
      slotNumber: `Slot ${slotNum}`,
      pillarName: `Pillar ${16 + Math.floor(i / 2)}`,
      zoneName: "Zone A",
      floorName,
      status,
      position: [-3.8, 0, z],
      rotationY: Math.PI / 2,
    });
  });

  // 2. Zone A - Center Right Row (X = 3.8)
  zRows.forEach((z, i) => {
    const slotNum = `A-${20 + i}`;
    const status =
      i % 2 === 0
        ? "occupied"
        : i % 4 === 0
          ? "reserved"
          : "available";

    slots.push({
      id: `slot-a-right-${i}`,
      slotNumber: `Slot ${slotNum}`,
      pillarName: `Pillar ${20 + Math.floor(i / 2)}`,
      zoneName: "Zone A",
      floorName,
      status,
      position: [3.8, 0, z],
      rotationY: -Math.PI / 2,
    });
  });

  // 3. Zone B - Outer Left Row (X = -10.5)
  [-12, -8, -4, 0, 4, 8, 12].forEach((z, i) => {
    const slotNum = `B-${10 + i}`;
    const status = i % 3 === 1 ? "available" : "occupied";
    slots.push({
      id: `slot-b-left-${i}`,
      slotNumber: `Slot ${slotNum}`,
      pillarName: `Pillar ${12 + i}`,
      zoneName: "Zone B",
      floorName,
      status,
      position: [-10.5, 0, z],
      rotationY: Math.PI / 2,
    });
  });

  // 4. Zone C - Outer Right Row (X = 10.5)
  [-12, -8, -4, 0, 4, 8, 12].forEach((z, i) => {
    const slotNum = `C-${10 + i}`;
    const status = i % 2 === 0 ? "available" : "occupied";
    slots.push({
      id: `slot-c-right-${i}`,
      slotNumber: `Slot ${slotNum}`,
      pillarName: `Pillar ${24 + i}`,
      zoneName: "Zone C",
      floorName,
      status,
      position: [10.5, 0, z],
      rotationY: -Math.PI / 2,
    });
  });

  return slots;
}

export default function ParkingDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [floors] = useState<string[]>(["B3", "B2", "B1", "G"]);
  const [selectedFloor, setSelectedFloor] = useState<string>("B2");
  const [selectedZone, setSelectedZone] = useState<string>("All");
  const [is3D, setIs3D] = useState<boolean>(true);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlotData | null>(null);
  const [allSlots, setAllSlots] = useState<ParkingSlotData[]>([]);

  // Load floor geometry
  useEffect(() => {
    setAllSlots(generateFloorSlots(selectedFloor));
    setSelectedSlot(null);
  }, [selectedFloor]);

  // Filtered slots by Zone
  const filteredSlots = useMemo(() => {
    if (selectedZone === "All") return allSlots;
    return allSlots.filter((s) => s.zoneName === selectedZone);
  }, [allSlots, selectedZone]);

  // Real availability metrics
  const stats = useMemo(() => {
    const total = filteredSlots.length;
    const available = filteredSlots.filter((s) => s.status === "available").length;
    const occupied = filteredSlots.filter((s) => s.status === "occupied" || s.status === "my_vehicle").length;
    const reserved = filteredSlots.filter((s) => s.status === "reserved").length;
    return { total, available, occupied, reserved };
  }, [filteredSlots]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#FBF8F3] overflow-hidden">
      {/* ── Floor & Zone Switcher Header Bar ───────────────────────────────── */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-4 px-6 lg:px-8 py-3.5 bg-white/85 backdrop-blur-md border-b border-[#EAE3D9] select-none">
        {/* Floor Selection Tabs */}
        <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1.5 rounded-xl border border-[#E7DFD5]">
          {floors.map((floor) => {
            const isActive = selectedFloor === floor;
            return (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`h-8 px-4 rounded-lg text-[13px] font-semibold transition-all duration-180 cursor-pointer ${
                  isActive
                    ? "bg-[#D84A2B] text-white shadow-xs shadow-[#D84A2B]/20"
                    : "text-[#78716C] hover:text-[#1C1917] hover:bg-black/[0.03]"
                }`}
              >
                {floor}
              </button>
            );
          })}
        </div>

        {/* Zone Filters */}
        <div className="flex items-center gap-1.5">
          {["All", "Zone A", "Zone B", "Zone C"].map((zone) => {
            const isZoneActive = selectedZone === zone;
            return (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`h-8 px-4 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer ${
                  isZoneActive
                    ? "bg-[#FFF5F2] text-[#D84A2B] border border-[#FADCD5]"
                    : "text-[#78716C] hover:text-[#1C1917] hover:bg-black/[0.03] border border-transparent"
                }`}
              >
                {zone}
              </button>
            );
          })}
        </div>

        {/* Occupancy Indicator */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-[12.5px] text-[#78716C] font-medium">
            Occupancy:{" "}
            <strong className="text-[#1C1917]">
              {Math.round((stats.occupied / (stats.total || 1)) * 100)}%
            </strong>
          </span>
          <div className="w-24 h-2 rounded-full bg-[#EAE3D9] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D84A2B] to-[#F59E0B] rounded-full"
              style={{ width: `${Math.round((stats.occupied / (stats.total || 1)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main 3D Parking Stage ────────────────────────────────────────────── */}
      <div className="relative flex-1 w-full h-full">
        {/* 3D WebGL Canvas */}
        <InteractiveParkingMap3D
          slots={filteredSlots}
          selectedSlot={selectedSlot}
          onSelectSlot={(slot) => setSelectedSlot(slot)}
          is3D={is3D}
        />

        {/* ── Left Floating Floor / Zone Stat Card ─────────────────────────── */}
        <div className="absolute top-6 left-6 z-20 pointer-events-none">
          <div className="w-[230px] bg-white/95 backdrop-blur-xl border border-[rgba(80,60,40,0.08)] rounded-3xl p-5 sm:p-6 shadow-[0_10px_35px_rgba(80,50,20,0.04)] pointer-events-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-[32px] font-extrabold text-[#1C1917] leading-none tracking-tight">
                {selectedFloor}
              </h2>
              <span className="text-[11.5px] font-bold px-3 py-1 rounded-full bg-[#FFF5F2] text-[#D84A2B] border border-[#FADCD5] uppercase">
                {selectedZone}
              </span>
            </div>
            <p className="text-[12.5px] font-medium text-[#78716C] mt-2 mb-3.5">
              Central Mall Parking
            </p>

            <div className="flex flex-col gap-2.5 text-[12.5px] border-t border-[#EAE3D9] pt-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[#78716C] font-medium">Total Slots</span>
                <span className="text-[#1C1917] font-bold">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#10B981] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  Available
                </span>
                <span className="text-[#10B981] font-bold">{stats.available}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#EF4444] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  Occupied
                </span>
                <span className="text-[#EF4444] font-bold">{stats.occupied}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#F59E0B] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  Reserved
                </span>
                <span className="text-[#F59E0B] font-bold">{stats.reserved}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Floating Map Controls ──────────────────────────────────── */}
        <div className="absolute top-6 right-6 z-20 flex flex-col items-center gap-2.5">
          {/* 3D / 2D Toggle */}
          <button
            onClick={() => setIs3D(!is3D)}
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-[13px] font-bold transition-all duration-180 shadow-md cursor-pointer ${
              is3D
                ? "bg-[#D84A2B] text-white border-[#D84A2B] shadow-[#D84A2B]/20"
                : "bg-white text-[#78716C] border-[#E2D9CC] hover:text-[#1C1917]"
            }`}
            title="Toggle 3D View"
          >
            {is3D ? "3D" : "2D"}
          </button>

          {/* Recenter Compass */}
          <button
            className="w-11 h-11 rounded-2xl bg-white border border-[#E2D9CC] flex items-center justify-center text-[#78716C] hover:text-[#D84A2B] hover:border-[#D84A2B]/40 transition-all shadow-md cursor-pointer"
            title="Recenter Camera"
          >
            <Compass className="w-4.5 h-4.5" strokeWidth={1.75} />
          </button>
        </div>

        {/* ── Selected Slot Action Bottom Card ─────────────────────────────── */}
        {selectedSlot && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-[460px] px-4">
            <div className="bg-white/95 backdrop-blur-xl border border-[rgba(80,60,40,0.08)] rounded-3xl p-5 sm:p-6 shadow-[0_12px_40px_rgba(80,50,20,0.08)] flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] text-[#A8A29E] font-bold uppercase tracking-wider">Selected Slot</p>
                <p className="text-[17px] font-bold text-[#1C1917] mt-0.5">
                  {selectedSlot.pillarName || "Pillar"} · <span className="text-[#D84A2B]">{selectedSlot.slotNumber}</span>
                </p>
                <p className="text-[12.5px] text-[#78716C] mt-0.5">
                  Floor {selectedSlot.floorName} · {selectedSlot.zoneName} ·{" "}
                  <span
                    className={
                      selectedSlot.status === "available"
                        ? "text-[#10B981] font-bold"
                        : selectedSlot.status === "my_vehicle"
                          ? "text-[#D84A2B] font-bold"
                          : "text-[#EF4444] font-bold"
                    }
                  >
                    {selectedSlot.status.replace("_", " ").toUpperCase()}
                  </span>
                </p>
              </div>

              {selectedSlot.status === "available" ? (
                <Link
                  href={`/parking/confirm?slotId=${selectedSlot.id}&slotNum=${encodeURIComponent(
                    selectedSlot.slotNumber
                  )}&pillar=${encodeURIComponent(
                    selectedSlot.pillarName || "Pillar 18"
                  )}&floor=${selectedSlot.floorName}&zone=${encodeURIComponent(
                    selectedSlot.zoneName
                  )}`}
                  className="h-11 px-5 rounded-xl bg-[#D84A2B] text-white text-[13.5px] font-semibold flex items-center gap-2 hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-md shadow-[#D84A2B]/20 shrink-0 cursor-pointer"
                >
                  Park Here
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : selectedSlot.status === "my_vehicle" ? (
                <Link
                  href="/find-my-car"
                  className="h-11 px-5 rounded-xl bg-[#FFF5F2] border border-[#FADCD5] text-[#D84A2B] text-[13.5px] font-bold flex items-center gap-2 hover:bg-[#FFEAE4] active:scale-[0.98] transition-all shrink-0 cursor-pointer"
                >
                  Locate Car
                  <Compass className="w-4 h-4" />
                </Link>
              ) : (
                <span className="text-[12.5px] text-[#A8A29E] font-medium italic px-3">Slot Occupied</span>
              )}
            </div>
          </div>
        )}

        {/* ── Bottom Legend Bar ────────────────────────────────────────────── */}
        <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-5 sm:gap-6 px-6 py-3 rounded-full bg-white/95 backdrop-blur-xl border border-[rgba(80,60,40,0.08)] text-[12.5px] shadow-[0_8px_32px_rgba(80,50,20,0.05)] pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span className="text-[#57534E] font-medium">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <span className="text-[#57534E] font-medium">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="text-[#57534E] font-medium">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D84A2B]" />
              <span className="text-[#D84A2B] font-bold">My Vehicle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
