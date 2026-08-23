"use client";

import React, { useState } from "react";
import {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-[500px] bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 sm:p-7 shadow-[0_16px_48px_rgba(70,48,35,0.15)] flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#DED3C7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#241F1B]">Report a Parking Issue</h3>
              <p className="text-[12.5px] text-[#70675F]">
                Direct dispatch to mall parking operations team
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="w-8 h-8 rounded-lg bg-[#F3EAE0] hover:bg-[#EDE1D4] text-[#70675F] hover:text-[#241F1B] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2F7D5A]/15 text-[#2F7D5A] flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-[19px] font-bold text-[#241F1B]">Assistance Request Dispatched</h4>
              <p className="text-[14px] text-[#70675F] mt-1 max-w-[380px]">
                Our floor marshals at {mallName} have received your ticket for vehicle{" "}
                <span className="font-mono text-[#241F1B] font-bold">{vehicleNumber}</span>.
              </p>
              {reportId && (
                <div className="mt-3 inline-block px-3 py-1 rounded-md bg-[#F3EAE0] font-mono text-[12px] text-[#70675F]">
                  Ticket #{reportId.substring(0, 8).toUpperCase()}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="h-11 px-6 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[14px] transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#241F1B] uppercase tracking-wider">
                Select the issue
              </label>
              <select
                value={selectedIssue}
                onChange={(e) => setSelectedIssue(e.target.value)}
                className="h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] text-[13.5px] focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none"
              >
                {ISSUE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#241F1B] uppercase tracking-wider">
                Additional Details (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your location or the problem..."
                rows={3}
                className="p-3 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] placeholder:text-[#938980] text-[13.5px] focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none resize-none"
              />
            </div>

            <div className="bg-[#F3EAE0] border border-[#DED3C7] rounded-xl p-3 text-[12px] text-[#70675F]">
              <span>Vehicle: </span>
              <strong className="font-mono text-[#241F1B]">{vehicleNumber}</strong>
              {slotNumber && (
                <span>
                  {" "}
                  · Space: <strong className="text-[#241F1B]">{slotNumber}</strong> (Level {floor})
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="h-11 px-4 rounded-xl border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] text-[#241F1B] text-[13.5px] font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-11 px-6 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[13.5px] font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
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
