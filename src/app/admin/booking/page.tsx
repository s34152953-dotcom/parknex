"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
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
  Navigation,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import AdminFloorPlan2D, { ParkingSlot2D } from "@/components/admin/AdminFloorPlan2D";
import { getTop3Recommendations, SlotRecommendationInput } from "@/lib/parking/recommendation";

const InteractiveParkingMap3D = dynamic(
  () => import("@/components/parking/InteractiveParkingMap3D"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[540px] sm:min-h-[580px] lg:min-h-[660px] bg-[#FAF7F2] rounded-2xl border border-[#DED3C7] flex flex-col items-center justify-center p-6 text-center animate-pulse">
        <Loader2 className="w-8 h-8 text-[#C93B2F] animate-spin mb-2" />
        <p className="text-[14px] font-bold text-[#241F1B]">Loading Interactive Map...</p>
        <p className="text-[12px] text-[#70675F] mt-1">Initializing 3D spatial coordinates and floor layout</p>
      </div>
    ),
  }
);

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto flex flex-col gap-6 select-none text-[#241F1B]">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DED3C7]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C93B2F] bg-[#F9E3DE] px-2 py-0.5 rounded border border-[#C93B2F]/20">
              FACILITY OVERVIEW
            </span>
            <span className="text-[12px] text-[#70675F]">· Central Mall Grand</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#241F1B] tracking-tight">
            Live Parking Map
          </h1>
          <p className="text-[13.5px] text-[#70675F] mt-0.5">
            Real-time space occupancy, automated recommendations, and operator controls.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Floor Selector */}
          <div className="flex items-center bg-[#F3EAE0] border border-[#DED3C7] p-1 rounded-xl">
            {["B2", "B1", "G", "ALL"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFloor(f)}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-bold transition-all cursor-pointer ${
                  selectedFloor === f
                    ? "bg-[#C93B2F] text-white shadow-xs"
                    : "text-[#70675F] hover:text-[#241F1B]"
                }`}
              >
                {f === "ALL" ? "All Floors" : `Level ${f}`}
              </button>
            ))}
          </div>

          {/* Zone Selector */}
          <div className="flex items-center bg-[#F3EAE0] border border-[#DED3C7] p-1 rounded-xl">
            {["ALL", "Zone A", "Zone B"].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setSelectedZone(z)}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-bold transition-all cursor-pointer ${
                  selectedZone === z
                    ? "bg-[#C93B2F] text-white shadow-xs"
                    : "text-[#70675F] hover:text-[#241F1B]"
                }`}
              >
                {z === "ALL" ? "All Zones" : z}
              </button>
            ))}
          </div>

          {/* 2D / 3D View Switcher */}
          <div className="flex items-center bg-[#F3EAE0] border border-[#DED3C7] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("2d")}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-bold transition-all cursor-pointer ${
                viewMode === "2d"
                  ? "bg-[#C93B2F] text-white shadow-xs"
                  : "text-[#70675F] hover:text-[#241F1B]"
              }`}
            >
              Floor Plan
            </button>
            <button
              type="button"
              onClick={() => setViewMode("3d")}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-bold transition-all cursor-pointer ${
                viewMode === "3d"
                  ? "bg-[#C93B2F] text-white shadow-xs"
                  : "text-[#70675F] hover:text-[#241F1B]"
              }`}
            >
              Interactive View
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="h-[38px] px-3 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] hover:bg-[#F3EAE0] text-[#241F1B] text-[12.5px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Refresh Occupancy Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C93B2F] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top 3 Recommended Spaces Banner */}
      <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#3569A8]" />
            <h3 className="text-[14px] font-bold text-[#241F1B]">
              Recommended Spaces
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#3569A8]/10 text-[#3569A8] border border-[#3569A8]/20">
              Ranked
            </span>
          </div>
          <span className="text-[11.5px] text-[#70675F]">
            Optimal walking distance to main lobby
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topRecommendations.map((rec) => (
            <div
              key={rec.slot.slotId}
              onClick={() => setSelectedSlot(rec.slot as ParkingSlot2D)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedSlot?.slotId === rec.slot.slotId
                  ? "bg-[#F9E3DE] border-[#C93B2F] ring-2 ring-[#C93B2F]/20"
                  : "bg-[#FAF7F2] border-[#DED3C7] hover:bg-[#F3EAE0]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#3569A8] text-white text-[11px] font-black flex items-center justify-center">
                  #{rec.rank}
                </span>
                <div>
                  <div className="font-mono font-black text-[15px] text-[#241F1B]">
                    Space {rec.slot.slotNumber}
                  </div>
                  <div className="text-[11px] text-[#70675F]">
                    Level {rec.slot.floor} · {rec.slot.pillar}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-[#3569A8] bg-[#3569A8]/10 px-2 py-0.5 rounded border border-[#3569A8]/20">
                  {rec.score}/100 Match
                </span>
                <span className="block text-[10.5px] text-[#70675F] mt-0.5">
                  {rec.slot.distanceFromEntrance}m walk
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Floor Plan Grid Layout (Responsive: Map + 360px Details Panel) */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
        {/* Left Column: Interactive Map Canvas */}
        <div className="w-full flex flex-col gap-4">
          {viewMode === "2d" ? (
            <AdminFloorPlan2D
              slots={rawSlots as ParkingSlot2D[]}
              selectedSlotId={selectedSlot?.slotId || null}
              recommendedSlotIds={recommendedSlotIds}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
              floor={selectedFloor}
              zoneFilter={selectedZone}
            />
          ) : (
            <div className="w-full min-h-[540px] sm:min-h-[580px] lg:min-h-[660px] rounded-2xl border border-[#DED3C7] bg-[#FFFFFF] overflow-hidden shadow-[0_8px_24px_rgba(70,48,35,0.07)]">
              <InteractiveParkingMap3D
                slots={rawSlots as any}
                selectedSlot={selectedSlot as any}
                nearestSlot={topRecommendations[0]?.slot as any}
                recommendedSlotIds={recommendedSlotIds}
                onSelectSlot={(slot) => setSelectedSlot(slot as any)}
                currentFloor={selectedFloor}
                onFallbackTo2D={() => setViewMode("2d")}
              />
            </div>
          )}
        </div>

        {/* Right Column: Space Inspector & Direct Allocation Panel (360px on Desktop) */}
        <div className="w-full flex flex-col gap-4">
          {selectedSlot ? (
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.07)]">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#DED3C7]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C93B2F]" />
                  <h3 className="text-[15px] font-bold text-[#241F1B]">Space Inspector</h3>
                </div>
                <span
                  className={`text-[10.5px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    selectedSlot.status === "available"
                      ? "bg-[#2F7D5A]/10 text-[#2F7D5A] border-[#2F7D5A]/30"
                      : selectedSlot.status === "occupied"
                      ? "bg-[#C93B2F]/10 text-[#C93B2F] border-[#C93B2F]/30"
                      : selectedSlot.status === "reserved"
                      ? "bg-[#B7791F]/10 text-[#B7791F] border-[#B7791F]/30"
                      : "bg-[#70675F]/10 text-[#70675F] border-[#70675F]/30"
                  }`}
                >
                  {selectedSlot.status}
                </span>
              </div>

              {/* Slot Number Main Block */}
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DED3C7] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#70675F] uppercase">Space Identifier</span>
                  <div className="text-[26px] font-mono font-black text-[#241F1B] leading-none mt-1">
                    {selectedSlot.slotNumber}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#70675F] uppercase">Floor &amp; Pillar</span>
                  <div className="text-[14px] font-bold text-[#241F1B] mt-1">
                    Level {selectedSlot.floor} · {selectedSlot.pillar}
                  </div>
                </div>
              </div>

              {/* Recommendation Analysis */}
              {selectedRecommendation && (
                <div className="bg-[#3569A8]/10 border border-[#3569A8]/30 p-3 rounded-xl flex flex-col gap-1 text-[12px]">
                  <div className="flex items-center justify-between text-[#3569A8] font-bold">
                    <span>Rank #{selectedRecommendation.rank} Space</span>
                    <span>{selectedRecommendation.score}/100 Match</span>
                  </div>
                  <p className="text-[#241F1B] leading-relaxed text-[11.5px]">
                    {selectedRecommendation.reason}
                  </p>
                </div>
              )}

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                  <span className="text-[#70675F] block text-[10.5px]">Zone</span>
                  <span className="font-semibold text-[#241F1B]">{selectedSlot.zone}</span>
                </div>
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                  <span className="text-[#70675F] block text-[10.5px]">Distance from Gate A</span>
                  <span className="font-semibold text-[#241F1B]">{selectedSlot.distanceFromEntrance} meters</span>
                </div>
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                  <span className="text-[#70675F] block text-[10.5px]">EV Charger</span>
                  <span className="font-semibold text-[#241F1B]">
                    {selectedSlot.vehicleConstraints?.isEV ? "Available" : "Standard Bay"}
                  </span>
                </div>
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                  <span className="text-[#70675F] block text-[10.5px]">Accessibility</span>
                  <span className="font-semibold text-[#241F1B]">
                    {selectedSlot.vehicleConstraints?.isHandicapped ? "Near Lift Lobby" : "Standard"}
                  </span>
                </div>
              </div>

              {/* Quick Action Controls */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#DED3C7]">
                {selectedSlot.status === "available" && (
                  <Link
                    href={`/admin/new-entry?slotId=${selectedSlot.slotId}`}
                    className="w-full h-11 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <CarFront className="w-4 h-4" />
                    <span>Assign Vehicle to Space {selectedSlot.slotNumber}</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(true)}
                  className="w-full h-10 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] hover:bg-[#F3EAE0] text-[#241F1B] text-[12.5px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5 text-[#70675F]" />
                  <span>Update Space Status</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 shadow-[0_8px_24px_rgba(70,48,35,0.06)] min-h-[320px]">
              <div className="w-12 h-12 rounded-2xl bg-[#F3EAE0] flex items-center justify-center text-[#70675F]">
                <Navigation className="w-6 h-6 text-[#C93B2F]" />
              </div>
              <h4 className="text-[16px] font-bold text-[#241F1B]">No Space Selected</h4>
              <p className="text-[12.5px] text-[#70675F] max-w-[220px]">
                Click on any parking bay in the floor plan to inspect details or assign a vehicle.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Status Override Modal */}
      {overrideModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-[18px] font-bold text-[#241F1B]">
              Update Status: Space {selectedSlot.slotNumber}
            </h3>

            <form onSubmit={handleStatusOverride} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#241F1B] uppercase mb-1">
                  New Status
                </label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value as any)}
                  className="w-full bg-[#FFFFFF] border border-[#DED3C7] rounded-xl px-3 py-2.5 text-[13.5px] text-[#241F1B] focus:outline-none focus:border-[#C93B2F]"
                >
                  <option value="available">Available (Green)</option>
                  <option value="maintenance">Maintenance / Out of Order (Grey)</option>
                  <option value="occupied">Manual Occupied (Red)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#241F1B] uppercase mb-1">
                  Reason / Notes
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g., Space blocked for maintenance"
                  rows={2}
                  className="w-full bg-[#FFFFFF] border border-[#DED3C7] rounded-xl p-3 text-[13px] text-[#241F1B] focus:outline-none focus:border-[#C93B2F] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] text-[#241F1B] text-[13px] font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[13px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
