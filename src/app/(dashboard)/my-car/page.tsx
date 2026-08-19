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
    // Read from localStorage if user registered vehicle or parked
    try {
      const savedVehicle = localStorage.getItem("smartpark_user_vehicle");
      const savedSession = localStorage.getItem("smartpark_active_session");

      if (savedVehicle) {
        setVehicle(JSON.parse(savedVehicle));
      }
      if (savedSession) {
        setSession(JSON.parse(savedSession));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full p-6 sm:p-10 bg-[#040608] max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] mb-8">
        <div>
          <h1 className="text-[26px] font-extrabold text-white tracking-tight">
            My Vehicle & Active Session
          </h1>
          <p className="text-[13px] text-white/50 mt-1">
            Real-time status of your registered vehicle and active parking slot
          </p>
        </div>

        <Link
          href="/vehicle"
          className="h-10 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-[13px] font-semibold text-white flex items-center gap-2 hover:bg-white/[0.08] hover:border-white/20 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          {vehicle ? "Edit Vehicle" : "Register Vehicle"}
        </Link>
      </div>

      {session ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Parking Status Card */}
          <div className="lg:col-span-2 bg-[#080C14]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-6">
              <div>
                <p className="text-[11px] text-white/40 font-medium uppercase">Floor</p>
                <p className="text-[22px] font-extrabold text-white mt-0.5">{session.floor}</p>
              </div>
              <div>
                <p className="text-[11px] text-white/40 font-medium uppercase">Zone</p>
                <p className="text-[22px] font-extrabold text-white mt-0.5">{session.zone}</p>
              </div>
              <div>
                <p className="text-[11px] text-white/40 font-medium uppercase">Pillar</p>
                <p className="text-[22px] font-extrabold text-white mt-0.5">{session.pillar}</p>
              </div>
              <div>
                <p className="text-[11px] text-white/40 font-medium uppercase">Slot</p>
                <p className="text-[22px] font-extrabold text-cyan-400 mt-0.5">{session.slot}</p>
              </div>
            </div>

            {/* Timings */}
            <div className="flex items-center justify-between text-[13px] text-white/60 border-t border-white/[0.06] pt-4 mb-6">
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

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/find-my-car"
                className="h-[46px] px-6 rounded-xl bg-white text-[#040608] text-[13.5px] font-bold flex items-center gap-2 hover:bg-white/90 active:scale-95 transition-all shadow-md shadow-white/10"
              >
                <Compass className="w-4 h-4" />
                Find My Car
              </Link>
              <Link
                href="/checkout"
                className="h-[46px] px-6 rounded-xl bg-white/[0.04] border border-white/10 text-white text-[13.5px] font-semibold flex items-center gap-2 hover:border-white/20 active:scale-95 transition-all"
              >
                <CreditCard className="w-4 h-4 text-white/60" />
                Proceed to Checkout
              </Link>
            </div>
          </div>

          {/* Registered Vehicle Details Card */}
          <div className="bg-[#080C14]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                <Car className="w-6 h-6" strokeWidth={1.5} />
              </div>

              <h2 className="text-[20px] font-bold text-white">
                {vehicle ? `${vehicle.manufacturer} ${vehicle.model}` : "Vehicle Registered"}
              </h2>
              <p className="text-[14px] text-cyan-300 font-semibold mt-1">
                {vehicle?.plate || "Plate Confirmed"}
              </p>

              <div className="flex flex-col gap-3 mt-6 border-t border-white/[0.06] pt-4 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Body Type</span>
                  <span className="text-white font-medium">{vehicle?.type || "Sedan"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Color</span>
                  <span className="text-white font-medium">{vehicle?.color || "Obsidian"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Location</span>
                  <span className="text-white font-medium">{session.mall}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.06] mt-6">
              <Link
                href="/exit-pass"
                className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/10 text-[13px] font-semibold text-white/80 hover:text-white flex items-center justify-center gap-2 hover:border-white/20 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                View Active Exit Pass
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Designed Empty State */
        <div className="w-full py-20 px-6 rounded-3xl bg-[#080C14]/50 border border-white/[0.06] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/40 mb-4 shadow-xl">
            <Car className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h2 className="text-[20px] font-bold text-white mb-2">
            No Active Parking Session
          </h2>
          <p className="text-[13.5px] text-white/50 max-w-[400px] mb-7 leading-relaxed">
            You currently do not have a vehicle parked in a SmartPark-enabled mall. Select a parking slot to start an active session.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/parking"
              className="h-11 px-6 rounded-full bg-white text-[#040608] text-[13.5px] font-bold hover:bg-white/90 transition-colors shadow-lg shadow-white/10 flex items-center gap-2"
            >
              Explore Parking Map
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/vehicle"
              className="h-11 px-6 rounded-full bg-white/[0.04] border border-white/10 text-white text-[13.5px] font-semibold hover:bg-white/[0.08] transition-colors"
            >
              Add Vehicle
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
