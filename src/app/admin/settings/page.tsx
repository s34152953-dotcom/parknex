"use client";

import React, { useState } from "react";
import {
  Route,
  ChevronDown,
  ChevronUp,
  Info,
  Car,
  Zap,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  SlidersHorizontal,
  Building2,
  Navigation,
} from "lucide-react";

interface VehicleProfile {
  id: string;
  name: string;
  plate: string;
  type: string;
  requirements: string[];
  tag: string;
}

const SAMPLE_PROFILES: VehicleProfile[] = [
  {
    id: "ev-suv",
    name: "Electric SUV",
    plate: "DL01EV4412",
    type: "EV · High Clearance",
    requirements: ["EV Charger Active", "Wide Turning Radius", "Proximity to Lift B"],
    tag: "EV & Wide Bay",
  },
  {
    id: "compact-sedan",
    name: "Compact Sedan",
    plate: "MH02AB1234",
    type: "Standard Petrol",
    requirements: ["Shortest Driving Route", "Low Lane Congestion"],
    tag: "Fastest Turnaround",
  },
  {
    id: "accessibility",
    name: "Priority Family Access",
    plate: "KA04CD9988",
    type: "Full-Size Hatchback",
    requirements: ["Zero-Step Lift Access", "Under 30m Walking Distance", "Covered Zone"],
    tag: "Accessibility",
  },
];

interface Recommendation {
  slot: string;
  floor: string;
  zone: string;
  score: number;
  badge: string;
  distance: string;
  walkTime: string;
  rationale: string;
  factors: { name: string; score: number }[];
}

