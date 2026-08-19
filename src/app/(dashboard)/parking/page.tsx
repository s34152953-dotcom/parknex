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
} from "lucide-react";
import InteractiveParkingMap3D, {
  ParkingSlotData,
} from "@/components/parking/InteractiveParkingMap3D";
import { createClient } from "@/lib/supabase/client";

// Default parking slots layout generator for standard mall floors (e.g. B2 Zone A)
function generateFloorSlots(floorName: string = "B2"): ParkingSlotData[] {
  const slots: ParkingSlotData[] = [];
  const rows = [-12, -8, -4, 0, 4, 8, 12];

  // Left Row of Slots
  rows.forEach((z, i) => {
    const slotNum = `A-${10 + i}`;
    const status =
      i === 3
        ? "my_vehicle" // Pillar 18 / Slot A-18 is user's car
        : i % 3 === 0
        ? "available"
        : i % 4 === 0
        ? "reserved"
        : "occupied";

    slots.push({
      id: `slot-left-${i}`,
      slotNumber: `Slot ${slotNum}`,
      pillarName: `Pillar ${14 + i}`,
      zoneName: "Zone A",
      floorName,
      status,
      position: [-3.6, 0, z],
      rotationY: Math.PI / 2,
    });
  });

  // Right Row of Slots
  rows.forEach((z, i) => {
    const slotNum = `A-${20 + i}`;
    const status =
      i % 2 === 0
        ? "occupied"
        : i % 5 === 0
        ? "reserved"
        : "available";

    slots.push({
      id: `slot-right-${i}`,
      slotNumber: `Slot ${slotNum}`,
      pillarName: `Pillar ${20 + i}`,
      zoneName: "Zone A",
      floorName,
      status,
      position: [3.6, 0, z],
      rotationY: -Math.PI / 2,
    });
  });

  return slots;
}

