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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-6 shadow-[0_6px_28px_rgba(80,50,20,0.025)] hover:shadow-[0_10px_32px_rgba(80,50,20,0.04)] transition-all"
          >
            <p className="text-[11.5px] font-bold text-[#A8A29E] uppercase tracking-wider">
              {m.label}
            </p>
            <p className={`text-[30px] font-extrabold mt-1.5 tracking-tight ${m.color}`}>
              {m.value}
            </p>
            <p className="text-[13px] text-[#78716C] mt-1">{m.trend}</p>
          </div>
        ))}
      </div>

      {/* ANPR Camera Events Feed */}
      <div className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-7 sm:p-9 shadow-[0_8px_32px_rgba(80,50,20,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 className="text-[19px] font-bold text-[#1C1917] flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-[#D84A2B]" />
            Live ANPR Camera Integration Feed
          </h2>
          <span className="text-[13px] text-[#78716C]">Real-time optical audit</span>
        </div>

        <div className="flex flex-col gap-3.5">
          {cameraFeeds.map((cam) => (
            <div
              key={cam.id}
              className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center text-[#D84A2B] shrink-0 shadow-2xs">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[15px] font-bold text-[#1C1917] font-mono">{cam.plate}</span>
                    <span className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-lg bg-white border border-[#E2D9CC] text-[#78716C]">
                      {cam.id}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#78716C] mt-0.5">{cam.location}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 text-right">
                <div>
                  <p className="text-[10.5px] text-[#A8A29E] font-bold uppercase tracking-wider">Confidence</p>
                  <p className="text-[14px] font-bold text-[#10B981]">{cam.confidence}</p>
                </div>
                <div>
                  <p className="text-[10.5px] text-[#A8A29E] font-bold uppercase tracking-wider">Event</p>
                  <p className="text-[13.5px] font-semibold text-[#1C1917]">{cam.status}</p>
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
