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

export default function ExitPassPage() {
  const pass = {
    passToken: "SP-PASS-98214-B2-A18",
    vehiclePlate: "KA-01-MJ-2024",
    vehicleName: "Hyundai Creta",
    mallName: "Central Mall",
    location: "Floor B2 · Slot A-18",
    validUntil: "12:30 PM (15 mins remaining)",
    issuedAt: "12:15 PM, Today",
    status: "Authorized for Exit",
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full p-4 sm:p-8 bg-[#05070A] flex flex-col items-center justify-center">
      <div className="w-full max-w-[460px] flex flex-col items-center">
        {/* Back Link */}
        <div className="w-full flex items-center justify-between mb-4">
          <Link
            href="/my-car"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-sp-secondary hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sp-green/10 text-sp-green border border-sp-green/20 font-bold uppercase tracking-wider">
            Active Pass
          </span>
        </div>

        {/* ── Premium Digital Exit Pass Card ───────────────────────────── */}
        <div className="w-full bg-sp-surface/95 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center">
          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sp-green shadow-sm shadow-sp-green" />
            <h1 className="text-[18px] font-bold text-white">{pass.mallName}</h1>
          </div>
          <p className="text-[12px] text-sp-secondary">Digital Parking Exit Pass</p>

          {/* QR Code Container */}
          <div className="my-6 p-5 rounded-2xl bg-white flex items-center justify-center shadow-lg mx-auto w-fit">
            <QRCodeSVG
              value={JSON.stringify({
                token: pass.passToken,
                plate: pass.vehiclePlate,
                mall: pass.mallName,
                exp: pass.validUntil,
              })}
              size={180}
              level="H"
            />
          </div>

          {/* Pass ID */}
          <p className="text-[11px] font-mono font-medium text-sp-muted uppercase tracking-wider">
            Token: {pass.passToken}
          </p>

          {/* Vehicle and Expiration Meta */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-sp-elevated/70 border border-white/[0.06] text-left mt-5 text-[12.5px]">
            <div>
              <p className="text-[10px] text-sp-muted uppercase font-semibold">
                Vehicle
              </p>
              <p className="text-white font-bold mt-0.5">{pass.vehiclePlate}</p>
              <p className="text-[11px] text-sp-secondary">{pass.vehicleName}</p>
            </div>
            <div>
              <p className="text-[10px] text-sp-muted uppercase font-semibold">
                Grace Period
              </p>
              <p className="text-sp-green font-bold mt-0.5">{pass.validUntil}</p>
              <p className="text-[11px] text-sp-muted">Issued {pass.issuedAt}</p>
            </div>
          </div>

          {/* Instruction */}
          <p className="text-[11.5px] text-sp-secondary mt-5 leading-relaxed">
            Scan this QR code at the boom barrier or drive toward the exit camera for automated ANPR verification.
          </p>
        </div>
      </div>
    </div>
  );
}
