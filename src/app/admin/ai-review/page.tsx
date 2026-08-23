"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Loader2,
  ChevronRight,
  Info,
  Car,
  MapPin,
  Clock,
  User,
  Sparkles,
  FileText,
  HelpCircle,
  Check,
  X,
} from "lucide-react";

type ReviewStatusFilter = "all" | "pending" | "approved" | "rejected" | "investigating" | "resolved";
type SeverityFilter = "all" | "low" | "medium" | "high" | "critical";

export default function AiReviewPage() {
  const { data: session } = useSession();
  const reviewerEmail = session?.user?.email || "operator@parknex.com";

  const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>("pending");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const reviews = useQuery(api.ai.getAiReviews, {
    status: statusFilter,
    severity: severityFilter,
    limit: 100,
  });

  const reviewStats = useQuery(api.ai.getAiReviewStats, {});
  const resolveMutation = useMutation(api.ai.resolveAiReview);

  const filteredReviews = (reviews || []).filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.vehicle?.toLowerCase().includes(q) ||
      r.anomalyType?.toLowerCase().includes(q) ||
      r.parkingLocation?.toLowerCase().includes(q) ||
      r.reviewId?.toLowerCase().includes(q)
    );
  });

  const handleResolveAction = async (action: "approve" | "reject" | "investigate" | "resolve") => {
    if (!selectedReview) return;
    setIsProcessingAction(true);
    setActionSuccessMsg("");

    try {
      await resolveMutation({
        reviewId: selectedReview.reviewId,
        action,
        reviewerEmail,
        notes: actionNotes.trim() || undefined,
      });

      const actionLabels = {
        approve: "Approved",
        reject: "Rejected",
        investigate: "Marked for Investigation",
        resolve: "Resolved",
      };

      setActionSuccessMsg(`Review ${selectedReview.reviewId} has been ${actionLabels[action]}.`);
      setSelectedReview(null);
      setActionNotes("");

      setTimeout(() => {
        setActionSuccessMsg("");
      }, 4000);
    } catch (err: any) {
      alert("Failed to update AI review: " + err.message);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-[#F9E3DE] text-[#C93B2F] border border-[#C93B2F]/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C93B2F] animate-pulse" />
            CRITICAL
          </span>
        );
      case "high":
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-[#FEF5E7] text-[#D97706] border border-[#D97706]/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[#D97706]" />
            HIGH
          </span>
        );
      case "medium":
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-[#FAF7F2] text-[#70675F] border border-[#DED3C7]">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-[#FAF7F2] text-[#70675F] border border-[#DED3C7]">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EBF7F0] text-[#2F7D5A] border border-[#2F7D5A]/30">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F9E3DE] text-[#C93B2F] border border-[#C93B2F]/30">
            Rejected
          </span>
        );
      case "investigating":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF5E7] text-[#D97706] border border-[#D97706]/30">
            Investigating
          </span>
        );
      case "resolved":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF7F2] text-[#241F1B] border border-[#DED3C7]">
            Resolved
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-[#F9E3DE] text-[#C93B2F] border border-[#C93B2F]/25 animate-pulse">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1440px] mx-auto text-[#241F1B]">
      {/* ── 1. HEADER & METRIC CARDS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#241F1B]">
              AI Review Queue
            </h1>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#C93B2F] text-white">
              HUMAN-IN-THE-LOOP
            </span>
          </div>
          <p className="text-[13.5px] text-[#70675F] mt-1">
            Supervise AI decisions, anomaly detections, and low-confidence check-in events
          </p>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="bg-[#EBF7F0] border border-[#2F7D5A]/40 text-[#2F7D5A] text-[13.5px] font-bold px-5 py-3 rounded-xl flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#2F7D5A]" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Summary Metric Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[11.5px] font-bold uppercase text-[#70675F]">Pending Reviews</span>
          <div className="text-2xl sm:text-3xl font-black text-[#C93B2F] mt-2 font-mono">
            {reviewStats?.pending ?? 0}
          </div>
          <span className="text-[11.5px] text-[#70675F] mt-1">Requiring operator action</span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[11.5px] font-bold uppercase text-[#70675F]">Critical / High Risk</span>
          <div className="text-2xl sm:text-3xl font-black text-[#D97706] mt-2 font-mono">
            {(reviewStats?.critical ?? 0) + (reviewStats?.high ?? 0)}
          </div>
          <span className="text-[11.5px] text-[#70675F] mt-1">High-impact anomalies</span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[11.5px] font-bold uppercase text-[#70675F]">Approved Decisions</span>
          <div className="text-2xl sm:text-3xl font-black text-[#2F7D5A] mt-2 font-mono">
            {reviewStats?.approved ?? 0}
          </div>
          <span className="text-[11.5px] text-[#70675F] mt-1">Validated by operators</span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[11.5px] font-bold uppercase text-[#70675F]">Total Lifetime Audited</span>
          <div className="text-2xl sm:text-3xl font-black text-[#241F1B] mt-2 font-mono">
            {reviewStats?.total ?? 0}
          </div>
          <span className="text-[11.5px] text-[#70675F] mt-1">AI pipeline evaluations</span>
        </div>
      </div>

      {/* ── 2. FILTER CONTROLS & SEARCH ── */}
      <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["pending", "all", "approved", "rejected", "investigating", "resolved"] as ReviewStatusFilter[]).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-[12.5px] font-bold capitalize transition-all cursor-pointer shrink-0 ${
                statusFilter === st
                  ? "bg-[#C93B2F] text-white shadow-xs"
                  : "bg-[#FAF7F2] text-[#70675F] border border-[#DED3C7] hover:text-[#241F1B]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Severity Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-[220px]">
            <Search className="w-4 h-4 text-[#70675F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vehicle or type..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#FAF7F2] border border-[#DED3C7] text-[#241F1B] text-[13px] focus:outline-none focus:border-[#C93B2F]"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="h-10 px-3 rounded-xl bg-[#FAF7F2] border border-[#DED3C7] text-[#241F1B] text-[12.5px] font-bold focus:outline-none focus:border-[#C93B2F]"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* ── 3. REVIEWS TABLE & LIST ── */}
      <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl shadow-xs overflow-hidden">
        {reviews === undefined ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-[#C93B2F] animate-spin" />
            <span className="text-[13px] text-[#70675F]">Loading review queue…</span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF7F0] text-[#2F7D5A] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-[17px] font-bold text-[#241F1B]">No AI reviews found</h3>
            <p className="text-[13.5px] text-[#70675F] max-w-sm">
              All parking events and anomalies matching the selected filter have been addressed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#DED3C7] text-[#70675F] text-[11px] uppercase font-black tracking-wider">
                  <th className="py-3.5 px-5">Severity</th>
                  <th className="py-3.5 px-5">Anomaly / Incident</th>
                  <th className="py-3.5 px-5">Vehicle</th>
                  <th className="py-3.5 px-5">Location</th>
                  <th className="py-3.5 px-5">AI Confidence</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Created</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DED3C7]">
                {filteredReviews.map((r) => {
                  const confPercent = Math.round((r.aiConfidence || 0) * 100);
                  const confLabel =
                    confPercent >= 85
                      ? `${confPercent}% — High confidence`
                      : `${confPercent}% — Review recommended`;

                  return (
                    <tr
                      key={r.reviewId}
                      className="hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                      onClick={() => setSelectedReview(r)}
                    >
                      <td className="py-4 px-5">{getSeverityBadge(r.severity)}</td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-[#241F1B] leading-tight">
                          {r.anomalyType.replace(/_/g, " ")}
                        </div>
                        <div className="text-[11.5px] text-[#70675F] truncate max-w-[240px] mt-0.5">
                          {r.recommendedAction}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-[#241F1B] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#DED3C7]">
                          {r.vehicle}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-[#70675F] font-medium">{r.parkingLocation}</td>
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span
                            className={`font-bold font-mono text-[12px] ${
                              confPercent >= 85 ? "text-[#2F7D5A]" : "text-[#D97706]"
                            }`}
                          >
                            {confLabel}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5">{getStatusBadge(r.status)}</td>
                      <td className="py-4 px-5 text-[#70675F] text-[12px]">
                        {new Date(r.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReview(r);
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

      {/* ── 4. REVIEW INSPECT & ACTION MODAL ── */}
      {selectedReview && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#FFFFFF] rounded-2xl border border-[#DED3C7] shadow-2xl p-6 sm:p-7 flex flex-col gap-5 text-[#241F1B] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DED3C7]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-black text-[#241F1B]">
                      {selectedReview.anomalyType.replace(/_/g, " ")}
                    </h3>
                    {getSeverityBadge(selectedReview.severity)}
                  </div>
                  <span className="text-[11.5px] font-mono text-[#70675F]">
                    Review ID: {selectedReview.reviewId} · Pipeline Exec: {selectedReview.pipelineExecutionId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="p-2 rounded-xl bg-[#FAF7F2] border border-[#DED3C7] text-[#70675F] hover:text-[#241F1B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Entity Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#DED3C7]">
                <span className="text-[11px] font-bold uppercase text-[#70675F]">Vehicle Plate</span>
                <span className="block text-[15px] font-mono font-black text-[#241F1B] mt-0.5">
                  {selectedReview.vehicle}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#DED3C7]">
                <span className="text-[11px] font-bold uppercase text-[#70675F]">Location</span>
                <span className="block text-[14px] font-bold text-[#241F1B] mt-0.5">
                  {selectedReview.parkingLocation}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#DED3C7]">
                <span className="text-[11px] font-bold uppercase text-[#70675F]">AI Confidence</span>
                <span className="block text-[14px] font-bold text-[#2F7D5A] mt-0.5">
                  {(selectedReview.aiConfidence * 100).toFixed(0)}% Fact-Checked
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#DED3C7]">
                <span className="text-[11px] font-bold uppercase text-[#70675F]">Current Status</span>
                <span className="block mt-0.5">{getStatusBadge(selectedReview.status)}</span>
              </div>
            </div>

            {/* AI Explanation */}
            <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-[#FAF7F2] border border-[#DED3C7]">
              <span className="text-[11.5px] font-bold uppercase text-[#70675F]">
                AI Intelligence Explanation
              </span>
              <p className="text-[13.5px] text-[#241F1B] leading-relaxed">
                {selectedReview.aiExplanation}
              </p>
            </div>

            {/* Recommended Action */}
            <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-[#FEF5E7] border border-[#D97706]/30 text-[#92400E]">
              <span className="text-[11.5px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Recommended Operator Action
              </span>
              <p className="text-[13px] font-bold">
                {selectedReview.recommendedAction}
              </p>
            </div>

            {/* Evidence Payload */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-bold uppercase text-[#70675F]">
                Diagnostic Evidence Payload
              </span>
              <pre className="p-3.5 rounded-xl bg-[#241F1B] text-[#FAF7F2] text-[12px] font-mono overflow-x-auto max-h-[140px]">
                {selectedReview.evidence}
              </pre>
            </div>

            {/* Optional Operator Notes Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#241F1B]">
                Operator Notes (Audit Log Trail)
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Add contextual justification or investigation notes..."
                rows={2}
                className="p-3 rounded-xl bg-[#FAF7F2] border border-[#DED3C7] text-[13px] focus:outline-none focus:border-[#C93B2F]"
              />
            </div>

            {/* Action Buttons: APPROVE, REJECT, INVESTIGATE */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-[#DED3C7]">
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2.5 rounded-xl border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] text-[#241F1B] text-[13px] font-bold transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleResolveAction("investigate")}
                disabled={isProcessingAction}
                className="px-4 py-2.5 rounded-xl bg-[#FEF5E7] hover:bg-[#FDE8C7] border border-[#D97706]/40 text-[#92400E] text-[13px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                <span>INVESTIGATE</span>
              </button>

              <button
                type="button"
                onClick={() => handleResolveAction("reject")}
                disabled={isProcessingAction}
                className="px-4 py-2.5 rounded-xl bg-[#F9E3DE] hover:bg-[#F3C7BD] border border-[#C93B2F]/40 text-[#C93B2F] text-[13px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-[#C93B2F]" />
                <span>REJECT</span>
              </button>

              <button
                type="button"
                onClick={() => handleResolveAction("approve")}
                disabled={isProcessingAction}
                className="px-5 py-2.5 rounded-xl bg-[#2F7D5A] hover:bg-[#25684A] text-white text-[13px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {isProcessingAction ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>APPROVE DECISION</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
