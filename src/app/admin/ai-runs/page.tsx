"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Sparkles,
  Search,
  Filter,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Coins,
  ChevronRight,
  ExternalLink,
  Layers,
  Terminal,
  X,
  FileCode,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function RocketRideRunsPage() {
  const [pipelineFilter, setPipelineFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRun, setSelectedRun] = useState<any | null>(null);

  const runs = useQuery(api.ai.getRocketRideRuns, {
    pipeline: pipelineFilter === "all" ? undefined : pipelineFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100,
  });

  const filteredRuns = (runs || []).filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.executionId?.toLowerCase().includes(q) ||
      r.pipeline?.toLowerCase().includes(q) ||
      r.inputSummary?.toLowerCase().includes(q) ||
      r.outputSummary?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EBF7F0] text-[#2F7D5A] border border-[#2F7D5A]/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            COMPLETED
          </span>
        );
      case "FAILED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F9E3DE] text-[#C93B2F] border border-[#C93B2F]/30 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            FAILED
          </span>
        );
      case "RUNNING":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF5E7] text-[#D97706] border border-[#D97706]/30 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            RUNNING
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF7F2] text-[#70675F] border border-[#DED3C7]">
            {status}
          </span>
        );
    }
  };

  const getPipelineIcon = (pipeline: string) => {
    return <Zap className="w-4 h-4 text-[#C93B2F]" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1440px] mx-auto text-[#241F1B]">
      {/* ── 1. HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#241F1B]">
              RocketRide Pipeline Executions
            </h1>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#C93B2F] text-white">
              AUDIT TRAIL
            </span>
          </div>
          <p className="text-[13.5px] text-[#70675F] mt-1">
            Live execution telemetry, latency profiling, confidence metrics, and usage analytics for RocketRide pipelines
          </p>
        </div>
      </div>

      {/* ── 2. FILTER CONTROLS ── */}
      <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={pipelineFilter}
            onChange={(e) => setPipelineFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#FAF7F2] border border-[#DED3C7] text-[#241F1B] text-[12.5px] font-bold focus:outline-none focus:border-[#C93B2F]"
          >
            <option value="all">All Pipelines</option>
            <option value="parking-verification">parking-verification.pipe</option>
            <option value="parking-recommendation">parking-recommendation.pipe</option>
            <option value="parking-anomaly">parking-anomaly.pipe</option>
            <option value="occupancy-reconciliation">occupancy-reconciliation.pipe</option>
            <option value="parknex-assistant">parknex-assistant.pipe</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#FAF7F2] border border-[#DED3C7] text-[#241F1B] text-[12.5px] font-bold focus:outline-none focus:border-[#C93B2F]"
          >
            <option value="all">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="RUNNING">Running</option>
          </select>
        </div>

        <div className="relative w-full sm:w-[240px]">
          <Search className="w-4 h-4 text-[#70675F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search execution ID or text..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#FAF7F2] border border-[#DED3C7] text-[#241F1B] text-[13px] focus:outline-none focus:border-[#C93B2F]"
          />
        </div>
      </div>

      {/* ── 3. EXECUTION RUNS TABLE ── */}
      <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl shadow-xs overflow-hidden">
        {runs === undefined ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-[#C93B2F] animate-spin" />
            <span className="text-[13px] text-[#70675F]">Loading execution telemetry…</span>
          </div>
        ) : filteredRuns.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-[17px] font-bold text-[#241F1B]">No pipeline runs recorded</h3>
            <p className="text-[13.5px] text-[#70675F] max-w-sm">
              Invocations from check-in, recommendation, anomaly audit, or batch reconciliation will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#DED3C7] text-[#70675F] text-[11px] uppercase font-black tracking-wider">
                  <th className="py-3.5 px-5">Pipeline</th>
                  <th className="py-3.5 px-5">Execution ID</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Confidence</th>
                  <th className="py-3.5 px-5">Records (In / Out)</th>
                  <th className="py-3.5 px-5">Duration</th>
                  <th className="py-3.5 px-5">Cost</th>
                  <th className="py-3.5 px-5">Started At</th>
                  <th className="py-3.5 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DED3C7]">
                {filteredRuns.map((r) => {
                  return (
                    <tr
                      key={r.executionId}
                      className="hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                      onClick={() => setSelectedRun(r)}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          {getPipelineIcon(r.pipeline)}
                          <span className="font-bold text-[#241F1B] font-mono text-[12.5px]">
                            {r.pipeline}.pipe
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono text-[12px] text-[#70675F]">
                        {r.executionId}
                      </td>
                      <td className="py-4 px-5">{getStatusBadge(r.status)}</td>
                      <td className="py-4 px-5">
                        {r.confidence ? (
                          <span className="font-mono font-bold text-[#2F7D5A]">
                            {(r.confidence * 100).toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-[#70675F]">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-5 font-mono text-[12px] text-[#241F1B]">
                        {r.inputRecordCount} in / {r.outputRecordCount} out
                      </td>
                      <td className="py-4 px-5 font-mono text-[12px] text-[#241F1B]">
                        {r.durationMs}ms
                      </td>
                      <td className="py-4 px-5 font-mono text-[12px] text-[#2F7D5A] font-bold">
                        ${r.estimatedCost || 0.0004}
                      </td>
                      <td className="py-4 px-5 text-[#70675F] text-[12px]">
                        {new Date(r.startedAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRun(r);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EDE1D4] border border-[#DED3C7] text-[#241F1B] text-[12px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. RUN INSPECTOR MODAL ── */}
      {selectedRun && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#FFFFFF] rounded-2xl border border-[#DED3C7] shadow-2xl p-6 sm:p-7 flex flex-col gap-5 text-[#241F1B] max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DED3C7]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-black text-[#241F1B]">
                      {selectedRun.pipeline}.pipe
                    </h3>
                    {getStatusBadge(selectedRun.status)}
                  </div>
                  <span className="text-[11.5px] font-mono text-[#70675F]">
                    Execution ID: {selectedRun.executionId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRun(null)}
                className="p-2 rounded-xl bg-[#FAF7F2] border border-[#DED3C7] text-[#70675F] hover:text-[#241F1B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#DED3C7]">
                <span className="text-[11px] font-bold uppercase text-[#70675F]">Duration</span>
                <span className="block text-[15px] font-mono font-black text-[#241F1B] mt-0.5">
                  {selectedRun.durationMs}ms
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#DED3C7]">
                <span className="text-[11px] font-bold uppercase text-[#70675F]">Confidence</span>
                <span className="block text-[14px] font-bold text-[#2F7D5A] mt-0.5">
                  {selectedRun.confidence ? `${(selectedRun.confidence * 100).toFixed(0)}%` : "N/A"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#DED3C7]">
                <span className="text-[11px] font-bold uppercase text-[#70675F]">Usage / Tokens</span>
                <span className="block text-[12px] font-mono text-[#241F1B] mt-0.5 truncate">
                  {selectedRun.usage || "Standard"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#DED3C7]">
                <span className="text-[11px] font-bold uppercase text-[#70675F]">Estimated Cost</span>
                <span className="block text-[14px] font-bold font-mono text-[#2F7D5A] mt-0.5">
                  ${selectedRun.estimatedCost || 0.0004}
                </span>
              </div>
            </div>

            {/* Input Summary */}
            <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#DED3C7]">
              <span className="text-[11.5px] font-bold uppercase text-[#70675F]">Input Summary</span>
              <p className="text-[13px] text-[#241F1B] font-mono">
                {selectedRun.inputSummary || "N/A"}
              </p>
            </div>

            {/* Output Summary */}
            <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#DED3C7]">
              <span className="text-[11.5px] font-bold uppercase text-[#70675F]">Output Summary</span>
              <p className="text-[13px] text-[#241F1B] font-mono">
                {selectedRun.outputSummary || "N/A"}
              </p>
            </div>

            {/* Errors if any */}
            {selectedRun.errorMessage && (
              <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#F9E3DE] border border-[#C93B2F]/30 text-[#C93B2F]">
                <span className="text-[11.5px] font-bold uppercase">Error Diagnostic</span>
                <p className="text-[12.5px] font-mono">{selectedRun.errorMessage}</p>
              </div>
            )}

            {/* Close Button */}
            <div className="flex items-center justify-end pt-3 border-t border-[#DED3C7]">
              <button
                type="button"
                onClick={() => setSelectedRun(null)}
                className="px-5 py-2 rounded-xl bg-[#241F1B] text-white text-[13px] font-bold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
