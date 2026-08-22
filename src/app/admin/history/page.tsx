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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#D84A2B] bg-[#D84A2B]/10 px-2 py-0.5 rounded border border-[#D84A2B]/20">
              OPERATIONAL AUDIT
            </span>
            <span className="text-[12px] text-[rgba(245,247,250,0.5)]">· Activity Logs</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#F5F7FA] tracking-tight">
            Parking History &amp; Audit Trail
          </h1>
          <p className="text-[13.5px] text-[rgba(245,247,250,0.65)] mt-0.5">
            Immutable log of all active, completed allocations, barrier scans, and operator overrides.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#10151D] border border-white/[0.08] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "sessions"
                ? "bg-[#D84A2B] text-white shadow-xs"
                : "text-[rgba(245,247,250,0.6)] hover:text-white"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Parking Sessions ({bookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "audit"
                ? "bg-[#D84A2B] text-white shadow-xs"
                : "text-[rgba(245,247,250,0.6)] hover:text-white"
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
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#10151D] border border-white/[0.08] p-3 rounded-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plate, phone..."
                  className="w-full bg-[#0A0D14] border border-white/[0.1] rounded-xl pl-9 pr-3 py-2 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#D84A2B]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0A0D14] border border-white/[0.1] rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#D84A2B]"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="bg-[#0A0D14] border border-white/[0.1] rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#D84A2B]"
              >
                <option value="ALL">All Floors</option>
                <option value="B2">Level B2</option>
                <option value="B1">Level B1</option>
                <option value="G">Level G</option>
              </select>
            </div>

            <span className="text-[12px] text-[rgba(245,247,250,0.5)]">
              Showing {bookings.length} record{bookings.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Sessions Table */}
          <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] text-[rgba(245,247,250,0.85)]">
                <thead className="bg-[#0A0D14] text-[11.5px] font-bold uppercase tracking-wider text-[rgba(245,247,250,0.5)] border-b border-white/[0.08]">
                  <tr>
                    <th className="px-5 py-4">Booking Ref</th>
                    <th className="px-5 py-4">Vehicle Plate</th>
                    <th className="px-5 py-4">Space Allocated</th>
                    <th className="px-5 py-4">Entry / Exit Times</th>
                    <th className="px-5 py-4">Duration</th>
                    <th className="px-5 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {bookings.length > 0 ? (
                    bookings.map((b: any) => (
                      <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-white text-[12.5px]">
                          #{b.bookingNumber}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <CarFront className="w-4 h-4 text-[#D84A2B]" />
                            <div>
                              <span className="font-mono font-black text-white block">
                                {b.vehicleNumber}
                              </span>
                              <span className="text-[11px] text-[rgba(245,247,250,0.5)]">
                                {b.phoneNumber || b.email || "Walk-In"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono font-bold text-white block">
                            Slot {b.slotNumber}
                          </span>
                          <span className="text-[11px] text-[rgba(245,247,250,0.6)]">
                            Level {b.floor} · {b.pillar}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[12px]">
                          <span className="text-white block">
                            In: {new Date(b.entryTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                          </span>
                          <span className="text-[rgba(245,247,250,0.5)]">
                            Out: {b.exitTime ? new Date(b.exitTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Active Inside"}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-white">
                          {computeDuration(b.entryTime, b.exitTime)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              b.status === "ACTIVE"
                                ? "bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]"
                                : b.status === "COMPLETED"
                                ? "bg-white/[0.08] border-white/[0.15] text-[rgba(245,247,250,0.8)]"
                                : "bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-[rgba(245,247,250,0.5)]">
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
        <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] text-[rgba(245,247,250,0.85)]">
              <thead className="bg-[#0A0D14] text-[11.5px] font-bold uppercase tracking-wider text-[rgba(245,247,250,0.5)] border-b border-white/[0.08]">
                <tr>
                  <th className="px-5 py-4">Timestamp</th>
                  <th className="px-5 py-4">Operator</th>
                  <th className="px-5 py-4">Action</th>
                  <th className="px-5 py-4">Details &amp; Reason</th>
                  <th className="px-5 py-4 text-right">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log: any) => (
                    <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-mono text-[12px] text-white/70">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 font-bold text-white flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-[#D84A2B]" />
                        <span>{log.operatorEmail}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-[11.5px] px-2 py-0.5 rounded bg-white/[0.06] text-white">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[12.5px] text-white leading-snug">{log.details || "-"}</p>
                        {log.reason && (
                          <p className="text-[11.5px] text-[#F59E0B] italic mt-0.5">
                            Reason: &ldquo;{log.reason}&rdquo;
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-[11.5px] text-white/50">
                        {log.targetType} ({log.targetId.substring(0, 10)})
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-[rgba(245,247,250,0.5)]">
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
