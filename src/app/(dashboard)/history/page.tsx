"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Car, MapPin, Calendar, CheckCircle2, ChevronRight, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

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
      } else {
        // High quality preview history entries matching reference
        setSessions([
          {
            id: "hist-1",
            date: "Today, Aug 19 · 11:20 AM",
            mall: "Central Mall Grand",
            vehicle: "Porsche Taycan (KA-01-MJ-2024)",
            floor: "B2",
            pillarSlot: "Pillar 18 · Slot A-14",
            duration: "1h 45m",
            amount: "$12.50",
            status: "Completed & Paid",
          },
          {
            id: "hist-2",
            date: "Yesterday, Aug 18 · 04:15 PM",
            mall: "Metro Galleria Mall",
            vehicle: "Porsche Taycan (KA-01-MJ-2024)",
            floor: "B1",
            pillarSlot: "Pillar 09 · Slot B-06",
            duration: "2h 30m",
            amount: "$18.00",
            status: "Completed & Paid",
          },
          {
            id: "hist-3",
            date: "Aug 15, 2026 · 01:00 PM",
            mall: "Skyline Avenue Plaza",
            vehicle: "Porsche Taycan (KA-01-MJ-2024)",
            floor: "G Level",
            pillarSlot: "Pillar 03 · Slot G-02",
            duration: "45m",
            amount: "$6.00",
            status: "Completed & Paid",
          },
          {
            id: "hist-4",
            date: "Aug 12, 2026 · 07:30 PM",
            mall: "Central Mall Grand",
            vehicle: "Porsche Taycan (KA-01-MJ-2024)",
            floor: "B3",
            pillarSlot: "Pillar 22 · Slot C-11",
            duration: "3h 10m",
            amount: "$22.00",
            status: "Completed & Paid",
          },
          {
            id: "hist-5",
            date: "Aug 08, 2026 · 02:40 PM",
            mall: "Westfield Mega Center",
            vehicle: "Porsche Taycan (KA-01-MJ-2024)",
            floor: "B2",
            pillarSlot: "Pillar 14 · Slot A-08",
            duration: "1h 15m",
            amount: "$10.00",
            status: "Completed & Paid",
          },
        ]);
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
        <div className="pb-6 border-b border-[#333333] mb-8">
          <h1 className="text-[24px] sm:text-[26px] font-extrabold text-white tracking-tight">
            Parking History & Receipts
          </h1>
          <p className="text-[13px] text-white/50 mt-1">
            Historical log of all your completed parking sessions, durations, and payment invoices
          </p>
        </div>

        {sessions.length > 0 ? (
          <div className="bg-[#111111] border border-[#333333] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-[#333333] text-white/40 uppercase text-[11px] font-semibold bg-[#0a0a0a]">
                  <tr>
                    <th className="py-4 px-6">Date & Mall</th>
                    <th className="py-4 px-6">Vehicle</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Duration</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333] text-white/70">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-[#1a1a1a] transition-all duration-200 cursor-default group">
                      <td className="py-4 px-6">
                        <p className="text-white font-semibold text-[13.5px]">{s.mall}</p>
                        <p className="text-[11px] text-white/40 mt-0.5">{s.date}</p>
                      </td>
                      <td className="py-4 px-6 text-white/80 font-medium">{s.vehicle}</td>
                      <td className="py-4 px-6">
                        <p className="text-white font-semibold">Floor {s.floor}</p>
                        <p className="text-[11.5px] text-cyan-400 font-mono mt-0.5">{s.pillarSlot}</p>
                      </td>
                      <td className="py-4 px-6 text-white/80 font-medium">{s.duration}</td>
                      <td className="py-4 px-6 text-white font-bold text-[14px]">{s.amount}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
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
          <EmptyState
            icon={Clock}
            title="No Past Parking Sessions"
            description="Your completed parking sessions and invoice receipts will automatically appear here after exiting the garage."
            action={
              <Link
                href="/parking"
                className="h-11 px-6 rounded-md bg-white text-[#000000] text-[13.5px] font-bold hover:bg-[#E5E5E5] transition-colors inline-flex items-center justify-center gap-2"
              >
                Find Parking Spot
                <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