const RECOMMENDATIONS_MAP: Record<string, Recommendation[]> = {
  "ev-suv": [
    {
      slot: "B-04",
      floor: "Basement 1",
      zone: "Zone B (Green)",
      score: 98,
      badge: "Best Match",
      distance: "45m driving",
      walkTime: "1 min to Lift B",
      rationale: "Equipped with 22kW AC charger, 3.2m extra-wide bay, lane congestion is clear (12%).",
      factors: [
        { name: "EV Charging Proximity", score: 100 },
        { name: "Bay Width & Clearance", score: 95 },
        { name: "Lane Congestion", score: 98 },
        { name: "Lift Accessibility", score: 100 },
      ],
    },
    {
      slot: "B-08",
      floor: "Basement 1",
      zone: "Zone B (Green)",
      score: 91,
      badge: "Alternative",
      distance: "65m driving",
      walkTime: "2 min to Lift B",
      rationale: "Standard EV charger equipped bay, minimal traffic, slightly further driving loop.",
      factors: [
        { name: "EV Charging Proximity", score: 100 },
        { name: "Bay Width & Clearance", score: 88 },
        { name: "Lane Congestion", score: 90 },
        { name: "Lift Accessibility", score: 86 },
      ],
    },
    {
      slot: "A-12",
      floor: "Basement 1",
      zone: "Zone A (Red)",
      score: 82,
      badge: "Backup",
      distance: "90m driving",
      walkTime: "3 min to Main Lift",
      rationale: "Standard wide bay without dedicated EV charger; suitable if rapid turnover needed.",
      factors: [
        { name: "EV Charging Proximity", score: 40 },
        { name: "Bay Width & Clearance", score: 98 },
        { name: "Lane Congestion", score: 94 },
        { name: "Lift Accessibility", score: 96 },
      ],
    },
  ],
  "compact-sedan": [
    {
      slot: "A-06",
      floor: "Basement 1",
      zone: "Zone A (Red)",
      score: 99,
      badge: "Best Match",
      distance: "30m driving",
      walkTime: "1 min to Central Atrium",
      rationale: "Immediate straight-line entry corridor, zero vehicle bottlenecks, fastest turn-in.",
      factors: [
        { name: "Entry Proximity", score: 100 },
        { name: "Driving Distance", score: 98 },
        { name: "Lane Flow Speed", score: 99 },
        { name: "Exit Pathway", score: 98 },
      ],
    },
    {
      slot: "A-09",
      floor: "Basement 1",
      zone: "Zone A (Red)",
      score: 93,
      badge: "Alternative",
      distance: "50m driving",
      walkTime: "2 min to Central Atrium",
      rationale: "Standard single space along primary circulation aisle, low congestion.",
      factors: [
        { name: "Entry Proximity", score: 92 },
        { name: "Driving Distance", score: 94 },
        { name: "Lane Flow Speed", score: 95 },
        { name: "Exit Pathway", score: 90 },
      ],
    },
    {
      slot: "C-03",
      floor: "Basement 2",
      zone: "Zone C (Blue)",
      score: 85,
      badge: "Backup",
      distance: "110m driving",
      walkTime: "3 min to Food Court Lift",
      rationale: "Spacious lower level parking bay with 90% available adjacent capacity.",
      factors: [
        { name: "Entry Proximity", score: 80 },
        { name: "Driving Distance", score: 82 },
        { name: "Lane Flow Speed", score: 96 },
        { name: "Exit Pathway", score: 84 },
      ],
    },
  ],
  accessibility: [
    {
      slot: "P-01",
      floor: "Ground Floor",
      zone: "Zone P (Priority)",
      score: 100,
      badge: "Best Match",
      distance: "20m driving",
      walkTime: "20m direct to Mall Gate A",
      rationale: "Zero incline, step-free access, 1.5m passenger side transfer zone directly next to Lift Lobby 1.",
      factors: [
        { name: "Step-Free Level Access", score: 100 },
        { name: "Walk Distance to Lift", score: 100 },
        { name: "Transfer Zone Width", score: 100 },
        { name: "Entry Gate Proximity", score: 100 },
      ],
    },
    {
      slot: "P-02",
      floor: "Ground Floor",
      zone: "Zone P (Priority)",
      score: 94,
      badge: "Alternative",
      distance: "35m driving",
      walkTime: "35m to Mall Gate A",
      rationale: "Dedicated accessibility bay, level ramp access to north escalator bank.",
      factors: [
        { name: "Step-Free Level Access", score: 100 },
        { name: "Walk Distance to Lift", score: 92 },
        { name: "Transfer Zone Width", score: 95 },
        { name: "Entry Gate Proximity", score: 90 },
      ],
    },
    {
      slot: "B-01",
      floor: "Basement 1",
      zone: "Zone B (Green)",
      score: 87,
      badge: "Backup",
      distance: "60m driving",
      walkTime: "40m to Lift B",
      rationale: "Wide end-of-row bay with direct corridor to hydraulic glass elevators.",
      factors: [
        { name: "Step-Free Level Access", score: 90 },
        { name: "Walk Distance to Lift", score: 85 },
        { name: "Transfer Zone Width", score: 90 },
        { name: "Entry Gate Proximity", score: 82 },
      ],
    },
  ],
};

