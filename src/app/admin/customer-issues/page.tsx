"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  CarFront,
  MessageSquare,
  Search,
  Filter,
} from "lucide-react";

export default function AdminCustomerIssuesPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("OPEN");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const reports = useQuery(api.reports.listReports, {
    status: selectedStatus === "ALL" ? undefined : (selectedStatus as any),
  });

  const resolveReportMutation = useMutation(api.reports.resolveReport);

  const handleResolve = async (reportId: any) => {
    setResolvingId(reportId);
    try {
      await resolveReportMutation({ reportId });
    } catch (err: any) {
      alert("Failed to resolve issue: " + err.message);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded border border-[#EF4444]/20">
              CUSTOMER ASSISTANCE
            </span>
            <span className="text-[12px] text-[rgba(245,247,250,0.5)]">· Incident Dispatch</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#F5F7FA] tracking-tight">
            Customer Issues &amp; Reports ({reports?.length ?? 0})
          </h1>
          <p className="text-[13.5px] text-[rgba(245,247,250,0.65)] mt-0.5">
            Live tickets submitted by drivers from their mobile dashboard for instant operator assistance.
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center bg-[#10151D] border border-white/[0.08] p-1 rounded-xl">
          {["OPEN", "IN_PROGRESS", "RESOLVED", "ALL"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                selectedStatus === st
                  ? "bg-[#D84A2B] text-white shadow-xs"
                  : "text-[rgba(245,247,250,0.6)] hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Queue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports && reports.length > 0 ? (
          reports.map((r) => (
            <div
              key={r._id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                r.status === "OPEN"
                  ? "bg-[#10151D] border-[#EF4444]/40 shadow-[0_4px_20px_rgba(239,68,68,0.1)]"
                  : r.status === "RESOLVED"
                  ? "bg-[#10151D]/50 border-white/[0.06] opacity-75"
                  : "bg-[#10151D] border-[#F59E0B]/30"
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        r.status === "OPEN"
                          ? "bg-[#EF4444]/20 text-[#EF4444]"
                          : r.status === "RESOLVED"
                          ? "bg-[#10B981]/20 text-[#10B981]"
                          : "bg-[#F59E0B]/20 text-[#F59E0B]"
                      }`}
                    >
                      {r.status === "RESOLVED" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-extrabold text-[14.5px] text-white">
                      {r.issueType}
                    </span>
                  </div>

                  <span
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
                      r.status === "OPEN"
                        ? "bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]"
                        : r.status === "RESOLVED"
                        ? "bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]"
                        : "bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                {/* Issue Details */}
                {r.details && (
                  <p className="text-[13px] text-[rgba(245,247,250,0.85)] bg-[#0A0D14] p-3 rounded-xl border border-white/[0.06] leading-relaxed">
                    &ldquo;{r.details}&rdquo;
                  </p>
                )}

                {/* Spatial Context */}
                <div className="flex flex-wrap items-center gap-3 text-[12px] text-[rgba(245,247,250,0.65)]">
                  <div className="flex items-center gap-1.5">
                    <CarFront className="w-3.5 h-3.5 text-[#D84A2B]" />
                    <span className="font-mono font-bold text-white">{r.vehicleNumber}</span>
                  </div>
                  {r.floor && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-white/40" />
                      <span>Level {r.floor} · {r.pillar || "Main Bay"}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(r.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {r.status !== "RESOLVED" && (
                <button
                  type="button"
                  onClick={() => handleResolve(r._id)}
                  disabled={resolvingId === r._id}
                  className="w-full h-10 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-[13px] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{resolvingId === r._id ? "Resolving..." : "Mark as Resolved"}</span>
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-2 py-16 text-center text-[rgba(245,247,250,0.5)] bg-[#10151D] border border-white/[0.08] rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto mb-3 opacity-60" />
            <p className="text-[15px] font-bold text-white">All Clear — No Open Issues</p>
            <p className="text-[12.5px] text-white/50 mt-1">
              Customer problem submissions will appear here in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
