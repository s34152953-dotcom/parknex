"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  Car,
  Phone,
  RefreshCw,
  ExternalLink,
  Calendar,
  Filter,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface BookingItem {
  id: string;
  bookingNumber: string;
  vehicleNumber: string;
  phoneNumber: string;
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

export default function AdminHistoryPage() {
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [floorFilter, setFloorFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [retryStatus, setRetryStatus] = useState<Record<string, "retrying" | "success" | "error">>({});

  const bookings = useQuery(api.bookings.listBookings, {
    status: statusFilter === "ALL" ? undefined : statusFilter,
    floor: floorFilter === "ALL" ? undefined : floorFilter,
    query: searchQuery.trim() || undefined,
    date: dateFilter || undefined,
  }) || [];
  
  const retrySmsMutation = useMutation(api.bookings.retrySms);
  
  const loading = bookings.length === 0 && useQuery(api.bookings.listBookings, {}) === undefined; // approximate loading state

  const fetchBookings = () => {
    // Convex is real-time, no manual refresh needed, but we can reset filters if they click refresh
  };

  // Mask Phone for privacy (e.g. +91 ••••••4821)
  const maskPhone = (phone: string) => {
    if (!phone) return "";
    const parts = phone.split(" ");
    if (parts.length > 1) {
      const country = parts[0];
      const rest = parts.slice(1).join("");
      if (rest.length > 4) {
        return `${country} ••••••${rest.slice(-4)}`;
      }
    }
    return phone.length > 4 ? `••••••${phone.slice(-4)}` : phone;
  };

  // Compute duration
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
    <div className="w-full p-6 sm:p-8 lg:p-10 max-w-[1700px] mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#EAE3D9]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-bold text-[#D84A2B] uppercase tracking-wider">
              OPERATIONAL AUDIT
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[30px] font-bold text-[#1C1917] tracking-tight">
            Booking History & Parking Log
          </h1>
          <p className="text-[13.5px] text-[#78716C] mt-0.5">
            Full audit log of active and completed parking allocations
          </p>
        </div>

        <button
          onClick={fetchBookings}
          disabled={loading}
          className="h-11 px-5 rounded-2xl bg-white border border-[#E2D9CC] text-[#1C1917] text-[13.5px] font-semibold inline-flex items-center gap-2 hover:border-[#D84A2B]/40 hover:bg-[#FFFDFC] transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-[#D84A2B] ${loading ? "animate-spin" : ""}`} />
          Refresh Log
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-5 sm:p-6 shadow-[0_6px_28px_rgba(80,50,20,0.025)] flex flex-wrap items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search license plate, phone, booking ID, or pillar..."
            className="w-full h-11 pl-11 pr-4 rounded-2xl bg-[#FAF7F2] border border-[#E2D9CC] text-[#1C1917] placeholder:text-[#A8A29E] text-[13.5px] focus:border-[#D84A2B] focus:ring-2 focus:ring-[#D84A2B]/20 focus:outline-none transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 rounded-2xl bg-[#FAF7F2] border border-[#E2D9CC] text-[#1C1917] text-[13px] font-medium focus:border-[#D84A2B] focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Parking</option>
            <option value="COMPLETED">Completed Exit</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Floor Filter */}
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="h-11 px-4 rounded-2xl bg-[#FAF7F2] border border-[#E2D9CC] text-[#1C1917] text-[13px] font-medium focus:border-[#D84A2B] focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Floors</option>
            <option value="B2">Floor B2</option>
            <option value="B1">Floor B1</option>
            <option value="G">Ground Level</option>
          </select>

          {/* Date Filter */}
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-11 px-4 rounded-2xl bg-[#FAF7F2] border border-[#E2D9CC] text-[#1C1917] text-[13px] font-medium focus:border-[#D84A2B] focus:outline-none cursor-pointer"
            />
          </div>

          {(searchQuery || statusFilter !== "ALL" || floorFilter !== "ALL" || dateFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setFloorFilter("ALL");
                setDateFilter("");
              }}
              className="text-[12.5px] font-bold text-[#D84A2B] hover:underline px-2 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl shadow-[0_8px_32px_rgba(80,50,20,0.03)] overflow-hidden w-full">
        {bookings.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-[13.5px] min-w-[840px]">
              <thead className="border-b border-[#EAE3D9] text-[#78716C] uppercase text-[11px] font-bold bg-[#FAF7F2]">
                <tr>
                  <th className="py-4.5 px-6 sm:px-8">Booking & Plate</th>
                  <th className="py-4.5 px-6">Customer Phone</th>
                  <th className="py-4.5 px-6">Space Assigned</th>
                  <th className="py-4.5 px-6">Entry Time</th>
                  <th className="py-4.5 px-6">Exit Time</th>
                  <th className="py-4.5 px-6">Duration</th>
                  <th className="py-4.5 px-6">Status</th>
                  <th className="py-4.5 px-6 sm:px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D9] text-[#57534E]">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAF7F2]/80 transition-colors">
                    <td className="py-5 px-6 sm:px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center text-[#D84A2B] font-bold shrink-0">
                          <Car className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="text-[#1C1917] font-extrabold font-mono text-[14.5px]">
                            {b.vehicleNumber}
                          </p>
                          <p className="text-[12px] text-[#A8A29E] font-medium font-mono">{b.bookingNumber}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-5 px-6 font-medium text-[#1C1917]">
                      {maskPhone(b.phoneNumber)}
                    </td>

                    <td className="py-5 px-6">
                      <p className="text-[#1C1917] font-bold text-[14px]">
                        Floor {b.floor} · {b.slotNumber}
                      </p>
                      <p className="text-[12px] text-[#78716C]">{b.zone} ({b.pillar})</p>
                    </td>

                    <td className="py-5 px-6 text-[#1C1917] font-medium">
                      {new Date(b.entryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      <p className="text-[11.5px] text-[#A8A29E]">
                        {new Date(b.entryTime).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-5 px-6 text-[#1C1917] font-medium">
                      {b.exitTime ? (
                        <>
                          {new Date(b.exitTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          <p className="text-[11.5px] text-[#A8A29E]">
                            {new Date(b.exitTime).toLocaleDateString()}
                          </p>
                        </>
                      ) : (
                        <span className="text-[#A8A29E] italic text-[12.5px]">— Active —</span>
                      )}
                    </td>

                    <td className="py-5 px-6 font-bold text-[#1C1917]">
                      {computeDuration(b.entryTime, b.exitTime)}
                    </td>

                    <td className="py-5 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-bold ${
                          b.status === "ACTIVE"
                            ? "bg-[#D84A2B]/10 text-[#D84A2B] border border-[#D84A2B]/20 animate-pulse"
                            : b.status === "COMPLETED"
                            ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                            : "bg-[#78716C]/10 text-[#78716C] border border-[#78716C]/20"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${b.status === "ACTIVE" ? "bg-[#D84A2B]" : b.status === "COMPLETED" ? "bg-[#10B981]" : "bg-[#78716C]"}`} />
                        {b.status}
                      </span>
                    </td>

                    <td className="py-5 px-6 sm:px-8 text-right">
                      {b.status === "ACTIVE" && (
                        <button
                          disabled={retryStatus[b.id] === "retrying"}
                          onClick={async () => {
                            setRetryStatus(prev => ({ ...prev, [b.id]: "retrying" }));
                            try {
                              await retrySmsMutation({ bookingId: b.id });
                              setRetryStatus(prev => ({ ...prev, [b.id]: "success" }));
                              setTimeout(() => setRetryStatus(prev => ({ ...prev, [b.id]: undefined as any })), 3000);
                            } catch (e: any) {
                              setRetryStatus(prev => ({ ...prev, [b.id]: "error" }));
                              setTimeout(() => setRetryStatus(prev => ({ ...prev, [b.id]: undefined as any })), 3000);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#D84A2B] hover:underline disabled:opacity-50"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{retryStatus[b.id] === "retrying" ? "Retrying..." : retryStatus[b.id] === "success" ? "Sent!" : retryStatus[b.id] === "error" ? "Failed" : "Retry SMS"}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Clock className="w-12 h-12 text-[#A8A29E] mb-3" strokeWidth={1.5} />
            <h3 className="text-[17px] font-bold text-[#1C1917]">No Bookings Found</h3>
            <p className="text-[13px] text-[#78716C] mt-1 max-w-[340px]">
              No booking records match the selected filters. Clear filters or assign a parking slot on the Booking page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
