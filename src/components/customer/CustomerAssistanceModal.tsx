"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Send,
  HelpCircle,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const ISSUE_OPTIONS = [
  "Assigned space is occupied",
  "Pillar QR is damaged",
  "Wrong vehicle information",
  "Cannot find my car",
  "Exit pass is not working",
];

interface CustomerAssistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  vehicleNumber: string;
  mallName?: string;
  slotNumber?: string;
  floor?: string;
  pillar?: string;
}

export default function CustomerAssistanceModal({
  isOpen,
  onClose,
  bookingId,
  vehicleNumber,
  mallName = "Central Mall Grand",
  slotNumber = "",
  floor = "B2",
  pillar = "",
}: CustomerAssistanceModalProps) {
  const [selectedIssue, setSelectedIssue] = useState<string>(ISSUE_OPTIONS[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  const createReport = useMutation(api.reports.createReport);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue || !vehicleNumber) return;

    setLoading(true);
    try {
      const res = await createReport({
        bookingId: bookingId as any,
        vehicleNumber,
        issueType: selectedIssue,
        details: notes.trim(),
        mallName,
        slotNumber,
        floor,
        pillar,
      });
      setSubmitted(true);
      setReportId(res.reportId);
    } catch (err) {
      console.error("Failed to submit issue report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setNotes("");
    setReportId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px] sm:p-[24px] bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[500px] bg-[#10151D] border border-white/15 rounded-2xl p-[20px] sm:p-[24px] shadow-2xl flex flex-col gap-[20px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-[16px] border-b border-white/[0.08]">
          <div className="flex items-center gap-[10px]">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#F5F7FA]">Report a Parking Issue</h3>
              <p className="text-[12px] text-[rgba(245,247,250,0.58)]">
                Direct dispatch to mall parking operations team
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center text-center gap-[16px] py-[16px]">
            <div className="w-[56px] h-[56px] rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-[20px] font-bold text-white">Assistance Request Dispatched</h4>
              <p className="text-[14px] text-[rgba(245,247,250,0.58)] mt-[4px] max-w-[380px]">
                Our floor marshals at {mallName} have received your ticket for vehicle{" "}
                <span className="font-mono text-white font-bold">{vehicleNumber}</span>.
              </p>
              {reportId && (
                <div className="mt-[12px] inline-block px-3 py-1 rounded-md bg-white/[0.06] font-mono text-[12px] text-white/70">
                  Ticket #{reportId.substring(0, 8).toUpperCase()}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="h-[44px] px-[24px] rounded-xl bg-[#D84A2B] hover:bg-[#C64024] text-white font-bold text-[14px] transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[8px]">
              <label className="text-[12px] font-bold text-white/70 uppercase tracking-wider">
                Select the issue
              </label>
              <div className="flex flex-col gap-[8px]">
                {ISSUE_OPTIONS.map((issue) => (
                  <label
                    key={issue}
                    className={`flex items-center gap-[10px] p-[12px] rounded-xl border transition-all cursor-pointer text-[14px] ${
                      selectedIssue === issue
                        ? "bg-[#D84A2B]/10 border-[#D84A2B] text-white font-semibold"
                        : "bg-[#151B24] border-white/[0.08] text-[rgba(245,247,250,0.7)] hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="issueType"
                      value={issue}
                      checked={selectedIssue === issue}
                      onChange={() => setSelectedIssue(issue)}
                      className="accent-[#D84A2B]"
                    />
                    <span>{issue}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <label htmlFor="issueNotes" className="text-[12px] font-bold text-white/70 uppercase tracking-wider">
                Additional Details (Optional)
              </label>
              <textarea
                id="issueNotes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what you see or need help with..."
                className="w-full p-[12px] rounded-xl bg-[#151B24] border border-white/15 text-white placeholder-white/30 text-[14px] focus:border-[#D84A2B] focus:outline-none resize-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-[12px] pt-[8px]">
              <button
                type="button"
                onClick={handleReset}
                className="h-[44px] px-[16px] rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/80 font-semibold text-[14px] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedIssue}
                className="h-[44px] px-[20px] rounded-xl bg-[#D84A2B] hover:bg-[#C64024] disabled:opacity-50 text-white font-bold text-[14px] flex items-center gap-[8px] transition-all cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
