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
    try {
      const savedVehicle = localStorage.getItem("parknex_user_vehicle") || localStorage.getItem("smartpark_user_vehicle");
      const savedSession = localStorage.getItem("parknex_active_session") || localStorage.getItem("smartpark_active_session");

      if (savedVehicle) {
        setVehicle(JSON.parse(savedVehicle));
      } else {
        // Default preview vehicle
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
        // Default active session
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
    <div className="min-h-[calc(100vh-68px)] w-full p-6 sm:p-8 lg:p-10 xl:p-12 bg-[#FBF8F3] flex flex-col justify-start">
      <div className="w-full max-w-[1500px] mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#EAE3D9] mb-8">
          <div>
            <h1 className="text-[26px] sm:text-[28px] lg:text-[32px] font-bold text-[#1C1917] tracking-tight">
              My Vehicle & Active Session
            </h1>
            <p className="text-[14px] text-[#78716C] mt-1">
              Real-time telemetry and indoor location of your registered vehicle
            </p>
          </div>

          <Link
            href="/vehicle"
            className="h-10 px-5 rounded-lg bg-white border border-[#E2D9CC] text-[#1C1917] text-[13px] font-semibold inline-flex items-center justify-center gap-2 hover:border-[#D84A2B]/40 hover:bg-[#FFFDFC] active:scale-95 transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4 text-[#D84A2B]" />
            {vehicle ? "Edit Vehicle" : "Add Vehicle"}
          </Link>
        </div>

        {session ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* Active Parking Status Card */}
            <div className="bg-white border border-[rgba(80,60,40,0.10)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_6px_24px_rgba(80,50,20,0.035)] h-full">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D84A2B] animate-pulse" />
                    <span className="text-[12px] font-bold text-[#D84A2B] uppercase tracking-wider">
                      ACTIVE PARKING SESSION
                    </span>
                  </div>
                  <span className="text-[12px] px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] font-semibold shrink-0">
                    {session.status || "Parked Securely"}
                  </span>
                </div>

                {/* Large Location Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 sm:p-5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D9] mb-6 min-w-0">
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#A8A29E] font-bold uppercase tracking-wider">Floor</p>
                    <p className="text-[22px] sm:text-[24px] font-extrabold text-[#1C1917] mt-0.5 truncate">{session.floor}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#A8A29E] font-bold uppercase tracking-wider">Zone</p>
                    <p className="text-[22px] sm:text-[24px] font-extrabold text-[#1C1917] mt-0.5 truncate">{session.zone}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#A8A29E] font-bold uppercase tracking-wider">Pillar</p>
                    <p className="text-[22px] sm:text-[24px] font-extrabold text-[#1C1917] mt-0.5 truncate">{session.pillar}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#A8A29E] font-bold uppercase tracking-wider">Slot</p>
                    <p className="text-[22px] sm:text-[24px] font-extrabold text-[#D84A2B] mt-0.5 truncate">{session.slot}</p>
                  </div>
                </div>

                {/* Timings */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-[#78716C] border-t border-[#EAE3D9] pt-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#A8A29E]" />
                    <span>
                      Parked at <strong className="text-[#1C1917]">{session.parkedAt}</strong>
                    </span>
                  </div>
                  <div>
                    Duration: <strong className="text-[#1C1917]">{session.duration}</strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-[#EAE3D9]/60">
                <Link
                  href="/find-my-car"
                  className="flex-1 min-h-[48px] px-5 rounded-lg bg-[#D84A2B] text-white text-[13.5px] font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-sm shadow-[#D84A2B]/20 whitespace-nowrap"
                >
                  <Compass className="w-4 h-4" />
                  Find My Car
                </Link>
                <Link
                  href="/checkout"
                  className="flex-1 min-h-[48px] px-5 rounded-lg bg-white border border-[#E2D9CC] text-[#1C1917] text-[13.5px] font-semibold inline-flex items-center justify-center gap-2 hover:border-[#D84A2B]/40 hover:bg-[#FFFDFC] active:scale-[0.98] transition-all shadow-xs whitespace-nowrap"
                >
                  <CreditCard className="w-4 h-4 text-[#78716C]" />
                  Proceed to Checkout
                </Link>
              </div>
            </div>

            {/* Registered Vehicle Details Card */}
            <div className="bg-white border border-[rgba(80,60,40,0.10)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_6px_24px_rgba(80,50,20,0.035)] h-full">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center text-[#D84A2B] shadow-xs">
                    <Car className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <span className="text-[11.5px] font-semibold px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EAE3D9] text-[#78716C]">
                    Primary Vehicle
                  </span>
                </div>

                <h2 className="text-[22px] sm:text-[24px] font-bold text-[#1C1917] tracking-tight">
                  {vehicle ? `${vehicle.manufacturer} ${vehicle.model}` : "Vehicle Registered"}
                </h2>
                <p className="text-[14px] text-[#D84A2B] font-bold mt-1 font-mono tracking-wide">
                  {vehicle?.plate || "Plate Confirmed"}
                </p>

                <div className="flex flex-col mt-6 border-t border-[#EAE3D9] text-[13.5px]">
                  <div className="flex items-center justify-between py-3 border-b border-[#EAE3D9]">
                    <span className="text-[#78716C]">Body Type</span>
                    <span className="text-[#1C1917] font-semibold">{vehicle?.type || "Sedan"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[#EAE3D9]">
                    <span className="text-[#78716C]">Color</span>
                    <span className="text-[#1C1917] font-semibold">{vehicle?.color || "Obsidian"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-[#78716C]">Location</span>
                    <span className="text-[#1C1917] font-semibold">{session.mall}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#EAE3D9] mt-6">
                <Link
                  href="/exit-pass"
                  className="w-full min-h-[48px] rounded-lg bg-white border border-[#E2D9CC] text-[13.5px] font-semibold text-[#1C1917] inline-flex items-center justify-center gap-2 hover:border-[#D84A2B]/40 hover:bg-[#FFFDFC] transition-colors shadow-xs"
                >
                  <QrCode className="w-4 h-4 text-[#D84A2B]" />
                  View Active Exit Pass
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Car}
            title="No Active Parking Session"
            description="You currently do not have a vehicle parked in a PARKNEX-enabled mall. Select a parking slot to start an active session."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/parking"
                  className="h-11 px-6 rounded-lg bg-[#D84A2B] text-white text-[13.5px] font-semibold hover:bg-[#C23E21] transition-colors inline-flex items-center justify-center gap-2 shadow-sm shadow-[#D84A2B]/20"
                >
                  Explore Parking Map
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/vehicle"
                  className="h-11 px-6 rounded-lg bg-white border border-[#E2D9CC] text-[#1C1917] text-[13.5px] font-semibold hover:border-[#D84A2B]/40 transition-colors inline-flex items-center justify-center"
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
