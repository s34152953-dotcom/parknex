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
  const [mallName] = useState("Central Mall - Downtown");

  const metrics = [
    { label: "Active Occupancy", value: "68%", trend: "+4% vs yesterday", color: "text-sp-blue" },
    { label: "Total Available Slots", value: "324", trend: "Across 4 floors", color: "text-sp-green" },
    { label: "ANPR Recognition Rate", value: "99.4%", trend: "Last 24 hours", color: "text-sp-cyan" },
    { label: "Active Revenue Today", value: "$4,820", trend: "142 completed sessions", color: "text-white" },
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
    <div className="min-h-[calc(100vh-64px)] w-full p-6 sm:p-10 bg-[#05070A] max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.06] mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sp-blue shadow-sm shadow-sp-blue" />
            <span className="text-[12px] font-bold uppercase tracking-wider text-sp-blue">
              Mall Operations Control
            </span>
          </div>
          <h1 className="text-[26px] font-extrabold text-white tracking-tight">
            {mallName}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[12.5px] text-sp-green flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sp-green/10 border border-sp-green/20 font-semibold">
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
            className="bg-sp-surface/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-lg"
          >
            <p className="text-[11px] font-medium text-sp-muted uppercase tracking-wider">
              {m.label}
            </p>
            <p className={`text-[28px] font-extrabold mt-1 tracking-tight ${m.color}`}>
              {m.value}
            </p>
            <p className="text-[12px] text-sp-secondary mt-1">{m.trend}</p>
          </div>
        ))}
      </div>

      {/* ANPR Camera Events Feed */}
      <div className="bg-sp-surface/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-bold text-white flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-sp-blue" />
            Live ANPR Camera Integration Feed
          </h2>
          <span className="text-[12px] text-sp-secondary">Real-time optical audit</span>
        </div>

        <div className="flex flex-col gap-3">
          {cameraFeeds.map((cam) => (
            <div
              key={cam.id}
              className="p-4 rounded-2xl bg-sp-elevated/50 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sp-blue/15 border border-sp-blue/25 flex items-center justify-center text-sp-blue shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-white">{cam.plate}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-sp-elevated border border-white/10 text-sp-nav">
                      {cam.id}
                    </span>
                  </div>
                  <p className="text-[12px] text-sp-secondary mt-0.5">{cam.location}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 text-right">
                <div>
                  <p className="text-[11px] text-sp-muted">Confidence</p>
                  <p className="text-[13px] font-semibold text-sp-green">{cam.confidence}</p>
                </div>
                <div>
                  <p className="text-[11px] text-sp-muted">Event</p>
                  <p className="text-[12px] font-medium text-white">{cam.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
