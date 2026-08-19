"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Car, MapPin, Calendar, CheckCircle2, ChevronRight, ArrowRight } from "lucide-react";

interface ParkingHistoryItem {
  id: string;
  date: string;
  mall: string;
  vehicle: string;
  floor: string;
  pillarSlot: string;
  duration: string;
  amount: string;
  status: string;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ParkingHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("smartpark_parking_history");
      if (savedHistory) {
        setSessions(JSON.parse(savedHistory));
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
      <div className="pb-6 border-b border-white/[0.06] mb-8">
        <h1 className="text-[26px] font-extrabold text-white tracking-tight">
          Parking History & Receipts
        </h1>
        <p className="text-[13px] text-white/50 mt-1">
          Historical log of all your completed parking sessions, durations, and payment invoices
        </p>
      </div>

      {sessions.length > 0 ? (
        <div className="bg-[#080C14]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-white/[0.06] text-white/40 uppercase text-[11px] font-semibold bg-white/[0.02]">
                <tr>
                  <th className="py-4 px-6">Date & Mall</th>
                  <th className="py-4 px-6">Vehicle</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-white/70">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <p className="text-white font-semibold">{s.mall}</p>
                      <p className="text-[11px] text-white/40">{s.date}</p>
                    </td>
                    <td className="py-4 px-6 text-white/70">{s.vehicle}</td>
                    <td className="py-4 px-6">
                      <p className="text-white font-medium">Floor {s.floor}</p>
                      <p className="text-[11px] text-cyan-400">{s.pillarSlot}</p>
                    </td>
                    <td className="py-4 px-6 text-white/70">{s.duration}</td>
                    <td className="py-4 px-6 text-white font-bold">{s.amount}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
        /* Clean Designed Empty State */
        <div className="w-full py-20 px-6 rounded-3xl bg-[#080C14]/50 border border-white/[0.06] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/40 mb-4 shadow-xl">
            <Clock className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h2 className="text-[19px] font-bold text-white mb-2">
            No Past Parking Sessions
          </h2>
          <p className="text-[13.5px] text-white/50 max-w-[380px] mb-7 leading-relaxed">
            Your completed parking sessions and invoice receipts will automatically appear here after exiting the garage.
          </p>
          <Link
            href="/parking"
            className="h-11 px-6 rounded-full bg-white text-[#040608] text-[13.5px] font-bold hover:bg-white/90 transition-colors shadow-lg shadow-white/10 flex items-center gap-2"
          >
            Find Parking Spot
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