export default function ParkingDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [floors, setFloors] = useState<string[]>(["B3", "B2", "B1", "G"]);
  const [selectedFloor, setSelectedFloor] = useState<string>("B2");
  const [is3D, setIs3D] = useState<boolean>(true);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlotData | null>(null);
  const [slots, setSlots] = useState<ParkingSlotData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load dynamic slots from database or floor generator
  useEffect(() => {
    async function loadFloorData() {
      setLoading(true);
      try {
        // Attempt query from Supabase
        const { data: dbSlots } = await supabase
          .from("parking_slots")
          .select("*, parking_zones(name), parking_pillars(name), parking_floors(name)")
          .limit(50);

        if (dbSlots && dbSlots.length > 0) {
          const mapped: ParkingSlotData[] = dbSlots.map((s: any) => ({
            id: s.id,
            slotNumber: s.slot_number,
            pillarName: s.parking_pillars?.name,
            zoneName: s.parking_zones?.name || "Zone A",
            floorName: s.parking_floors?.name || selectedFloor,
            status: s.status as any,
            position: [s.position_x || 0, s.position_y || 0, s.position_z || 0],
            rotationY: s.rotation_y || 0,
          }));
          setSlots(mapped);
        } else {
          // Standard floor geometry for B2
          setSlots(generateFloorSlots(selectedFloor));
        }
      } catch (err) {
        setSlots(generateFloorSlots(selectedFloor));
      } finally {
        setLoading(false);
      }
    }

    loadFloorData();
  }, [selectedFloor, supabase]);

  // Real availability calculations
  const stats = useMemo(() => {
    const total = slots.length;
    const available = slots.filter((s) => s.status === "available").length;
    const occupied = slots.filter((s) => s.status === "occupied" || s.status === "my_vehicle").length;
    const reserved = slots.filter((s) => s.status === "reserved").length;
    return { total, available, occupied, reserved };
  }, [slots]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#05070A] overflow-hidden">
      {/* ── Floor Switcher Header Bar ────────────────────────────────────────── */}
      <div className="relative z-30 flex items-center justify-between px-6 py-3 bg-sp-surface/60 backdrop-blur-md border-b border-white/[0.04]">
        {/* Floor Selection Tabs */}
        <div className="flex items-center gap-2">
          {floors.map((floor) => {
            const isActive = selectedFloor === floor;
            return (
              <button
                key={floor}
                onClick={() => {
                  setSelectedFloor(floor);
                  setSelectedSlot(null);
                }}
                className={`h-8 px-5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-sp-blue text-white shadow-md shadow-sp-blue/20"
                    : "text-sp-secondary hover:text-white bg-sp-elevated/40 hover:bg-sp-elevated border border-white/[0.04]"
                }`}
              >
                {floor}
              </button>
            );
          })}
        </div>

        {/* Mall & Status Summary */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-[12px] text-sp-secondary">
            Live occupancy: <strong className="text-white">{Math.round((stats.occupied / (stats.total || 1)) * 100)}%</strong>
          </span>
        </div>
      </div>

      {/* ── Main 3D Parking Stage ────────────────────────────────────────────── */}
      <div className="relative flex-1 w-full h-full">
        {/* 3D WebGL Canvas */}
        <InteractiveParkingMap3D
          slots={slots}
          selectedSlot={selectedSlot}
          onSelectSlot={(slot) => setSelectedSlot(slot)}
          is3D={is3D}
        />

        {/* ── Left Floating Info Overlay Card matching screenshot ──────────── */}
        <div className="absolute top-6 left-6 z-20 pointer-events-none">
          <div className="w-[180px] bg-sp-surface/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 shadow-2xl pointer-events-auto">
            <h2 className="text-[32px] font-extrabold text-white leading-none tracking-tight">
              {selectedFloor}
            </h2>
            <p className="text-[12px] font-medium text-sp-secondary mt-1 mb-4">
              Zone A
            </p>

            <div className="flex flex-col gap-2.5 text-[12px] border-t border-white/[0.06] pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sp-muted font-medium">Total Slots</span>
                <span className="text-white font-semibold">{stats.total || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sp-green font-medium">Available</span>
                <span className="text-sp-green font-bold">{stats.available || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sp-red font-medium">Occupied</span>
                <span className="text-sp-red font-semibold">{stats.occupied || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sp-amber font-medium">Reserved</span>
                <span className="text-sp-amber font-semibold">{stats.reserved || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Floating Map Controls matching screenshot ─────────────── */}
        <div className="absolute top-6 right-6 z-20 flex flex-col items-center gap-2">
          {/* 3D / 2D Toggle */}
          <button
            onClick={() => setIs3D(!is3D)}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center text-[12px] font-bold transition-all duration-200 shadow-lg ${
              is3D
                ? "bg-sp-blue text-white border-sp-blue/50 shadow-sp-blue/20"
                : "bg-sp-surface/90 text-sp-nav border-white/10 hover:text-white"
            }`}
            title="Toggle 3D View"
          >
            3D
          </button>

          {/* Layer Controls */}
          <button
            className="w-10 h-10 rounded-xl bg-sp-surface/90 backdrop-blur-xl border border-white/10 flex items-center justify-center text-sp-nav hover:text-white hover:border-white/20 transition-colors shadow-lg"
            title="Layer Settings"
          >
            <Layers className="w-4 h-4" strokeWidth={1.5} />
          </button>

          {/* Compass Orientation */}
          <button
            className="w-10 h-10 rounded-xl bg-sp-surface/90 backdrop-blur-xl border border-white/10 flex items-center justify-center text-sp-nav hover:text-white hover:border-white/20 transition-colors shadow-lg"
            title="Recenter"
          >
            <Compass className="w-4 h-4" strokeWidth={1.5} />
          </button>

          {/* Zoom Buttons */}
          <div className="flex flex-col rounded-xl bg-sp-surface/90 backdrop-blur-xl border border-white/10 overflow-hidden shadow-lg mt-2">
            <button
              className="w-10 h-9 flex items-center justify-center text-sp-nav hover:text-white hover:bg-white/5 transition-colors border-b border-white/[0.06]"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              className="w-10 h-9 flex items-center justify-center text-sp-nav hover:text-white hover:bg-white/5 transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Selected Slot Action Bottom Card ─────────────────────────────── */}
        {selectedSlot && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 w-full max-w-[420px] px-4">
            <div className="bg-sp-elevated/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] text-sp-muted font-medium">Selected Slot</p>
                <p className="text-[15px] font-bold text-white">
                  {selectedSlot.pillarName || "Pillar"} · {selectedSlot.slotNumber}
                </p>
                <p className="text-[11px] text-sp-secondary mt-0.5">
                  Floor {selectedSlot.floorName} · {selectedSlot.zoneName} ·{" "}
                  <span
                    className={
                      selectedSlot.status === "available"
                        ? "text-sp-green"
                        : selectedSlot.status === "my_vehicle"
                        ? "text-sp-cyan"
                        : "text-sp-red"
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
                  className="h-10 px-5 rounded-xl bg-sp-blue text-white text-[13px] font-semibold flex items-center gap-2 hover:bg-sp-blue-hover active:scale-95 transition-all shadow-md shadow-sp-blue/20 shrink-0"
                >
                  Park Here
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : selectedSlot.status === "my_vehicle" ? (
                <Link
                  href="/find-my-car"
                  className="h-10 px-5 rounded-xl bg-sp-cyan/20 border border-sp-cyan text-sp-cyan text-[13px] font-semibold flex items-center gap-2 hover:bg-sp-cyan/30 active:scale-95 transition-all shrink-0"
                >
                  Locate Car
                  <Compass className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="text-[12px] text-sp-muted italic px-3">Occupied</span>
              )}
            </div>
          </div>
        )}

        {/* ── Bottom Legend Bar matching screenshot ───────────────────────── */}
        <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-6 px-5 py-2.5 rounded-full bg-sp-surface/80 backdrop-blur-xl border border-white/[0.08] text-[12px] shadow-lg pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sp-green shadow-sm shadow-sp-green/50" />
              <span className="text-sp-nav">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sp-red shadow-sm shadow-sp-red/50" />
              <span className="text-sp-nav">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sp-amber shadow-sm shadow-sp-amber/50" />
              <span className="text-sp-nav">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sp-cyan shadow-sm shadow-sp-cyan/50" />
              <span className="text-sp-nav">My Vehicle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
