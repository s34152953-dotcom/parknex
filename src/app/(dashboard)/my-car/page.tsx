"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  Compass,
  Clock,
  MapPin,
  QrCode,
  CreditCard,
  Plus,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface VehicleData {
  manufacturer: string;
  model: string;
  plate: string;
  color: string;
  type: string;
}

interface ParkingSession {
  mall: string;
  floor: string;
  zone: string;
  pillar: string;
  slot: string;
  parkedAt: string;
  duration: string;
  status: string;
}

export default function MyCarPage() {
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [session, setSession] = useState<ParkingSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Read from localStorage if user registered vehicle or parked, or provide active session preview
    try {
      const savedVehicle = localStorage.getItem("smartpark_user_vehicle");
      const savedSession = localStorage.getItem("smartpark_active_session");

      if (savedVehicle) {
        setVehicle(JSON.parse(savedVehicle));
      } else {
        // Default preview vehicle matching reference
        setVehicle({
          manufacturer: "Porsche",
          model: "Taycan 4S",
          plate: "KA-01-MJ-2024",
          color: "Deep Obsidian Metallic",
          type: "Electric (EV)",
        });
      }

      if (savedSession) {
        setSession(JSON.parse(savedSession));
      } else {
        // Default active session matching reference
        setSession({
          mall: "Central Mall Grand",
          floor: "B2",
          zone: "Zone A",
          pillar: "Pillar 18",
          slot: "Slot A-14",
          parkedAt: "02:45 PM",
          duration: "1h 24m",
          status: "Parked Securely",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full p-8 sm:p-10 lg:p-12 bg-[#000000] flex flex-col justify-start">
      <div className="max-w-[1240px] w-full mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#333333] mb-8">
          <div>
            <h1 className="text-[24px] sm:text-[26px] font-extrabold text-white tracking-tight">
              My Vehicle & Active Session
            </h1>
            <p className="text-[13px] text-white/50 mt-1">
              Real-time telemetry and indoor location of your registered vehicle
            </p>
          </div>

          <Link
            href="/vehicle"
            className="h-10 px-5 rounded-md bg-white text-black text-[13px] font-bold inline-flex items-center justify-center gap-2 hover:bg-[#E5E5E5] active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            {vehicle ? "Edit Vehicle" : "Add Vehicle"}
          </Link>
        </div>

        {session ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Active Parking Status Card */}
            <div className="bg-[#111111] border border-[#333333] rounded-2xl p-7 sm:p-8 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-md shadow-cyan-400 animate-pulse" />
                    <span className="text-[12.5px] font-bold text-cyan-300 uppercase tracking-wider">
                      Active Parking Session
                    </span>
                  </div>
                  <span className="text-[12px] px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                    {session.status || "Parked Securely"}
                  </span>
                </div>

                {/* Large Location Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 rounded-xl bg-[#0a0a0a] border border-[#333333] mb-6 min-w-0">
                  <div className="min-w-0">
                    <p className="text-[11px] text-white/40 font-medium uppercase">Floor</p>
                    <p className="text-[20px] font-extrabold text-white mt-0.5 truncate">{session.floor}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-white/40 font-medium uppercase">Zone</p>
                    <p className="text-[20px] font-extrabold text-white mt-0.5 truncate">{session.zone}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-white/40 font-medium uppercase">Pillar</p>
                    <p className="text-[20px] font-extrabold text-white mt-0.5 truncate">{session.pillar}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-white/40 font-medium uppercase">Slot</p>
                    <p className="text-[20px] font-extrabold text-cyan-400 mt-0.5 truncate">{session.slot}</p>
                  </div>
                </div>

                {/* Timings */}
                <div className="flex items-center justify-between text-[13px] text-white/60 border-t border-[#333333] pt-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/40" />
                    <span>
                      Parked at <strong className="text-white">{session.parkedAt}</strong>
                    </span>
                  </div>
                  <div>
                    Duration: <strong className="text-white">{session.duration}</strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/find-my-car"
                  className="h-12 px-5 rounded-md bg-white text-black text-[13px] font-bold inline-flex items-center justify-center gap-2 hover:bg-[#E5E5E5] active:scale-95 transition-all shrink-0"
                >
                  <Compass className="w-4 h-4" />
                  Find My Car
                </Link>
                <Link
                  href="/checkout"
                  className="h-12 px-5 rounded-md bg-transparent border border-[#333333] text-white text-[13px] font-semibold inline-flex items-center justify-center gap-2 hover:border-[#666666] active:scale-95 transition-all shrink-0"
                >
                  <CreditCard className="w-4 h-4 text-white/60" />
                  Proceed to Checkout
                </Link>
              </div>
            </div>

            {/* Registered Vehicle Details Card */}
            <div className="bg-[#111111] border border-[#333333] rounded-2xl p-7 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Car className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <span className="text-[11.5px] font-semibold px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/70">
                    Primary Vehicle
                  </span>
                </div>

                <h2 className="text-[22px] font-extrabold text-white tracking-tight">
                  {vehicle ? `${vehicle.manufacturer} ${vehicle.model}` : "Vehicle Registered"}
                </h2>
                <p className="text-[14px] text-cyan-300 font-semibold mt-1 font-mono">
                  {vehicle?.plate || "Plate Confirmed"}
                </p>

                <div className="flex flex-col mt-6 border-t border-[#333333] text-[13px]">
                  <div className="flex items-center justify-between py-3 border-b border-[#333333]">
                    <span className="text-white/50">Body Type</span>
                    <span className="text-white font-medium">{vehicle?.type || "Sedan"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[#333333]">
                    <span className="text-white/50">Color</span>
                    <span className="text-white font-medium">{vehicle?.color || "Obsidian"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <span className="text-white/50">Location</span>
                    <span className="text-white font-medium">{session.mall}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#333333] mt-6">
                <Link
                  href="/exit-pass"
                  className="w-full h-12 rounded-md bg-transparent border border-[#333333] text-[13px] font-semibold text-white inline-flex items-center justify-center gap-2 hover:border-[#666666] transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  View Active Exit Pass
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Car}
            title="No Active Parking Session"
            description="You currently do not have a vehicle parked in a SmartPark-enabled mall. Select a parking slot to start an active session."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/parking"
                  className="h-11 px-6 rounded-md bg-white text-[#000000] text-[13.5px] font-bold hover:bg-[#E5E5E5] transition-colors inline-flex items-center justify-center gap-2"
                >
                  Explore Parking Map
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/vehicle"
                  className="h-11 px-6 rounded-md bg-transparent border border-[#333333] text-white text-[13.5px] font-semibold hover:border-[#666666] transition-colors inline-flex items-center justify-center"
                >
                  Add Vehicle
                </Link>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
