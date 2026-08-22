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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto flex flex-col gap-6 select-none text-[#241F1B]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DED3C7]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C93B2F] bg-[#F9E3DE] px-2 py-0.5 rounded border border-[#C93B2F]/20">
              OPERATIONAL SESSIONS
            </span>
            <span className="text-[12px] text-[#70675F]">· In-Facility Vehicles</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#241F1B] tracking-tight">
            Active Parking Sessions ({sessions?.length ?? 0})
          </h1>
          <p className="text-[13.5px] text-[#70675F] mt-0.5">
            Real-time monitoring of currently parked vehicles, duration timers, and pillar confirmations.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Floor Filter */}
          <div className="flex items-center bg-[#F3EAE0] border border-[#DED3C7] p-1 rounded-xl">
            {["ALL", "B2", "B1", "G"].map((fl) => (
              <button
                key={fl}
                onClick={() => setSelectedFloor(fl)}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-bold transition-all cursor-pointer ${
                  selectedFloor === fl
                    ? "bg-[#C93B2F] text-white shadow-xs"
                    : "text-[#70675F] hover:text-[#241F1B]"
                }`}
              >
                {fl === "ALL" ? "All Levels" : `Level ${fl}`}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#70675F]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plate, space..."
              className="w-full bg-[#FFFFFF] border border-[#DED3C7] rounded-xl pl-9 pr-3 py-2 text-[13px] text-[#241F1B] placeholder:text-[#938980] focus:outline-none focus:border-[#C93B2F]"
            />
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13.5px]">
            <thead className="bg-[#F3EAE0] text-[11.5px] font-bold uppercase tracking-wider text-[#70675F] border-b border-[#DED3C7]">
              <tr>
                <th className="px-5 py-3.5">Vehicle Plate</th>
                <th className="px-5 py-3.5">Assigned Space</th>
                <th className="px-5 py-3.5">Pillar Confirmation</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5">Fallback Code</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DED3C7]">
              {sessions && sessions.length > 0 ? (
                sessions.map((s) => (
                  <tr key={s._id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center">
                          <CarFront className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-mono font-black text-[#241F1B] text-[14px] block">
                            {s.vehicleNumber}
                          </span>
                          <span className="text-[11.5px] text-[#70675F]">
                            {s.phoneNumber || s.email || "Walk-In"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-[#241F1B] block">
                        Space {s.slotNumber}
                      </span>
                      <span className="text-[11.5px] text-[#70675F]">
                        Level {s.floor} · {s.zone} ({s.pillar})
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {s.pillarConfirmedAt ? (
                        <div className="flex items-center gap-1.5 text-[#2F7D5A] font-bold text-[12px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirmed at {s.confirmedPillar || s.pillar}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[#B7791F] font-bold text-[12px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Awaiting Customer Pillar Scan</span>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-[#241F1B] font-bold">
                        <Clock className="w-3.5 h-3.5 text-[#C93B2F]" />
                        <span>{getDuration(s.entryTime)}</span>
                      </div>
                      <span className="text-[11px] text-[#70675F]">
                        Entered {new Date(s.entryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-[#C93B2F] bg-[#F9E3DE] px-2 py-1 rounded border border-[#C93B2F]/20 text-[12px]">
                        {s.fallbackCode || "N/A"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {s.phoneNumber && (
                        <button
                          type="button"
                          onClick={() => handleResend(s._id)}
                          disabled={resendingId === s._id}
                          className="px-3 py-1.5 rounded-lg border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] text-[#241F1B] text-[12px] font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          {resendingId === s._id ? "Sending..." : "Resend SMS"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#70675F]">
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
