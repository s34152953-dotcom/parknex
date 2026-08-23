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
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-12 text-center" role="status" aria-live="polite">
        <div className="w-12 h-12 rounded-2xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center mb-4 animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h2 className="text-[18px] font-bold text-[#241F1B]">Loading Parking Space...</h2>
        <p className="text-[13.5px] text-[#70675F] mt-1">Retrieving your verified vehicle location</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-8 sm:p-10 shadow-[0_8px_24px_rgba(70,48,35,0.07)] text-center flex flex-col items-center max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-[20px] font-bold text-[#241F1B]">Parking Pass Unavailable</h2>
          <p className="text-[14px] text-[#70675F] mt-2 mb-6">
            {error || "This parking session pass could not be retrieved. Please check your SMS link or sign in."}
          </p>
          <Link
            href="/customer/login"
            className="w-full h-12 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <span>Go to Customer Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241F1B] flex flex-col selection:bg-[#F9E3DE] selection:text-[#C93B2F]">
      {/* Header */}
      <header className="w-full bg-[#FFFFFF] border-b border-[#DED3C7] py-4 px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <Link href="/">
            <ParknexLogo size="md" variant="light" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-[#2F7D5A]/10 text-[#2F7D5A] border border-[#2F7D5A]/20 uppercase">
              {booking.status}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[1000px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Pass Card */}
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(70,48,35,0.07)] flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DED3C7]">
            <div>
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#C93B2F]">
                Verified Space Assignment
              </span>
              <h1 className="text-[24px] sm:text-[28px] font-black text-[#241F1B]">
                {booking.mallName || "Central Mall Grand"}
              </h1>
            </div>
            <div className="flex items-center gap-2 font-mono text-[14px] font-bold bg-[#F3EAE0] border border-[#DED3C7] px-3.5 py-1.5 rounded-xl text-[#241F1B]">
              <Car className="w-4 h-4 text-[#C93B2F]" />
              <span>{booking.vehicleNumber}</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F3EAE0] border border-[#DED3C7] rounded-xl p-3.5">
              <span className="text-[11px] font-bold uppercase text-[#70675F] block">Floor</span>
              <span className="text-[20px] font-black text-[#241F1B]">{slot?.floor || booking.floor || "B2"}</span>
            </div>
            <div className="bg-[#F3EAE0] border border-[#DED3C7] rounded-xl p-3.5">
              <span className="text-[11px] font-bold uppercase text-[#70675F] block">Zone</span>
              <span className="text-[20px] font-black text-[#C93B2F]">{slot?.zone || booking.zone || "Zone A"}</span>
            </div>
            <div className="bg-[#F3EAE0] border border-[#DED3C7] rounded-xl p-3.5">
              <span className="text-[11px] font-bold uppercase text-[#70675F] block">Pillar</span>
              <span className="text-[20px] font-black text-[#241F1B]">{slot?.pillar || "P02"}</span>
            </div>
            <div className="bg-[#F3EAE0] border border-[#DED3C7] rounded-xl p-3.5">
              <span className="text-[11px] font-bold uppercase text-[#70675F] block">Duration</span>
              <span className="text-[20px] font-black text-[#2F7D5A]">{durationStr}</span>
            </div>
          </div>

          {/* 2D Floor Plan */}
          <CustomerFloorPlan2D
            floor={slot?.floor || booking.floor || "B2"}
            zone={slot?.zone || booking.zone || "Zone A"}
            pillar={slot?.pillar || "Pillar"}
            slotNumber={slot?.slotNumber || booking.slotId}
            distanceFromEntrance={slot?.distanceFromEntrance || 36}
          />

          {/* Exit Pass QR Code */}
          <div className="bg-[#F3EAE0] border border-[#DED3C7] rounded-2xl p-6 flex flex-col items-center text-center gap-4">
            <h3 className="text-[18px] font-bold text-[#241F1B]">Digital Exit Barrier Pass</h3>
            <div className="p-4 bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl shadow-xs">
              <QRCodeSVG value={booking.exitPassToken || booking.customerAccessToken || token} size={180} />
            </div>
            {booking.fallbackCode && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-[#70675F] uppercase font-bold">Offline Fallback Code</span>
                <span className="text-[20px] font-mono font-black text-[#C93B2F] tracking-widest">{booking.fallbackCode}</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
