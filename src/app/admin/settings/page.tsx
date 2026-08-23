"use client";

import React, { useState } from "react";
import { Route, ChevronDown, ChevronUp, Info } from "lucide-react";

export default function AdminSettingsPage() {
  const [isAiCardExpanded, setIsAiCardExpanded] = useState<boolean>(true);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto flex flex-col gap-6 select-none text-[#241F1B]">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DED3C7]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C93B2F] bg-[#F9E3DE] px-2 py-0.5 rounded border border-[#C93B2F]/20">
              SETTINGS &amp; ROADMAP
            </span>
            <span className="text-[12px] text-[#70675F]">· Platform Capabilities</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#241F1B] tracking-tight">
            Future Implementations
          </h1>
          <p className="text-[13.5px] text-[#70675F] mt-0.5">
            Architectural roadmap and planned intelligent capabilities scheduled for future platform releases.
          </p>
        </div>
      </div>

      {/* ── AI-Assisted Parking Recommendation Roadmap Card ── */}
      <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-[0_8px_24px_rgba(70,48,35,0.06)] transition-all">
        {/* Card Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center shrink-0 shadow-xs">
              <Route className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-[18px] sm:text-[21px] font-black text-[#241F1B] tracking-tight">
                  AI-Assisted Parking Recommendation
                </h2>
                {/* Disabled Status Control */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#DED3C7] text-[#70675F] text-[11.5px] font-bold cursor-not-allowed select-none">
                  <span className="w-2 h-2 rounded-full bg-[#938980]" />
                  <span>Status: Planned</span>
                </span>
              </div>
              <p className="text-[13.5px] text-[#70675F]">
                Intelligent arrival-triggered space allocation engine for high-traffic facilities.
              </p>
            </div>
          </div>

          {/* Expand / Collapse Control */}
          <button
            type="button"
            onClick={() => setIsAiCardExpanded(!isAiCardExpanded)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#DED3C7] bg-[#FAF7F2] hover:bg-[#F3EAE0] text-[#241F1B] text-[13px] font-bold transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
          >
            <span>{isAiCardExpanded ? "Hide Details" : "View Details & Phases"}</span>
            {isAiCardExpanded ? (
              <ChevronUp className="w-4 h-4 text-[#70675F]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#70675F]" />
            )}
          </button>
        </div>

        {/* Notice Banner */}
        <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-4 flex items-center gap-3 text-[13px] text-[#70675F]">
          <Info className="w-4.5 h-4.5 text-[#C93B2F] shrink-0" />
          <span>
            <strong className="text-[#241F1B]">Platform Notice:</strong> This feature is not enabled in the current version.
          </span>
        </div>

        {/* Expandable Body */}
        {isAiCardExpanded && (
          <div className="flex flex-col gap-6 pt-3 border-t border-[#DED3C7]">
            {/* Feature Description */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#70675F]">
                Feature Scope &amp; Allocation Criteria
              </h3>
              <p className="text-[14px] text-[#241F1B] leading-relaxed">
                When implemented, this feature will analyze live parking availability and recommend the three most suitable spaces after a vehicle arrives. Recommendations will consider:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                <div className="flex items-center gap-2.5 text-[13.5px] text-[#241F1B]">
                  <span className="w-2 h-2 rounded-full bg-[#C93B2F]" />
                  <span>Driving distance from the entry gate</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13.5px] text-[#241F1B]">
                  <span className="w-2 h-2 rounded-full bg-[#C93B2F]" />
                  <span>Floor and lane congestion</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13.5px] text-[#241F1B]">
                  <span className="w-2 h-2 rounded-full bg-[#C93B2F]" />
                  <span>Vehicle size</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13.5px] text-[#241F1B]">
                  <span className="w-2 h-2 rounded-full bg-[#C93B2F]" />
                  <span>Accessible and EV requirements</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13.5px] text-[#241F1B]">
                  <span className="w-2 h-2 rounded-full bg-[#C93B2F]" />
                  <span>Proximity to lifts and mall entrances</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13.5px] text-[#241F1B]">
                  <span className="w-2 h-2 rounded-full bg-[#C93B2F]" />
                  <span>Mechanical stacker availability</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13.5px] text-[#241F1B] md:col-span-2">
                  <span className="w-2 h-2 rounded-full bg-[#C93B2F]" />
                  <span>Historical occupancy patterns</span>
                </div>
              </div>
              <p className="text-[13px] text-[#70675F] bg-[#FAF7F2] p-3.5 rounded-xl border border-[#DED3C7] italic mt-1">
                The operator will always make the final assignment. Customers must not reserve spaces before arriving.
              </p>
            </div>

            {/* Implementation Phases */}
            <div className="flex flex-col gap-3.5">
              <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#70675F]">
                Implementation Phases
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phase 1 */}
                <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-4 sm:p-5 flex flex-col gap-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-black uppercase tracking-widest text-[#2F7D5A] bg-[#2F7D5A]/10 px-2 py-0.5 rounded border border-[#2F7D5A]/20">
                      PHASE 1
                    </span>
                    <h4 className="text-[15px] font-bold text-[#241F1B]">Smart Recommendation</h4>
                  </div>
                  <p className="text-[13px] text-[#70675F] leading-relaxed">
                    Real-time availability and transparent weighted ranking.
                  </p>
                </div>

                {/* Phase 2 */}
                <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-4 sm:p-5 flex flex-col gap-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-black uppercase tracking-widest text-[#3569A8] bg-[#3569A8]/10 px-2 py-0.5 rounded border border-[#3569A8]/20">
                      PHASE 2
                    </span>
                    <h4 className="text-[15px] font-bold text-[#241F1B]">AI Learning</h4>
                  </div>
                  <p className="text-[13px] text-[#70675F] leading-relaxed">
                    A machine-learning model trained using real parking history, congestion patterns and operator decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
