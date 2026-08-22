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
  ExternalLink,
  Layers,
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto flex flex-col gap-6 select-none text-[#F5F7FA]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#D84A2B] bg-[#D84A2B]/10 px-2 py-0.5 rounded border border-[#D84A2B]/20">
              SYSTEM CONFIGURATION
            </span>
            <span className="text-[12px] text-[rgba(245,247,250,0.5)]">· Infrastructure &amp; Adapters</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-white tracking-tight">
            System Status &amp; Provider Health
          </h1>
          <p className="text-[13.5px] text-[rgba(245,247,250,0.65)] mt-0.5">
            Diagnostic dashboard for plate detection service, real-time database, SMS gateway, and email delivery.
          </p>
        </div>

        <button
          type="button"
          onClick={checkEdgeAiHealth}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white font-bold text-[13px] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${edgeAiStatus === "checking" ? "animate-spin" : ""}`} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* Provider Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Convex Realtime Database */}
        <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D84A2B]/15 border border-[#D84A2B]/30 flex items-center justify-center text-[#D84A2B]">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white">Convex Realtime Database</h3>
                <span className="text-[11.5px] text-[rgba(245,247,250,0.55)]">Reactive state, mutations, &amp; locks</span>
              </div>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-[11px] font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              ONLINE
            </span>
          </div>

          <div className="bg-[#0A0D14] border border-white/[0.06] rounded-xl p-3.5 text-[12px] font-mono text-[rgba(245,247,250,0.8)]">
            <div>Deployment: Agreeable Tapir (Production)</div>
            <div className="text-[rgba(245,247,250,0.45)] mt-1">Free Developer Tier · Active Service</div>
          </div>
        </div>

        {/* 2. Edge Plate Recognition Service */}
        <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/30 flex items-center justify-center text-[#3B82F6]">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white">Edge Plate Detection Service</h3>
                <span className="text-[11.5px] text-[rgba(245,247,250,0.55)]">Plate Detection Service</span>
              </div>
            </div>
            {edgeAiStatus === "online" ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-[11px] font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                ONLINE (PORT 8000)
              </span>
            ) : edgeAiStatus === "checking" ? (
              <span className="px-2.5 py-1 rounded-full bg-white/[0.1] text-white/70 text-[11px] font-bold">
                PROBING...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-[11px] font-extrabold">
                MANUAL FALLBACK ACTIVE
              </span>
            )}
          </div>

          <div className="bg-[#0A0D14] border border-white/[0.06] rounded-xl p-3.5 text-[12px] font-mono text-[rgba(245,247,250,0.8)]">
            <div>Service: Local Plate Recognition Service</div>
            <div className="text-[rgba(245,247,250,0.45)] mt-1">
              {edgeAiStatus === "online"
                ? "FastAPI server running locally with signature validation."
                : "Plate service offline. Operator manual plate confirmation is active."}
            </div>
          </div>
        </div>

        {/* 3. Resend Email Adapter */}
        <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white">Resend Email Gateway</h3>
                <span className="text-[11.5px] text-[rgba(245,247,250,0.55)]">Digital pass &amp; dashboard links</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/[0.08] text-white/80 text-[11px] font-bold">
              ADAPTER READY
            </span>
          </div>

          <div className="bg-[#0A0D14] border border-white/[0.06] rounded-xl p-3.5 text-[12px] text-[rgba(245,247,250,0.7)]">
            <p>
              When <code>RESEND_API_KEY</code> is configured, passes are emailed directly. If unconfigured, graceful fallback states are shown.
            </p>
          </div>
        </div>

        {/* 4. TextBee Android SMS Gateway */}
        <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white">TextBee Android Gateway</h3>
                <span className="text-[11.5px] text-[rgba(245,247,250,0.55)]">Direct Android SIM SMS dispatch</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/[0.08] text-white/80 text-[11px] font-bold">
              GATEWAY READY
            </span>
          </div>

          <div className="bg-[#0A0D14] border border-white/[0.06] rounded-xl p-3.5 text-[12px] text-[rgba(245,247,250,0.7)]">
            <p>
              Dispatches SMS using a connected Android device &amp; SIM card. If disconnected, manual <code>sms:</code> URI and printable passes are offered.
            </p>
          </div>
        </div>
      </div>

      {/* Hardware & Production Architecture Notes */}
      <div className="bg-[#10151D] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4 shadow-md">
        <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#D84A2B]" />
          <span>System Setup &amp; Commercial Roadmap</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12.5px] text-[rgba(245,247,250,0.75)]">
          <div className="bg-[#0A0D14] p-4 rounded-xl border border-white/[0.06] flex flex-col gap-2">
            <h4 className="font-bold text-white text-[13px] text-[#10B981]">Prototype Setup (Free Tier)</h4>
            <ul className="list-disc list-inside space-y-1 text-[12px]">
              <li>Vercel for Next.js App Router frontend</li>
              <li>Convex real-time database &amp; state synchronization</li>
              <li>Local plate recognition service on operator laptop</li>
              <li>TextBee Android app with active SIM for free SMS</li>
              <li>Printed physical QR tags on pillars for location confirmation</li>
            </ul>
          </div>

          <div className="bg-[#0A0D14] p-4 rounded-xl border border-white/[0.06] flex flex-col gap-2">
            <h4 className="font-bold text-white text-[13px] text-[#D84A2B]">Commercial Production Upgrades</h4>
            <ul className="list-disc list-inside space-y-1 text-[12px]">
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
