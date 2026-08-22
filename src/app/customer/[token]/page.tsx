"use client";

import React, { useState, useEffect, use } from "react";
import { QRCodeSVG } from "qrcode.react";
import CustomerFloorPlan2D from "@/components/customer/CustomerFloorPlan2D";
import {
  Car,
  Clock,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ParknexLogo from "@/components/ui/ParknexLogo";

interface CustomerBookingData {
  id: string;
  bookingNumber: string;
  vehicleNumber: string;
  phoneNumber: string;
  mallName: string;
  floor: string;
  zone: string;
  pillar: string;
  slotNumber: string;
  distanceFromEntrance: number;
  entryTime: string;
  exitTime: string | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  qrToken: string;
  customerAccessToken: string;
}

export default function CustomerFindMySpacePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [booking, setBooking] = useState<any | null>(null);
  const [slot, setSlot] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [durationStr, setDurationStr] = useState("0h 0m");

  const bookingData = useQuery(api.bookings.getBookingByToken, { token });
  const loading = bookingData === undefined;
  
  useEffect(() => {
    if (bookingData === null) {
      setError("No active booking found for this session link.");
    } else if (bookingData) {
      setBooking(bookingData);
      setSlot(bookingData.slotDetails);
      setError(null);
    }
  }, [bookingData]);

  // Real-time Duration Calculated directly from Booking Timestamp
  useEffect(() => {
    if (!booking) return;

    const calculateDuration = () => {
      const start = new Date(booking.entryTime).getTime();
      const end = booking.exitTime ? new Date(booking.exitTime).getTime() : Date.now();
      const diffMins = Math.max(0, Math.floor((end - start) / (60 * 1000)));

      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      setDurationStr(`${hours}h ${mins}m`);
    };

    calculateDuration();
    const timer = setInterval(calculateDuration, 20000);
    return () => clearInterval(timer);
  }, [booking]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center" role="status" aria-live="polite">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center text-[#D84A2B] mb-4 animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h2 className="text-[18px] font-bold text-[#1C1917]">Loading Parking Space Telemetry...</h2>
        <p className="text-[13px] text-[#78716C] mt-1">Retrieving your verified vehicle location</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-8 sm:p-10 shadow-[0_8px_32px_rgba(80,50,20,0.03)] text-center flex flex-col items-center my-auto">
        <div className="w-16 h-16 rounded-3xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center text-[#D84A2B] mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-[20px] font-bold text-[#1C1917]">No Active Parking Booking</h2>
        <p className="text-[13.5px] text-[#78716C] mt-1 mb-6 max-w-[360px]">
          {error || "Your parking session may have been completed, or this access link has expired."}
        </p>
        <Link
          href={`/customer/${token}/history`}
          className="h-11 px-6 rounded-2xl bg-[#D84A2B] text-white text-[13.5px] font-bold inline-flex items-center gap-2"
        >
          View Past Parking History
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const isCompleted = booking.status === "COMPLETED";
  const steps = slot?.walkingDirections || [
    `Enter through Parking Lobby on Floor ${booking.floor}`,
    `Proceed along Main Driving Lane towards ${booking.zone}`,
    `Turn towards ${booking.pillar}`,
    `Your vehicle is parked in Slot ${booking.slotNumber}`,
  ];

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* ── Top Vehicle Identity & Location Banner ───────────────────────── */}
      <section className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(80,50,20,0.03)] flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isCompleted ? "bg-[#78716C]" : "bg-[#10B981] animate-pulse"}`} />
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#D84A2B]">
              {isCompleted ? "PARKING SESSION COMPLETED" : "ACTIVE VEHICLE LOCATION"}
            </span>
          </div>

          <span
            className={`text-[12px] font-extrabold px-3.5 py-1 rounded-full border ${
              isCompleted
                ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20"
                : "bg-[#D84A2B]/10 text-[#D84A2B] border-[#D84A2B]/20"
            }`}
          >
            {isCompleted ? "COMPLETED EXIT" : "PARKED SECURELY"}
          </span>
        </div>

        <div>
          <span className="text-[11.5px] font-bold text-[#A8A29E] uppercase tracking-wider font-mono">
            REGISTERED VEHICLE
          </span>
          <h1 className="text-[32px] sm:text-[38px] font-extrabold text-[#1C1917] tracking-tight font-mono">
            {booking.vehicleNumber}
          </h1>
        </div>

        {/* Large Location Matrix Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9]">
          <div>
            <p className="text-[10.5px] font-bold uppercase text-[#A8A29E]">Level</p>
            <p className="text-[22px] font-extrabold text-[#1C1917]">Floor {booking.floor}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase text-[#A8A29E]">Zone</p>
            <p className="text-[22px] font-extrabold text-[#1C1917]">{booking.zone}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase text-[#A8A29E]">Pillar</p>
            <p className="text-[22px] font-extrabold text-[#1C1917]">{booking.pillar}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase text-[#A8A29E]">Assigned Slot</p>
            <p className="text-[22px] font-extrabold text-[#D84A2B]">{booking.slotNumber}</p>
          </div>
        </div>

        {/* Timings & Duration Calculated from entryTime */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#78716C] pt-2 border-t border-[#EAE3D9]/60">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#A8A29E]" />
            <span>
              Parked at <strong>{new Date(booking.entryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
            </span>
          </div>
          <div>
            Elapsed Duration: <strong className="text-[#1C1917]">{durationStr}</strong>
          </div>
        </div>
      </section>

      {/* ── 2D Indoor Floor Guidance Map ─────────────────────────────────── */}
      {!isCompleted && (
        <CustomerFloorPlan2D
          floor={booking.floor}
          zone={booking.zone}
          pillar={booking.pillar}
          slotNumber={booking.slotNumber}
          distanceFromEntrance={booking.distanceFromEntrance}
        />
      )}

      {/* ── Textual Turn-by-Turn Wayfinding Fallback ──────────────────────── */}
      {!isCompleted && (
        <section className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-6 sm:p-7 shadow-[0_8px_32px_rgba(80,50,20,0.03)] flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#D84A2B]" />
            <h3 className="text-[16px] font-bold text-[#1C1917]">Turn-By-Turn Walking Steps</h3>
          </div>
          <div className="flex flex-col gap-2.5">
            {steps.map((step: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-[13.5px]">
                <span className="w-6 h-6 rounded-full bg-[#FFF5F2] border border-[#FADCD5] text-[#D84A2B] flex items-center justify-center text-[11.5px] font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="text-[#1C1917] font-medium leading-tight pt-0.5">{step}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Digital Exit Pass QR Section (High-Contrast, No Overflow) ──────── */}
      <section className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-7 sm:p-9 shadow-[0_8px_32px_rgba(80,50,20,0.03)] flex flex-col items-center text-center gap-5">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center text-[#D84A2B]">
            <QrCode className="w-4 h-4" />
          </div>
          <h2 className="text-[18px] font-bold text-[#1C1917]">
            {isCompleted ? "Validated Exit Pass" : "Digital Exit Pass"}
          </h2>
        </div>

        <p className="text-[13px] text-[#78716C] max-w-[380px]">
          {isCompleted
            ? "This pass has been verified at the boom barrier. Exit completed successfully."
            : "Present this QR code to the gate attendant or hold it toward the optical exit scanner."}
        </p>

        {/* QR Code Container with High-Contrast White Backing */}
        <div className="relative p-5 sm:p-6 rounded-3xl bg-white border-2 border-[#EAE3D9] shadow-md flex items-center justify-center max-w-full">
          <QRCodeSVG
            value={booking.exitPassToken}
            size={230}
            level="H"
            fgColor={isCompleted ? "#78716C" : "#1C1917"}
            bgColor="#FFFFFF"
          />

          {isCompleted && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-4">
              <CheckCircle2 className="w-12 h-12 text-[#10B981] mb-2" />
              <span className="text-[14px] font-extrabold text-[#10B981] uppercase tracking-wider">
                EXIT COMPLETED
              </span>
              <span className="text-[11.5px] text-[#78716C] mt-1">Pass Used</span>
            </div>
          )}
        </div>

        {/* Token Meta Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E2D9CC]">
          <span className="text-[11px] font-mono font-bold text-[#78716C]">
            Ref: {booking.bookingNumber}
          </span>
          <span className="text-[#A8A29E]">·</span>
          <span className="text-[11px] font-mono font-bold text-[#D84A2B]">
            Floor {booking.floor} · {booking.slotNumber}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-[#78716C] pt-2">
          <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          <span>Cryptographically signed single-use PARKNEX token</span>
        </div>
      </section>
    </div>
  );
}
