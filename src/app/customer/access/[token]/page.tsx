"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import dynamic from "next/dynamic";
import { QRCodeSVG } from "qrcode.react";
import {
  MapPin,
  Car,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Compass,
  Building2,
  Navigation,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import ParknexLogo from "@/components/ui/ParknexLogo";
import CustomerFloorPlan2D from "@/components/customer/CustomerFloorPlan2D";
import {
  LANDMARKS,
  calculateDijkstraRoute,
} from "@/lib/parking/pathfinding";

// Dynamic 3D Map
const FindMyCar3DMap = dynamic(
  () => import("@/components/parking/FindMyCar3DMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[360px] bg-[#FAF7F2] rounded-2xl border border-[#DED3C7] flex flex-col items-center justify-center p-6 text-center animate-pulse">
        <Loader2 className="w-8 h-8 text-[#C93B2F] animate-spin mb-2" />
        <p className="text-[14px] font-bold text-[#241F1B]">Loading Interactive Map...</p>
      </div>
    ),
  }
);

function formatDuration(entryTime: string): string {
  const diff = Date.now() - new Date(entryTime).getTime();
  if (diff < 0) return "0m";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default function CustomerSecureAccessPage() {
  const params = useParams();
  const token = typeof params.token === "string" ? params.token : "";

  const booking = useQuery(api.bookings.getBookingByToken, token ? { token } : "skip");
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>("mall_entrance");
  const [mapMode, setMapMode] = useState<"3D" | "2D">("3D");
  const [liveDuration, setLiveDuration] = useState("0m");

  useEffect(() => {
    if (!booking?.entryTime) return;
    setLiveDuration(formatDuration(booking.entryTime));
    const interval = setInterval(() => {
      setLiveDuration(formatDuration(booking.entryTime));
    }, 30000);
    return () => clearInterval(interval);
  }, [booking?.entryTime]);

  // Loading State
  if (booking === undefined) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 font-sans">
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-3xl p-8 max-w-md w-full text-center shadow-lg flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#C93B2F] animate-spin" />
          <h2 className="text-[18px] font-bold text-[#241F1B]">Verifying Secure Access Token...</h2>
          <p className="text-[13px] text-[#70675F]">Retrieving your active parking session details.</p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!booking) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 font-sans">
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-3xl p-8 max-w-md w-full text-center shadow-lg flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-[20px] font-black text-[#241F1B]">Invalid or Expired Pass</h2>
          <p className="text-[13.5px] text-[#70675F] leading-relaxed">
            This secure link does not correspond to an active parking session. Tokens expire automatically when a session ends.
          </p>
          <Link
            href="/customer/login"
            className="w-full h-11 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[13.5px] flex items-center justify-center transition-colors shadow-xs"
          >
            Customer Login
          </Link>
        </div>
      </div>
    );
  }

  // Completed or Cancelled Session (Expired Link)
  if (booking.status !== "ACTIVE") {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 font-sans">
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-3xl p-8 max-w-md w-full text-center shadow-lg flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2F7D5A]/15 text-[#2F7D5A] flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-[20px] font-black text-[#241F1B]">Parking Session Completed</h2>
          <p className="text-[13.5px] text-[#70675F] leading-relaxed">
            Your parking session for vehicle <strong className="text-[#241F1B] font-mono">{booking.vehicleNumber}</strong> at {booking.mallName} has been successfully closed.
          </p>
          <p className="text-[12px] text-[#70675F]">
            This secure session pass is no longer active.
          </p>
          <Link
            href="/customer/login"
            className="w-full h-11 rounded-xl bg-[#241F1B] hover:bg-[#3D352E] text-white font-bold text-[13.5px] flex items-center justify-center transition-colors shadow-xs"
          >
            View Parking History
          </Link>
        </div>
      </div>
    );
  }

  const slot = booking.slotDetails;
  const routeData = calculateDijkstraRoute(
    selectedLandmarkId,
    slot?.slotNumber || slot?.slotId || "A-01",
    {
      floor: slot?.floor || "B2",
      zone: slot?.zone || "Zone A",
      pillar: slot?.pillar,
      slotNumber: slot?.slotNumber,
    }
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241F1B] font-sans antialiased flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#DED3C7]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ParknexLogo />
            <div className="hidden sm:flex flex-col border-l border-[#DED3C7] pl-3">
              <span className="text-[11px] font-bold text-[#C93B2F] uppercase tracking-wider">
                Direct Pass Access
              </span>
              <span className="text-[13px] font-bold text-[#241F1B]">{booking.mallName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#2F7D5A]/10 text-[#2F7D5A] border border-[#2F7D5A]/30 text-[11.5px] font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2F7D5A] animate-pulse" />
              ACTIVE SESSION
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Banner */}
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-3xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(70,48,35,0.06)] flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DED3C7]">
            <div>
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#C93B2F]">
                Confirmed Space Allocation
              </span>
              <h1 className="text-[24px] sm:text-[30px] font-black text-[#241F1B] tracking-tight">
                {booking.mallName}
              </h1>
            </div>
            <div className="flex items-center gap-2 font-mono text-[15px] font-bold bg-[#F3EAE0] border border-[#DED3C7] px-4 py-2 rounded-xl text-[#241F1B]">
              <Car className="w-4.5 h-4.5 text-[#C93B2F]" />
              <span>{booking.vehicleNumber}</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F3EAE0] border border-[#DED3C7] rounded-xl p-3.5 flex flex-col">
              <span className="text-[11px] font-bold uppercase text-[#70675F]">Floor</span>
              <span className="text-[20px] font-black text-[#241F1B] mt-0.5">
                Floor {slot?.floor || "B2"}
              </span>
            </div>
            <div className="bg-[#F3EAE0] border border-[#DED3C7] rounded-xl p-3.5 flex flex-col">
              <span className="text-[11px] font-bold uppercase text-[#70675F]">Zone</span>
              <span className="text-[20px] font-black text-[#C93B2F] mt-0.5">
                {slot?.zone || "Zone A"}
              </span>
            </div>
            <div className="bg-[#F3EAE0] border border-[#DED3C7] rounded-xl p-3.5 flex flex-col">
              <span className="text-[11px] font-bold uppercase text-[#70675F]">Space Number</span>
              <span className="text-[20px] font-black text-[#241F1B] mt-0.5">
                Space {slot?.slotNumber || booking.slotId}
              </span>
            </div>
            <div className="bg-[#F3EAE0] border border-[#DED3C7] rounded-xl p-3.5 flex flex-col">
              <span className="text-[11px] font-bold uppercase text-[#70675F]">Live Duration</span>
              <span className="text-[20px] font-black text-[#2F7D5A] mt-0.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C93B2F]" />
                <span>{liveDuration}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Find My Car Navigation */}
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-3xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(70,48,35,0.06)] flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#DED3C7]">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#C93B2F]" />
              <h2 className="text-[18px] font-bold text-[#241F1B]">Find My Car · Indoor Navigation</h2>
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

          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5">
            {/* Map Column */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-[#DED3C7] h-[360px] sm:h-[460px] relative">
              {mapMode === "3D" ? (
                <FindMyCar3DMap
                  routePoints={routeData?.waypointCoordinates}
                  slotNumber={slot?.slotNumber}
                  floor={slot?.floor}
                  zone={slot?.zone}
                  pillar={slot?.pillar}
                  startLandmarkName={routeData?.startLandmark.name}
                  startLandmarkPos={routeData?.startLandmark.position}
                />
              ) : (
                <CustomerFloorPlan2D
                  floor={slot?.floor || "B2"}
                  zone={slot?.zone || "Zone A"}
                  pillar={slot?.pillar || "Pillar"}
                  slotNumber={slot?.slotNumber || booking.slotId}
                  distanceFromEntrance={routeData?.totalDistanceMeters || 36}
                />
              )}
            </div>

            {/* Landmark & Steps Column */}
            <div className="flex flex-col gap-4">
              <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-2xl p-4 flex flex-col gap-3">
                <span className="text-[12px] font-bold uppercase text-[#70675F]">
                  Starting Landmark ({routeData?.totalDistanceMeters || 36}m · {routeData?.walkTimeMinutes || 1} min)
                </span>
                <div className="flex flex-col gap-1.5">
                  {LANDMARKS.map((landmark) => (
                    <button
                      key={landmark.id}
                      type="button"
                      onClick={() => setSelectedLandmarkId(landmark.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                        selectedLandmarkId === landmark.id
                          ? "bg-[#F9E3DE] border-[#C93B2F] text-[#241F1B]"
                          : "bg-[#FFFFFF] border-[#DED3C7] text-[#70675F] hover:bg-[#F3EAE0]"
                      }`}
                    >
                      <Building2 className={`w-4 h-4 shrink-0 mt-0.5 ${selectedLandmarkId === landmark.id ? "text-[#C93B2F]" : "text-[#70675F]"}`} />
                      <span className="text-[12.5px] font-bold text-[#241F1B]">{landmark.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Turn-by-Turn Steps */}
              <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-2xl p-4 flex flex-col gap-2.5">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#70675F] flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-[#C93B2F]" />
                  <span>Turn-by-Turn Route</span>
                </span>
                <div className="flex flex-col gap-2">
                  {routeData?.directions.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[12.5px] leading-relaxed">
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

        {/* Digital Exit Pass */}
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-3xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(70,48,35,0.06)] flex flex-col items-center text-center gap-5">
          <div className="flex items-center gap-2 text-[#C93B2F]">
            <ShieldCheck className="w-6 h-6" />
            <h2 className="text-[20px] font-black text-[#241F1B]">Digital Exit Barrier Pass</h2>
          </div>
          <p className="text-[13.5px] text-[#70675F] max-w-md">
            Scan this QR code at the automated barrier gate camera when driving out of {booking.mallName}.
          </p>

          <div className="p-4 bg-[#FAF7F2] border border-[#DED3C7] rounded-3xl shadow-xs">
            <QRCodeSVG value={booking.exitPassToken || booking.customerAccessToken || token} size={200} />
          </div>

          {booking.fallbackCode && (
            <div className="flex flex-col gap-1 bg-[#FAF7F2] border border-[#DED3C7] px-6 py-3 rounded-2xl">
              <span className="text-[11px] font-mono text-[#70675F] uppercase font-bold">Offline Exit Backup Code</span>
              <span className="text-[22px] font-mono font-black text-[#C93B2F] tracking-widest">{booking.fallbackCode}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
