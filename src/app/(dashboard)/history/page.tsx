"use client";

import React, { useState } from "react";
import { Clock, Car, MapPin, Calendar, CheckCircle2, ChevronRight } from "lucide-react";

export default function HistoryPage() {
  const [sessions] = useState([
    {
      id: "sess-1",
      date: "Aug 18, 2026",
      mall: "Central Mall",
      vehicle: "Hyundai Creta · KA-01-MJ-2024",
      floor: "B2",
      pillarSlot: "Pillar 18, Slot A-18",
      duration: "2 hrs 15 min",
      amount: "$60.00",
      status: "Completed",
    },
    {
      id: "sess-2",
      date: "Aug 14, 2026",
      mall: "Central Mall",
      vehicle: "Hyundai Creta · KA-01-MJ-2024",
      floor: "B1",
      pillarSlot: "Pillar 04, Slot B-06",
      duration: "1 hr 10 min",
      amount: "$40.00",
      status: "Completed",
    },
  ]);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full p-6 sm:p-10 bg-[#05070A] max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-white/[0.06] mb-8">
        <h1 className="text-[26px] font-extrabold text-white tracking-tight">
          Parking History
        </h1>
        <p className="text-[13px] text-sp-secondary mt-1">
          View your past parking sessions, duration, and receipt records
        </p>
      </div>

      {sessions.length > 0 ? (
        <div className="bg-sp-surface/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-white/[0.06] text-sp-muted uppercase text-[11px] font-semibold bg-sp-elevated/40">
                <tr>
                  <th className="py-4 px-6">Date & Mall</th>
                  <th className="py-4 px-6">Vehicle</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-sp-nav">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <p className="text-white font-semibold">{s.mall}</p>
                      <p className="text-[11px] text-sp-muted">{s.date}</p>
                    </td>
                    <td className="py-4 px-6 text-sp-secondary">{s.vehicle}</td>
                    <td className="py-4 px-6">
                      <p className="text-white font-medium">Floor {s.floor}</p>
                      <p className="text-[11px] text-sp-cyan">{s.pillarSlot}</p>
                    </td>
                    <td className="py-4 px-6 text-sp-secondary">{s.duration}</td>
                    <td className="py-4 px-6 text-white font-bold">{s.amount}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sp-green/10 text-sp-green border border-sp-green/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center">
          <Clock className="w-10 h-10 text-sp-muted mx-auto mb-3" />
          <h2 className="text-[16px] font-bold text-white">No previous parking sessions.</h2>
        </div>
      )}
    </div>
  );
}
