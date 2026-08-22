"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Layers,
  Search,
  Clock,
  CarFront,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  QrCode,
  Share2,
  RefreshCw,
} from "lucide-react";

export default function AdminActiveSessionsPage() {
  const [search, setSearch] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("ALL");

  const sessions = useQuery(api.bookings.listActiveSessions, {
    floor: selectedFloor,
    search: search || undefined,
  });

  const retrySmsMutation = useMutation(api.bookings.retrySms);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleResend = async (bookingId: any) => {
    setResendingId(bookingId);
    try {
      await retrySmsMutation({ bookingId });
      alert("SMS pass notification queued for dispatch.");
    } catch (err: any) {
      alert("Failed to resend: " + err.message);
    } finally {
      setResendingId(null);
    }
  };

  const getDuration = (entryTimeStr: string) => {
    const start = new Date(entryTimeStr).getTime();
    const now = Date.now();
    const diffMins = Math.max(1, Math.floor((now - start) / 60000));
    if (diffMins < 60) return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#D84A2B] bg-[#D84A2B]/10 px-2 py-0.5 rounded border border-[#D84A2B]/20">
              OPERATIONAL SESSIONS
            </span>
            <span className="text-[12px] text-[rgba(245,247,250,0.5)]">· In-Facility Vehicles</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#F5F7FA] tracking-tight">
            Active Parking Sessions ({sessions?.length ?? 0})
          </h1>
          <p className="text-[13.5px] text-[rgba(245,247,250,0.65)] mt-0.5">
            Real-time monitoring of currently parked vehicles, duration timers, and pillar confirmations.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Floor Filter */}
          <div className="flex items-center bg-[#10151D] border border-white/[0.08] p-1 rounded-xl">
            {["ALL", "B2", "B1", "G"].map((fl) => (
              <button
                key={fl}
                onClick={() => setSelectedFloor(fl)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                  selectedFloor === fl
                    ? "bg-[#D84A2B] text-white shadow-xs"
                    : "text-[rgba(245,247,250,0.6)] hover:text-white"
                }`}
              >
                {fl === "ALL" ? "All Levels" : `Level ${fl}`}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plate, space..."
              className="w-full bg-[#10151D] border border-white/[0.1] rounded-xl pl-9 pr-3 py-2 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#D84A2B]"
            />
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[rgba(245,247,250,0.85)]">
            <thead className="bg-[#0A0D14] text-[11.5px] font-bold uppercase tracking-wider text-[rgba(245,247,250,0.5)] border-b border-white/[0.08]">
              <tr>
                <th className="px-5 py-4">Vehicle Plate</th>
                <th className="px-5 py-4">Assigned Space</th>
                <th className="px-5 py-4">Pillar Confirmation</th>
                <th className="px-5 py-4">Duration</th>
                <th className="px-5 py-4">Fallback Code</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sessions && sessions.length > 0 ? (
                sessions.map((s) => (
                  <tr key={s._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#D84A2B]/10 border border-[#D84A2B]/20 flex items-center justify-center text-[#D84A2B]">
                          <CarFront className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-mono font-black text-white text-[14px] block">
                            {s.vehicleNumber}
                          </span>
                          <span className="text-[11px] text-[rgba(245,247,250,0.5)]">
                            {s.phoneNumber || s.email || "Walk-In"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-white block">
                        Space {s.slotNumber}
                      </span>
                      <span className="text-[11.5px] text-[rgba(245,247,250,0.6)]">
                        Level {s.floor} · {s.zone} ({s.pillar})
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {s.pillarConfirmedAt ? (
                        <div className="flex items-center gap-1.5 text-[#10B981] font-semibold text-[12px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirmed at {s.confirmedPillar || s.pillar}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[#F59E0B] font-semibold text-[12px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Awaiting Customer Pillar Scan</span>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-white">
                        <Clock className="w-3.5 h-3.5 text-[#D84A2B]" />
                        <span>{getDuration(s.entryTime)}</span>
                      </div>
                      <span className="text-[10.5px] text-[rgba(245,247,250,0.45)]">
                        Entered {new Date(s.entryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-[#D84A2B] bg-[#D84A2B]/10 px-2 py-1 rounded border border-[#D84A2B]/20 text-[12px]">
                        {s.fallbackCode || "N/A"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {s.phoneNumber && (
                        <button
                          type="button"
                          onClick={() => handleResend(s._id)}
                          disabled={resendingId === s._id}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white text-[11.5px] font-semibold transition-colors cursor-pointer"
                        >
                          {resendingId === s._id ? "Sending..." : "Resend SMS"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[rgba(245,247,250,0.5)]">
                    No active parking sessions matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
