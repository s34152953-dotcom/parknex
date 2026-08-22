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
      <div className="w-full h-[360px] sm:h-[460px] bg-[#FAF7F2] rounded-2xl border border-[#DED3C7] flex flex-col items-center justify-center p-6 text-center animate-pulse">
        <Loader2 className="w-8 h-8 text-[#C93B2F] animate-spin mb-2" />
        <p className="text-[14px] font-bold text-[#241F1B]">Loading Interactive Map...</p>
        <p className="text-[12px] text-[#70675F] mt-1">Initializing spatial coordinates and floor layout</p>
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
        name: session?.user?.name || "Customer",
        vehicleNumber: vehicleInput.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().trim(),
      });
      setVehicleSavedMsg(true);
      setVehicleInput("");
    } catch (err: any) {
      alert("Failed to save vehicle: " + err.message);
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleConfirmPillar = async (codeOrToken: string) => {
    if (!activeBooking?._id) {
      return { success: false, error: "No active parking session found." };
    }

    try {
      const res = await confirmPillarMutation({
        bookingId: activeBooking._id,
        pillarTokenOrCode: codeOrToken.trim(),
      });

      if (res.success) {
        setActiveTab("find-my-car");
        return {
          success: true,
          confirmedPillar: res.confirmedPillar || activeBooking.slotDetails?.pillar || "Confirmed",
        };
      } else {
        return { success: false, error: (res as any).error || "Pillar verification failed." };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to confirm pillar." };
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  // Turn-by-turn routing calculation
  const routeData = useMemo(() => {
    if (!activeBooking?.slotDetails) return null;
    const targetSlot = activeBooking.slotDetails;
    return calculateDijkstraRoute(
      selectedLandmarkId,
      targetSlot.slotNumber || targetSlot.slotId,
      {
        floor: targetSlot.floor,
        zone: targetSlot.zone,
        pillar: activeBooking.confirmedPillar || targetSlot.pillar,
        slotNumber: targetSlot.slotNumber,
      }
    );
  }, [activeBooking, selectedLandmarkId]);

  const customerDisplayName = session?.user?.name || session?.user?.email?.split("@")[0] || "Customer";

  // Pagination for History
  const itemsPerPage = 6;
  const totalHistoryPages = Math.ceil((historyRecords?.length || 0) / itemsPerPage) || 1;
  const paginatedHistory = (historyRecords || []).slice(
    (historyPage - 1) * itemsPerPage,
    historyPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241F1B] selection:bg-[#F9E3DE] selection:text-[#C93B2F] flex flex-col font-[family-name:var(--font-sora)]">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#DED3C7] w-full shadow-xs">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] sm:h-[72px] flex items-center justify-between">
          <Link href="/customer/dashboard" className="group flex items-center shrink-0">
            <ParknexLogo size="md" variant="light" />
          </Link>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="hidden sm:inline text-[13.5px] text-[#70675F] font-medium truncate max-w-[150px]">
              {customerDisplayName}
            </span>

            {vehicleNumber && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EAE0] border border-[#DED3C7] shrink-0 font-mono text-[12px] font-bold text-[#241F1B]">
                <Car className="w-3.5 h-3.5 text-[#C93B2F]" />
                <span>{vehicleNumber}</span>
              </div>
            )}

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1.5 h-[38px] px-3.5 rounded-xl border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] text-[13px] font-bold text-[#70675F] hover:text-[#241F1B] transition-all cursor-pointer shrink-0 shadow-xs"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 flex flex-col gap-6 min-w-0">
        {/* ── 2. DASHBOARD WELCOME AREA ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-[#DED3C7]">
          <div>
            <div className="text-[11.5px] font-bold text-[#C93B2F] uppercase tracking-wider mb-1">
              Customer Parking Hub
            </div>
            <h1 className="text-[24px] sm:text-[32px] font-black text-[#241F1B] tracking-tight leading-tight">
              Hello, {customerDisplayName}
            </h1>
            <p className="text-[14px] text-[#70675F] mt-0.5">
              Manage live navigation, pillar verification, and digital exit passes.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-[40px] px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[13px] font-bold text-[#241F1B] hover:bg-[#F3EAE0] transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#C93B2F] ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>

        {/* Vehicle Registration Banner if user has no vehicle assigned */}
        {user !== undefined && !vehicleNumber && (
          <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[15px] sm:text-[16px] font-bold text-[#241F1B]">Register Vehicle License Plate</h3>
                <p className="text-[13px] text-[#70675F] mt-0.5">
                  Link your license plate to automatically sync incoming parking assignments.
                </p>
              </div>
            </div>
            <form onSubmit={handleSaveVehicle} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={vehicleInput}
                onChange={(e) => setVehicleInput(e.target.value.toUpperCase())}
                placeholder="e.g. MH02AB1234"
                className="h-11 px-3 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] font-mono text-[13.5px] font-bold uppercase focus:outline-none focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] w-full sm:w-[200px]"
              />
              <button
                type="submit"
                disabled={savingVehicle || !vehicleInput.trim()}
                className="h-11 px-4 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] disabled:opacity-50 text-white font-bold text-[13.5px] flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs"
              >
                {savingVehicle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Save</span>
              </button>
            </form>
          </div>
        )}
        {vehicleSavedMsg && (
          <div className="bg-[#2F7D5A]/10 border border-[#2F7D5A]/30 text-[#2F7D5A] text-[13px] font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Vehicle plate registered successfully! Active bookings will link automatically.</span>
          </div>
        )}

        {/* ── 3. ACTIVE-PARKING SUMMARY / NO-ACTIVE-SESSION ── */}
        {hasActiveSession && activeBooking ? (
          <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 sm:p-7 flex flex-col gap-5 shadow-[0_8px_24px_rgba(70,48,35,0.07)] relative overflow-hidden">
            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-[#DED3C7]">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2F7D5A] animate-pulse shrink-0" />
                <span className="text-[12px] font-black uppercase tracking-wider text-[#2F7D5A]">
                  Active Parking Session
                </span>
                <span className="text-[13px] text-[#70675F]">·</span>
                <span className="text-[13.5px] font-bold text-[#241F1B] truncate">{activeBooking.mallName}</span>
              </div>

              <button
                type="button"
                onClick={() => setIsAssistanceOpen(true)}
                className="text-[12.5px] font-bold text-[#70675F] hover:text-[#C93B2F] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-[#C93B2F]" />
                <span>Report a Problem</span>
              </button>
            </div>

            {/* Space Grid Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#F3EAE0] border border-[#DED3C7] rounded-xl p-3.5 flex flex-col min-w-0">
                <span className="text-[11px] font-bold uppercase text-[#70675F] truncate">Floor &amp; Zone</span>
                <span className="text-[17px] sm:text-[19px] font-black text-[#241F1B] mt-1 truncate">
                  Floor {activeBooking.slotDetails?.floor || "B2"}
                </span>
                <span className="text-[12px] text-[#C93B2F] font-bold truncate">{activeBooking.slotDetails?.zone || "Zone A"}</span>
              </div>

              <div className="bg-[#F3EAE0] border border-[#DED3C7] rounded-xl p-3.5 flex flex-col min-w-0">
                <span className="text-[11px] font-bold uppercase text-[#70675F] truncate">Assigned Space</span>
                <span className="text-[17px] sm:text-[19px] font-black text-[#C93B2F] mt-1 truncate">
                  Slot {activeBooking.slotDetails?.slotNumber || activeBooking.slotId}
                </span>
                <span className="text-[12px] text-[#70675F] font-semibold truncate">
                  {isPillarConfirmed ? (activeBooking.confirmedPillar || activeBooking.slotDetails?.pillar) : activeBooking.slotDetails?.pillar}
                </span>
              </div>

              <div className="bg-[#F3EAE0] border border-[#DED3C7] rounded-xl p-3.5 flex flex-col min-w-0">
                <span className="text-[11px] font-bold uppercase text-[#70675F] truncate">Entry Time</span>
                <span className="text-[15px] sm:text-[17px] font-bold text-[#241F1B] mt-1 truncate">
                  {new Date(activeBooking.entryTime).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-[12px] text-[#70675F] truncate">
                  {new Date(activeBooking.entryTime).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </span>
              </div>

              <div className="bg-[#F3EAE0] border border-[#DED3C7] rounded-xl p-3.5 flex flex-col min-w-0">
                <span className="text-[11px] font-bold uppercase text-[#70675F] truncate">Live Duration</span>
                <span className="text-[17px] sm:text-[19px] font-black text-[#241F1B] mt-1 flex items-center gap-1.5 truncate">
                  <Clock className="w-4 h-4 text-[#C93B2F] shrink-0" />
                  <span className="truncate">{liveDuration}</span>
                </span>
                <span className="text-[12px] text-[#2F7D5A] font-bold truncate">Active In Mall</span>
              </div>
            </div>

            {/* 4-Stage Status Timeline */}
            <div className="bg-[#F3EAE0] border border-[#DED3C7] rounded-xl p-4 sm:p-5 flex flex-col gap-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#70675F]">
                Parking Session Timeline
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative">
                {/* Step 1 */}
                <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-[#FFFFFF] border border-[#2F7D5A]/40 min-w-0">
                  <div className="flex items-center gap-1.5 text-[#2F7D5A] text-[12px] font-bold truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">1. Vehicle Detected</span>
                  </div>
                  <span className="text-[11px] text-[#70675F] truncate">Entry gate verified</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-[#FFFFFF] border border-[#2F7D5A]/40 min-w-0">
                  <div className="flex items-center gap-1.5 text-[#2F7D5A] text-[12px] font-bold truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">2. Space Assigned</span>
                  </div>
                  <span className="text-[11px] text-[#70675F] truncate">Slot {activeBooking.slotDetails?.slotNumber} allocated</span>
                </div>

                {/* Step 3 */}
                <div
                  className={`flex flex-col gap-1 p-2.5 rounded-lg border min-w-0 ${
                    isPillarConfirmed
                      ? "bg-[#FFFFFF] border-[#2F7D5A]/40 text-[#2F7D5A]"
                      : "bg-[#FFFFFF] border-[#C93B2F] text-[#C93B2F]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[12px] font-bold truncate">
                    {isPillarConfirmed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#C93B2F] animate-pulse shrink-0" />
                    )}
                    <span className="truncate">3. Pillar Confirmed</span>
                  </div>
                  <span className="text-[11px] text-[#70675F] truncate">
                    {isPillarConfirmed ? `${activeBooking.confirmedPillar || "Pillar"} verified` : "Action needed"}
                  </span>
                </div>

                {/* Step 4 */}
                <div
                  className={`flex flex-col gap-1 p-2.5 rounded-lg border min-w-0 ${
                    activeBooking.status === "COMPLETED"
                      ? "bg-[#FFFFFF] border-[#2F7D5A]/40 text-[#2F7D5A]"
                      : isPillarConfirmed
                      ? "bg-[#FFFFFF] border-[#DED3C7] text-[#241F1B]"
                      : "bg-[#F3EAE0] border-[#DED3C7] text-[#938980]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[12px] font-bold truncate">
                    {activeBooking.status === "COMPLETED" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="truncate">4. Ready to Exit</span>
                  </div>
                  <span className="text-[11px] text-[#70675F] truncate">Digital pass active</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── 5. NO ACTIVE SESSION COMPACT EMPTY STATE ── */
          <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
            <div className="w-14 h-14 rounded-2xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center">
              <Car className="w-7 h-7" />
            </div>
            <div className="max-w-[480px]">
              <h3 className="text-[20px] font-bold text-[#241F1B]">No active parking session</h3>
              <p className="text-[14px] text-[#70675F] mt-1 leading-relaxed">
                Your parking tools will activate when an operator assigns a space to your vehicle{" "}
                {vehicleNumber && (
                  <span className="font-mono text-[#241F1B] font-bold">({vehicleNumber})</span>
                )}
                .
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-11 px-5 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[14px] flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                <span>Refresh Assignment</span>
              </button>
            </div>
          </div>
        )}

        {/* ── 4. FOUR DASHBOARD OPTIONS (RESPONSIVE TAB SELECTOR) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Option 1: Find My Car */}
          <button
            type="button"
            onClick={() => setActiveTab("find-my-car")}
            disabled={!hasActiveSession}
            className={`min-h-[90px] p-4 rounded-2xl border text-left flex flex-col justify-between transition-all relative cursor-pointer ${
              activeTab === "find-my-car"
                ? "bg-[#FFFFFF] border-2 border-[#C93B2F] shadow-[0_8px_24px_rgba(70,48,35,0.08)] ring-2 ring-[#C93B2F]/20"
                : hasActiveSession
                ? "bg-[#FFFFFF] border-[#DED3C7] hover:bg-[#F3EAE0] hover:border-[#CBBCAE]"
                : "bg-[#F3EAE0] border-[#DED3C7] opacity-65 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  activeTab === "find-my-car"
                    ? "bg-[#C93B2F] text-white"
                    : "bg-[#F3EAE0] text-[#70675F]"
                }`}
              >
                <MapPin className="w-5 h-5" />
              </div>
              {!hasActiveSession && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF7F2] text-[#938980] border border-[#DED3C7] uppercase">
                  Inactive
                </span>
              )}
            </div>
            <div className="mt-2">
              <div className="text-[15px] font-bold text-[#241F1B]">Find My Car</div>
              <div className="text-[12px] text-[#70675F] truncate">
                {hasActiveSession ? "Interactive route map" : "Requires active space"}
              </div>
            </div>
          </button>

          {/* Option 2: Scan QR */}
          <button
            type="button"
            onClick={() => setActiveTab("scan-qr")}
            disabled={!hasActiveSession}
            className={`min-h-[90px] p-4 rounded-2xl border text-left flex flex-col justify-between transition-all relative cursor-pointer ${
              activeTab === "scan-qr"
                ? "bg-[#FFFFFF] border-2 border-[#C93B2F] shadow-[0_8px_24px_rgba(70,48,35,0.08)] ring-2 ring-[#C93B2F]/20"
                : hasActiveSession
                ? "bg-[#FFFFFF] border-[#DED3C7] hover:bg-[#F3EAE0] hover:border-[#CBBCAE]"
                : "bg-[#F3EAE0] border-[#DED3C7] opacity-65 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  activeTab === "scan-qr"
                    ? "bg-[#C93B2F] text-white"
                    : "bg-[#F3EAE0] text-[#70675F]"
                }`}
              >
                <ScanLine className="w-5 h-5" />
              </div>
              {!hasActiveSession && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF7F2] text-[#938980] border border-[#DED3C7] uppercase">
                  Inactive
                </span>
              )}
            </div>
            <div className="mt-2">
              <div className="text-[15px] font-bold text-[#241F1B]">Scan QR</div>
              <div className="text-[12px] text-[#70675F] truncate">
                {hasActiveSession ? "Confirm pillar location" : "Requires active space"}
              </div>
            </div>
          </button>

          {/* Option 3: History (Always Enabled) */}
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`min-h-[90px] p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-[#FFFFFF] border-2 border-[#C93B2F] shadow-[0_8px_24px_rgba(70,48,35,0.08)] ring-2 ring-[#C93B2F]/20"
                : "bg-[#FFFFFF] border-[#DED3C7] hover:bg-[#F3EAE0] hover:border-[#CBBCAE]"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  activeTab === "history"
                    ? "bg-[#C93B2F] text-white"
                    : "bg-[#F3EAE0] text-[#70675F]"
                }`}
              >
                <HistoryIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2F7D5A]/10 text-[#2F7D5A] border border-[#2F7D5A]/20 uppercase">
                {historyRecords?.length || 0} Records
              </span>
            </div>
            <div className="mt-2">
              <div className="text-[15px] font-bold text-[#241F1B]">History</div>
              <div className="text-[12px] text-[#70675F] truncate">
                Past parking sessions &amp; logs
              </div>
            </div>
          </button>

          {/* Option 4: Exit Pass */}
          <button
            type="button"
            onClick={() => setActiveTab("exit-pass")}
            disabled={!hasActiveSession}
            className={`min-h-[90px] p-4 rounded-2xl border text-left flex flex-col justify-between transition-all relative cursor-pointer ${
              activeTab === "exit-pass"
                ? "bg-[#FFFFFF] border-2 border-[#C93B2F] shadow-[0_8px_24px_rgba(70,48,35,0.08)] ring-2 ring-[#C93B2F]/20"
                : hasActiveSession
                ? "bg-[#FFFFFF] border-[#DED3C7] hover:bg-[#F3EAE0] hover:border-[#CBBCAE]"
                : "bg-[#F3EAE0] border-[#DED3C7] opacity-65 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  activeTab === "exit-pass"
                    ? "bg-[#C93B2F] text-white"
                    : "bg-[#F3EAE0] text-[#70675F]"
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              {!hasActiveSession && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF7F2] text-[#938980] border border-[#DED3C7] uppercase">
                  Inactive
                </span>
              )}
            </div>
            <div className="mt-2">
              <div className="text-[15px] font-bold text-[#241F1B]">Exit Pass</div>
              <div className="text-[12px] text-[#70675F] truncate">
                {hasActiveSession ? "Digital exit barrier QR" : "Requires active space"}
              </div>
            </div>
          </button>
        </div>

        {/* ── TAB CONTENT RENDERING ── */}
        <div className="w-full flex flex-col gap-6">
          {/* TAB 1: FIND MY CAR */}
          {activeTab === "find-my-car" && hasActiveSession && activeBooking && (
            <div className="flex flex-col gap-5">
              {!isPillarConfirmed ? (
                /* Pre-confirmation Call to Action */
                <div className="bg-[#FFFFFF] border border-[#C93B2F]/40 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-[0_8px_24px_rgba(70,48,35,0.07)]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center shrink-0">
                      <ScanLine className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#C93B2F]">
                        Step Required
                      </span>
                      <h3 className="text-[19px] sm:text-[21px] font-bold text-[#241F1B] mt-0.5">
                        Confirm where you parked
                      </h3>
                      <p className="text-[13.5px] text-[#70675F] mt-1 max-w-[460px] leading-relaxed">
                        Scan the QR code on your parking pillar ({activeBooking.slotDetails?.pillar || "Pillar"} · {activeBooking.slotDetails?.slotNumber}) to activate walking route guidance.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("scan-qr")}
                    className="h-12 px-6 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[14px] flex items-center gap-2 shrink-0 transition-all cursor-pointer shadow-xs"
                  >
                    <ScanLine className="w-4 h-4" />
                    <span>Scan Pillar QR Now</span>
                  </button>
                </div>
              ) : (
                /* Confirmed Find My Car View: Two-Column Desktop (2/3 Map, 1/3 Details) */
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5">
                  {/* Left 2/3 Column: Map & Controls */}
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.07)]">
                      {/* Map Mode Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Compass className="w-5 h-5 text-[#C93B2F]" />
                          <span className="text-[15px] font-bold text-[#241F1B]">Indoor Navigation Guidance</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#F3EAE0] p-1 rounded-xl border border-[#DED3C7]">
                          <button
                            type="button"
                            onClick={() => setMapMode("3D")}
                            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                              mapMode === "3D" ? "bg-[#C93B2F] text-white shadow-xs" : "text-[#70675F] hover:text-[#241F1B]"
                            }`}
                          >
                            Interactive View
                          </button>
                          <button
                            type="button"
                            onClick={() => setMapMode("2D")}
                            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                              mapMode === "2D" ? "bg-[#C93B2F] text-white shadow-xs" : "text-[#70675F] hover:text-[#241F1B]"
                            }`}
                          >
                            Floor Plan
                          </button>
                        </div>
                      </div>

                      {/* Map Canvas */}
                      <div className="w-full h-[360px] sm:h-[460px] rounded-xl overflow-hidden relative border border-[#DED3C7]">
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
                  <div className="flex flex-col gap-4">
                    {/* Landmark Selector Card */}
                    <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-3.5 shadow-[0_8px_24px_rgba(70,48,35,0.07)]">
                      <div className="flex items-center justify-between pb-2.5 border-b border-[#DED3C7]">
                        <span className="text-[12px] font-bold uppercase text-[#70675F]">
                          Starting Landmark
                        </span>
                        <span className="text-[12px] text-[#2F7D5A] font-bold">
                          {routeData?.totalDistanceMeters || 36}m ({routeData?.walkTimeMinutes || 1} min)
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {LANDMARKS.map((landmark) => (
                          <button
                            key={landmark.id}
                            type="button"
                            onClick={() => setSelectedLandmarkId(landmark.id)}
                            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                              selectedLandmarkId === landmark.id
                                ? "bg-[#F9E3DE] border-[#C93B2F] text-[#241F1B]"
                                : "bg-[#FFFFFF] border-[#DED3C7] text-[#70675F] hover:bg-[#F3EAE0]"
                            }`}
                          >
                            <Building2
                              className={`w-4 h-4 shrink-0 mt-0.5 ${
                                selectedLandmarkId === landmark.id ? "text-[#C93B2F]" : "text-[#70675F]"
                              }`}
                            />
                            <div>
                              <div className="text-[13.5px] font-bold text-[#241F1B] leading-tight">{landmark.name}</div>
                              <div className="text-[11.5px] text-[#70675F] mt-0.5">
                                {landmark.description}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Turn-by-turn Directions */}
                    <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col gap-3 shadow-[0_8px_24px_rgba(70,48,35,0.07)]">
                      <div className="text-[12px] font-bold uppercase tracking-wider text-[#70675F] flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-[#C93B2F]" />
                        <span>Turn-by-Turn Route</span>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        {routeData?.directions.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-[13px] leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-[#F9E3DE] text-[#C93B2F] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-[#241F1B]">{step}</span>
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
            <div className="flex flex-col gap-5">
              {!hasActiveSession || !activeBooking ? (
                <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
                  <ScanLine className="w-8 h-8 text-[#70675F]" />
                  <h4 className="text-[18px] font-bold text-[#241F1B]">QR Scanner is Inactive</h4>
                  <p className="text-[14px] text-[#70675F] max-w-[400px]">
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
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 sm:p-7 flex flex-col gap-5 shadow-[0_8px_24px_rgba(70,48,35,0.07)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DED3C7]">
                <div>
                  <h3 className="text-[18px] font-bold text-[#241F1B] flex items-center gap-2.5">
                    <HistoryIcon className="w-5 h-5 text-[#C93B2F]" />
                    <span>Customer Parking History</span>
                  </h3>
                  <p className="text-[13.5px] text-[#70675F] mt-0.5">
                    Verified log of previous parking stays for vehicle{" "}
                    <span className="font-mono text-[#241F1B] font-bold">{vehicleNumber || "your account"}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-10 px-4 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[13px] font-bold text-[#241F1B] hover:bg-[#F3EAE0] flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#C93B2F] ${refreshing ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {historyRecords === undefined ? (
                /* Loading Skeleton */
                <div className="flex flex-col gap-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-[#F3EAE0] rounded-xl border border-[#DED3C7]" />
                  ))}
                </div>
              ) : historyRecords.length === 0 ? (
                /* Empty State */
                <div className="py-10 text-center flex flex-col items-center justify-center gap-2.5">
                  <HistoryIcon className="w-8 h-8 text-[#70675F]" />
                  <h4 className="text-[16px] font-bold text-[#241F1B]">No past parking records</h4>
                  <p className="text-[13.5px] text-[#70675F] max-w-[360px]">
                    When your parking visits are completed and validated at the exit gate, they will appear here.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Responsive Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-[13.5px]">
                      <thead>
                        <tr className="border-b border-[#DED3C7] bg-[#F3EAE0] text-[11.5px] font-bold uppercase text-[#70675F]">
                          <th className="py-3 px-3 rounded-l-lg">Date</th>
                          <th className="py-3 px-3">Location</th>
                          <th className="py-3 px-3">Space</th>
                          <th className="py-3 px-3">Entry</th>
                          <th className="py-3 px-3">Exit</th>
                          <th className="py-3 px-3 rounded-r-lg">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DED3C7]">
                        {paginatedHistory.map((rec: any) => (
                          <tr key={rec._id} className="hover:bg-[#FAF7F2] transition-colors">
                            <td className="py-3.5 px-3 text-[#241F1B] font-semibold">
                              {new Date(rec.entryTime).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-3.5 px-3 text-[#70675F]">
                              {rec.mallName || "Central Mall"} · Floor {rec.floor || "B2"}
                            </td>
                            <td className="py-3.5 px-3 font-mono text-[#C93B2F] font-bold">
                              {rec.slotNumber || rec.slotId} ({rec.pillar || "Pillar"})
                            </td>
                            <td className="py-3.5 px-3 text-[#70675F]">
                              {new Date(rec.entryTime).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="py-3.5 px-3 text-[#70675F]">
                              {rec.exitTime
                                ? new Date(rec.exitTime).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "In Progress"}
                            </td>
                            <td className="py-3.5 px-3">
                              <span
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                                  rec.status === "COMPLETED"
                                    ? "bg-[#2F7D5A]/10 text-[#2F7D5A] border-[#2F7D5A]/30"
                                    : rec.status === "ACTIVE"
                                    ? "bg-[#C93B2F]/10 text-[#C93B2F] border-[#C93B2F]/30"
                                    : "bg-[#F3EAE0] text-[#70675F] border-[#DED3C7]"
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
                  <div className="sm:hidden flex flex-col gap-3">
                    {paginatedHistory.map((rec: any) => (
                      <div
                        key={rec._id}
                        className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-3.5 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-bold text-[#241F1B]">
                            {new Date(rec.entryTime).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              rec.status === "COMPLETED"
                                ? "bg-[#2F7D5A]/10 text-[#2F7D5A] border-[#2F7D5A]/30"
                                : "bg-[#C93B2F]/10 text-[#C93B2F] border-[#C93B2F]/30"
                            }`}
                          >
                            {rec.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="font-mono text-[#C93B2F] font-bold">
                            Space {rec.slotNumber || rec.slotId}
                          </span>
                          <span className="text-[#70675F]">
                            {new Date(rec.entryTime).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalHistoryPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-[#DED3C7]">
                      <span className="text-[12px] text-[#70675F]">
                        Page {historyPage} of {totalHistoryPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={historyPage <= 1}
                          onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                          className="px-3 py-1.5 rounded-lg border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] disabled:opacity-40 text-[12.5px] font-bold transition-all cursor-pointer"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          disabled={historyPage >= totalHistoryPages}
                          onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                          className="px-3 py-1.5 rounded-lg border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] disabled:opacity-40 text-[12.5px] font-bold transition-all cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 4: EXIT PASS */}
          {activeTab === "exit-pass" && hasActiveSession && activeBooking && (
            <div className="max-w-[560px] mx-auto w-full bg-[#FFFFFF] border border-[#DED3C7] rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center gap-6 shadow-[0_8px_24px_rgba(70,48,35,0.08)]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2F7D5A]/10 border border-[#2F7D5A]/30 text-[#2F7D5A] text-[11px] font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  AUTHENTICATED DIGITAL PASS
                </div>
                <h3 className="text-[22px] font-black text-[#241F1B]">Exit Barrier Clearance Pass</h3>
                <p className="text-[13.5px] text-[#70675F] mt-1">
                  Scan this pass at the exit gate camera for automated gate lift.
                </p>
              </div>

              {/* QR Container */}
              <div className="p-4 bg-[#FAF7F2] border border-[#DED3C7] rounded-2xl shadow-xs">
                <QRCodeSVG
                  value={activeBooking.exitPassToken || activeBooking.customerAccessToken}
                  size={200}
                  level="H"
                />
              </div>

              {/* Fallback Code Box */}
              <div className="w-full bg-[#F3EAE0] border border-[#DED3C7] rounded-xl p-4 flex flex-col items-center gap-1">
                <span className="text-[11px] font-bold uppercase text-[#70675F]">
                  Manual Fallback Code
                </span>
                <span className="text-[22px] font-mono font-black text-[#C93B2F] tracking-widest">
                  {activeBooking.fallbackCode || "N/A"}
                </span>
                <span className="text-[11px] text-[#70675F] mt-0.5">
                  Provide this code to the operator if QR scan is unavailable
                </span>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 text-left text-[12.5px] pt-3 border-t border-[#DED3C7]">
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                  <span className="text-[#70675F] block text-[11px]">Vehicle</span>
                  <span className="font-mono font-bold text-[#241F1B]">{activeBooking.vehicleNumber}</span>
                </div>
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7]">
                  <span className="text-[#70675F] block text-[11px]">Space</span>
                  <span className="font-bold text-[#241F1B]">
                    Slot {activeBooking.slotDetails?.slotNumber || activeBooking.slotId}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Customer Assistance Modal */}
      <CustomerAssistanceModal
        isOpen={isAssistanceOpen}
        onClose={() => setIsAssistanceOpen(false)}
        bookingId={activeBooking?._id}
        vehicleNumber={vehicleNumber}
        mallName={activeBooking?.mallName}
        slotNumber={activeBooking?.slotDetails?.slotNumber}
        floor={activeBooking?.slotDetails?.floor}
        pillar={activeBooking?.confirmedPillar || activeBooking?.slotDetails?.pillar}
      />
    </div>
  );
}
