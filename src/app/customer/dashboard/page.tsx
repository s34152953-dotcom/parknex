"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import dynamic from "next/dynamic";
import { QRCodeSVG } from "qrcode.react";
import {
  MapPin,
  ScanLine,
  History as HistoryIcon,
  ShieldCheck,
  Car,
  Clock,
  LogOut,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Compass,
  Building2,
  Navigation,
  HelpCircle,
  Loader2,
  Plus,
  ChevronLeft,
  KeyRound,
} from "lucide-react";
import ParknexLogo from "@/components/ui/ParknexLogo";
import QrCameraScanner from "@/components/customer/QrCameraScanner";
import CustomerAssistanceModal from "@/components/customer/CustomerAssistanceModal";
import CustomerFloorPlan2D from "@/components/customer/CustomerFloorPlan2D";
import {
  LANDMARKS,
  calculateDijkstraRoute,
} from "@/lib/parking/pathfinding";

// Dynamic Three.js WebGL 3D Map with fallback loading state
const FindMyCar3DMap = dynamic(
  () => import("@/components/parking/FindMyCar3DMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[360px] sm:h-[460px] bg-[#10151D] rounded-2xl border border-white/[0.08] flex flex-col items-center justify-center p-[24px] text-center animate-pulse">
        <Loader2 className="w-8 h-8 text-[#D84A2B] animate-spin mb-2" />
        <p className="text-[14px] font-bold text-[#F5F7FA]">Loading 3D Parking Floor Space...</p>
        <p className="text-[12px] text-[rgba(245,247,250,0.58)] mt-1">Initializing spatial coordinates and lighting</p>
      </div>
    ),
  }
);

type ActiveTabType = "find-my-car" | "scan-qr" | "history" | "exit-pass";

