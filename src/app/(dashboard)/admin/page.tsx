"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Camera,
  Activity,
  Layers,
  CheckCircle,
  AlertTriangle,
  Users,
  Car,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [mallName] = useState("Central Mall Grand - Downtown");

  const metrics = [
    { label: "Active Occupancy", value: "68%", trend: "+4% vs yesterday", color: "text-[#D84A2B]" },
    { label: "Total Available Slots", value: "324", trend: "Across 4 floors", color: "text-[#10B981]" },
    { label: "ANPR Recognition Rate", value: "99.4%", trend: "Last 24 hours", color: "text-[#D84A2B]" },
    { label: "Active Revenue Today", value: "$4,820", trend: "142 completed sessions", color: "text-[#1C1917]" },
  ];

  const cameraFeeds = [
    {
      id: "CAM-01",
      location: "North Gate Entrance (ANPR A)",
      plate: "KA-01-MJ-2024",
      confidence: "99.8%",
      time: "2 mins ago",
      status: "Vehicle Entry Logged",
    },
    {
      id: "CAM-02",
      location: "South Gate Exit (Barrier B)",
      plate: "MH-02-CP-8812",
      confidence: "98.9%",
      time: "5 mins ago",
      status: "Exit Pass Verified",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-68px)] w-full p-6 sm:p-8 lg:p-10 xl:p-12 bg-[#FBF8F3] flex flex-col justify-start">
      <div className="w-full max-w-[1500px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EAE3D9] mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D84A2B]" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#D84A2B]">
                Mall Operations Control
              </span>
            </div>
            <h1 className="text-[26px] sm:text-[28px] lg:text-[32px] font-bold text-[#1C1917] tracking-tight">
              {mallName}
            </h1>
          </div>

        <div className="flex items-center gap-3">
          <span className="text-[12.5px] text-[#10B981] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 font-semibold">
            <Activity className="w-4 h-4" />
            System Live & Operational
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-white border border-[rgba(80,60,40,0.10)] rounded-2xl p-5 shadow-[0_4px_18px_rgba(80,50,20,0.025)]"
          >
            <p className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider">
              {m.label}
            </p>
            <p className={`text-[28px] font-extrabold mt-1 tracking-tight ${m.color}`}>
              {m.value}
            </p>
            <p className="text-[12.5px] text-[#78716C] mt-1">{m.trend}</p>
          </div>
        ))}
      </div>

      {/* ANPR Camera Events Feed */}
      <div className="bg-white border border-[rgba(80,60,40,0.10)] rounded-2xl p-6 sm:p-8 shadow-[0_6px_24px_rgba(80,50,20,0.035)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-bold text-[#1C1917] flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-[#D84A2B]" />
            Live ANPR Camera Integration Feed
          </h2>
          <span className="text-[12.5px] text-[#78716C]">Real-time optical audit</span>
        </div>

        <div className="flex flex-col gap-3">
          {cameraFeeds.map((cam) => (
            <div
              key={cam.id}
              className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center text-[#D84A2B] shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14.5px] font-bold text-[#1C1917] font-mono">{cam.plate}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E2D9CC] text-[#78716C]">
                      {cam.id}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#78716C] mt-0.5">{cam.location}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 text-right">
                <div>
                  <p className="text-[11px] text-[#A8A29E] font-bold uppercase">Confidence</p>
                  <p className="text-[13.5px] font-bold text-[#10B981]">{cam.confidence}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#A8A29E] font-bold uppercase">Event</p>
                  <p className="text-[13px] font-semibold text-[#1C1917]">{cam.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
}
