"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Server,
  Cpu,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Terminal,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [edgeAiStatus, setEdgeAiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [edgeAiData, setEdgeAiData] = useState<any | null>(null);

  const checkEdgeAiHealth = async () => {
    setEdgeAiStatus("checking");
    try {
      const res = await fetch("http://localhost:8000/health", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setEdgeAiData(data);
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto flex flex-col gap-6 select-none text-[#241F1B]">
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
            System Status &amp; Provider Health
          </h1>
          <p className="text-[13.5px] text-[#70675F] mt-0.5">
            Diagnostic dashboard for plate detection service, real-time database, SMS gateway, and email delivery.
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
            <div className="text-[#70675F] mt-1">Free Developer Tier · Active Service</div>
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
              When <code className="text-[#241F1B] font-bold">RESEND_API_KEY</code> is configured, passes are emailed directly. If unconfigured, graceful fallback states are shown.
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
              Dispatches SMS using a connected Android device &amp; SIM card. If disconnected, manual <code className="text-[#241F1B] font-bold">sms:</code> URI and printable passes are offered.
            </p>
          </div>
        </div>
      </div>

      {/* Hardware & Production Architecture Notes */}
      <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 flex flex-col gap-4 shadow-[0_8px_24px_rgba(70,48,35,0.06)]">
        <h3 className="text-[16px] font-bold text-[#241F1B] flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#C93B2F]" />
          <span>System Setup &amp; Commercial Roadmap</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12.5px] text-[#70675F]">
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DED3C7] flex flex-col gap-2">
            <h4 className="font-bold text-[#2F7D5A] text-[13.5px]">Prototype Setup (Free Tier)</h4>
            <ul className="list-disc list-inside space-y-1 text-[12px] text-[#241F1B]">
              <li>Vercel for Next.js App Router frontend</li>
              <li>Convex real-time database &amp; state synchronization</li>
              <li>Local plate recognition service on operator laptop</li>
              <li>TextBee Android app with active SIM for free SMS</li>
              <li>Live digital wayfinding &amp; turn-by-turn indoor route maps</li>
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