function formatDurationLive(entryTime: string): string {
  const diff = Date.now() - new Date(entryTime).getTime();
  if (diff < 0) return "0m";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ActiveTabType>("find-my-car");
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>("mall_entrance");
  const [mapMode, setMapMode] = useState<"3D" | "2D">("3D");
  const [isAssistanceOpen, setIsAssistanceOpen] = useState(false);
  const [vehicleInput, setVehicleInput] = useState("");
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [vehicleSavedMsg, setVehicleSavedMsg] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [liveDuration, setLiveDuration] = useState("0m");
  const [refreshing, setRefreshing] = useState(false);

  const userEmail = session?.user?.email || "";
  const user = useQuery(api.users.getUser, userEmail ? { email: userEmail } : "skip");
  const upsertUser = useMutation(api.users.upsertUser);
  const confirmPillarMutation = useMutation(api.bookings.confirmPillarLocation);

  const vehicleNumber = user?.vehicleNumber || "";

  const activeBooking = useQuery(
    api.bookings.getActiveBookingByVehicle,
    vehicleNumber ? { vehicleNumber } : "skip"
  );

  const historyRecords = useQuery(
    api.bookings.getHistoryByVehicle,
    vehicleNumber ? { vehicleNumber } : "skip"
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/customer/login");
    }
  }, [status, router]);

  // Live parking duration counter timer
  useEffect(() => {
    if (!activeBooking?.entryTime) return;
    setLiveDuration(formatDurationLive(activeBooking.entryTime));
    const interval = setInterval(() => {
      setLiveDuration(formatDurationLive(activeBooking.entryTime));
    }, 20000);
    return () => clearInterval(interval);
  }, [activeBooking?.entryTime]);

  const hasActiveSession = Boolean(activeBooking && activeBooking.status === "ACTIVE");
  const isPillarConfirmed = Boolean(activeBooking?.pillarConfirmedAt);

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleInput.trim() || !userEmail) return;
    setSavingVehicle(true);
    setVehicleSavedMsg(false);
    try {
      await upsertUser({
        email: userEmail,
        name: session?.user?.name || userEmail,
        vehicleNumber: vehicleInput.trim().toUpperCase(),
      });
      setVehicleSavedMsg(true);
      setVehicleInput("");
      setTimeout(() => setVehicleSavedMsg(false), 4000);
    } catch (err) {
      console.error("Failed to save vehicle:", err);
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleConfirmPillar = async (codeOrToken: string) => {
    if (!activeBooking) {
      return { success: false, error: "No active parking session found" };
    }
    try {
      const res = await confirmPillarMutation({
        bookingId: activeBooking._id,
        pillarTokenOrCode: codeOrToken,
      });
      return { success: true, confirmedPillar: res.confirmedPillar };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to confirm pillar code" };
    }
  };

  // Dijkstra spatial pathfinding calculation
  const routeData = useMemo(() => {
    if (!activeBooking?.slotDetails) return null;
    return calculateDijkstraRoute(
      selectedLandmarkId,
      activeBooking.slotDetails.slotNumber || activeBooking.slotId,
      {
        floor: activeBooking.slotDetails.floor,
        zone: activeBooking.slotDetails.zone,
        pillar: activeBooking.pillarConfirmedAt ? (activeBooking.confirmedPillar || activeBooking.slotDetails.pillar) : activeBooking.slotDetails.pillar,
        slotNumber: activeBooking.slotDetails.slotNumber,
      }
    );
  }, [selectedLandmarkId, activeBooking]);

  // Pagination for history
  const PAGE_SIZE = 5;
  const totalHistoryPages = Math.ceil((historyRecords?.length || 0) / PAGE_SIZE) || 1;
  const paginatedHistory = useMemo(() => {
    if (!historyRecords) return [];
    const start = (historyPage - 1) * PAGE_SIZE;
    return historyRecords.slice(start, start + PAGE_SIZE);
  }, [historyRecords, historyPage]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-[100dvh] bg-[#050507] flex items-center justify-center w-full">
        <Loader2 className="w-8 h-8 text-[#D84A2B] animate-spin" />
      </div>
    );
  }

  const customerDisplayName = session.user?.name || session.user?.email?.split("@")[0] || "Driver";

  return (
    <div className="min-h-[100dvh] bg-[#050507] text-[#F5F7FA] selection:bg-[#D84A2B]/20 selection:text-[#D84A2B] box-border w-full flex flex-col font-['Sora',sans-serif]">
      {/* ── 1. COMPACT HEADER ── */}
      <header className="sticky top-0 z-40 bg-[#050507]/95 backdrop-blur-md border-b border-white/[0.10] w-full h-[64px] sm:h-[72px]">
        <div className="w-full max-w-[1180px] mx-auto px-[12px] sm:px-[24px] lg:px-[32px] h-full flex items-center justify-between gap-[8px] sm:gap-[12px]">
          {/* Logo */}
          <Link href="/" className="group flex items-center transition-transform hover:opacity-90 shrink-0">
            <div className="sm:hidden">
              <ParknexLogo size="sm" variant="dark" />
            </div>
            <div className="hidden sm:block">
              <ParknexLogo size="md" variant="dark" />
            </div>
          </Link>

          {/* Right Header Controls */}
          <div className="flex items-center gap-[6px] sm:gap-[12px] shrink-0">
            <span className="hidden sm:inline text-[13px] sm:text-[14px] text-[rgba(245,247,250,0.58)] truncate max-w-[140px]">
              {customerDisplayName}
            </span>

            {vehicleNumber && (
              <div className="flex items-center gap-[4px] sm:gap-[6px] px-[8px] sm:px-[10px] py-[4px] sm:py-[5px] rounded-full bg-[#151B24] border border-white/[0.10] shrink-0 font-mono text-[11px] sm:text-[12px] font-bold text-white/90">
                <Car className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D84A2B]" />
                <span>{vehicleNumber}</span>
              </div>
            )}

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-[4px] sm:gap-[6px] h-[34px] sm:h-[40px] px-[10px] sm:px-[16px] rounded-xl border border-white/[0.10] bg-white/[0.04] text-[12px] sm:text-[14px] font-semibold text-[rgba(245,247,250,0.7)] hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="w-full max-w-[1180px] mx-auto px-[12px] sm:px-[24px] lg:px-[32px] pt-[20px] sm:pt-[32px] pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-[48px] flex-1 flex flex-col gap-[20px] sm:gap-[24px] min-w-0">
        {/* ── 2. DASHBOARD WELCOME AREA ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-[12px] sm:gap-[16px] pb-[4px]">
          <div className="min-w-0">
            <div className="text-[11px] sm:text-[12px] font-bold text-[#D84A2B] uppercase tracking-wider mb-[2px]">
              Customer Parking Hub
            </div>
            <h1 className="text-[22px] sm:text-[34px] font-bold text-[#F5F7FA] tracking-tight leading-tight truncate">
              Hello, {customerDisplayName}
            </h1>
            <p className="text-[13.5px] sm:text-[15px] text-[rgba(245,247,250,0.58)] mt-[2px] leading-snug">
              Manage live navigation, physical pillar verification and digital exit passes.
            </p>
          </div>

          <div className="flex items-center gap-[10px] self-start sm:self-auto shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-[38px] sm:h-[40px] px-[12px] sm:px-[14px] rounded-xl bg-[#10151D] border border-white/[0.10] text-[12.5px] sm:text-[13px] font-semibold text-[rgba(245,247,250,0.7)] hover:text-white hover:bg-[#151B24] transition-all flex items-center gap-[6px] cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D84A2B] ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>

        {/* Vehicle Registration Banner if user has no vehicle assigned */}
        {user !== undefined && !vehicleNumber && (
          <div className="bg-[#10151D] border border-white/[0.10] rounded-2xl p-[16px] sm:p-[24px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[14px]">
            <div className="flex items-start gap-[12px]">
              <div className="w-[40px] h-[40px] rounded-xl bg-[#D84A2B]/15 border border-[#D84A2B]/30 flex items-center justify-center shrink-0 text-[#D84A2B]">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[15px] sm:text-[16px] font-bold text-white">Register Vehicle License Plate</h3>
                <p className="text-[12.5px] sm:text-[13.5px] text-[rgba(245,247,250,0.58)] mt-[2px]">
                  Link your license plate to automatically sync incoming parking assignments.
                </p>
              </div>
            </div>
            <form onSubmit={handleSaveVehicle} className="flex items-center gap-[8px] w-full sm:w-auto">
              <input
                type="text"
                value={vehicleInput}
                onChange={(e) => setVehicleInput(e.target.value.toUpperCase())}
                placeholder="e.g. KA 01 AB 1234"
                className="h-[40px] sm:h-[44px] px-[12px] rounded-xl bg-[#151B24] border border-white/15 text-white font-mono text-[13px] sm:text-[14px] focus:outline-none focus:border-[#D84A2B] transition-colors w-full sm:w-[200px]"
              />
              <button
                type="submit"
                disabled={savingVehicle || !vehicleInput.trim()}
                className="h-[40px] sm:h-[44px] px-[16px] rounded-xl bg-[#D84A2B] hover:bg-[#C64024] disabled:opacity-50 text-white font-bold text-[13px] sm:text-[14px] flex items-center gap-[6px] shrink-0 transition-all cursor-pointer"
              >
                {savingVehicle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Save</span>
              </button>
            </form>
          </div>
        )}
        {vehicleSavedMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[13px] px-[16px] py-[10px] rounded-xl flex items-center gap-[8px]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Vehicle plate registered successfully! Active bookings will link automatically.</span>
          </div>
        )}

        {/* ── 3. ACTIVE-PARKING SUMMARY / NO-ACTIVE-SESSION ── */}
        {hasActiveSession && activeBooking ? (
          <div className="bg-[#10151D] border border-white/[0.10] rounded-2xl p-[16px] sm:p-[24px] flex flex-col gap-[16px] sm:gap-[20px] shadow-xl relative overflow-hidden">
            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-[10px] pb-[12px] sm:pb-[16px] border-b border-white/[0.08]">
              <div className="flex items-center gap-[8px] sm:gap-[10px] min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[11.5px] sm:text-[12px] font-bold uppercase tracking-wider text-emerald-400 truncate">
                  Active Parking Session
                </span>
                <span className="text-[13px] text-[rgba(245,247,250,0.58)]">·</span>
                <span className="text-[13px] sm:text-[13.5px] font-medium text-white/80 truncate">{activeBooking.mallName}</span>
              </div>

              <button
                type="button"
                onClick={() => setIsAssistanceOpen(true)}
                className="text-[12px] sm:text-[12.5px] font-semibold text-[rgba(245,247,250,0.58)] hover:text-[#D84A2B] transition-colors flex items-center gap-[6px] shrink-0"
              >
                <HelpCircle className="w-4 h-4 text-[#D84A2B]" />
                <span>Report a Problem</span>
              </button>
            </div>

            {/* Space Grid Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-[8px] sm:gap-[12px]">
              <div className="bg-[#151B24] border border-white/[0.08] rounded-xl p-[10px] sm:p-[14px] flex flex-col min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase text-[rgba(245,247,250,0.58)] truncate">Floor & Zone</span>
                <span className="text-[15px] sm:text-[18px] font-black text-white mt-[2px] sm:mt-[4px] truncate">
                  Floor {activeBooking.slotDetails?.floor || "B2"}
                </span>
                <span className="text-[11px] sm:text-[12px] text-[#D84A2B] font-semibold truncate">{activeBooking.slotDetails?.zone || "Zone A"}</span>
              </div>

              <div className="bg-[#151B24] border border-white/[0.08] rounded-xl p-[10px] sm:p-[14px] flex flex-col min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase text-[rgba(245,247,250,0.58)] truncate">Assigned Space</span>
                <span className="text-[15px] sm:text-[18px] font-black text-[#D84A2B] mt-[2px] sm:mt-[4px] truncate">
                  Slot {activeBooking.slotDetails?.slotNumber || activeBooking.slotId}
                </span>
                <span className="text-[11px] sm:text-[12px] text-white/60 font-medium truncate">
                  {isPillarConfirmed ? (activeBooking.confirmedPillar || activeBooking.slotDetails?.pillar) : activeBooking.slotDetails?.pillar}
                </span>
              </div>

              <div className="bg-[#151B24] border border-white/[0.08] rounded-xl p-[10px] sm:p-[14px] flex flex-col min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase text-[rgba(245,247,250,0.58)] truncate">Entry Time</span>
                <span className="text-[14px] sm:text-[16px] font-bold text-white mt-[2px] sm:mt-[4px] truncate">
                  {new Date(activeBooking.entryTime).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-[11px] sm:text-[12px] text-[rgba(245,247,250,0.58)] truncate">
                  {new Date(activeBooking.entryTime).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </span>
              </div>

              <div className="bg-[#151B24] border border-white/[0.08] rounded-xl p-[10px] sm:p-[14px] flex flex-col min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase text-[rgba(245,247,250,0.58)] truncate">Live Duration</span>
                <span className="text-[15px] sm:text-[18px] font-black text-white mt-[2px] sm:mt-[4px] flex items-center gap-[4px] sm:gap-[6px] truncate">
                  <Clock className="w-3.5 h-3.5 text-[#D84A2B] shrink-0" />
                  <span className="truncate">{liveDuration}</span>
                </span>
                <span className="text-[11px] sm:text-[12px] text-emerald-400 font-semibold truncate">Active In Mall</span>
              </div>
            </div>

            {/* 4-Stage Status Timeline */}
            <div className="bg-[#151B24] border border-white/[0.08] rounded-xl p-[12px] sm:p-[20px] flex flex-col gap-[10px] sm:gap-[12px]">
              <div className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-[rgba(245,247,250,0.58)]">
                Parking Session Timeline
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-[6px] sm:gap-[12px] relative">
                {/* Step 1 */}
                <div className="flex flex-col gap-[2px] sm:gap-[4px] p-[8px] sm:p-[10px] rounded-lg bg-emerald-500/10 border border-emerald-500/30 min-w-0">
                  <div className="flex items-center gap-[4px] sm:gap-[6px] text-emerald-400 text-[11px] sm:text-[12px] font-bold truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">1. Vehicle Detected</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-white/60 truncate">Entry gate verified</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col gap-[2px] sm:gap-[4px] p-[8px] sm:p-[10px] rounded-lg bg-emerald-500/10 border border-emerald-500/30 min-w-0">
                  <div className="flex items-center gap-[4px] sm:gap-[6px] text-emerald-400 text-[11px] sm:text-[12px] font-bold truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">2. Space Assigned</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-white/60 truncate">Slot {activeBooking.slotDetails?.slotNumber} allocated</span>
                </div>

                {/* Step 3 */}
                <div
                  className={`flex flex-col gap-[2px] sm:gap-[4px] p-[8px] sm:p-[10px] rounded-lg border min-w-0 ${
                    isPillarConfirmed
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-[#D84A2B]/10 border-[#D84A2B] text-white"
                  }`}
                >
                  <div
                    className={`flex items-center gap-[4px] sm:gap-[6px] text-[11px] sm:text-[12px] font-bold truncate ${
                      isPillarConfirmed ? "text-emerald-400" : "text-[#D84A2B]"
                    }`}
                  >
                    {isPillarConfirmed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#D84A2B] animate-pulse shrink-0" />
                    )}
                    <span className="truncate">3. Pillar Confirmed</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-white/60 truncate">
                    {isPillarConfirmed ? `${activeBooking.confirmedPillar || "Pillar"} verified` : "Action needed"}
                  </span>
                </div>

                {/* Step 4 */}
                <div
                  className={`flex flex-col gap-[2px] sm:gap-[4px] p-[8px] sm:p-[10px] rounded-lg border min-w-0 ${
                    activeBooking.status === "COMPLETED"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : isPillarConfirmed
                      ? "bg-white/[0.04] border-white/15 text-white/80"
                      : "bg-white/[0.02] border-white/[0.06] text-white/40"
                  }`}
                >
                  <div className="flex items-center gap-[4px] sm:gap-[6px] text-[11px] sm:text-[12px] font-bold truncate">
                    {activeBooking.status === "COMPLETED" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    )}
                    <span className="truncate">4. Ready to Exit</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-white/50 truncate">Digital pass active</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── 5. NO ACTIVE SESSION COMPACT EMPTY STATE ── */
          <div className="bg-[#10151D] border border-white/[0.10] rounded-2xl p-[24px] sm:p-[32px] text-center flex flex-col items-center justify-center gap-[16px]">
            <div className="w-[56px] h-[56px] rounded-2xl bg-[#151B24] border border-white/[0.08] flex items-center justify-center text-[rgba(245,247,250,0.58)]">
              <Car className="w-7 h-7 text-[#D84A2B]" />
            </div>
            <div className="max-w-[480px]">
              <h3 className="text-[20px] sm:text-[22px] font-bold text-white">No active parking session</h3>
              <p className="text-[14px] text-[rgba(245,247,250,0.58)] mt-[6px] leading-[1.5]">
                Your parking tools will activate when an operator assigns a space to your vehicle{" "}
                {vehicleNumber && (
                  <span className="font-mono text-white font-semibold">({vehicleNumber})</span>
                )}
                .
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-[12px] pt-[8px]">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-[44px] px-[20px] rounded-xl bg-[#D84A2B] hover:bg-[#C64024] text-white font-bold text-[14px] flex items-center gap-[8px] transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                <span>Refresh Assignment</span>
              </button>
            </div>
          </div>
        )}

        {/* ── 4. FOUR DASHBOARD OPTIONS (DESKTOP TAB SELECTOR) ── */}
        <div className="hidden md:grid grid-cols-4 gap-3">
          {/* Option 1: Find My Car */}
          <button
            type="button"
            onClick={() => setActiveTab("find-my-car")}
            disabled={!hasActiveSession}
            className={`min-h-[84px] p-[16px] rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
              activeTab === "find-my-car"
                ? "bg-[#151B24] border-[#D84A2B] shadow-lg"
                : hasActiveSession
                ? "bg-[#10151D] border-white/[0.08] hover:border-white/20 hover:bg-[#151B24]"
                : "bg-[#10151D]/60 border-white/[0.04] opacity-60 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  activeTab === "find-my-car"
                    ? "bg-[#D84A2B] text-white"
                    : "bg-[#151B24] text-[rgba(245,247,250,0.58)]"
                }`}
              >
                <MapPin className="w-5 h-5" />
              </div>
              {!hasActiveSession && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/[0.06] text-white/40 uppercase">
                  Inactive
                </span>
              )}
            </div>
            <div className="mt-[8px]">
              <div className="text-[15px] font-bold text-white">Find My Car</div>
              <div className="text-[12px] text-[rgba(245,247,250,0.58)] truncate">
                {hasActiveSession ? "Interactive 3D route map" : "Available after space assigned"}
              </div>
            </div>
          </button>

          {/* Option 2: Scan QR */}
          <button
            type="button"
            onClick={() => setActiveTab("scan-qr")}
            disabled={!hasActiveSession}
            className={`min-h-[84px] p-[16px] rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
              activeTab === "scan-qr"
                ? "bg-[#151B24] border-[#D84A2B] shadow-lg"
                : hasActiveSession
                ? "bg-[#10151D] border-white/[0.08] hover:border-white/20 hover:bg-[#151B24]"
                : "bg-[#10151D]/60 border-white/[0.04] opacity-60 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  activeTab === "scan-qr"
                    ? "bg-[#D84A2B] text-white"
                    : "bg-[#151B24] text-[rgba(245,247,250,0.58)]"
                }`}
              >
                <ScanLine className="w-5 h-5" />
              </div>
              {!hasActiveSession && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/[0.06] text-white/40 uppercase">
                  Inactive
                </span>
              )}
            </div>
            <div className="mt-[8px]">
              <div className="text-[15px] font-bold text-white">Scan QR</div>
              <div className="text-[12px] text-[rgba(245,247,250,0.58)] truncate">
                {hasActiveSession ? "Confirm pillar location" : "Available after space assigned"}
              </div>
            </div>
          </button>

          {/* Option 3: History (Always Enabled) */}
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`min-h-[84px] p-[16px] rounded-2xl border text-left flex flex-col justify-between transition-all ${
              activeTab === "history"
                ? "bg-[#151B24] border-[#D84A2B] shadow-lg"
                : "bg-[#10151D] border-white/[0.08] hover:border-white/20 hover:bg-[#151B24]"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  activeTab === "history"
                    ? "bg-[#D84A2B] text-white"
                    : "bg-[#151B24] text-[rgba(245,247,250,0.58)]"
                }`}
              >
                <HistoryIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase">
                {historyRecords?.length || 0} Records
              </span>
            </div>
            <div className="mt-[8px]">
              <div className="text-[15px] font-bold text-white">History</div>
              <div className="text-[12px] text-[rgba(245,247,250,0.58)] truncate">
                Past parking sessions & logs
              </div>
            </div>
          </button>

          {/* Option 4: Exit Pass */}
          <button
            type="button"
            onClick={() => setActiveTab("exit-pass")}
            disabled={!hasActiveSession}
            className={`min-h-[84px] p-[16px] rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
              activeTab === "exit-pass"
                ? "bg-[#151B24] border-[#D84A2B] shadow-lg"
                : hasActiveSession
                ? "bg-[#10151D] border-white/[0.08] hover:border-white/20 hover:bg-[#151B24]"
                : "bg-[#10151D]/60 border-white/[0.04] opacity-60 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  activeTab === "exit-pass"
                    ? "bg-[#D84A2B] text-white"
                    : "bg-[#151B24] text-[rgba(245,247,250,0.58)]"
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              {!hasActiveSession && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/[0.06] text-white/40 uppercase">
                  Inactive
                </span>
              )}
            </div>
            <div className="mt-[8px]">
              <div className="text-[15px] font-bold text-white">Exit Pass</div>
              <div className="text-[12px] text-[rgba(245,247,250,0.58)] truncate">
                {hasActiveSession ? "Digital signed barrier QR" : "Available after space assigned"}
              </div>
            </div>
          </button>
        </div>

        {/* ── TAB CONTENT RENDERING ── */}
        <div className="w-full flex flex-col gap-[24px]">
          {/* TAB 1: FIND MY CAR */}
          {activeTab === "find-my-car" && hasActiveSession && activeBooking && (
            <div className="flex flex-col gap-[20px]">
              {!isPillarConfirmed ? (
                /* Pre-confirmation Call to Action */
                <div className="bg-[#10151D] border border-[#D84A2B]/40 rounded-2xl p-[24px] sm:p-[32px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[20px] shadow-xl">
                  <div className="flex items-start gap-[16px]">
                    <div className="w-[52px] h-[52px] rounded-2xl bg-[#D84A2B]/15 border border-[#D84A2B]/30 flex items-center justify-center shrink-0 text-[#D84A2B]">
                      <ScanLine className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#D84A2B]">
                        Step Required
                      </span>
                      <h3 className="text-[20px] sm:text-[22px] font-bold text-white mt-[2px]">
                        Confirm where you parked
                      </h3>
                      <p className="text-[14px] text-[rgba(245,247,250,0.58)] mt-[4px] max-w-[460px] leading-[1.5]">
                        Scan the QR code near your parking pillar ({activeBooking.slotDetails?.pillar || "Pillar"} · {activeBooking.slotDetails?.slotNumber}) to activate live walking route guidance.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("scan-qr")}
                    className="h-[48px] px-[24px] rounded-xl bg-[#D84A2B] hover:bg-[#C64024] text-white font-bold text-[14px] flex items-center gap-[8px] shrink-0 transition-all cursor-pointer shadow-lg"
                  >
                    <ScanLine className="w-4 h-4" />
                    <span>Scan Pillar QR Now</span>
                  </button>
                </div>
              ) : (
                /* Confirmed Find My Car View: Two-Column Desktop (2/3 Map, 1/3 Details) */
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-[20px]">
                  {/* Left 2/3 Column: Map & Controls */}
                  <div className="lg:col-span-2 flex flex-col gap-[16px]">
                    <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-[16px] sm:p-[20px] flex flex-col gap-[16px]">
                      {/* Map Mode Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-[8px]">
                          <Compass className="w-5 h-5 text-[#D84A2B]" />
                          <span className="text-[15px] font-bold text-white">Indoor Navigation Guidance</span>
                        </div>
                        <div className="flex items-center gap-[6px] bg-[#151B24] p-[3px] rounded-xl border border-white/[0.08]">
                          <button
                            type="button"
                            onClick={() => setMapMode("3D")}
                            className={`px-[12px] py-[6px] rounded-lg text-[12px] font-bold transition-all ${
                              mapMode === "3D" ? "bg-[#D84A2B] text-white" : "text-white/60 hover:text-white"
                            }`}
                          >
                            Interactive View
                          </button>
                          <button
                            type="button"
                            onClick={() => setMapMode("2D")}
                            className={`px-[12px] py-[6px] rounded-lg text-[12px] font-bold transition-all ${
                              mapMode === "2D" ? "bg-[#D84A2B] text-white" : "text-white/60 hover:text-white"
                            }`}
                          >
                            Floor Plan
                          </button>
                        </div>
                      </div>

                      {/* Map Canvas */}
                      <div className="w-full h-[360px] sm:h-[460px] rounded-xl overflow-hidden relative">
                        {mapMode === "3D" ? (
                          <FindMyCar3DMap
                            routePoints={routeData?.waypointCoordinates}
                            slotNumber={activeBooking.slotDetails?.slotNumber}
                            floor={activeBooking.slotDetails?.floor}
                            zone={activeBooking.slotDetails?.zone}
                            pillar={activeBooking.confirmedPillar || activeBooking.slotDetails?.pillar}
                            startLandmarkName={routeData?.startLandmark.name}
                            startLandmarkPos={routeData?.startLandmark.position}
                          />
                        ) : (
                          <CustomerFloorPlan2D
                            floor={activeBooking.slotDetails?.floor || "B2"}
                            zone={activeBooking.slotDetails?.zone || "Zone A"}
                            pillar={activeBooking.confirmedPillar || activeBooking.slotDetails?.pillar || "Pillar"}
                            slotNumber={activeBooking.slotDetails?.slotNumber || activeBooking.slotId}
                            distanceFromEntrance={routeData?.totalDistanceMeters || 36}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right 1/3 Column: Landmark Selector & Step Guidance */}
                  <div className="flex flex-col gap-[16px]">
                    {/* Landmark Selector Card */}
                    <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-[20px] flex flex-col gap-[14px]">
                      <div className="flex items-center justify-between pb-[10px] border-b border-white/[0.08]">
                        <span className="text-[12px] font-bold uppercase text-[rgba(245,247,250,0.58)]">
                          Starting Landmark
                        </span>
                        <span className="text-[12px] text-emerald-400 font-bold">
                          {routeData?.totalDistanceMeters || 36}m ({routeData?.walkTimeMinutes || 1} min)
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        {LANDMARKS.map((landmark) => (
                          <button
                            key={landmark.id}
                            type="button"
                            onClick={() => setSelectedLandmarkId(landmark.id)}
                            className={`p-[12px] rounded-xl border text-left flex items-start gap-[10px] transition-all cursor-pointer ${
                              selectedLandmarkId === landmark.id
                                ? "bg-[#D84A2B]/10 border-[#D84A2B] text-white"
                                : "bg-[#151B24] border-white/[0.06] text-white/70 hover:border-white/20"
                            }`}
                          >
                            <Building2
                              className={`w-4 h-4 shrink-0 mt-[2px] ${
                                selectedLandmarkId === landmark.id ? "text-[#D84A2B]" : "text-white/40"
                              }`}
                            />
                            <div>
                              <div className="text-[13.5px] font-bold leading-tight">{landmark.name}</div>
                              <div className="text-[11.5px] text-[rgba(245,247,250,0.58)] mt-[2px]">
                                {landmark.description}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Turn-by-turn Directions */}
                    <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-[20px] flex flex-col gap-[12px]">
                      <div className="text-[12px] font-bold uppercase tracking-wider text-[rgba(245,247,250,0.58)] flex items-center gap-[6px]">
                        <Navigation className="w-4 h-4 text-[#D84A2B]" />
                        <span>A* Turn-by-Turn Route</span>
                      </div>
                      <div className="flex flex-col gap-[10px]">
                        {routeData?.directions.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-[10px] text-[13px] leading-[1.4]">
                            <span className="w-5 h-5 rounded-full bg-[#D84A2B]/20 text-[#D84A2B] text-[11px] font-bold flex items-center justify-center shrink-0 mt-[1px]">
                              {idx + 1}
                            </span>
                            <span className="text-white/85">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SCAN QR */}
          {activeTab === "scan-qr" && (
            <div className="flex flex-col gap-[20px]">
              {!hasActiveSession || !activeBooking ? (
                <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-[32px] text-center flex flex-col items-center justify-center gap-[12px]">
                  <ScanLine className="w-8 h-8 text-[rgba(245,247,250,0.4)]" />
                  <h4 className="text-[18px] font-bold text-white">QR Scanner is Inactive</h4>
                  <p className="text-[14px] text-[rgba(245,247,250,0.58)] max-w-[400px]">
                    Available after a parking space is assigned to your vehicle.
                  </p>
                </div>
              ) : (
                <QrCameraScanner
                  onConfirmPillar={handleConfirmPillar}
                  assignedPillar={activeBooking.slotDetails?.pillar || "Pillar"}
                  assignedSlot={activeBooking.slotDetails?.slotNumber || activeBooking.slotId}
                  assignedFloor={activeBooking.slotDetails?.floor || "B2"}
                />
              )}
            </div>
          )}

          {/* TAB 3: HISTORY (Always Available) */}
          {activeTab === "history" && (
            <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-[20px] sm:p-[24px] flex flex-col gap-[20px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[12px] pb-[16px] border-b border-white/[0.08]">
                <div>
                  <h3 className="text-[18px] font-bold text-white flex items-center gap-[10px]">
                    <HistoryIcon className="w-5 h-5 text-[#D84A2B]" />
                    <span>Customer Parking History</span>
                  </h3>
                  <p className="text-[13.5px] text-[rgba(245,247,250,0.58)] mt-[2px]">
                    Verified log of previous parking stays for vehicle{" "}
                    <span className="font-mono text-white font-semibold">{vehicleNumber || "your account"}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-[38px] px-[14px] rounded-xl bg-[#151B24] border border-white/[0.08] text-[13px] font-semibold text-white/80 hover:text-white flex items-center gap-[6px] self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#D84A2B] ${refreshing ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {historyRecords === undefined ? (
                /* Loading Skeleton */
                <div className="flex flex-col gap-[12px] animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[64px] bg-[#151B24] rounded-xl border border-white/[0.04]" />
                  ))}
                </div>
              ) : historyRecords.length === 0 ? (
                /* Empty State */
                <div className="py-[36px] text-center flex flex-col items-center justify-center gap-[10px]">
                  <HistoryIcon className="w-8 h-8 text-[rgba(245,247,250,0.3)]" />
                  <h4 className="text-[16px] font-bold text-white">No past parking records</h4>
                  <p className="text-[13.5px] text-[rgba(245,247,250,0.58)] max-w-[360px]">
                    When your parking visits are completed and validated at the exit gate, they will appear here.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Responsive Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-[13.5px]">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-[11.5px] font-bold uppercase text-[rgba(245,247,250,0.58)]">
                          <th className="py-[12px] px-[12px]">Date</th>
                          <th className="py-[12px] px-[12px]">Location</th>
                          <th className="py-[12px] px-[12px]">Space</th>
                          <th className="py-[12px] px-[12px]">Entry</th>
                          <th className="py-[12px] px-[12px]">Exit</th>
                          <th className="py-[12px] px-[12px]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {paginatedHistory.map((rec: any) => (
                          <tr key={rec._id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-[14px] px-[12px] text-white font-medium">
                              {new Date(rec.entryTime).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-[14px] px-[12px] text-[rgba(245,247,250,0.7)]">
                              {rec.mallName || "Central Mall"} · Floor {rec.floor || "B2"}
                            </td>
                            <td className="py-[14px] px-[12px] font-mono text-[#D84A2B] font-bold">
                              {rec.slotNumber || rec.slotId} ({rec.pillar || "Pillar"})
                            </td>
                            <td className="py-[14px] px-[12px] text-[rgba(245,247,250,0.7)]">
                              {new Date(rec.entryTime).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="py-[14px] px-[12px] text-[rgba(245,247,250,0.7)]">
                              {rec.exitTime
                                ? new Date(rec.exitTime).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "In Progress"}
                            </td>
                            <td className="py-[14px] px-[12px]">
                              <span
                                className={`text-[11px] font-bold px-[10px] py-[4px] rounded-full border ${
                                  rec.status === "COMPLETED"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                    : rec.status === "ACTIVE"
                                    ? "bg-[#D84A2B]/10 text-[#D84A2B] border-[#D84A2B]/30"
                                    : "bg-white/5 text-white/50 border-white/10"
                                }`}
                              >
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Stacked History Cards */}
                  <div className="sm:hidden flex flex-col gap-[12px]">
                    {paginatedHistory.map((rec: any) => (
                      <div
                        key={rec._id}
                        className="bg-[#151B24] border border-white/[0.08] rounded-xl p-[16px] flex flex-col gap-[10px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[15px] font-bold text-[#D84A2B]">
                            Slot {rec.slotNumber || rec.slotId}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-[8px] py-[3px] rounded-full border ${
                              rec.status === "COMPLETED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-[#D84A2B]/10 text-[#D84A2B] border-[#D84A2B]/30"
                            }`}
                          >
                            {rec.status}
                          </span>
                        </div>
                        <div className="text-[13px] text-[rgba(245,247,250,0.58)]">
                          {rec.mallName || "Central Mall"} · Floor {rec.floor || "B2"} · {rec.pillar || "Pillar"}
                        </div>
                        <div className="flex items-center justify-between text-[12px] text-white/80 pt-[6px] border-t border-white/[0.06]">
                          <span>
                            {new Date(rec.entryTime).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span>
                            {new Date(rec.entryTime).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            →{" "}
                            {rec.exitTime
                              ? new Date(rec.exitTime).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Active"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalHistoryPages > 1 && (
                    <div className="flex items-center justify-between pt-[12px] border-t border-white/[0.08]">
                      <span className="text-[12px] text-[rgba(245,247,250,0.58)]">
                        Page {historyPage} of {totalHistoryPages}
                      </span>
                      <div className="flex items-center gap-[8px]">
                        <button
                          type="button"
                          onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                          disabled={historyPage === 1}
                          className="h-[36px] px-[12px] rounded-lg bg-[#151B24] border border-white/[0.08] text-white disabled:opacity-40 text-[12px] font-semibold flex items-center gap-[4px]"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Prev</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                          disabled={historyPage === totalHistoryPages}
                          className="h-[36px] px-[12px] rounded-lg bg-[#151B24] border border-white/[0.08] text-white disabled:opacity-40 text-[12px] font-semibold flex items-center gap-[4px]"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 4: EXIT PASS */}
          {activeTab === "exit-pass" && (
            <div className="flex flex-col items-center">
              {!hasActiveSession || !activeBooking ? (
                <div className="w-full bg-[#10151D] border border-white/[0.08] rounded-2xl p-[32px] text-center flex flex-col items-center justify-center gap-[12px]">
                  <ShieldCheck className="w-8 h-8 text-[rgba(245,247,250,0.4)]" />
                  <h4 className="text-[18px] font-bold text-white">No Active Exit Pass</h4>
                  <p className="text-[14px] text-[rgba(245,247,250,0.58)] max-w-[400px]">
                    Available after a parking space is assigned.
                  </p>
                </div>
              ) : activeBooking.status === "COMPLETED" || activeBooking.exitPassUsed ? (
                /* Exit Pass Already Used / Completed */
                <div className="w-full max-w-[460px] bg-[#10151D] border border-white/[0.10] rounded-2xl p-[24px] sm:p-[32px] flex flex-col items-center text-center gap-[20px] shadow-2xl">
                  <div className="w-[64px] h-[64px] rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-[22px] font-bold text-white">Exit completed</h3>
                    <p className="text-[14px] text-[rgba(245,247,250,0.58)] mt-[6px]">
                      This exit pass has already been used.
                    </p>
                  </div>
                  <div className="w-full p-[14px] rounded-xl bg-[#151B24] border border-white/[0.08] text-[13px] text-white/70 font-mono">
                    Exit logged at{" "}
                    {activeBooking.exitTime
                      ? new Date(activeBooking.exitTime).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "Gate Scanner"}
                  </div>
                </div>
              ) : (
                /* Active Digital Signed Single-Use Exit Pass */
                <div className="w-full max-w-[460px] bg-[#10151D] border border-white/[0.12] rounded-2xl p-[24px] sm:p-[32px] flex flex-col items-center text-center gap-[20px] shadow-2xl">
                  <div className="flex items-center justify-between w-full pb-[16px] border-b border-white/[0.08]">
                    <div className="flex items-center gap-[8px]">
                      <ShieldCheck className="w-5 h-5 text-[#D84A2B]" />
                      <span className="text-[13px] font-bold text-white uppercase tracking-wider">
                        Digital Exit Pass
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-[10px] py-[3px] rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      SINGLE USE
                    </span>
                  </div>

                  {/* Scannable QR Code Canvas */}
                  <div className="bg-white p-[20px] rounded-2xl border-4 border-[#D84A2B] shadow-2xl">
                    <QRCodeSVG
                      value={activeBooking.exitPassToken || activeBooking.customerAccessToken || "INVALID"}
                      size={220}
                      level="H"
                      marginSize={0}
                    />
                  </div>

                  {/* Vehicle & Location Details */}
                  <div className="flex flex-col gap-[6px] w-full">
                    <div className="text-[20px] font-mono font-black text-white tracking-wider">
                      {activeBooking.vehicleNumber}
                    </div>
                    <div className="text-[14px] text-[rgba(245,247,250,0.58)] font-medium">
                      Floor {activeBooking.slotDetails?.floor || "B2"} · {activeBooking.slotDetails?.zone || "Zone A"} · Space {activeBooking.slotDetails?.slotNumber || activeBooking.slotId}
                    </div>
                  </div>

                  {/* Short Exit Instructions */}
                  <div className="w-full p-[14px] rounded-xl bg-[#151B24] border border-white/[0.08] text-[13px] text-white/80 flex items-start gap-[10px] text-left">
                    <KeyRound className="w-5 h-5 text-[#D84A2B] shrink-0 mt-[1px]" />
                    <span>
                      Present this QR code to the barrier scanner at the exit gate. Validated single-use token expires in 24 hours.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── 4. FIXED BOTTOM NAVIGATION (MOBILE ONLY) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050507]/95 backdrop-blur-lg border-t border-white/[0.10] px-[8px] sm:px-[12px] py-[6px] sm:py-[8px] pb-[calc(6px+env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-4 gap-1 max-w-[430px] mx-auto w-full">
          {/* Mobile Option 1: Find My Car */}
          <button
            type="button"
            onClick={() => setActiveTab("find-my-car")}
            disabled={!hasActiveSession}
            className={`min-h-[48px] sm:min-h-[52px] rounded-xl flex flex-col items-center justify-center gap-[2px] sm:gap-[4px] transition-all cursor-pointer min-w-0 ${
              activeTab === "find-my-car"
                ? "text-[#D84A2B] bg-[#D84A2B]/10 font-bold"
                : hasActiveSession
                ? "text-[rgba(245,247,250,0.58)] hover:text-white"
                : "text-white/30 opacity-50 cursor-not-allowed"
            }`}
          >
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[10px] sm:text-[11px] leading-none truncate max-w-full">Find Car</span>
          </button>

          {/* Mobile Option 2: Scan QR */}
          <button
            type="button"
            onClick={() => setActiveTab("scan-qr")}
            disabled={!hasActiveSession}
            className={`min-h-[48px] sm:min-h-[52px] rounded-xl flex flex-col items-center justify-center gap-[2px] sm:gap-[4px] transition-all cursor-pointer min-w-0 ${
              activeTab === "scan-qr"
                ? "text-[#D84A2B] bg-[#D84A2B]/10 font-bold"
                : hasActiveSession
                ? "text-[rgba(245,247,250,0.58)] hover:text-white"
                : "text-white/30 opacity-50 cursor-not-allowed"
            }`}
          >
            <ScanLine className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[10px] sm:text-[11px] leading-none truncate max-w-full">Scan QR</span>
          </button>

          {/* Mobile Option 3: History */}
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`min-h-[48px] sm:min-h-[52px] rounded-xl flex flex-col items-center justify-center gap-[2px] sm:gap-[4px] transition-all cursor-pointer min-w-0 ${
              activeTab === "history"
                ? "text-[#D84A2B] bg-[#D84A2B]/10 font-bold"
                : "text-[rgba(245,247,250,0.58)] hover:text-white"
            }`}
          >
            <HistoryIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[10px] sm:text-[11px] leading-none truncate max-w-full">History</span>
          </button>

          {/* Mobile Option 4: Exit Pass */}
          <button
            type="button"
            onClick={() => setActiveTab("exit-pass")}
            disabled={!hasActiveSession}
            className={`min-h-[48px] sm:min-h-[52px] rounded-xl flex flex-col items-center justify-center gap-[2px] sm:gap-[4px] transition-all cursor-pointer min-w-0 ${
              activeTab === "exit-pass"
                ? "text-[#D84A2B] bg-[#D84A2B]/10 font-bold"
                : hasActiveSession
                ? "text-[rgba(245,247,250,0.58)] hover:text-white"
                : "text-white/30 opacity-50 cursor-not-allowed"
            }`}
          >
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-[10px] sm:text-[11px] leading-none truncate max-w-full">Exit Pass</span>
          </button>
        </div>
      </nav>

      {/* ── CUSTOMER ASSISTANCE PROBLEM REPORT MODAL ── */}
      <CustomerAssistanceModal
        isOpen={isAssistanceOpen}
        onClose={() => setIsAssistanceOpen(false)}
        bookingId={activeBooking?._id}
        vehicleNumber={activeBooking?.vehicleNumber || vehicleNumber}
        mallName={activeBooking?.mallName}
        slotNumber={activeBooking?.slotDetails?.slotNumber}
        floor={activeBooking?.slotDetails?.floor}
        pillar={activeBooking?.confirmedPillar || activeBooking?.slotDetails?.pillar}
      />
    </div>
  );
}
