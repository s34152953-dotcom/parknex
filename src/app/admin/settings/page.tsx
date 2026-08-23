"use client";

import React, { useState, useEffect } from "react";
import {
  Server,
  Cpu,
  Mail,
  Smartphone,
  RefreshCw,
  Terminal,
  Route,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [edgeAiStatus, setEdgeAiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [isAiCardExpanded, setIsAiCardExpanded] = useState<boolean>(true);

  const checkEdgeAiHealth = async () => {
    setEdgeAiStatus("checking");
    try {
      const res = await fetch("http://localhost:8000/health", { method: "GET" });
      if (res.ok) {
        setEdgeAiStatus("online");
      } else {
        setEdgeAiStatus("offline");
      }
    } catch {
      setEdgeAiStatus("offline");
    }
  };

  useEffect(() => {
    checkEdgeAiHealth();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto flex flex-col gap-8 select-none text-[#241F1B]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DED3C7]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C93B2F] bg-[#F9E3DE] px-2 py-0.5 rounded border border-[#C93B2F]/20">
              SYSTEM CONFIGURATION
            </span>
            <span className="text-[12px] text-[#70675F]">· Infrastructure &amp; Adapters</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#241F1B] tracking-tight">
            System Status &amp; Settings
          </h1>
          <p className="text-[13.5px] text-[#70675F] mt-0.5">
            Diagnostic status for plate detection service, database, notification gateways, and feature roadmap.
          </p>
        </div>

        <button
          type="button"
          onClick={checkEdgeAiHealth}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F3EAE0] border border-[#DED3C7] text-[#241F1B] font-bold text-[13px] transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 text-[#C93B2F] ${edgeAiStatus === "checking" ? "animate-spin" : ""}`} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* Provider Health Grid */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[16px] font-bold text-[#241F1B] uppercase tracking-wider">
          Active System Adapters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Convex Realtime Database */}
          <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#241F1B]">Convex Realtime Database</h3>
                  <span className="text-[11.5px] text-[#70675F]">Reactive state, mutations, &amp; locks</span>
                </div>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2F7D5A]/10 border border-[#2F7D5A]/30 text-[#2F7D5A] text-[11px] font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D5A] animate-pulse" />
                ONLINE
              </span>
            </div>

            <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-3.5 text-[12px] font-mono text-[#241F1B]">
              <div>Deployment: Agreeable Tapir (Production)</div>
              <div className="text-[#70675F] mt-1">Active Backend Service</div>
            </div>
          </div>

          {/* 2. Edge Plate Recognition Service */}
          <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3569A8]/10 text-[#3569A8] flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#241F1B]">Edge Plate Detection Service</h3>
                  <span className="text-[11.5px] text-[#70675F]">Plate Detection Service</span>
                </div>
              </div>
              {edgeAiStatus === "online" ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2F7D5A]/10 border border-[#2F7D5A]/30 text-[#2F7D5A] text-[11px] font-extrabold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D5A]" />
                  ONLINE (PORT 8000)
                </span>
              ) : edgeAiStatus === "checking" ? (
                <span className="px-2.5 py-1 rounded-full bg-[#F3EAE0] text-[#70675F] text-[11px] font-bold border border-[#DED3C7]">
                  PROBING...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C93B2F]/10 border border-[#C93B2F]/30 text-[#C93B2F] text-[11px] font-extrabold">
                  MANUAL FALLBACK ACTIVE
                </span>
              )}
            </div>

            <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-3.5 text-[12px] font-mono text-[#241F1B]">
              <div>Service: Local Plate Recognition Service</div>
              <div className="text-[#70675F] mt-1">
                {edgeAiStatus === "online"
                  ? "FastAPI server running locally with signature validation."
                  : "Plate service offline. Operator manual plate confirmation is active."}
              </div>
            </div>
          </div>

          {/* 3. Resend Email Adapter */}
          <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B7791F]/10 text-[#B7791F] flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#241F1B]">Resend Email Gateway</h3>
                  <span className="text-[11.5px] text-[#70675F]">Digital pass &amp; dashboard links</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#F3EAE0] text-[#241F1B] border border-[#DED3C7] text-[11px] font-bold">
                ADAPTER READY
              </span>
            </div>

            <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-3.5 text-[12.5px] text-[#70675F]">
              <p>
                When <code className="text-[#241F1B] font-bold">RESEND_API_KEY</code> is configured in Vercel, transactional passes are delivered directly upon entry assignment.
              </p>
            </div>
          </div>

          {/* 4. TextBee Android SMS Gateway */}
          <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2F7D5A]/10 text-[#2F7D5A] flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#241F1B]">TextBee Android Gateway</h3>
                  <span className="text-[11.5px] text-[#70675F]">Direct Android SIM SMS dispatch</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#F3EAE0] text-[#241F1B] border border-[#DED3C7] text-[11px] font-bold">
                GATEWAY READY
              </span>
            </div>

            <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-3.5 text-[12.5px] text-[#70675F]">
              <p>
                Dispatches SMS notifications using a connected Android device &amp; SIM card.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FUTURE IMPLEMENTATIONS SECTION ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#DED3C7]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#70675F] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#DED3C7]">
                ROADMAP &amp; CAPABILITIES
              </span>
            </div>
            <h2 className="text-[20px] sm:text-[22px] font-black text-[#241F1B] tracking-tight">
              Future Implementations
            </h2>
            <p className="text-[13px] text-[#70675F] mt-0.5">
              Architectural roadmap and planned intelligent capabilities scheduled for future platform releases.
            </p>
          </div>
        </div>

        {/* Large Roadmap Card: AI-Assisted Parking Recommendation */}
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 sm:p-7 flex flex-col gap-6 shadow-[0_8px_24px_rgba(70,48,35,0.06)] transition-all">
          {/* Card Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center shrink-0 shadow-xs">
                <Route className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-[18px] sm:text-[20px] font-black text-[#241F1B] tracking-tight">
                    AI-Assisted Parking Recommendation
                  </h3>
                  {/* Disabled Status Control */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#DED3C7] text-[#70675F] text-[11.5px] font-bold cursor-not-allowed select-none">
                    <span className="w-2 h-2 rounded-full bg-[#938980]" />
                    <span>Status: Planned</span>
                  </span>
                </div>
                <p className="text-[13px] text-[#70675F]">
                  Intelligent arrival-triggered space allocation engine for high-traffic facilities.
                </p>
              </div>
            </div>

            {/* Expand / Collapse Control */}
            <button
              type="button"
              onClick={() => setIsAiCardExpanded(!isAiCardExpanded)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#DED3C7] bg-[#FAF7F2] hover:bg-[#F3EAE0] text-[#241F1B] text-[12.5px] font-bold transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
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
          <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-3.5 flex items-center gap-2.5 text-[12.5px] text-[#70675F]">
            <Info className="w-4 h-4 text-[#C93B2F] shrink-0" />
            <span>
              <strong className="text-[#241F1B]">Platform Notice:</strong> This feature is not enabled in the current version.
            </span>
          </div>

          {/* Expandable Body */}
          {isAiCardExpanded && (
            <div className="flex flex-col gap-6 pt-2 border-t border-[#DED3C7]">
              {/* Feature Description */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[14px] font-bold uppercase tracking-wider text-[#70675F]">
                  Feature Scope &amp; Allocation Criteria
                </h4>
                <p className="text-[13.5px] text-[#241F1B] leading-relaxed">
                  When implemented, this feature will analyze live parking availability and recommend the three most suitable spaces after a vehicle arrives. Recommendations will consider:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pl-2">
                  <div className="flex items-center gap-2 text-[13px] text-[#241F1B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C93B2F]" />
                    <span>Driving distance from the entry gate</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[#241F1B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C93B2F]" />
                    <span>Floor and lane congestion</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[#241F1B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C93B2F]" />
                    <span>Vehicle size</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[#241F1B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C93B2F]" />
                    <span>Accessible and EV requirements</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[#241F1B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C93B2F]" />
                    <span>Proximity to lifts and mall entrances</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[#241F1B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C93B2F]" />
                    <span>Mechanical stacker availability</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[#241F1B] md:col-span-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C93B2F]" />
                    <span>Historical occupancy patterns</span>
                  </div>
                </div>
                <p className="text-[13px] text-[#70675F] bg-[#FAF7F2] p-3 rounded-lg border border-[#DED3C7] italic mt-1">
                  The operator will always make the final assignment. Customers must not reserve spaces before arriving.
                </p>
              </div>

              {/* Implementation Phases */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[14px] font-bold uppercase tracking-wider text-[#70675F]">
                  Implementation Phases
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phase 1 */}
                  <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-black uppercase tracking-widest text-[#2F7D5A] bg-[#2F7D5A]/10 px-2 py-0.5 rounded border border-[#2F7D5A]/20">
                        PHASE 1
                      </span>
                      <h5 className="text-[14px] font-bold text-[#241F1B]">Smart Recommendation</h5>
                    </div>
                    <p className="text-[12.5px] text-[#70675F] leading-relaxed">
                      Real-time availability and transparent weighted ranking.
                    </p>
                  </div>

                  {/* Phase 2 */}
                  <div className="bg-[#FAF7F2] border border-[#DED3C7] rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-black uppercase tracking-widest text-[#3569A8] bg-[#3569A8]/10 px-2 py-0.5 rounded border border-[#3569A8]/20">
                        PHASE 2
                      </span>
                      <h5 className="text-[14px] font-bold text-[#241F1B]">AI Learning</h5>
                    </div>
                    <p className="text-[12.5px] text-[#70675F] leading-relaxed">
                      A machine-learning model trained using real parking history, congestion patterns and operator decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hardware & Production Architecture Notes */}
      <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
        <h3 className="text-[16px] font-bold text-[#241F1B] flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#C93B2F]" />
          <span>System Setup &amp; Commercial Specifications</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12.5px] text-[#70675F]">
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DED3C7] flex flex-col gap-2">
            <h4 className="font-bold text-[#2F7D5A] text-[13.5px]">Prototype Setup</h4>
            <ul className="list-disc list-inside space-y-1 text-[12px] text-[#241F1B]">
              <li>Vercel for Next.js App Router frontend</li>
              <li>Convex real-time database &amp; state synchronization</li>
              <li>Local plate recognition service on operator station</li>
              <li>TextBee Android app with active SIM for SMS</li>
              <li>Live digital wayfinding &amp; turn-by-turn indoor route guidance</li>
            </ul>
          </div>

          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DED3C7] flex flex-col gap-2">
            <h4 className="font-bold text-[#C93B2F] text-[13.5px]">Commercial Production Upgrades</h4>
            <ul className="list-disc list-inside space-y-1 text-[12px] text-[#241F1B]">
              <li>Dedicated IP cameras at Entry/Exit gates with RTSP feeds</li>
              <li>Hardware barrier relay integration (GPIO / Modbus TCP)</li>
              <li>Twilio / AWS SNS commercial SMS aggregator</li>
              <li>Overhead ultrasonic/optical sensors in each parking bay</li>
              <li>Thermal receipt printer at operator kiosks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
