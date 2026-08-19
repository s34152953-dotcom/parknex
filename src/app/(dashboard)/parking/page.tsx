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
    <div className="relative w-full h-full flex flex-col bg-[#040608] overflow-hidden">
      {/* ── Floor & Zone Switcher Header Bar ───────────────────────────────── */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-4 px-6 lg:px-8 py-3 bg-[#05070A]/85 backdrop-blur-xl border-b border-white/[0.04] select-none">
        {/* Floor Selection Tabs */}
        <div className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
          {floors.map((floor) => {
            const isActive = selectedFloor === floor;
            return (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`h-7 px-4 rounded-lg text-[12.5px] font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-white text-[#040608] shadow-md shadow-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
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
                className={`h-7 px-3.5 rounded-lg text-[11.5px] font-medium transition-colors ${
                  isZoneActive
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-white/50 hover:text-white hover:bg-white/[0.02] border border-transparent"
                }`}
              >
                {zone}
              </button>
            );
          })}
        </div>

        {/* Occupancy Indicator */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-[12px] text-white/60">
            Occupancy:{" "}
            <strong className="text-white">
              {Math.round((stats.occupied / (stats.total || 1)) * 100)}%
            </strong>
          </span>
          <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full"
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
        <div className="absolute top-8 left-8 z-20 pointer-events-none">
          <div className="w-[195px] bg-[#080C14]/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-4 shadow-2xl pointer-events-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-[28px] font-extrabold text-white leading-none tracking-tight">
                {selectedFloor}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.06] text-white/80 uppercase">
                {selectedZone}
              </span>
            </div>
            <p className="text-[11px] font-medium text-white/50 mt-1 mb-3">
              Central Mall Parking
            </p>

            <div className="flex flex-col gap-2 text-[12px] border-t border-white/[0.06] pt-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50 font-medium">Total Slots</span>
                <span className="text-white font-bold">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Available
                </span>
                <span className="text-emerald-400 font-bold">{stats.available}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Occupied
                </span>
                <span className="text-rose-400 font-bold">{stats.occupied}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Reserved
                </span>
                <span className="text-amber-400 font-bold">{stats.reserved}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Floating Map Controls ──────────────────────────────────── */}
        <div className="absolute top-8 right-8 z-20 flex flex-col items-center gap-2">
          {/* 3D / 2D Toggle */}
          <button
            onClick={() => setIs3D(!is3D)}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center text-[12px] font-bold transition-all duration-200 shadow-xl ${
              is3D
                ? "bg-white text-[#040608] border-white shadow-white/10"
                : "bg-[#080C14]/90 text-white/70 border-white/10 hover:text-white"
            }`}
            title="Toggle 3D View"
          >
            {is3D ? "3D" : "2D"}
          </button>

          {/* Recenter Compass */}
          <button
            className="w-10 h-10 rounded-xl bg-[#080C14]/90 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-white/20 transition-colors shadow-xl"
            title="Recenter Camera"
          >
            <Compass className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* ── Selected Slot Action Bottom Card ─────────────────────────────── */}
        {selectedSlot && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-[420px] px-4">
            <div className="bg-[#080C14]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] text-white/50 font-medium">Selected Slot</p>
                <p className="text-[15px] font-bold text-white">
                  {selectedSlot.pillarName || "Pillar"} · {selectedSlot.slotNumber}
                </p>
                <p className="text-[11px] text-white/60 mt-0.5">
                  Floor {selectedSlot.floorName} · {selectedSlot.zoneName} ·{" "}
                  <span
                    className={
                      selectedSlot.status === "available"
                        ? "text-emerald-400 font-semibold"
                        : selectedSlot.status === "my_vehicle"
                        ? "text-cyan-400 font-semibold"
                        : "text-rose-400 font-semibold"
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
                  className="h-10 px-5 rounded-xl bg-white text-[#040608] text-[13px] font-bold flex items-center gap-2 hover:bg-white/90 active:scale-95 transition-all shadow-md shadow-white/10 shrink-0"
                >
                  Park Here
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : selectedSlot.status === "my_vehicle" ? (
                <Link
                  href="/find-my-car"
                  className="h-10 px-5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[13px] font-semibold flex items-center gap-2 hover:bg-cyan-500/30 active:scale-95 transition-all shrink-0"
                >
                  Locate Car
                  <Compass className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="text-[12px] text-white/40 italic px-3">Slot Occupied</span>
              )}
            </div>
          </div>
        )}

        {/* ── Bottom Legend Bar ────────────────────────────────────────────── */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-5 sm:gap-6 px-5 py-2.5 rounded-full bg-[#080C14]/85 backdrop-blur-xl border border-white/[0.08] text-[12px] shadow-2xl pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span className="text-white/80 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
              <span className="text-white/80 font-medium">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
              <span className="text-white/80 font-medium">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
              <span className="text-cyan-300 font-semibold">My Vehicle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
