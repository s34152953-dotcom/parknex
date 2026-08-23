"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Menu,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { ParknexIcon } from "@/components/ui/ParknexLogo";
import { useSidebar } from "@/context/SidebarContext";

export default function AdminTopBar() {
  const { toggleSidebar } = useSidebar();

  // Real-time live statistics from Convex
  const stats = useQuery(api.bookings.getLiveStats, { floor: "ALL" });
  const openReports = useQuery(api.reports.listReports, { status: "OPEN" });

  const availableCount = stats?.available ?? 0;
  const occupiedCount = stats?.occupied ?? 0;
  const reservedCount = stats?.reserved ?? 0;
  const vehiclesInside = stats?.vehiclesInside ?? 0;
  const recommendedCount = Math.min(3, availableCount);

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#DED3C7] text-[#241F1B] select-none shadow-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-[64px] sm:h-[70px] flex items-center justify-between gap-4">
        {/* Left: Mobile Hamburger & Brand / Facility Name */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-[#F3EAE0] border border-[#DED3C7] text-[#241F1B] hover:bg-[#EDE1D4] active:scale-95 transition-all cursor-pointer shadow-xs"
            aria-label="Open Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-[#F9E3DE] border border-[#C93B2F]/20 flex items-center justify-center p-1">
              <ParknexIcon className="w-5 h-5" variant="light" />
            </div>
            <span className="font-black tracking-tight text-[16px] text-[#241F1B]">
              PARK<span className="text-[#C93B2F]">NEX</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <span className="text-[13.5px] font-bold text-[#70675F]">
              Central Mall Grand
            </span>
            <span className="text-[#DED3C7]">·</span>
            <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#2F7D5A]/10 text-[#2F7D5A] border border-[#2F7D5A]/25 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D5A] animate-pulse" />
              Live Online
            </span>
          </div>
        </div>

        {/* Center: Live Statistics Strip */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 bg-[#FAF7F2] border border-[#DED3C7] px-3.5 py-1.5 rounded-xl text-[12.5px] font-bold shadow-xs">
          {/* Available */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[#2F7D5A]">
            <span className="w-2 h-2 rounded-full bg-[#2F7D5A]" />
            <span>Available:</span>
            <span className="font-mono text-[#241F1B] text-[13px]">{availableCount}</span>
          </div>

          <span className="text-[#DED3C7]">|</span>

          {/* Recommended */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[#3569A8]">
            <span className="w-2 h-2 rounded-full bg-[#3569A8]" />
            <span>Recommended:</span>
            <span className="font-mono text-[#241F1B] text-[13px]">{recommendedCount}</span>
          </div>

          <span className="text-[#DED3C7]">|</span>

          {/* Reserved */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[#B7791F]">
            <span className="w-2 h-2 rounded-full bg-[#B7791F]" />
            <span>Reserved:</span>
            <span className="font-mono text-[#241F1B] text-[13px]">{reservedCount}</span>
          </div>

          <span className="text-[#DED3C7]">|</span>

          {/* Occupied */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[#C93B2F]">
            <span className="w-2 h-2 rounded-full bg-[#C93B2F]" />
            <span>Occupied:</span>
            <span className="font-mono text-[#241F1B] text-[13px]">{occupiedCount}</span>
          </div>

          <span className="text-[#DED3C7]">|</span>

          {/* Vehicles Inside */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[#70675F]">
            <span>Inside:</span>
            <span className="font-mono text-[#241F1B] text-[13px]">{vehiclesInside}</span>
          </div>
        </div>

        {/* Right: Issues Alert Pill & Operator Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {openReports && openReports.length > 0 && (
            <Link
              href="/admin/customer-issues"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C93B2F]/10 border border-[#C93B2F]/30 text-[#C93B2F] text-[12px] font-bold hover:bg-[#C93B2F]/20 transition-colors animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{openReports.length} Issue{openReports.length > 1 ? "s" : ""}</span>
            </Link>
          )}

          <div className="flex items-center gap-2 bg-[#F3EAE0] border border-[#DED3C7] px-3 py-1.5 rounded-xl shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#C93B2F]" />
            <div className="flex flex-col text-left">
              <span className="text-[12px] font-bold text-[#241F1B] leading-tight">Operator Station 01</span>
              <span className="text-[10.5px] text-[#70675F] font-medium">Control Desk</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
