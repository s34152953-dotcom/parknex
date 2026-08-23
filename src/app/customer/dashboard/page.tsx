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
  Pencil,
  X,
  Phone,
  Palette,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import ParknexLogo from "@/components/ui/ParknexLogo";
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

type ActiveTabType = "find-my-car" | "history" | "exit-pass";

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
  const updateVehicleMutation = useMutation(api.users.updateVehicleDetails);

  const vehicleNumber = user?.vehicleNumber || "";

  // Edit Vehicle Modal State
  const [isEditVehicleOpen, setIsEditVehicleOpen] = useState(false);
  const [editPlate, setEditPlate] = useState("");
  const [editType, setEditType] = useState<"sedan" | "suv" | "hatchback" | "ev" | "motorcycle">("sedan");
  const [editMake, setEditMake] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editColour, setEditColour] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isUpdatingVehicle, setIsUpdatingVehicle] = useState(false);
  const [editVehicleError, setEditVehicleError] = useState("");
  const [editVehicleSuccess, setEditVehicleSuccess] = useState(false);

  const openEditModal = () => {
    setEditPlate(user?.vehicleNumber || "");
    setEditType((user as any)?.vehicleType || "sedan");
    setEditMake((user as any)?.vehicleMake || "");
    setEditModel((user as any)?.vehicleModel || "");
    setEditColour((user as any)?.vehicleColour || "");
    setEditPhone((user as any)?.phoneNumber || "");
    setEditVehicleError("");
    setEditVehicleSuccess(false);
    setIsEditVehicleOpen(true);
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlate = editPlate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().trim();
    if (!cleanPlate) {
      setEditVehicleError("Please provide a valid vehicle license plate number.");
      return;
    }
    if (!userEmail) return;

    setIsUpdatingVehicle(true);
    setEditVehicleError("");
    setEditVehicleSuccess(false);

    try {
      await updateVehicleMutation({
        email: userEmail,
        vehicleNumber: cleanPlate,
        vehicleType: editType,
        vehicleMake: editMake.trim() || undefined,
        vehicleModel: editModel.trim() || undefined,
        vehicleColour: editColour.trim() || undefined,
        phoneNumber: editPhone.trim() || undefined,
      });
      setEditVehicleSuccess(true);
      setTimeout(() => {
        setIsEditVehicleOpen(false);
        setEditVehicleSuccess(false);
      }, 1000);
    } catch (err: any) {
      setEditVehicleError(err.message || "Failed to update vehicle details.");
    } finally {
      setIsUpdatingVehicle(false);
    }
  };

  const activeBooking = useQuery(
    api.bookings.getActiveBookingByVehicle,
    vehicleNumber ? { vehicleNumber } : "skip"
  );

  const historyRecords = useQuery(
    api.bookings.getHistoryByVehicle,
    vehicleNumber ? { vehicleNumber } : "skip"
  );

  const latestCctvSighting = useQuery(
    api.cctv.getLatestSighting,
    vehicleNumber ? { plateNumber: vehicleNumber } : "skip"
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
        pillar: targetSlot.pillar,
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
              <button
                type="button"
                onClick={openEditModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3EAE0] hover:bg-[#EDE1D4] border border-[#DED3C7] shrink-0 font-mono text-[12px] font-bold text-[#241F1B] transition-colors cursor-pointer"
                title="Edit Vehicle Details"
              >
                <Car className="w-3.5 h-3.5 text-[#C93B2F]" />
                <span>{vehicleNumber}</span>
                <Pencil className="w-3 h-3 text-[#70675F] ml-0.5" />
              </button>
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
              Manage parking navigation, history and your digital exit pass.
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

        {/* Registered Vehicle Profile Bar if user has vehicle assigned */}
        {user !== undefined && vehicleNumber && (
          <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.05)]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[16px] sm:text-[17px] font-black text-[#241F1B] tracking-wide">
                    {vehicleNumber}
                  </span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F3EAE0] text-[#70675F] border border-[#DED3C7]">
                    {(user as any)?.vehicleType || "sedan"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[#70675F] mt-0.5">
                  {((user as any)?.vehicleMake || (user as any)?.vehicleModel) && (
                    <span>
                      {[(user as any)?.vehicleMake, (user as any)?.vehicleModel].filter(Boolean).join(" ")}
                    </span>
                  )}
                  {(user as any)?.vehicleColour && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full border border-[#DED3C7] bg-[#70675F]" />
                      {(user as any).vehicleColour}
                    </span>
                  )}
                  {(user as any)?.phoneNumber && (
                    <span className="flex items-center gap-1 font-mono text-[11.5px]">
                      <Phone className="w-3 h-3 text-[#70675F]" />
                      {(user as any).phoneNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openEditModal}
              className="h-10 px-4 rounded-xl bg-[#FFFFFF] hover:bg-[#F3EAE0] border border-[#DED3C7] text-[#241F1B] text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Pencil className="w-3.5 h-3.5 text-[#C93B2F]" />
              <span>Edit Vehicle Details</span>
            </button>
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
                  {activeBooking.slotDetails?.pillar || "Standard Bay"}
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

            {/* 3-Stage Status Timeline */}
            <div className="bg-[#F3EAE0] border border-[#DED3C7] rounded-xl p-4 sm:p-5 flex flex-col gap-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#70675F]">
                Parking Session Timeline
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 relative">
                {/* Step 1 */}
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-[#FFFFFF] border border-[#2F7D5A]/40 min-w-0">
                  <div className="flex items-center gap-1.5 text-[#2F7D5A] text-[12px] font-bold truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">1. Vehicle Detected</span>
                  </div>
                  <span className="text-[11px] text-[#70675F] truncate">Entry gate verified</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-[#FFFFFF] border border-[#2F7D5A]/40 min-w-0">
                  <div className="flex items-center gap-1.5 text-[#2F7D5A] text-[12px] font-bold truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">2. Space Assigned</span>
                  </div>
                  <span className="text-[11px] text-[#70675F] truncate">Slot {activeBooking.slotDetails?.slotNumber} allocated</span>
                </div>

                {/* Step 3 */}
                <div
                  className={`flex flex-col gap-1 p-3 rounded-lg border min-w-0 ${
                    activeBooking.status === "COMPLETED"
                      ? "bg-[#FFFFFF] border-[#2F7D5A]/40 text-[#2F7D5A]"
                      : "bg-[#FFFFFF] border-[#DED3C7] text-[#241F1B]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[12px] font-bold truncate">
                    {activeBooking.status === "COMPLETED" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#2F7D5A]" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#C93B2F]" />
                    )}
                    <span className="truncate">3. Ready to Exit</span>
                  </div>
                  <span className="text-[11px] text-[#70675F] truncate">Digital exit pass active</span>
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

        {/* ── 4. THREE DASHBOARD ACTION CARDS (RESPONSIVE 3-CARD GRID) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
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

          {/* Option 2: History (Always Enabled) */}
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

          {/* Option 3: Exit Pass */}
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
              {/* Find My Car Two-Column View: 2/3 Map, 1/3 Details */}
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
                          pillar={activeBooking.slotDetails?.pillar}
                          startLandmarkName={routeData?.startLandmark.name}
                          startLandmarkPos={routeData?.startLandmark.position}
                        />
                      ) : (
                        <CustomerFloorPlan2D
                          floor={activeBooking.slotDetails?.floor || "B2"}
                          zone={activeBooking.slotDetails?.zone || "Zone A"}
                          pillar={activeBooking.slotDetails?.pillar || "Pillar"}
                          slotNumber={activeBooking.slotDetails?.slotNumber || activeBooking.slotId}
                          distanceFromEntrance={routeData?.totalDistanceMeters || 36}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Right 1/3 Column: Landmark Selector & Step Guidance */}
                <div className="flex flex-col gap-4">
                  {/* Latest Confirmed CCTV Sighting Card (if sighted) */}
                  {latestCctvSighting && (
                    <div className="bg-[#FFFFFF] border border-[#2F7D5A]/40 rounded-2xl p-4 sm:p-5 flex flex-col gap-2 shadow-[0_8px_24px_rgba(70,48,35,0.07)]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#2F7D5A]/10 text-[#2F7D5A] border border-[#2F7D5A]/25 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D5A] animate-pulse" />
                          CONFIRMED CCTV SIGHTING
                        </span>
                        <span className="text-[11px] text-[#70675F]">
                          {new Date(latestCctvSighting.timestamp).toLocaleTimeString("en-IN")}
                        </span>
                      </div>
                      <div className="text-[13px] font-bold text-[#241F1B]">
                        {latestCctvSighting.cameraName}
                      </div>
                      <div className="flex items-center justify-between text-[11.5px] text-[#70675F] pt-1 border-t border-[#DED3C7]">
                        <span>
                          Floor {latestCctvSighting.floor} · {latestCctvSighting.zone}
                        </span>
                        <span className="font-bold text-[#2F7D5A]">
                          {(latestCctvSighting.confidence * 100).toFixed(1)}% Confidence
                        </span>
                      </div>
                    </div>
                  )}

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
        pillar={activeBooking?.slotDetails?.pillar}
      />

      {/* ── EDIT VEHICLE PROFILE MODAL ── */}
      {isEditVehicleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DED3C7]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[17px] font-black text-[#241F1B]">Edit Vehicle Profile</h3>
                  <p className="text-[12px] text-[#70675F]">Update your vehicle details and preferences</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditVehicleOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#70675F] hover:text-[#241F1B] hover:bg-[#F3EAE0] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error / Success feedback */}
            {editVehicleError && (
              <div className="p-3 rounded-xl bg-[#C93B2F]/10 border border-[#C93B2F]/30 text-[#C93B2F] text-[12.5px] font-semibold flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" />
                <span>{editVehicleError}</span>
              </div>
            )}
            {editVehicleSuccess && (
              <div className="p-3 rounded-xl bg-[#2F7D5A]/10 border border-[#2F7D5A]/30 text-[#2F7D5A] text-[12.5px] font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Vehicle profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdateVehicle} className="flex flex-col gap-4">
              {/* License Plate */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#241F1B]">
                  License Plate Number <span className="text-[#C93B2F]">*</span>
                </label>
                <input
                  type="text"
                  value={editPlate}
                  onChange={(e) => setEditPlate(e.target.value.toUpperCase())}
                  placeholder="e.g. MH02AB1234"
                  required
                  className="h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] font-mono text-[14px] font-bold uppercase focus:outline-none focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE]"
                />
                <span className="text-[11px] text-[#70675F]">
                  Active and upcoming parking assignments link to this plate number.
                </span>
              </div>

              {/* Vehicle Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#241F1B]">Vehicle Class / Type</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as any)}
                  className="h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] text-[13.5px] font-medium focus:outline-none focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE]"
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="ev">Electric Vehicle (EV)</option>
                  <option value="motorcycle">Motorcycle / Two-Wheeler</option>
                </select>
              </div>

              {/* Make & Model in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#241F1B]">Make / Brand</label>
                  <input
                    type="text"
                    value={editMake}
                    onChange={(e) => setEditMake(e.target.value)}
                    placeholder="e.g. Tata, Hyundai, Honda"
                    className="h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] text-[13.5px] focus:outline-none focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#241F1B]">Model</label>
                  <input
                    type="text"
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    placeholder="e.g. Nexon EV, Creta, City"
                    className="h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] text-[13.5px] focus:outline-none focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE]"
                  />
                </div>
              </div>

              {/* Colour & Phone in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#241F1B]">Vehicle Colour</label>
                  <input
                    type="text"
                    value={editColour}
                    onChange={(e) => setEditColour(e.target.value)}
                    placeholder="e.g. White, Silver, Black"
                    className="h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] text-[13.5px] focus:outline-none focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#241F1B]">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] font-mono text-[13.5px] focus:outline-none focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE]"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DED3C7]">
                <button
                  type="button"
                  onClick={() => setIsEditVehicleOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] text-[#241F1B] text-[13px] font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingVehicle || !editPlate.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[13px] font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUpdatingVehicle ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Vehicle Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
