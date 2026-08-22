"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import {
  Layers,
  MapPin,
  CarFront,
  CheckCircle2,
  RefreshCw,
  Wrench,
  Eye,
  SlidersHorizontal,
  Navigation,
  Compass,
} from "lucide-react";
import AdminFloorPlan2D, { ParkingSlot2D } from "@/components/admin/AdminFloorPlan2D";
import InteractiveParkingMap3D from "@/components/parking/InteractiveParkingMap3D";
import { getTop3Recommendations, SlotRecommendationInput } from "@/lib/parking/recommendation";

export default function AdminLiveParkingMapPage() {
  const [selectedFloor, setSelectedFloor] = useState<string>("B2");
  const [selectedZone, setSelectedZone] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot2D | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState<"available" | "maintenance" | "occupied">("maintenance");
  const [overrideReason, setOverrideReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch slots from Convex
  const slotsData = useQuery(api.slots.getSlots, {
    floor: selectedFloor === "ALL" ? undefined : selectedFloor,
  });
  const rawSlots = slotsData?.slots || [];

  // Mutations
  const updateStatusMutation = useMutation(api.slots.updateSlotStatus);

  // Map slots to Recommendation input
  const recommendationInputs: SlotRecommendationInput[] = useMemo(() => {
    return rawSlots.map((s) => ({
      slotId: s.slotId,
      slotNumber: s.slotNumber,
      floor: s.floor,
      zone: s.zone,
      pillar: s.pillar,
      status: s.status as any,
      distanceFromEntrance: s.distanceFromEntrance,
      positionX: s.positionX,
      positionZ: s.positionZ,
      vehicleConstraints: s.vehicleConstraints,
    }));
  }, [rawSlots]);

  // Calculate top 3 recommendations
  const topRecommendations = useMemo(() => {
    return getTop3Recommendations(recommendationInputs);
  }, [recommendationInputs]);

  const recommendedSlotIds = useMemo(() => {
    return topRecommendations.map((r) => r.slot.slotId);
  }, [topRecommendations]);

  const selectedRecommendation = useMemo(() => {
    if (!selectedSlot) return null;
    return topRecommendations.find((r) => r.slot.slotId === selectedSlot.slotId);
  }, [selectedSlot, topRecommendations]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleStatusOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setIsUpdating(true);
    try {
      await updateStatusMutation({
        slotId: selectedSlot.slotId,
        status: overrideStatus,
        operatorEmail: "operator:desk01",
        reason: overrideReason || "Manual status change from Live Parking Map",
      });
      setOverrideModalOpen(false);
      setOverrideReason("");
      setSelectedSlot((prev) => (prev ? { ...prev, status: overrideStatus } : null));
    } catch (err: any) {
      alert("Failed to update space status: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto flex flex-col gap-6 select-none text-[#F5F7FA]">
      {/* ── MAP HEADER CONTROLS ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-black text-white tracking-tight">
            Live Parking Map
          </h1>
          <p className="text-[13px] text-[rgba(245,247,250,0.6)] mt-0.5">
            Real-time space occupancy and bay management.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Floor Selector */}
          <div className="flex items-center bg-[#10151D] border border-white/[0.08] p-1 rounded-xl">
            {["B2", "B1", "G", "ALL"].map((fl) => (
              <button
                key={fl}
                onClick={() => {
                  setSelectedFloor(fl);
                  setSelectedSlot(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                  selectedFloor === fl
                    ? "bg-[#D84A2B] text-white shadow-xs"
                    : "text-[rgba(245,247,250,0.6)] hover:text-white"
                }`}
              >
                {fl === "ALL" ? "All Floors" : `Level ${fl}`}
              </button>
            ))}
          </div>

          {/* Zone Selector */}
          <div className="flex items-center bg-[#10151D] border border-white/[0.08] p-1 rounded-xl">
            {[
              { id: "ALL", label: "All Zones" },
              { id: "Zone A", label: "Zone A" },
              { id: "Zone B", label: "Zone B" },
            ].map((z) => (
              <button
                key={z.id}
                onClick={() => setSelectedZone(z.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                  selectedZone === z.id
                    ? "bg-white/[0.12] text-white"
                    : "text-[rgba(245,247,250,0.6)] hover:text-white"
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>

          {/* Floor Plan (2D) / Interactive View (3D) Toggle */}
          <div className="flex items-center bg-[#10151D] border border-white/[0.08] p-1 rounded-xl">
            <button
              onClick={() => setViewMode("2d")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "2d"
                  ? "bg-white/[0.14] text-white"
                  : "text-[rgba(245,247,250,0.6)] hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Floor Plan</span>
            </button>
            <button
              onClick={() => setViewMode("3d")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "3d"
                  ? "bg-white/[0.14] text-white"
                  : "text-[rgba(245,247,250,0.6)] hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Interactive View</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-[#10151D] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          {/* New Entry Button */}
          <Link
            href="/admin/new-entry"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#D84A2B] hover:bg-[#C64024] text-white font-bold text-[12.5px] shadow-[0_2px_12px_rgba(216,74,43,0.3)] transition-all cursor-pointer"
          >
            <CarFront className="w-4 h-4" />
            <span>New Entry</span>
          </Link>
        </div>
      </div>

      {/* ── TOP RECOMMENDED SPACES ── */}
      {topRecommendations.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-white/60">
              Recommended Spaces
            </span>
            <span className="text-[11.5px] text-white/40">
              Ranked by entry proximity and lift walking distance
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topRecommendations.map((rec) => (
              <button
                key={rec.slot.slotId}
                onClick={() => setSelectedSlot(rec.slot as any)}
                className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedSlot?.slotId === rec.slot.slotId
                    ? "bg-[#151B24] border-[#2563EB] ring-2 ring-[#2563EB]/40 shadow-lg"
                    : "bg-[#10151D] border-white/[0.08] hover:border-white/20 hover:bg-[#151B24]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[11px] font-black flex items-center justify-center">
                      #{rec.rank}
                    </span>
                    <span className="font-mono font-extrabold text-[15px] text-white">
                      Space {rec.slot.slotNumber}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#60A5FA] bg-[#2563EB]/15 px-2.5 py-0.5 rounded-full border border-[#2563EB]/30">
                    {rec.score}/100 Match
                  </span>
                </div>

                <p className="text-[11.5px] text-white/70 line-clamp-1 mt-2">
                  {rec.reason}
                </p>

                <div className="flex items-center justify-between text-[11px] text-white/50 mt-2.5 pt-2 border-t border-white/[0.04]">
                  <span>Level {rec.slot.floor} · {rec.slot.pillar}</span>
                  <span className="text-[#3B82F6] font-semibold">Select Space →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── DESKTOP GRID: LARGE MAP ON LEFT + DETAILS PANEL ON RIGHT ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        {/* Left: Large Live Parking Map */}
        <div className="w-full">
          {viewMode === "2d" ? (
            <AdminFloorPlan2D
              slots={rawSlots as any}
              selectedSlotId={selectedSlot?.slotId || null}
              recommendedSlotIds={recommendedSlotIds}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
              floor={selectedFloor}
              zoneFilter={selectedZone}
            />
          ) : (
            <div className="w-full min-h-[380px] sm:min-h-[500px] lg:min-h-[650px] rounded-3xl border border-white/10 bg-[#10151D] overflow-hidden shadow-xl shadow-black/20">
              <InteractiveParkingMap3D
                slots={rawSlots.map((s) => ({
                  id: s.slotId,
                  slotId: s.slotId,
                  mallId: s.mallId || "central_mall",
                  mallName: s.mallName || "Central Mall Grand",
                  slotNumber: s.slotNumber,
                  floor: s.floor,
                  zone: s.zone,
                  pillar: s.pillar,
                  status: s.status as any,
                  positionX: s.positionX,
                  positionY: s.positionY,
                  positionZ: s.positionZ,
                  rotationY: s.rotationY || 0,
                  distanceFromEntrance: s.distanceFromEntrance,
                  walkingDirections: s.walkingDirections || [],
                }))}
                selectedSlot={selectedSlot ? ({ id: selectedSlot.slotId, ...selectedSlot } as any) : null}
                nearestSlot={topRecommendations[0] ? ({ id: topRecommendations[0].slot.slotId, ...topRecommendations[0].slot } as any) : null}
                recommendedSlotIds={recommendedSlotIds}
                onSelectSlot={(slot: any) => setSelectedSlot(slot)}
                currentFloor={selectedFloor}
                onFallbackTo2D={() => setViewMode("2d")}
              />
            </div>
          )}
        </div>

        {/* Right: Space Details & Assignment Panel (360px) */}
        <div className="bg-[#10151D] border border-white/[0.08] rounded-3xl p-5 flex flex-col gap-4 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h2 className="text-[14px] font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D84A2B]" />
              <span>Space Details</span>
            </h2>
            {selectedSlot && (
              <span className="text-[11px] font-mono text-white/50">
                {selectedSlot.slotId}
              </span>
            )}
          </div>

          {selectedSlot ? (
            <div className="flex flex-col gap-3.5">
              {/* Space Header Card */}
              <div className="bg-[#0A0D14] border border-white/[0.08] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10.5px] font-bold text-white/50 uppercase tracking-wider block">
                    Space Number
                  </span>
                  <span className="text-[22px] font-mono font-black text-white">
                    {selectedSlot.slotNumber}
                  </span>
                  <span className="text-[11.5px] text-white/60 block mt-0.5">
                    Level {selectedSlot.floor} · {selectedSlot.zone}
                  </span>
                </div>

                {/* Status Badge */}
                <div>
                  {selectedSlot.status === "available" && (
                    <span className="px-3 py-1.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-[11px] font-extrabold">
                      AVAILABLE
                    </span>
                  )}
                  {selectedSlot.status === "occupied" && (
                    <span className="px-3 py-1.5 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-[11px] font-extrabold">
                      OCCUPIED
                    </span>
                  )}
                  {(selectedSlot.status === "reserved" || selectedSlot.status === "temporarily_held") && (
                    <span className="px-3 py-1.5 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] text-[11px] font-extrabold">
                      RESERVED
                    </span>
                  )}
                  {selectedSlot.status === "maintenance" && (
                    <span className="px-3 py-1.5 rounded-full bg-[#6B7280]/20 border border-[#6B7280]/40 text-[#9CA3AF] text-[11px] font-extrabold">
                      MAINTENANCE
                    </span>
                  )}
                </div>
              </div>

              {/* Recommendation Card */}
              {selectedRecommendation && (
                <div className="bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-xl p-3 text-[12px]">
                  <div className="flex items-center gap-1.5 text-[#60A5FA] font-bold mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Match Score: {selectedRecommendation.score}/100</span>
                  </div>
                  <p className="text-white/80 leading-relaxed">
                    {selectedRecommendation.reason}
                  </p>
                </div>
              )}

              {/* Specs Cards */}
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="bg-[#151B24] p-3 rounded-xl border border-white/[0.06]">
                  <span className="text-white/50 block text-[10.5px]">Pillar</span>
                  <span className="font-semibold text-white">{selectedSlot.pillar}</span>
                </div>
                <div className="bg-[#151B24] p-3 rounded-xl border border-white/[0.06]">
                  <span className="text-white/50 block text-[10.5px]">Shortest Route</span>
                  <span className="font-semibold text-white">~{selectedSlot.distanceFromEntrance}m from Gate A</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2">
                {selectedSlot.status === "available" && (
                  <Link
                    href={`/admin/new-entry?slotId=${selectedSlot.slotId}`}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-[#D84A2B] hover:bg-[#C64024] text-white font-bold text-[13.5px] shadow-[0_2px_12px_rgba(216,74,43,0.3)] transition-all cursor-pointer"
                  >
                    <CarFront className="w-4 h-4" />
                    <span>Assign Space {selectedSlot.slotNumber}</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setOverrideStatus(selectedSlot.status === "maintenance" ? "available" : "maintenance");
                    setOverrideModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white font-semibold text-[12px] transition-all cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5 text-white/60" />
                  <span>
                    {selectedSlot.status === "maintenance" ? "Restore to Available" : "Set to Maintenance"}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-white/40">
              <MapPin className="w-9 h-9 text-white/20 mb-2" />
              <p className="text-[13.5px] font-semibold text-white/80">No Space Selected</p>
              <p className="text-[11.5px] text-white/50 max-w-[200px] mt-1">
                Click any bay on the floor plan to view details and assign.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── STATUS OVERRIDE MODAL ── */}
      {overrideModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#10151D] border border-white/[0.15] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-[17px] font-bold text-white mb-1.5">
              Change Status for Space {selectedSlot.slotNumber}
            </h3>
            <p className="text-[12.5px] text-white/60 mb-4">
              Status changes are recorded in the operator audit log.
            </p>

            <form onSubmit={handleStatusOverride} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-bold text-white/80 mb-1.5">
                  Target Status
                </label>
                <select
                  value={overrideStatus}
                  onChange={(e: any) => setOverrideStatus(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#D84A2B]"
                >
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-white/80 mb-1.5">
                  Reason for Status Change
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g., Space maintenance, Reserved allocation, Sensor check"
                  required
                  rows={3}
                  className="w-full bg-[#0A0D14] border border-white/[0.12] rounded-xl p-3 text-[13px] text-white focus:outline-none focus:border-[#D84A2B] placeholder:text-white/30 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] text-white text-[12.5px] font-semibold hover:bg-white/[0.1] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl bg-[#D84A2B] text-white text-[12.5px] font-bold hover:bg-[#C64024] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? "Applying..." : "Confirm Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
