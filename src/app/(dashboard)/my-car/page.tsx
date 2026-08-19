"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Car,
  Compass,
  Clock,
  MapPin,
  QrCode,
  CreditCard,
  CheckCircle2,
  Plus,
} from "lucide-react";

export default function MyCarPage() {
  // Active vehicle state (real or reactive)
  const [hasActiveSession, setHasActiveSession] = useState<boolean>(true);

  const vehicle = {
    manufacturer: "Hyundai",
    model: "Creta",
    plate: "KA-01-MJ-2024",
    color: "Deep Ocean Blue",
    type: "SUV",
  };

  const session = {
    mall: "Central Mall",
    floor: "B2",
    zone: "Zone A",
    pillar: "Pillar 18",
    slot: "Slot A-18",
    parkedAt: "10:45 AM, Today",
    duration: "1h 35m",
    status: "Parked Securely",
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full p-6 sm:p-10 bg-[#05070A] max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] mb-8">
        <div>
          <h1 className="text-[26px] font-extrabold text-white tracking-tight">
            My Vehicle
          </h1>
          <p className="text-[13px] text-sp-secondary mt-1">
            Manage your registered vehicle and active parking session
          </p>
        </div>

        <Link
          href="/vehicle"
          className="h-10 px-4 rounded-xl bg-sp-elevated border border-white/10 text-[13px] font-semibold text-white flex items-center gap-2 hover:bg-sp-elevated/80 hover:border-white/20 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </Link>
      </div>

      {hasActiveSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Parking Status Card */}
          <div className="lg:col-span-2 bg-sp-surface/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-sp-cyan shadow-md shadow-sp-cyan animate-pulse" />
                <span className="text-[13px] font-bold text-sp-cyan uppercase tracking-wider">
                  Active Parking Session
                </span>
              </div>
              <span className="text-[12px] px-3 py-1 rounded-full bg-sp-green/10 border border-sp-green/20 text-sp-green font-semibold">
                {session.status}
              </span>
            </div>

            {/* Large Location Headline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-sp-elevated/60 border border-white/[0.06] mb-6">
              <div>
                <p className="text-[11px] text-sp-muted font-medium uppercase">
                  Floor
                </p>
                <p className="text-[22px] font-extrabold text-white mt-0.5">
                  {session.floor}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-sp-muted font-medium uppercase">
                  Zone
                </p>
                <p className="text-[22px] font-extrabold text-white mt-0.5">
                  {session.zone}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-sp-muted font-medium uppercase">
                  Pillar
                </p>
                <p className="text-[22px] font-extrabold text-white mt-0.5">
                  {session.pillar}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-sp-muted font-medium uppercase">
                  Slot
                </p>
                <p className="text-[22px] font-extrabold text-sp-cyan mt-0.5">
                  {session.slot}
                </p>
              </div>
            </div>

            {/* Timings */}
            <div className="flex items-center justify-between text-[13px] text-sp-secondary border-t border-white/[0.06] pt-4 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sp-muted" />
                <span>
                  Parked at <strong className="text-white">{session.parkedAt}</strong>
                </span>
              </div>
              <div>
                Duration: <strong className="text-white">{session.duration}</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/find-my-car"
                className="h-[48px] px-6 rounded-xl bg-sp-blue text-white text-[13.5px] font-bold flex items-center gap-2.5 hover:bg-sp-blue-hover active:scale-95 transition-all shadow-lg shadow-sp-blue/30"
              >
                <Compass className="w-4 h-4" />
                Find My Car
              </Link>
              <Link
                href="/checkout"
                className="h-[48px] px-6 rounded-xl bg-sp-elevated border border-white/10 text-white text-[13.5px] font-semibold flex items-center gap-2.5 hover:border-white/20 active:scale-95 transition-all"
              >
                <CreditCard className="w-4 h-4 text-sp-secondary" />
                Proceed to Checkout
              </Link>
            </div>
          </div>

          {/* Registered Vehicle Details Card */}
          <div className="bg-sp-surface/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sp-blue/15 border border-sp-blue/30 flex items-center justify-center text-sp-blue mb-5">
                <Car className="w-6 h-6" strokeWidth={1.5} />
              </div>

              <h2 className="text-[20px] font-bold text-white">
                {vehicle.manufacturer} {vehicle.model}
              </h2>
              <p className="text-[14px] text-sp-cyan font-semibold mt-1">
                {vehicle.plate}
              </p>

              <div className="flex flex-col gap-3 mt-6 border-t border-white/[0.06] pt-4 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-sp-muted">Body Type</span>
                  <span className="text-white font-medium">{vehicle.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sp-muted">Color</span>
                  <span className="text-white font-medium">{vehicle.color}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sp-muted">Assigned Mall</span>
                  <span className="text-white font-medium">{session.mall}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.06] mt-6">
              <Link
                href="/exit-pass"
                className="w-full h-11 rounded-xl bg-sp-elevated border border-white/10 text-[13px] font-semibold text-sp-nav hover:text-white flex items-center justify-center gap-2 hover:border-white/20 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                View Active Exit Pass
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Designed Empty State */
        <div className="w-full py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-sp-elevated border border-white/10 flex items-center justify-center text-sp-muted mb-4">
            <Car className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <h2 className="text-[18px] font-semibold text-white mb-1">
            No active parking session
          </h2>
          <p className="text-[13px] text-sp-secondary max-w-[320px] mb-6">
            Park your vehicle in a SmartPark-enabled mall to track your vehicle location.
          </p>
          <Link
            href="/parking"
            className="h-11 px-6 rounded-full bg-sp-cta text-sp-cta-text text-[13.5px] font-bold hover:bg-white/90 transition-colors"
          >
            Find Parking
          </Link>
        </div>
      )}
    </div>
  );
}
