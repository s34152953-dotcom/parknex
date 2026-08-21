"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ParkingSlot } from "@/lib/parking/nearestSlot";
import AdminParkingMap from "@/components/admin/AdminParkingMap";
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
  ShieldCheck,
  Send,
} from "lucide-react";
import Link from "next/link";

export default function AdminBookingPage() {
  const [floor, setFloor] = useState<string>("B2");
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [nearestSlot, setNearestSlot] = useState<ParkingSlot | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [stats, setStats] = useState({ total: 0, available: 0, occupied: 0, reserved: 0 });
  const [loading, setLoading] = useState(true);

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

  // Fetch Slots
  const fetchSlots = useCallback(async (selectedFloor: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/slots?floor=${selectedFloor}`);
      const data = await res.json();
      if (data.success) {
        setSlots(data.slots);
        setNearestSlot(data.nearestAvailableSlot);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load slots:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots(floor);
  }, [floor, fetchSlots]);

  // Handle slot selection
  const handleSelectSlot = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setFormError(null);
    setBookedResult(null);
  };

  // Handle Quick Select Nearest
  const handleSelectNearest = () => {
    if (nearestSlot) {
      setSelectedSlot(nearestSlot);
      setFormError(null);
      setBookedResult(null);
    }
  };

  // Handle Confirm Booking
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    const cleanPlate = vehicleNumber.trim().toUpperCase();
    const cleanPhone = phoneNumber.trim();

    if (!cleanPlate) {
      setFormError("Please enter vehicle number plate.");
      return;
    }

    if (!cleanPhone || cleanPhone.length < 8) {
      setFormError("Please enter a valid customer phone number.");
      return;
    }

    const fullPhone = cleanPhone.startsWith("+") ? cleanPhone : `${countryCode} ${cleanPhone}`;

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleNumber: cleanPlate,
          phoneNumber: fullPhone,
          slotId: selectedSlot.id,
          mallName: "Central Mall Grand",
          originUrl: typeof window !== "undefined" ? window.location.origin : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.error || "Failed to confirm booking.");
        // Refresh slots in case of double-booking
        fetchSlots(floor);
        return;
      }

      setBookedResult(data.booking);
      // Refresh slot counts & occupied state
      fetchSlots(floor);
    } catch (err: any) {
      setFormError(err.message || "Network error confirming booking.");
    } finally {
      setSubmitting(false);
    }
  };

  // Resend SMS
  const handleResendSms = async () => {
    if (!bookedResult?.id) return;
    setResendingSms(true);
    setSmsStatusMessage(null);
    try {
      const res = await fetch("/api/bookings/resend-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookedResult.id,
          originUrl: window.location.origin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSmsStatusMessage("SMS resent successfully!");
        setBookedResult((prev: any) => ({ ...prev, smsStatus: "SENT" }));
      } else {
        setSmsStatusMessage("SMS delivery failed. Check phone format.");
      }
    } catch (err: any) {
      setSmsStatusMessage("Network error resending SMS.");
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

  const handleBookAnother = () => {
    setSelectedSlot(null);
    setBookedResult(null);
    setVehicleNumber("");
    setPhoneNumber("");
    setFormError(null);
    fetchSlots(floor);
  };

  return (
    <div className="w-full p-6 sm:p-8 lg:p-10 max-w-[1700px] mx-auto flex flex-col gap-8">
      {/* ── Top Metrics & Floor Switcher Bar ─────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-[#EAE3D9]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-bold text-[#D84A2B] uppercase tracking-wider">
              OPERATIONAL BOOKING STATION
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[30px] font-bold text-[#1C1917] tracking-tight">
            Central Mall Grand Parking
          </h1>
          <p className="text-[13.5px] text-[#78716C] mt-0.5">
            Assign parking slots to incoming vehicles and dispatch automated SMS navigation links
          </p>
        </div>

        {/* Floor selector & stats */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Floor Switcher */}
          <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-[#E2D9CC] shadow-xs">
            {["B2", "B1", "G", "ALL"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFloor(f);
                  setSelectedSlot(null);
                }}
                className={`h-9 px-4 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                  floor === f
                    ? "bg-[#D84A2B] text-white shadow-xs"
                    : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF7F2]"
                }`}
              >
                {f === "ALL" ? "All Levels" : `Floor ${f}`}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchSlots(floor)}
            disabled={loading}
            className="h-11 w-11 rounded-2xl bg-white border border-[#E2D9CC] flex items-center justify-center text-[#78716C] hover:text-[#D84A2B] hover:border-[#D84A2B]/40 transition-colors shadow-xs cursor-pointer"
            title="Refresh availability"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#D84A2B]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Summary Stats Strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4.5">
        <div className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-5 shadow-[0_4px_20px_rgba(80,50,20,0.02)]">
          <p className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider">Total Spaces</p>
          <p className="text-[26px] font-extrabold text-[#1C1917] mt-1">{stats.total}</p>
          <p className="text-[12px] text-[#78716C] mt-0.5">Configured layout</p>
        </div>

        <div className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-5 shadow-[0_4px_20px_rgba(80,50,20,0.02)]">
          <p className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider">Available Spaces</p>
          <p className="text-[26px] font-extrabold text-[#10B981] mt-1">{stats.available}</p>
          <p className="text-[12px] text-[#10B981] mt-0.5">Ready for booking</p>
        </div>

        <div className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-5 shadow-[0_4px_20px_rgba(80,50,20,0.02)]">
          <p className="text-[11px] font-bold text-[#EF4444] uppercase tracking-wider">Occupied Spaces</p>
          <p className="text-[26px] font-extrabold text-[#EF4444] mt-1">{stats.occupied}</p>
          <p className="text-[12px] text-[#78716C] mt-0.5">Active vehicles</p>
        </div>

        <div className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-5 shadow-[0_4px_20px_rgba(80,50,20,0.02)]">
          <p className="text-[11px] font-bold text-[#D84A2B] uppercase tracking-wider">Recommended Nearest</p>
          <p className="text-[22px] font-extrabold text-[#D84A2B] mt-1 truncate">
            {nearestSlot ? `${nearestSlot.floor} · ${nearestSlot.slotNumber}` : "None on Floor"}
          </p>
          <p className="text-[12px] text-[#78716C] mt-0.5">
            {nearestSlot ? `${nearestSlot.distanceFromEntrance}m from entrance` : "Switch level"}
          </p>
        </div>
      </div>

      {/* ── Main Operations Workspace: 70% Map / 30% Booking Panel ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 70% Parking Map */}
        <div className="lg:col-span-8 h-full min-h-[580px]">
          <AdminParkingMap
            slots={slots}
            selectedSlot={selectedSlot}
            nearestSlot={nearestSlot}
            onSelectSlot={handleSelectSlot}
            currentFloor={floor}
          />
        </div>

        {/* Right 30% Slot Details & Booking Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {bookedResult ? (
            /* ── Booking Success Confirmation Panel ── */
            <div className="bg-white border border-[#10B981]/30 rounded-3xl p-7 shadow-[0_12px_40px_rgba(16,185,129,0.06)] flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0">
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
              <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col gap-3 text-[13.5px]">
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
                <div className="flex items-center justify-between">
                  <span className="text-[#78716C]">Entry Time</span>
                  <span className="text-[#1C1917] font-medium">
                    {new Date(bookedResult.entryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {/* SMS Dispatch Status & Action */}
              <div className="p-4 rounded-2xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[13px]">
                  <span className={`w-2 h-2 rounded-full ${bookedResult.smsStatus === "SENT" ? "bg-[#10B981]" : "bg-[#EF4444]"}`} />
                  <span className="font-semibold text-[#1C1917]">
                    {bookedResult.smsStatus === "SENT" ? "SMS Dispatched" : "SMS Pending / Error"}
                  </span>
                </div>
                <button
                  onClick={handleResendSms}
                  disabled={resendingSms}
                  className="h-8 px-3 rounded-xl bg-white border border-[#FADCD5] text-[#D84A2B] text-[12px] font-bold flex items-center gap-1.5 hover:bg-[#FFFDFC] active:scale-[0.98] transition-all cursor-pointer"
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
                <p className="text-[11.5px] font-bold text-[#57534E] uppercase mb-1.5">
                  Secure Customer Link
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={bookedResult.customerLink || ""}
                    className="flex-1 h-11 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9CC] text-[12.5px] text-[#57534E] font-mono truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="h-11 px-4 rounded-xl bg-white border border-[#E2D9CC] text-[#1C1917] text-[13px] font-semibold flex items-center gap-1.5 hover:border-[#D84A2B]/40 transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2.5 pt-2">
                <Link
                  href={`/customer/${bookedResult.customerAccessToken}`}
                  target="_blank"
                  className="w-full min-h-[48px] rounded-xl bg-[#FAF7F2] border border-[#EAE3D9] text-[#1C1917] text-[13.5px] font-semibold flex items-center justify-center gap-2 hover:border-[#D84A2B]/40 hover:bg-white transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-[#D84A2B]" />
                  Preview Customer Portal View
                </Link>

                <button
                  type="button"
                  onClick={handleBookAnother}
                  className="w-full min-h-[50px] rounded-xl bg-[#D84A2B] text-white text-[14.5px] font-semibold flex items-center justify-center gap-2 hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-md shadow-[#D84A2B]/20 cursor-pointer"
                >
                  Book Another Parking Space
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : selectedSlot ? (
            /* ── Selected Slot Booking Form ── */
            <div className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-7 shadow-[0_8px_32px_rgba(80,50,20,0.03)] flex flex-col gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11.5px] font-bold text-[#D84A2B] uppercase tracking-wider">
                    SELECTED SPACE
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSlot(null)}
                    className="text-[12px] text-[#78716C] hover:text-[#EF4444] font-medium cursor-pointer"
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
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-between text-[13px]">
                <span className="text-[#78716C]">Walking from entrance</span>
                <span className="text-[#1C1917] font-bold">{selectedSlot.distanceFromEntrance} meters (~1.5 min)</span>
              </div>

              <form onSubmit={handleConfirmBooking} className="flex flex-col gap-4.5">
                {/* Vehicle Number Plate */}
                <div>
                  <label className="block text-[12px] font-bold text-[#57534E] uppercase mb-1.5">
                    Vehicle Number Plate *
                  </label>
                  <div className="relative">
                    <Car className="w-4 h-4 text-[#A8A29E] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. TS 09 AB 1234"
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9CC] text-[#1C1917] placeholder:text-[#A8A29E] text-[14.5px] font-mono font-bold tracking-wider focus:border-[#D84A2B] focus:ring-2 focus:ring-[#D84A2B]/20 focus:outline-none transition-all uppercase"
                      required
                    />
                  </div>
                </div>

                {/* Customer Phone Number */}
                <div>
                  <label className="block text-[12px] font-bold text-[#57534E] uppercase mb-1.5">
                    Customer Mobile Number (for SMS Pass) *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-12 px-3 rounded-xl bg-[#FAF7F2] border border-[#E2D9CC] text-[#1C1917] text-[13px] font-bold focus:border-[#D84A2B] focus:outline-none"
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+971">+971 (UAE)</option>
                    </select>

                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9CC] text-[#1C1917] placeholder:text-[#A8A29E] text-[14px] font-medium focus:border-[#D84A2B] focus:ring-2 focus:ring-[#D84A2B]/20 focus:outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center gap-2 text-[12.5px] text-[#EF4444] font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full min-h-[52px] rounded-xl bg-[#D84A2B] text-white text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-md shadow-[#D84A2B]/20 cursor-pointer mt-2"
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
            <div className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-7 shadow-[0_8px_32px_rgba(80,50,20,0.03)] flex flex-col gap-6">
              {/* Nearest Space Banner */}
              {nearestSlot ? (
                <div className="p-5 rounded-2xl bg-[#FFF5F2] border border-[#FADCD5] flex flex-col gap-3">
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
                      Floor {nearestSlot.floor} · {nearestSlot.zone} · <strong>{nearestSlot.distanceFromEntrance}m</strong> from entrance
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectNearest}
                    className="h-11 px-5 rounded-xl bg-[#D84A2B] text-white text-[13.5px] font-bold inline-flex items-center justify-center gap-2 hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-xs cursor-pointer"
                  >
                    Select Nearest Space ({nearestSlot.slotNumber})
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-center">
                  <p className="text-[14px] font-bold text-[#1C1917]">No Available Spaces on Floor {floor}</p>
                  <p className="text-[12.5px] text-[#78716C] mt-1">Please select another floor from the switcher above.</p>
                </div>
              )}

              {/* Instructions */}
              <div className="flex flex-col gap-3 text-[13px] text-[#78716C]">
                <p className="font-bold text-[#1C1917] text-[14px]">Operator Instructions:</p>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-center text-[11px] font-bold text-[#1C1917] shrink-0">1</span>
                  <span>Select any green space or accept the nearest recommendation.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FAF7F2] border border-[#EAE3D9] flex items-center justify-center text-[11px] font-bold text-[#1C1917] shrink-0">2</span>
                  <span>Enter incoming vehicle license plate and customer phone.</span>
                </div>
                <div className="flex items-start gap-2.5">
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
