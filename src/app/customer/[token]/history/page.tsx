"use client";

import React, { useState, useEffect, use } from "react";
import { Clock, Car, CheckCircle2, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

interface CustomerHistoryRecord {
  id: string;
  bookingNumber: string;
  vehicleNumber: string;
  mallName: string;
  floor: string;
  zone: string;
  pillar: string;
  slotNumber: string;
  entryTime: string;
  exitTime: string | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  customerAccessToken: string;
}

export default function CustomerHistoryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const historyData = useQuery(api.bookings.getCustomerHistory, { token });
  const loading = historyData === undefined;
  const history = historyData || [];

  const fetchCustomerHistory = () => {
    // Convex automatically handles real-time updates
  };

  const computeDuration = (entry: string, exit?: string | null) => {
    const start = new Date(entry).getTime();
    const end = exit ? new Date(exit).getTime() : Date.now();
    const diffMins = Math.max(1, Math.round((end - start) / (60 * 1000)));

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D9]">
        <div className="flex items-center gap-3">
          <Link
            href={`/customer/${token}`}
            className="w-10 h-10 rounded-xl bg-white border border-[#E2D9CC] flex items-center justify-center text-[#78716C] hover:text-[#D84A2B] hover:border-[#D84A2B]/40 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-bold text-[#1C1917] tracking-tight">
              Parking Activity History
            </h1>
            <p className="text-[12.5px] text-[#78716C]">Previous parking sessions and completed receipts</p>
          </div>
        </div>

        <button
          onClick={fetchCustomerHistory}
          disabled={loading}
          className="w-10 h-10 rounded-xl bg-white border border-[#E2D9CC] flex items-center justify-center text-[#78716C] hover:text-[#D84A2B] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#D84A2B]" : ""}`} />
        </button>
      </div>

      {/* History Items List */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center text-[#D84A2B] mb-3 animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>
          <p className="text-[13px] text-[#78716C]">Loading session history...</p>
        </div>
      ) : history.length > 0 ? (
        <div className="flex flex-col gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-6 sm:p-7 shadow-[0_8px_32px_rgba(80,50,20,0.03)] flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center text-[#D84A2B]">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-[#A8A29E] font-bold">
                      {item.bookingNumber}
                    </span>
                    <h3 className="text-[18px] font-extrabold text-[#1C1917] font-mono">
                      {item.vehicleNumber}
                    </h3>
                  </div>
                </div>

                <span
                  className={`text-[11.5px] font-bold px-3 py-1 rounded-full border ${
                    item.status === "ACTIVE"
                      ? "bg-[#D84A2B]/10 text-[#D84A2B] border-[#D84A2B]/20 animate-pulse"
                      : "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {/* Location metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D9] text-[13px]">
                <div>
                  <p className="text-[10px] text-[#A8A29E] uppercase font-bold">Location</p>
                  <p className="text-[#1C1917] font-bold mt-0.5">Floor {item.floor}</p>
                  <p className="text-[11.5px] text-[#D84A2B] font-semibold">{item.slotNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#A8A29E] uppercase font-bold">Pillar</p>
                  <p className="text-[#1C1917] font-bold mt-0.5">{item.pillar}</p>
                  <p className="text-[11.5px] text-[#78716C]">{item.zone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#A8A29E] uppercase font-bold">Entry</p>
                  <p className="text-[#1C1917] font-medium mt-0.5">
                    {new Date(item.entryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-[11px] text-[#A8A29E]">{new Date(item.entryTime).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#A8A29E] uppercase font-bold">Duration</p>
                  <p className="text-[#1C1917] font-bold mt-0.5">{computeDuration(item.entryTime, item.exitTime)}</p>
                  <p className="text-[11px] text-[#10B981] font-semibold">
                    {item.exitTime ? "Exit Verified" : "In Progress"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-10 text-center flex flex-col items-center">
          <Clock className="w-12 h-12 text-[#A8A29E] mb-3" strokeWidth={1.5} />
          <h3 className="text-[17px] font-bold text-[#1C1917]">No Previous Parking Activity</h3>
          <p className="text-[13px] text-[#78716C] mt-1">
            Your completed parking visits will automatically appear in this history tab.
          </p>
        </div>
      )}
    </div>
  );
}
