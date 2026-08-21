"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { ParkingSlot } from "@/lib/parking/nearestSlot";
import AdminParkingMap from "@/components/admin/AdminParkingMap";
import WebGLBoundary from "@/components/parking/WebGLBoundary";
import { isWebGLAvailable } from "@/components/parking/InteractiveParkingMap3D";
import {
  Sparkles,
  Check,
  Car,
  Phone,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Copy,
  AlertCircle,
  Clock,
  Send,
  Layers,
  LayoutGrid,
  Box,
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

// Lazy-load the Three.js 3D component to optimize initial load
const InteractiveParkingMap3D = dynamic(
  () => import("@/components/parking/InteractiveParkingMap3D"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[540px] bg-[#FBF8F3] rounded-[24px] border border-[#EAE3D9] flex flex-col items-center justify-center p-8 text-center animate-pulse">
        <div className="w-12 h-12 rounded-[16px] bg-[#FAF7F2] border border-[#E2D9CC] flex items-center justify-center text-[#D84A2B] mb-3">
          <Box className="w-6 h-6 animate-bounce" />
        </div>
        <p className="text-[14px] font-bold text-[#1C1917]">Initializing 3D Parking Floor Space...</p>
        <p className="text-[12px] text-[#78716C] mt-0.5">Configuring 3D shaders and spatial geometry</p>
      </div>
    ),
  }
);

export default function AdminBookingPage() {
  const [floor, setFloor] = useState<string>("B2");
  const [viewMode, setViewMode] = useState<"2D" | "3D">("3D");
  const [webGLSupported, setWebGLSupported] = useState(true);

  // Convex Real-Time Queries
  const slotsData = useQuery(api.slots.getSlots, { floor });
  const createBooking = useMutation(api.bookings.createBooking);
  const holdSlotMutation = useMutation(api.slots.holdSlot);
  const updateSlotStatus = useMutation(api.slots.updateSlotStatus);
  const retrySmsMutation = useMutation(api.bookings.retrySms);

  const slots = (slotsData?.slots || []).map((s: any) => ({ ...s, id: s.slotId }));
  const nearestSlot = slotsData?.nearestAvailableSlot ? { ...slotsData.nearestAvailableSlot, id: slotsData.nearestAvailableSlot.slotId } : null;
  const stats = slotsData?.stats || null;
  const loading = slotsData === undefined;
  
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Form State
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Success State
  const [bookedResult, setBookedResult] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [resendingSms, setResendingSms] = useState(false);
  const [smsStatusMessage, setSmsStatusMessage] = useState<string | null>(null);

  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  // Mount & Check WebGL Support & Load Preferred View Mode
  useEffect(() => {
    setIsMounted(true);
    const supported = isWebGLAvailable();
    setWebGLSupported(supported);

    const savedMode = typeof window !== "undefined" ? localStorage.getItem("parknex_view_mode") : null;
    if (savedMode === "2D" || savedMode === "3D") {
      setViewMode(supported ? (savedMode as "2D" | "3D") : "2D");
    } else if (!supported) {
      setViewMode("2D");
    }
  }, []);

  const handleToggleViewMode = (mode: "2D" | "3D", isFallback = false) => {
    if (mode === "3D" && !webGLSupported) {
      setFallbackMessage("3D graphics acceleration is not supported on this device.");
      return;
    }
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("parknex_view_mode", mode);
    }
    if (isFallback) {
      setFallbackMessage("3D unavailable on this device. Switched to 2D fallback.");
      setTimeout(() => setFallbackMessage(null), 5000);
    }
  };

  // Automatic real-time updates from Convex completely replace manual fetching!

  // Handle slot selection
  const handleSelectSlot = async (slot: ParkingSlot) => {
    // Release previous if changing
    if (selectedSlot && selectedSlot.id !== slot.id) {
      try { await updateSlotStatus({ slotId: selectedSlot.id, status: "available" }); } catch (e) {}
    }
    setSelectedSlot(slot);
    setFormError(null);
    setBookedResult(null);
    try {
      await holdSlotMutation({ slotId: slot.id });
    } catch (e: any) {
      setFormError(e.message || "Slot just taken. Please select another.");
      setSelectedSlot(null);
    }
  };

  // Handle Quick Select Nearest
  const handleSelectNearest = async () => {
    if (nearestSlot) {
      await handleSelectSlot(nearestSlot);
    }
  };

  // Handle Confirm Booking with validation
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    const cleanPlate = vehicleNumber.trim().toUpperCase().replace(/\s+/g, " ");
    const cleanPhone = phoneNumber.trim();

    if (!cleanPlate || cleanPlate.length < 4) {
      setFormError("Please enter a valid vehicle registration number (e.g. AA 00 BB 0000).");
      return;
    }

    const digitsOnly = cleanPhone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      setFormError("Please enter a valid 10-digit mobile number for SMS dispatch.");
      return;
    }

    const fullPhone = cleanPhone.startsWith("+") ? cleanPhone : `${countryCode} ${digitsOnly}`;

    setSubmitting(true);
    setFormError(null);

    try {
      const result = await createBooking({
        vehicleNumber: cleanPlate,
        phoneNumber: fullPhone,
        slotId: selectedSlot.id,
        mallName: selectedSlot.mallName,
      });

      setBookedResult({
        id: result.bookingId,
        vehicleNumber: cleanPlate,
        slotNumber: selectedSlot.slotNumber,
        floor: selectedSlot.floor,
        zone: selectedSlot.zone,
        customerLink: `${typeof window !== "undefined" ? window.location.origin : ""}/customer/${result.token}`,
      });
    } catch (err: any) {
      setFormError(err.message || "Error confirming booking.");
    } finally {
      setSubmitting(false);
    }
  };

  // Resend SMS via Convex mutation
  const handleResendSms = async () => {
    if (!bookedResult?.id) return;
    setResendingSms(true);
    setSmsStatusMessage(null);
    try {
      await retrySmsMutation({ bookingId: bookedResult.id });
      setSmsStatusMessage("SMS retry queued. Check SMS provider status.");
    } catch (err: any) {
      setSmsStatusMessage(err.message || "Failed to queue SMS retry.");
    } finally {
      setResendingSms(false);
    }
  };

  const handleCopyLink = () => {
    if (bookedResult?.customerLink) {
      navigator.clipboard.writeText(bookedResult.customerLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleBookAnother = async () => {
    if (selectedSlot && !bookedResult) {
       // Release hold if canceling mid-booking
       try { await updateSlotStatus({ slotId: selectedSlot.id, status: "available" }); } catch (e) {}
    }
    setSelectedSlot(null);
    setBookedResult(null);
    setVehicleNumber("");
    setPhoneNumber("");
    setFormError(null);
  };

  return (
    <div className="w-full p-6 sm:p-8 lg:p-10 max-w-[1700px] mx-auto flex flex-col gap-8">
      {/* ── Content Header Row ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE3D9]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11.5px] font-bold text-[#D84A2B] uppercase tracking-wider">
              OPERATIONAL BOOKING STATION
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[32px] font-extrabold text-[#1C1917] tracking-tight">
            {slots.length > 0 ? `${slots[0].mallName} Parking` : "Parking Operations"}
          </h1>
          <p className="text-[14px] text-[#78716C] mt-1">
            Assign parking slots to incoming vehicles and dispatch automated SMS navigation links
          </p>
        </div>

        {fallbackMessage && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#FF5C68]/10 border border-[#FF5C68]/30 rounded-xl text-[12.5px] font-semibold text-[#FF5C68] self-start sm:self-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fallbackMessage}</span>
          </div>
        )}
      </div>

      {/* ── Dedicated Controls Toolbar (Floor Selector & 2D/3D Switcher) ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-white rounded-2xl border border-[#EAE3D9] shadow-xs">
        {/* Floor Level Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["B2", "B1", "G", "ALL"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFloor(f);
                setSelectedSlot(null);
              }}
              className={`h-10 px-4 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                floor === f
                  ? "bg-[#D84A2B] text-white shadow-sm shadow-[#D84A2B]/20"
                  : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF7F2]"
              }`}
            >
              {f === "ALL" ? "All Levels" : `Level ${f}`}
            </button>
          ))}
        </div>

        {/* View Toggle (2D/3D) and Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#EAE3D9]">
            <button
              type="button"
              onClick={() => handleToggleViewMode("3D")}
              className={`h-8 px-3 rounded-lg text-[12px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "3D"
                  ? "bg-white text-[#D84A2B] shadow-xs"
                  : "text-[#78716C] hover:text-[#1C1917]"
              }`}
              title="Interactive 3D Space"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Map</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleViewMode("2D")}
              className={`h-8 px-3 rounded-lg text-[12px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "2D"
                  ? "bg-white text-[#D84A2B] shadow-xs"
                  : "text-[#78716C] hover:text-[#1C1917]"
              }`}
              title="2D Floor Layout Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>2D Grid</span>
            </button>
          </div>

          <button
            onClick={() => {}}
            disabled={loading}
            className="h-10 w-10 rounded-xl bg-white border border-[#EAE3D9] flex items-center justify-center text-[#78716C] hover:text-[#D84A2B] hover:border-[#D84A2B]/40 hover:bg-[#FAF7F2] transition-all shadow-xs cursor-pointer min-w-[40px]"
            title="Refresh availability"
            aria-label="Refresh availability"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#D84A2B]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Summary Stats Strip (Zero-Flashing Skeleton Protected) ───────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {/* Total Spaces */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(80,50,20,0.03)] border border-[#EAE3D9] min-w-0">
          <p className="text-[10px] sm:text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider truncate">Total Spaces</p>
          {loading && !stats ? (
            <div className="h-8 w-16 bg-[#FAF7F2] rounded-lg animate-pulse my-1" />
          ) : (
            <p className="text-[26px] font-extrabold text-[#1C1917] mt-1">{stats?.total ?? 0}</p>
          )}
          <p className="text-[12px] text-[#78716C] mt-0.5">Configured layout</p>
        </div>

        {/* Available */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(80,50,20,0.03)] border border-[#EAE3D9] min-w-0">
          <p className="text-[10px] sm:text-[11px] font-bold text-[#10B981] uppercase tracking-wider truncate">Available Spaces</p>
          {loading && !stats ? (
            <div className="h-8 w-16 bg-[#FAF7F2] rounded-lg animate-pulse my-1" />
          ) : (
            <p className="text-[26px] font-extrabold text-[#10B981] mt-1">{stats?.available ?? 0}</p>
          )}
          <p className="text-[12px] text-[#10B981] mt-0.5 opacity-80">Ready for booking</p>
        </div>

        {/* Occupied */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(80,50,20,0.03)] border border-[#EAE3D9] min-w-0">
          <p className="text-[10px] sm:text-[11px] font-bold text-[#EF4444] uppercase tracking-wider truncate">Occupied Spaces</p>
          {loading && !stats ? (
            <div className="h-8 w-16 bg-[#FAF7F2] rounded-lg animate-pulse my-1" />
          ) : (
            <p className="text-[26px] font-extrabold text-[#EF4444] mt-1">{stats?.occupied ?? 0}</p>
          )}
          <p className="text-[12px] text-[#78716C] mt-0.5">Active vehicles</p>
        </div>

        {/* Nearest Recommended */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(80,50,20,0.03)] border border-[#EAE3D9] min-w-0 border-[#D84A2B]/30 bg-gradient-to-br from-[#FFFFFF] to-[#D84A2B]/5">
          <p className="text-[10px] sm:text-[11px] font-bold text-[#D84A2B] uppercase tracking-wider truncate">Recommended Nearest</p>
          {loading && !nearestSlot ? (
            <div className="h-8 w-28 bg-[#FAF7F2] rounded-lg animate-pulse my-1" />
          ) : (
            <p className="text-[22px] font-extrabold text-[#D84A2B] mt-1 truncate drop-shadow-[0_0_8px_rgba(255,85,51,0.2)]">
              {nearestSlot ? `${nearestSlot.floor} · ${nearestSlot.slotNumber}` : "None on Floor"}
            </p>
          )}
          <p className="text-[12px] text-[#78716C] mt-0.5">
            {nearestSlot ? `${nearestSlot.distanceFromEntrance}m from entrance` : "Switch floor"}
          </p>
        </div>
      </div>

      {/* ── Main Operations Workspace: Map (Left) / Booking Panel (Right) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 68% Parking Map (3D or 2D Grid) */}
        <div className="lg:col-span-8 h-full min-h-[580px]">
          {viewMode === "3D" && webGLSupported ? (
            <WebGLBoundary onFallbackTo2D={() => handleToggleViewMode("2D", true)}>
              <InteractiveParkingMap3D
                slots={slots}
                selectedSlot={selectedSlot}
                nearestSlot={nearestSlot}
                onSelectSlot={handleSelectSlot}
                currentFloor={floor}
                onFallbackTo2D={() => handleToggleViewMode("2D", true)}
              />
            </WebGLBoundary>
          ) : (
            <AdminParkingMap
              slots={slots}
              selectedSlot={selectedSlot}
              nearestSlot={nearestSlot}
              onSelectSlot={handleSelectSlot}
              currentFloor={floor}
            />
          )}
        </div>

        {/* Right 32% Slot Details & Booking Panel (Sticky on Desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
          {bookedResult ? (
            /* ── Booking Success Confirmation Panel ── */
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(80,50,20,0.03)] border border-[#EAE3D9] border-[#10B981]/30 shadow-[0_8px_32px_rgba(34,211,154,0.1)] flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[16px] bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0">
                  <Check className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#10B981]">
                    PARKING CONFIRMED & BOOKED
                  </span>
                  <h3 className="text-[20px] font-extrabold text-[#1C1917]">
                    {bookedResult.vehicleNumber}
                  </h3>
                </div>
              </div>

              {/* Booking Summary Box */}
              <div className="p-5 rounded-[18px] bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col gap-3 text-[13.5px]">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#EAE3D9]">
                  <span className="text-[#78716C]">Assigned Space</span>
                  <span className="text-[#D84A2B] font-extrabold text-[15px]">
                    Floor {bookedResult.floor} · {bookedResult.zone} · {bookedResult.slotNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#EAE3D9]">
                  <span className="text-[#78716C]">Pillar Marker</span>
                  <span className="text-[#1C1917] font-bold">{bookedResult.pillar}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#EAE3D9]">
                  <span className="text-[#78716C]">Customer Phone</span>
                  <span className="text-[#1C1917] font-semibold">{bookedResult.phoneNumber}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#EAE3D9]">
                  <span className="text-[#78716C]">Distance</span>
                  <span className="text-[#1C1917] font-bold">{bookedResult.distanceFromEntrance} meters</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#78716C]">Entry Time</span>
                  <span className="text-[#1C1917] font-medium">
                    {new Date(bookedResult.entryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {/* SMS Dispatch Status & Action */}
              <div className="p-4 rounded-[18px] bg-[#FFFFFF] border border-[#EAE3D9] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[13px]">
                  <span className={`w-2 h-2 rounded-full ${bookedResult.smsStatus === "SENT" ? "bg-[#10B981]" : "bg-[#EF4444]"}`} />
                  <span className="font-semibold text-[#1C1917]">
                    {bookedResult.smsStatus === "SENT" ? "SMS Dispatched" : "SMS Pending / Failed"}
                  </span>
                </div>
                <button
                  onClick={handleResendSms}
                  disabled={resendingSms}
                  className="h-8 px-3 rounded-xl bg-[#FAF7F2] border border-[#E2D9CC] text-[#D84A2B] text-[12px] font-bold flex items-center gap-1.5 hover:bg-[#F5EFE6] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  {resendingSms ? "Sending..." : "Resend SMS"}
                </button>
              </div>

              {smsStatusMessage && (
                <p className="text-[12px] text-center font-medium text-[#10B981] -mt-2">{smsStatusMessage}</p>
              )}

              {/* Customer Access Link & Copy */}
              <div>
                <p className="text-[11.5px] font-bold text-[#A8A29E] uppercase mb-1.5">
                  Secure Customer Access Link
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={bookedResult.customerLink || ""}
                    className="flex-1 h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9CC] text-[12.5px] text-[#78716C] font-mono truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="h-11 px-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9CC] text-[#1C1917] text-[13px] font-semibold flex items-center gap-1.5 hover:border-[#D84A2B]/40 transition-colors cursor-pointer min-w-[44px]"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4">
                <Link
                  href={`/customer/${bookedResult.customerAccessToken}`}
                  target="_blank"
                  className="w-full min-h-[48px] rounded-xl bg-[#FAF7F2] border border-[#E2D9CC] text-[#1C1917] text-[13.5px] font-semibold flex items-center justify-center gap-2 hover:border-[#D84A2B]/40 hover:bg-[#F5EFE6] transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-[#D84A2B]" />
                  Preview Customer Portal View
                </Link>

                <button
                  type="button"
                  onClick={handleBookAnother}
                  className="h-11 px-6 rounded-2xl bg-[#D84A2B] text-white font-bold inline-flex items-center justify-center gap-2 hover:bg-[#C23E21] transition-all shadow-md cursor-pointer w-full min-h-[50px] text-[14.5px]"
                >
                  Book Another Parking Space
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : selectedSlot ? (
            /* ── Selected Slot Booking Form ── */
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(80,50,20,0.03)] border border-[#EAE3D9] flex flex-col gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11.5px] font-bold text-[#D84A2B] uppercase tracking-wider">
                    SELECTED SPACE
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSlot(null)}
                    className="text-[12px] text-[#78716C] hover:text-[#EF4444] font-medium cursor-pointer transition-colors"
                  >
                    Cancel Selection
                  </button>
                </div>
                <h3 className="text-[24px] font-extrabold text-[#1C1917] tracking-tight">
                  {selectedSlot.slotNumber}
                </h3>
                <p className="text-[13.5px] text-[#78716C]">
                  Floor {selectedSlot.floor} · {selectedSlot.zone} · {selectedSlot.pillar}
                </p>
              </div>

              {/* Distance badge */}
              <div className="p-4 rounded-[18px] bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-between text-[13px]">
                <span className="text-[#78716C]">Walking distance</span>
                <span className="text-[#1C1917] font-bold">{selectedSlot.distanceFromEntrance} meters (~1.5 min)</span>
              </div>

              <form onSubmit={handleConfirmBooking} className="flex flex-col gap-5">
                {/* Vehicle Number Plate */}
                <div>
                  <label htmlFor="vehicle-plate-input" className="block text-[12px] font-bold text-[#A8A29E] uppercase mb-1.5">
                    Vehicle Number Plate *
                  </label>
                  <div className="relative">
                    <Car className="w-4 h-4 text-[#78716C] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="vehicle-plate-input"
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      placeholder="Enter Vehicle Plate"
                      className="w-full h-12 pl-11 pr-4 rounded-[14px] bg-[#FAF7F2] border border-[#EAE3D9] text-[#1C1917] placeholder:text-[#A8A29E] text-[14.5px] font-mono font-bold tracking-wider focus:border-[#D84A2B] focus-visible:ring-2 focus-visible:ring-[#D84A2B]/20 focus:outline-none transition-all uppercase"
                      required
                    />
                  </div>
                </div>

                {/* Customer Phone Number */}
                <div>
                  <label htmlFor="phone-number-input" className="block text-[12px] font-bold text-[#A8A29E] uppercase mb-1.5">
                    Customer Mobile Number (for SMS Pass) *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      aria-label="Country Code"
                      className="h-12 px-3 rounded-[14px] bg-[#FAF7F2] border border-[#EAE3D9] text-[#1C1917] text-[13px] font-bold focus:border-[#D84A2B] focus:outline-none"
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+971">+971 (UAE)</option>
                    </select>

                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="phone-number-input"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter Phone Number"
                        className="w-full h-12 pl-10 pr-4 rounded-[14px] bg-[#FAF7F2] border border-[#EAE3D9] text-[#1C1917] placeholder:text-[#A8A29E] text-[14px] font-medium focus:border-[#D84A2B] focus-visible:ring-2 focus-visible:ring-[#D84A2B]/20 focus:outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center gap-2 text-[12.5px] text-[#EF4444] font-medium" role="alert">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 px-6 rounded-2xl bg-[#D84A2B] text-white font-bold inline-flex items-center justify-center gap-2 hover:bg-[#C23E21] transition-all shadow-md cursor-pointer w-full min-h-[52px] text-[15px] mt-2 disabled:opacity-50"
                >
                  {submitting ? (
                    "Assigning Space & Sending SMS..."
                  ) : (
                    <>
                      Confirm Booking & Send SMS
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* ── Default Recommendation & Selection Prompt ── */
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(80,50,20,0.03)] border border-[#EAE3D9] flex flex-col gap-6">
              {/* Nearest Space Banner */}
              {nearestSlot ? (
                <div className="p-5 rounded-[18px] bg-[#FAF7F2] border border-[#E2D9CC] flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[#D84A2B]">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[11.5px] font-extrabold uppercase tracking-wider">
                      PARKNEX Nearest Space Recommendation
                    </span>
                  </div>
                  <div>
                    <p className="text-[24px] font-extrabold text-[#1C1917]">
                      {nearestSlot.slotNumber} · {nearestSlot.pillar}
                    </p>
                    <p className="text-[13px] text-[#78716C] mt-0.5">
                      Floor {nearestSlot.floor} · {nearestSlot.zone} · <strong className="text-[#1C1917]">{nearestSlot.distanceFromEntrance}m</strong> from entrance
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectNearest}
                    className="h-11 px-6 rounded-2xl bg-[#D84A2B] text-white font-bold inline-flex items-center justify-center gap-2 hover:bg-[#C23E21] transition-all shadow-md cursor-pointer h-11 w-full"
                  >
                    Select Nearest Space ({nearestSlot.slotNumber})
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-[18px] bg-[#FAF7F2] border border-[#EAE3D9] text-center">
                  <p className="text-[14px] font-bold text-[#1C1917]">No Available Spaces on Floor {floor}</p>
                  <p className="text-[12.5px] text-[#78716C] mt-1">Please select another floor from the switcher above.</p>
                </div>
              )}

              {/* Instructions */}
              <div className="flex flex-col gap-3 text-[13px] text-[#78716C]">
                <p className="font-bold text-[#1C1917] text-[14px]">Operator Instructions:</p>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-center text-[11px] font-bold text-[#1C1917] shrink-0">1</span>
                  <span>Select any green space directly in 3D or 2D grid mode.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-center text-[11px] font-bold text-[#1C1917] shrink-0">2</span>
                  <span>Enter incoming vehicle license plate and customer phone.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-center text-[11px] font-bold text-[#1C1917] shrink-0">3</span>
                  <span>Confirm to dispatch the live navigation link and Exit QR via SMS.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