export default function AdminSettingsPage() {
  const [isAiCardExpanded, setIsAiCardExpanded] = useState<boolean>(true);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("ev-suv");
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [isAssigned, setIsAssigned] = useState<boolean>(false);

  const activeProfile =
    SAMPLE_PROFILES.find((p) => p.id === selectedProfileId) || SAMPLE_PROFILES[0];
  const recommendations = RECOMMENDATIONS_MAP[selectedProfileId] || RECOMMENDATIONS_MAP["ev-suv"];
  const currentRecommendation = recommendations[selectedSlotIndex] || recommendations[0];

  const handleSelectProfile = (id: string) => {
    setSelectedProfileId(id);
    setSelectedSlotIndex(0);
    setIsAssigned(false);
  };

  const handleAssignRecommended = () => {
    setIsAssigned(true);
  };

  const handleResetSimulation = () => {
    setIsAssigned(false);
    setSelectedSlotIndex(0);
  };

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
        {/* Card Header & Status */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center shrink-0 shadow-xs">
              <Route className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-[18px] sm:text-[22px] font-black text-[#241F1B] tracking-tight">
                  AI-Assisted Parking Recommendation
                </h2>
                {/* Disabled Status Control */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#DED3C7] text-[#70675F] text-[11.5px] font-bold cursor-not-allowed select-none">
                  <span className="w-2 h-2 rounded-full bg-[#938980]" />
                  <span>Status: Planned</span>
                </span>
              </div>
              <p className="text-[13.5px] text-[#70675F]">
                Arrival-triggered multi-variable space evaluation and operator recommendation engine.
              </p>
            </div>
          </div>

          {/* Expand / Collapse Control */}
          <button
            type="button"
            onClick={() => setIsAiCardExpanded(!isAiCardExpanded)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#DED3C7] bg-[#FAF7F2] hover:bg-[#F3EAE0] text-[#241F1B] text-[13px] font-bold transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
          >
            <span>{isAiCardExpanded ? "Hide Interactive Example" : "View Interactive Example"}</span>
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
            <strong className="text-[#241F1B]">Platform Notice:</strong> This feature is not enabled in the current version. Below is an interactive architectural walkthrough demonstrating the planned recommendation workflow.
          </span>
        </div>

        {/* Expandable Interactive Example & Workflow */}
        {isAiCardExpanded && (
          <div className="flex flex-col gap-7 pt-4 border-t border-[#DED3C7]">
            {/* ── INTERACTIVE WORKFLOW SIMULATOR ── */}
            <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-2xl p-5 sm:p-7 flex flex-col gap-6">
              {/* Simulator Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DED3C7]">
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-5 h-5 text-[#C93B2F]" />
                  <div>
                    <h3 className="text-[15px] font-bold text-[#241F1B]">
                      Interactive Recommendation Workflow Example
                    </h3>
                    <p className="text-[12px] text-[#70675F]">
                      Select a sample vehicle profile arriving at the entry gate to see how live matching operates.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetSimulation}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] text-[#70675F] text-[12px] font-bold transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo</span>
                </button>
              </div>

              {/* Step 1: Vehicle Profile Selector */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#70675F]">
                    Step 1: Select Arriving Vehicle Profile
                  </span>
                  <span className="text-[11.5px] text-[#70675F]">Simulated Entry Gate 01</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SAMPLE_PROFILES.map((profile) => {
                    const isSelected = profile.id === selectedProfileId;
                    return (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => handleSelectProfile(profile.id)}
                        className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FFFFFF] border-[#C93B2F] shadow-sm ring-1 ring-[#C93B2F]"
                            : "bg-[#FFFFFF]/70 border-[#DED3C7] hover:bg-[#FFFFFF]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[13.5px] font-bold text-[#241F1B]">
                            {profile.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-[#C93B2F] text-white"
                                : "bg-[#FAF7F2] text-[#70675F] border border-[#DED3C7]"
                            }`}
                          >
                            {profile.tag}
                          </span>
                        </div>
                        <div className="font-mono text-[12.5px] font-bold text-[#C93B2F]">
                          {profile.plate}
                        </div>
                        <div className="text-[11.5px] text-[#70675F]">{profile.type}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Real-time Evaluation Criteria Grid */}
              <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-xl p-4 sm:p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#70675F] flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#C93B2F]" />
                    Step 2: Live Multi-Factor Evaluation Analysis
                  </span>
                  <span className="text-[11px] font-bold text-[#2F7D5A] bg-[#2F7D5A]/10 px-2 py-0.5 rounded-full">
                    Weighted Matching
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#DED3C7]">
                    <span className="text-[#70675F] block text-[11px]">Active Constraints</span>
                    <span className="font-bold text-[#241F1B] truncate block mt-0.5">
                      {activeProfile.requirements[0]}
                    </span>
                  </div>
                  <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#DED3C7]">
                    <span className="text-[#70675F] block text-[11px]">Floor &amp; Lane Traffic</span>
                    <span className="font-bold text-[#2F7D5A] block mt-0.5">Low Congestion (12%)</span>
                  </div>
                  <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#DED3C7]">
                    <span className="text-[#70675F] block text-[11px]">Vehicle Dimension</span>
                    <span className="font-bold text-[#241F1B] block mt-0.5">Verified at Entry</span>
                  </div>
                  <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#DED3C7]">
                    <span className="text-[#70675F] block text-[11px]">Operator Authority</span>
                    <span className="font-bold text-[#C93B2F] block mt-0.5">Final Choice Operator</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Top 3 Ranked Recommendations */}
              <div className="flex flex-col gap-3">
                <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#70675F]">
                  Step 3: Top 3 Ranked Space Recommendations
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {recommendations.map((rec, index) => {
                    const isCardSelected = index === selectedSlotIndex;
                    return (
                      <div
                        key={rec.slot}
                        onClick={() => {
                          setSelectedSlotIndex(index);
                          setIsAssigned(false);
                        }}
                        className={`p-4 sm:p-5 rounded-xl border flex flex-col justify-between gap-4 transition-all cursor-pointer ${
                          isCardSelected
                            ? "bg-[#FFFFFF] border-[#C93B2F] shadow-[0_4px_16px_rgba(201,59,47,0.12)] ring-2 ring-[#C93B2F]"
                            : "bg-[#FFFFFF] border-[#DED3C7] hover:border-[#CBBCAE]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                index === 0
                                  ? "bg-[#2F7D5A]/10 text-[#2F7D5A] border border-[#2F7D5A]/25"
                                  : "bg-[#FAF7F2] text-[#70675F] border border-[#DED3C7]"
                              }`}
                            >
                              {rec.badge} · Rank #{index + 1}
                            </span>
                            <span className="text-[15px] font-black text-[#2F7D5A]">
                              {rec.score}% Match
                            </span>
                          </div>

                          <h4 className="text-[20px] font-black text-[#241F1B] tracking-tight">
                            Slot {rec.slot}
                          </h4>
                          <span className="text-[12px] text-[#70675F] block font-medium">
                            {rec.floor} · {rec.zone}
                          </span>

                          <div className="mt-3 text-[12px] text-[#241F1B] leading-relaxed bg-[#FAF7F2] p-2.5 rounded-lg border border-[#DED3C7]">
                            {rec.rationale}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-2 border-t border-[#DED3C7]/80 text-[11.5px] text-[#70675F]">
                          <div className="flex justify-between">
                            <span>Route Distance:</span>
                            <span className="font-bold text-[#241F1B]">{rec.distance}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pedestrian Access:</span>
                            <span className="font-bold text-[#241F1B]">{rec.walkTime}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Operator Decision & Assignment Simulation */}
              <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#2F7D5A]/10 text-[#2F7D5A] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#241F1B]">
                      {isAssigned
                        ? `Assigned: Slot ${currentRecommendation.slot} to Vehicle ${activeProfile.plate}`
                        : `Selected for Assignment: Slot ${currentRecommendation.slot} (${currentRecommendation.floor})`}
                    </h4>
                    <p className="text-[12px] text-[#70675F]">
                      {isAssigned
                        ? "Simulation Complete. Pass & guidance ready for customer."
                        : "The operator always makes the final assignment decision."}
                    </p>
                  </div>
                </div>

                {!isAssigned ? (
                  <button
                    type="button"
                    onClick={handleAssignRecommended}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[13px] font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Simulate Assign Space</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-[#2F7D5A] bg-[#2F7D5A]/10 px-3 py-1.5 rounded-xl border border-[#2F7D5A]/25">
                      ✓ Simulated Space Assigned
                    </span>
                    <button
                      type="button"
                      onClick={handleResetSimulation}
                      className="px-3.5 py-1.5 rounded-xl border border-[#DED3C7] bg-[#FAF7F2] hover:bg-[#F3EAE0] text-[#241F1B] text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      Try Next Vehicle
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── PLANNED IMPLEMENTATION PHASES ── */}
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
                    Real-time availability and transparent weighted ranking based on gate distance, lane flow, and vehicle attributes.
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
                    A machine-learning model trained using real parking history, congestion patterns, turnover intervals, and operator decisions.
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
