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
      const savedHistory = localStorage.getItem("parknex_parking_history") || localStorage.getItem("smartpark_parking_history");
      if (savedHistory) {
        setSessions(JSON.parse(savedHistory));
      } else {
        // High quality preview history entries
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
    <div className="min-h-[calc(100vh-68px)] w-full p-6 sm:p-8 lg:p-10 xl:p-12 bg-[#FBF8F3] flex flex-col justify-start">
      <div className="w-full max-w-[1500px] mx-auto">
        {/* Header */}
        <div className="pb-6 border-b border-[#EAE3D9] mb-8">
          <h1 className="text-[26px] sm:text-[28px] lg:text-[32px] font-bold text-[#1C1917] tracking-tight">
            Parking History & Receipts
          </h1>
          <p className="text-[14px] text-[#78716C] mt-1">
            Historical log of all your completed parking sessions, durations, and payment invoices
          </p>
        </div>

        {sessions.length > 0 ? (
          <div className="bg-white border border-[rgba(80,60,40,0.10)] rounded-2xl shadow-[0_6px_24px_rgba(80,50,20,0.035)] overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-[13.5px] min-w-[700px]">
                <thead className="border-b border-[#EAE3D9] text-[#78716C] uppercase text-[11px] font-bold bg-[#FAF7F2]">
                  <tr>
                    <th className="py-4 px-6 sm:px-8">Date & Mall</th>
                    <th className="py-4 px-6">Vehicle</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Duration</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6 sm:px-8">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D9] text-[#57534E]">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FAF7F2]/70 transition-all duration-180 cursor-default group">
                      <td className="py-4.5 px-6 sm:px-8">
                        <p className="text-[#1C1917] font-bold text-[14px]">{s.mall}</p>
                        <p className="text-[11.5px] text-[#78716C] mt-0.5">{s.date}</p>
                      </td>
                      <td className="py-4.5 px-6 text-[#1C1917] font-medium">{s.vehicle}</td>
                      <td className="py-4.5 px-6">
                        <p className="text-[#1C1917] font-bold">Floor {s.floor}</p>
                        <p className="text-[12px] text-[#D84A2B] font-semibold font-mono mt-0.5">{s.pillarSlot}</p>
                      </td>
                      <td className="py-4.5 px-6 text-[#1C1917] font-medium">{s.duration}</td>
                      <td className="py-4.5 px-6 text-[#1C1917] font-bold text-[14.5px]">{s.amount}</td>
                      <td className="py-4.5 px-6 sm:px-8">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 whitespace-nowrap">
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
                className="h-11 px-6 rounded-lg bg-[#D84A2B] text-white text-[13.5px] font-semibold hover:bg-[#C23E21] transition-colors inline-flex items-center justify-center gap-2 shadow-sm shadow-[#D84A2B]/20"
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
