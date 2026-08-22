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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto flex flex-col gap-6 select-none text-[#241F1B]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DED3C7]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C93B2F] bg-[#F9E3DE] px-2 py-0.5 rounded border border-[#C93B2F]/20">
              CUSTOMER ASSISTANCE
            </span>
            <span className="text-[12px] text-[#70675F]">· Incident Dispatch</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#241F1B] tracking-tight">
            Customer Issues &amp; Reports ({reports?.length ?? 0})
          </h1>
          <p className="text-[13.5px] text-[#70675F] mt-0.5">
            Live tickets submitted by drivers from their mobile dashboard for instant operator assistance.
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center bg-[#F3EAE0] border border-[#DED3C7] p-1 rounded-xl">
          {["OPEN", "IN_PROGRESS", "RESOLVED", "ALL"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-bold transition-all cursor-pointer ${
                selectedStatus === st
                  ? "bg-[#C93B2F] text-white shadow-xs"
                  : "text-[#70675F] hover:text-[#241F1B]"
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
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)] ${
                r.status === "OPEN"
                  ? "bg-[#FFFFFF] border-[#C93B2F]/40"
                  : r.status === "RESOLVED"
                  ? "bg-[#FAF7F2] border-[#DED3C7] opacity-80"
                  : "bg-[#FFFFFF] border-[#B7791F]/30"
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        r.status === "OPEN"
                          ? "bg-[#F9E3DE] text-[#C93B2F]"
                          : r.status === "RESOLVED"
                          ? "bg-[#2F7D5A]/15 text-[#2F7D5A]"
                          : "bg-[#B7791F]/15 text-[#B7791F]"
                      }`}
                    >
                      {r.status === "RESOLVED" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-extrabold text-[15px] text-[#241F1B]">
                      {r.issueType}
                    </span>
                  </div>

                  <span
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
                      r.status === "OPEN"
                        ? "bg-[#C93B2F]/10 border-[#C93B2F]/30 text-[#C93B2F]"
                        : r.status === "RESOLVED"
                        ? "bg-[#2F7D5A]/10 border-[#2F7D5A]/30 text-[#2F7D5A]"
                        : "bg-[#B7791F]/10 border-[#B7791F]/30 text-[#B7791F]"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                {/* Issue Details */}
                {r.details && (
                  <p className="text-[13px] text-[#241F1B] bg-[#FAF7F2] p-3 rounded-xl border border-[#DED3C7] leading-relaxed">
                    &ldquo;{r.details}&rdquo;
                  </p>
                )}

                {/* Spatial Context */}
                <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#70675F]">
                  <div className="flex items-center gap-1.5">
                    <CarFront className="w-3.5 h-3.5 text-[#C93B2F]" />
                    <span className="font-mono font-bold text-[#241F1B]">{r.vehicleNumber}</span>
                  </div>
                  {r.floor && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#70675F]" />
                      <span>Level {r.floor} · {r.pillar || "Main Bay"}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[#70675F]">
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
                  className="w-full h-10 rounded-xl bg-[#2F7D5A] hover:bg-[#236346] text-white font-bold text-[13px] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{resolvingId === r._id ? "Resolving..." : "Mark as Resolved"}</span>
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-2 py-16 text-center text-[#70675F] bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
            <CheckCircle2 className="w-12 h-12 text-[#2F7D5A] mx-auto mb-3" />
            <p className="text-[16px] font-bold text-[#241F1B]">All Clear — No Open Issues</p>
            <p className="text-[13px] text-[#70675F] mt-1">
              Customer problem submissions will appear here in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
