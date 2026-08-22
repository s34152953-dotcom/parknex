"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Menu,
  X,
  MapPin,
  CarFront,
  QrCode,
  Layers,
  History,
  AlertTriangle,
  Settings,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { ParknexIcon } from "@/components/ui/ParknexLogo";

const adminNavLinks = [
  { label: "Live Parking Map", href: "/admin/booking", icon: MapPin },
  { label: "New Entry", href: "/admin/new-entry", icon: CarFront },
  { label: "Gate Scanner", href: "/admin/scan-exit", icon: QrCode },
  { label: "Active Sessions", href: "/admin/active-sessions", icon: Layers },
  { label: "Parking History", href: "/admin/history", icon: History },
  { label: "Customer Issues", href: "/admin/customer-issues", icon: AlertTriangle },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminTopBar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real-time live statistics from Convex
  const stats = useQuery(api.bookings.getLiveStats, { floor: "ALL" });
  const openReports = useQuery(api.reports.listReports, { status: "OPEN" });

  const availableCount = stats?.available ?? 0;
  const occupiedCount = stats?.occupied ?? 0;
  const reservedCount = stats?.reserved ?? 0;
  const vehiclesInside = stats?.vehiclesInside ?? 0;
  const recommendedCount = Math.min(3, availableCount);

  return (
    <header className="sticky top-0 z-30 bg-[#10151D] border-b border-white/[0.08] text-[#F5F7FA] select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-[64px] sm:h-[70px] flex items-center justify-between gap-4">
        {/* Left: Mobile Brand & Facility Name */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-[#D84A2B]/20 border border-[#D84A2B]/40 flex items-center justify-center p-1">
              <ParknexIcon className="w-5 h-5" />
            </div>
            <span className="font-extrabold tracking-tight text-[16px] text-white">
              PARK<span className="text-[#D84A2B]">NEX</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <span className="text-[13px] font-bold text-[rgba(245,247,250,0.6)]">
              Central Mall Grand
            </span>
            <span className="text-white/20">·</span>
            <span className="text-[12px] font-semibold px-2 py-0.5 rounded-md bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Live Online
            </span>
          </div>
        </div>

        {/* Center: Live Statistics Strip (Convex Real-Time Counts) */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 bg-[#0A0D14] border border-white/[0.08] px-3.5 py-1.5 rounded-xl text-[12px] font-bold">
          {/* Available */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[#10B981]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Available:</span>
            <span className="font-mono text-white text-[13px]">{availableCount}</span>
          </div>

          <span className="text-white/20">|</span>

          {/* Recommended */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[#60A5FA]">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span>Recommended:</span>
            <span className="font-mono text-white text-[13px]">{recommendedCount}</span>
          </div>

          <span className="text-white/20">|</span>

          {/* Reserved */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[#F59E0B]">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span>Reserved:</span>
            <span className="font-mono text-white text-[13px]">{reservedCount}</span>
          </div>

          <span className="text-white/20">|</span>

          {/* Occupied */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[#EF4444]">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span>Occupied:</span>
            <span className="font-mono text-white text-[13px]">{occupiedCount}</span>
          </div>

          <span className="text-white/20">|</span>

          {/* Vehicles Inside */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-white/80">
            <span>Inside:</span>
            <span className="font-mono text-[#D84A2B] text-[13px]">{vehiclesInside}</span>
          </div>
        </div>

        {/* Right: Issues Alert Pill & Operator Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {openReports && openReports.length > 0 && (
            <Link
              href="/admin/customer-issues"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-[12px] font-bold hover:bg-[#EF4444]/25 transition-colors animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{openReports.length} Issue{openReports.length > 1 ? "s" : ""}</span>
            </Link>
          )}

          <div className="flex items-center gap-2 bg-[#151B24] border border-white/[0.08] px-3 py-1.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-[#D84A2B]" />
            <div className="flex flex-col text-left">
              <span className="text-[11.5px] font-bold text-white leading-tight">Operator Station 01</span>
              <span className="text-[10px] text-[rgba(245,247,250,0.5)] font-mono">Control Desk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-[#10151D] px-4 py-4 flex flex-col gap-1.5">
          {/* Mobile Stats Ribbon */}
          <div className="grid grid-cols-4 gap-2 pb-3 mb-2 border-b border-white/[0.08] text-center text-[11px] font-bold">
            <div className="bg-[#0A0D14] p-2 rounded-lg border border-white/[0.06]">
              <span className="text-[#10B981] block text-[14px] font-mono">{availableCount}</span>
              <span className="text-white/60 text-[10px]">Available</span>
            </div>
            <div className="bg-[#0A0D14] p-2 rounded-lg border border-white/[0.06]">
              <span className="text-[#60A5FA] block text-[14px] font-mono">{recommendedCount}</span>
              <span className="text-white/60 text-[10px]">Recommended</span>
            </div>
            <div className="bg-[#0A0D14] p-2 rounded-lg border border-white/[0.06]">
              <span className="text-[#EF4444] block text-[14px] font-mono">{occupiedCount}</span>
              <span className="text-white/60 text-[10px]">Occupied</span>
            </div>
            <div className="bg-[#0A0D14] p-2 rounded-lg border border-white/[0.06]">
              <span className="text-[#D84A2B] block text-[14px] font-mono">{vehiclesInside}</span>
              <span className="text-white/60 text-[10px]">Inside</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {adminNavLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all ${
                    isActive
                      ? "bg-[#D84A2B] text-white font-bold"
                      : "text-[rgba(245,247,250,0.7)] hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
