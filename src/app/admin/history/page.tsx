"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  CarFront,
  Phone,
  ShieldCheck,
  Calendar,
  Layers,
  History,
  FileText,
  UserCheck,
} from "lucide-react";

export default function AdminHistoryPage() {
  const [activeTab, setActiveTab] = useState<"sessions" | "audit">("sessions");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [floorFilter, setFloorFilter] = useState("ALL");

  const bookings = useQuery(api.bookings.listBookings, {
    status: statusFilter === "ALL" ? undefined : statusFilter,
    floor: floorFilter === "ALL" ? undefined : floorFilter,
    query: searchQuery.trim() || undefined,
  }) || [];

  const auditLogs = useQuery(api.audit.listAuditLogs, { limit: 100 }) || [];

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto flex flex-col gap-6 select-none text-[#241F1B]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DED3C7]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C93B2F] bg-[#F9E3DE] px-2 py-0.5 rounded border border-[#C93B2F]/20">
              OPERATIONAL AUDIT
            </span>
            <span className="text-[12px] text-[#70675F]">· Activity Logs</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#241F1B] tracking-tight">
            Parking History &amp; Audit Trail
          </h1>
          <p className="text-[13.5px] text-[#70675F] mt-0.5">
            Immutable log of all active, completed allocations, barrier scans, and operator overrides.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#F3EAE0] border border-[#DED3C7] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "sessions"
                ? "bg-[#C93B2F] text-white shadow-xs"
                : "text-[#70675F] hover:text-[#241F1B]"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Parking Sessions ({bookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "audit"
                ? "bg-[#C93B2F] text-white shadow-xs"
                : "text-[#70675F] hover:text-[#241F1B]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Operator Audit Log ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {activeTab === "sessions" ? (
        <div className="flex flex-col gap-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFFFFF] border border-[#DED3C7] p-3 rounded-2xl shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#70675F]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plate, phone..."
                  className="w-full bg-[#FAF7F2] border border-[#DED3C7] rounded-xl pl-9 pr-3 py-2 text-[13px] text-[#241F1B] placeholder:text-[#938980] focus:outline-none focus:border-[#C93B2F]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl px-3 py-2 text-[13px] text-[#241F1B] focus:outline-none focus:border-[#C93B2F]"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl px-3 py-2 text-[13px] text-[#241F1B] focus:outline-none focus:border-[#C93B2F]"
              >
                <option value="ALL">All Floors</option>
                <option value="B2">Level B2</option>
                <option value="B1">Level B1</option>
                <option value="G">Level G</option>
              </select>
            </div>

            <span className="text-[12px] text-[#70675F]">
              Showing {bookings.length} record{bookings.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Sessions Table */}
          <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13.5px]">
                <thead className="bg-[#F3EAE0] text-[11.5px] font-bold uppercase tracking-wider text-[#70675F] border-b border-[#DED3C7]">
                  <tr>
                    <th className="px-5 py-3.5">Booking Ref</th>
                    <th className="px-5 py-3.5">Vehicle Plate</th>
                    <th className="px-5 py-3.5">Space Allocated</th>
                    <th className="px-5 py-3.5">Entry / Exit Times</th>
                    <th className="px-5 py-3.5">Duration</th>
                    <th className="px-5 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DED3C7]">
                  {bookings.length > 0 ? (
                    bookings.map((b: any) => (
                      <tr key={b.id} className="hover:bg-[#FAF7F2] transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-[#241F1B] text-[13px]">
                          #{b.bookingNumber}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center">
                              <CarFront className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-mono font-black text-[#241F1B] block">
                                {b.vehicleNumber}
                              </span>
                              <span className="text-[11.5px] text-[#70675F]">
                                {b.phoneNumber || b.email || "Walk-In"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono font-bold text-[#241F1B] block">
                            Slot {b.slotNumber}
                          </span>
                          <span className="text-[11.5px] text-[#70675F]">
                            Level {b.floor} · {b.pillar}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[12.5px]">
                          <span className="text-[#241F1B] block font-medium">
                            In: {new Date(b.entryTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                          </span>
                          <span className="text-[#70675F]">
                            Out: {b.exitTime ? new Date(b.exitTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Active Inside"}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-[#241F1B] font-bold">
                          {computeDuration(b.entryTime, b.exitTime)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              b.status === "ACTIVE"
                                ? "bg-[#2F7D5A]/10 border-[#2F7D5A]/30 text-[#2F7D5A]"
                                : b.status === "COMPLETED"
                                ? "bg-[#F3EAE0] border-[#DED3C7] text-[#241F1B]"
                                : "bg-[#C93B2F]/10 border-[#C93B2F]/30 text-[#C93B2F]"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-[#70675F]">
                        No parking records matching the criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Operator Audit Log View */
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-[#F3EAE0] text-[11.5px] font-bold uppercase tracking-wider text-[#70675F] border-b border-[#DED3C7]">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Operator</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Details &amp; Reason</th>
                  <th className="px-5 py-3.5 text-right">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DED3C7]">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log: any) => (
                    <tr key={log._id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="px-5 py-4 font-mono text-[12px] text-[#70675F]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 font-bold text-[#241F1B] flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-[#C93B2F]" />
                        <span>{log.operatorEmail}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-[11.5px] px-2 py-0.5 rounded bg-[#F3EAE0] text-[#241F1B] border border-[#DED3C7]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[13px] text-[#241F1B] leading-snug">{log.details || "-"}</p>
                        {log.reason && (
                          <p className="text-[12px] text-[#B7791F] font-semibold italic mt-0.5">
                            Reason: &ldquo;{log.reason}&rdquo;
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-[11.5px] text-[#70675F]">
                        {log.targetType} ({log.targetId.substring(0, 10)})
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-[#70675F]">
                      No audit log records recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
