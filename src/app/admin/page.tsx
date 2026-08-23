"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import {
  Car,
  Layers,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  MapPin,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  UploadCloud,
  Loader2,
  CheckCircle2,
  Building2,
} from "lucide-react";
import ParknexAssistantModal from "@/components/ui/ParknexAssistantModal";

export default function AdminCommandCenterPage() {
  const stats = useQuery(api.ai.getCommandCenterStats, {});
  const zoneStats = useQuery(api.ai.getZoneOccupancyStats, {});
  const activeBookings = useQuery(api.bookings.listBookings, { status: "ACTIVE" });
  const pendingReviews = useQuery(api.ai.getAiReviews, { status: "pending", limit: 5 });

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAuditingAnomalies, setIsAuditingAnomalies] = useState(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);

  const handleRunAnomalyAudit = async () => {
    setIsAuditingAnomalies(true);
    setAuditResult(null);

    try {
      const activeSessions = activeBookings || [];
      const res = await fetch("/api/rocketride/audit-anomalies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId: "cm-grand",
          activeSessions,
          slots: [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAuditResult(data.data);
      }
    } catch (err: any) {
      console.warn("[Anomaly Audit Error]:", err.message);
    } finally {
      setIsAuditingAnomalies(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1440px] mx-auto text-[#241F1B]">
      {/* ── 1. COMMAND CENTER HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#241F1B]">
              ParkNex Command Center
            </h1>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#C93B2F] text-white">
              ROCKETRIDE AI
            </span>
          </div>
          <p className="text-[13.5px] text-[#70675F] mt-1">
            Real-time facility intelligence, autonomous occupancy monitoring, and AI pipeline orchestration
          </p>
        </div>

        {/* Quick Action Triggers */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRunAnomalyAudit}
            disabled={isAuditingAnomalies}
            className="h-10 px-4 rounded-xl bg-[#FAF7F2] hover:bg-[#EDE1D4] border border-[#DED3C7] text-[#241F1B] text-[13px] font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isAuditingAnomalies ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#C93B2F]" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-[#C93B2F]" />
            )}
            <span>Run Anomaly Audit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAssistantOpen(true)}
            className="h-10 px-4 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[13px] font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask ParkNex AI</span>
          </button>
        </div>
      </div>

      {/* Audit Banner Result if triggered */}
      {auditResult && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FEF5E7] border border-[#D97706]/40 text-[#92400E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-[#D97706] shrink-0" />
            <div>
              <div className="font-black text-[14.5px]">
                Anomaly Audit Completed ({auditResult.anomaliesDetected.length} detected)
              </div>
              <div className="text-[12.5px] mt-0.5">
                Audited {auditResult.totalSessionsAudited} active sessions across {auditResult.totalSlotsAudited} bays in {auditResult.durationMs}ms.
              </div>
            </div>
          </div>
          {auditResult.reviewCount > 0 && (
            <Link
              href="/admin/ai-review"
              className="px-4 py-2 rounded-xl bg-[#D97706] text-white text-[12.5px] font-bold flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <span>View Review Queue ({auditResult.reviewCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* ── 2. REAL-TIME LIVE STATS KPI GRID ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase text-[#70675F]">Vehicles Inside</span>
          <div className="text-2xl sm:text-3xl font-black text-[#241F1B] mt-2 font-mono">
            {stats?.vehiclesInside ?? 0}
          </div>
          <span className="text-[11.5px] text-[#2F7D5A] font-bold mt-1">Active registered sessions</span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase text-[#70675F]">Occupancy Rate</span>
          <div className="text-2xl sm:text-3xl font-black text-[#C93B2F] mt-2 font-mono">
            {stats?.occupancyRate ?? 0}%
          </div>
          <span className="text-[11.5px] text-[#70675F] mt-1">
            {stats?.occupiedSpaces ?? 0} / {stats?.totalSpaces ?? 10} occupied
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase text-[#70675F]">Available Spaces</span>
          <div className="text-2xl sm:text-3xl font-black text-[#2F7D5A] mt-2 font-mono">
            {stats?.availableSpaces ?? 0}
          </div>
          <span className="text-[11.5px] text-[#70675F] mt-1">Ready for allocation</span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase text-[#70675F]">Pending AI Reviews</span>
          <div className="text-2xl sm:text-3xl font-black text-[#D97706] mt-2 font-mono">
            {stats?.pendingAiReviews ?? 0}
          </div>
          <span className="text-[11.5px] text-[#C93B2F] font-bold mt-1">Human-in-the-loop queue</span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase text-[#70675F]">RocketRide Runs Today</span>
          <div className="text-2xl sm:text-3xl font-black text-[#241F1B] mt-2 font-mono">
            {stats?.rocketrideRunsTotal ?? 0}
          </div>
          <span className="text-[11.5px] text-[#2F7D5A] font-bold mt-1">Pipeline telemetry</span>
        </div>
      </div>

      {/* ── 3. PARKING ZONE OCCUPANCY CARDS ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-black text-[#241F1B]">Parking Zones Distribution</h2>
          <Link
            href="/admin/booking"
            className="text-[12.5px] font-bold text-[#C93B2F] hover:underline flex items-center gap-1"
          >
            <span>Open Interactive Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(zoneStats || []).map((z: any) => (
            <div
              key={z.id}
              className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 shadow-xs flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-black text-[#241F1B]">{z.zoneName}</h3>
                  <span className="text-[12px] text-[#70675F]">Floor {z.floor}</span>
                </div>
                <span className="font-mono text-[16px] font-black text-[#241F1B]">
                  {z.occupancyRate}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#FAF7F2] h-2.5 rounded-full overflow-hidden border border-[#DED3C7]">
                <div
                  className="h-full bg-[#C93B2F] rounded-full transition-all duration-300"
                  style={{ width: `${z.occupancyRate}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[12px]">
                <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#DED3C7]">
                  <span className="block font-mono font-bold text-[#241F1B]">{z.total}</span>
                  <span className="text-[10.5px] text-[#70675F]">Total</span>
                </div>
                <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#DED3C7]">
                  <span className="block font-mono font-bold text-[#C93B2F]">{z.occupied}</span>
                  <span className="text-[10.5px] text-[#70675F]">Occupied</span>
                </div>
                <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#DED3C7]">
                  <span className="block font-mono font-bold text-[#2F7D5A]">{z.available}</span>
                  <span className="text-[10.5px] text-[#70675F]">Available</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. TWO-COLUMN OPERATIONAL SUMMARY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Recent AI Reviews Requiring Approval */}
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DED3C7]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#C93B2F]" />
              <h3 className="text-[16px] font-black text-[#241F1B]">Pending AI Reviews</h3>
            </div>
            <Link
              href="/admin/ai-review"
              className="text-[12.5px] font-bold text-[#C93B2F] hover:underline flex items-center gap-1"
            >
              <span>View All ({pendingReviews?.length || 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!pendingReviews || pendingReviews.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-[#2F7D5A]" />
              <p className="text-[13.5px] font-bold text-[#241F1B]">All AI decisions approved</p>
              <p className="text-[12px] text-[#70675F]">No anomalies pending human operator review</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {pendingReviews.map((r: any) => (
                <Link
                  key={r.reviewId}
                  href="/admin/ai-review"
                  className="p-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EDE1D4] border border-[#DED3C7] flex items-center justify-between transition-colors"
                >
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[13.5px] text-[#241F1B] bg-white px-2 py-0.5 rounded border border-[#DED3C7]">
                        {r.vehicle}
                      </span>
                      <span className="font-bold text-[12.5px] text-[#241F1B] truncate">
                        {r.anomalyType.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className="text-[11.5px] text-[#70675F] mt-1 truncate">
                      {r.parkingLocation} · {(r.aiConfidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#F9E3DE] text-[#C93B2F] uppercase shrink-0">
                    {r.severity}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Operational Workflows */}
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DED3C7]">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#C93B2F]" />
              <h3 className="text-[16px] font-black text-[#241F1B]">Quick Operator Hub</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/admin/new-entry"
              className="p-4 rounded-xl bg-[#FAF7F2] hover:bg-[#EDE1D4] border border-[#DED3C7] flex flex-col justify-between transition-all"
            >
              <Car className="w-5 h-5 text-[#C93B2F]" />
              <div className="mt-3">
                <div className="font-bold text-[14px] text-[#241F1B]">New Vehicle Entry</div>
                <div className="text-[11.5px] text-[#70675F] mt-0.5">ANPR camera check-in</div>
              </div>
            </Link>

            <Link
              href="/admin/scan-exit"
              className="p-4 rounded-xl bg-[#FAF7F2] hover:bg-[#EDE1D4] border border-[#DED3C7] flex flex-col justify-between transition-all"
            >
              <Clock className="w-5 h-5 text-[#2F7D5A]" />
              <div className="mt-3">
                <div className="font-bold text-[14px] text-[#241F1B]">Gate QR Scanner</div>
                <div className="text-[11.5px] text-[#70675F] mt-0.5">Verify cryptographic pass</div>
              </div>
            </Link>

            <Link
              href="/admin/batch-reconciliation"
              className="p-4 rounded-xl bg-[#FAF7F2] hover:bg-[#EDE1D4] border border-[#DED3C7] flex flex-col justify-between transition-all"
            >
              <UploadCloud className="w-5 h-5 text-[#D97706]" />
              <div className="mt-3">
                <div className="font-bold text-[14px] text-[#241F1B]">Batch Reconciliation</div>
                <div className="text-[11.5px] text-[#70675F] mt-0.5">CSV/JSON traffic audit</div>
              </div>
            </Link>

            <Link
              href="/admin/ai-runs"
              className="p-4 rounded-xl bg-[#FAF7F2] hover:bg-[#EDE1D4] border border-[#DED3C7] flex flex-col justify-between transition-all"
            >
              <Sparkles className="w-5 h-5 text-[#C93B2F]" />
              <div className="mt-3">
                <div className="font-bold text-[14px] text-[#241F1B]">RocketRide Telemetry</div>
                <div className="text-[11.5px] text-[#70675F] mt-0.5">Pipeline execution logs</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── PARKNEX GLOBAL AI ASSISTANT MODAL ── */}
      <ParknexAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        userRole="ADMIN"
        facilityStats={stats}
        recentAnomalies={pendingReviews}
      />
    </div>
  );
}
