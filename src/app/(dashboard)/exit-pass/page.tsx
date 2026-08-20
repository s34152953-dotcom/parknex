"use client";

import React, { useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Car,
  ChevronLeft,
  Download,
  Share2,
} from "lucide-react";
import { ParknexIcon } from "@/components/ui/ParknexLogo";

export default function ExitPassPage() {
  const pass = {
    passToken: "PNX-PASS-98214-B2-A18",
    vehiclePlate: "KA-01-MJ-2024",
    vehicleName: "Hyundai Creta",
    mallName: "Central Mall Grand",
    location: "Floor B2 · Slot A-18",
    validUntil: "12:30 PM (15 mins remaining)",
    issuedAt: "12:15 PM, Today",
    status: "Authorized for Exit",
  };

  return (
    <div className="min-h-[calc(100vh-68px)] w-full p-6 sm:p-10 lg:p-12 pt-8 bg-[#FBF8F3] flex flex-col items-center justify-start">
      <div className="w-full max-w-[460px] flex flex-col items-center">
        {/* Back Link & Active Tag */}
        <div className="w-full flex items-center justify-between mb-4">
          <Link
            href="/my-car"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <span className="text-[11.5px] px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 font-bold uppercase tracking-wider">
            EXIT AUTHORIZED
          </span>
        </div>

        {/* ── Premium Digital Exit Pass Card ───────────────────────────── */}
        <div className="w-full bg-white border border-[rgba(80,60,40,0.10)] rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(80,50,20,0.05)] relative overflow-hidden text-center">
          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg border border-[#FADCD5] flex items-center justify-center bg-[#FFF5F2] p-1">
              <ParknexIcon className="w-5 h-5" />
            </div>
            <h1 className="text-[18px] font-bold text-[#1C1917]">{pass.mallName}</h1>
          </div>
          <p className="text-[12.5px] text-[#78716C]">Digital Parking Exit Pass</p>

          {/* QR Code Container */}
          <div className="my-6 p-5 rounded-2xl bg-white border border-[#EAE3D9] flex items-center justify-center shadow-md mx-auto w-fit">
            <QRCodeSVG
              value={JSON.stringify({
                token: pass.passToken,
                plate: pass.vehiclePlate,
                mall: pass.mallName,
                exp: pass.validUntil,
              })}
              size={180}
              level="H"
              fgColor="#1C1917"
            />
          </div>

          {/* Pass ID */}
          <p className="text-[11.5px] font-mono font-bold text-[#D84A2B] uppercase tracking-wider">
            Token: {pass.passToken}
          </p>

          {/* Vehicle and Expiration Meta */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE3D9] text-left mt-5 text-[13px]">
            <div>
              <p className="text-[10.5px] text-[#A8A29E] uppercase font-bold">
                Vehicle
              </p>
              <p className="text-[#1C1917] font-bold mt-0.5 font-mono">{pass.vehiclePlate}</p>
              <p className="text-[11.5px] text-[#78716C]">{pass.vehicleName}</p>
            </div>
            <div>
              <p className="text-[10.5px] text-[#A8A29E] uppercase font-bold">
                Grace Period
              </p>
              <p className="text-[#10B981] font-bold mt-0.5">{pass.validUntil}</p>
              <p className="text-[11.5px] text-[#A8A29E]">Issued {pass.issuedAt}</p>
            </div>
          </div>

          {/* Instruction */}
          <p className="text-[12px] text-[#78716C] mt-5 leading-relaxed">
            Scan this QR code at the boom barrier or drive toward the exit camera for automated ANPR verification.
          </p>
        </div>
      </div>
    </div>
  );
}
