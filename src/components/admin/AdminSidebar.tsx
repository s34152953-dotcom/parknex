"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  CarFront,
  QrCode,
  Layers,
  History,
  AlertTriangle,
  Settings,
  LogOut,
  Video,
  X,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { ParknexIcon } from "@/components/ui/ParknexLogo";
import { signOut } from "next-auth/react";
import { useSidebar } from "@/context/SidebarContext";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const adminNavLinks = [
  { label: "Command Center", href: "/admin", icon: LayoutDashboard },
  { label: "Live Parking Map", href: "/admin/booking", icon: MapPin },
  { label: "AI Review Queue", href: "/admin/ai-review", icon: ShieldAlert },
  { label: "RocketRide Runs", href: "/admin/ai-runs", icon: Sparkles },
  { label: "Batch Reconciliation", href: "/admin/batch-reconciliation", icon: UploadCloud },
  { label: "New Entry", href: "/admin/new-entry", icon: CarFront },
  { label: "Gate Scanner", href: "/admin/scan-exit", icon: QrCode },
  { label: "CCTV Monitoring", href: "/admin/cctv", icon: Video },
  { label: "Active Sessions", href: "/admin/active-sessions", icon: Layers },
  { label: "Parking History", href: "/admin/history", icon: History },
  { label: "Customer Issues", href: "/admin/customer-issues", icon: AlertTriangle },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isMobileOpen, closeSidebar } = useSidebar();

  const stats = useQuery(api.bookings.getLiveStats, { floor: "ALL" });
  const availableCount = stats?.available ?? 0;
  const occupiedCount = stats?.occupied ?? 0;
  const vehiclesInside = stats?.vehiclesInside ?? 0;

  return (
    <>
      {/* ── 1. DESKTOP PERMANENT SIDEBAR (>= lg) ── */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-[#F3EAE0] border-r border-[#DED3C7] h-screen sticky top-0 shrink-0 select-none text-[#241F1B]">
        {/* Brand Header */}
        <div className="flex items-center gap-3 h-[72px] px-6 border-b border-[#DED3C7] bg-[#FFFFFF]">
          <div className="w-10 h-10 rounded-xl border border-[#DED3C7] flex items-center justify-center bg-[#FAF7F2] shadow-xs p-1.5 shrink-0">
            <ParknexIcon className="w-6 h-6" variant="light" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black tracking-tight text-[17px] text-[#241F1B]">
                PARK<span className="text-[#C93B2F]">NEX</span>
              </span>
              <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#F9E3DE] text-[#C93B2F] uppercase tracking-wider border border-[#C93B2F]/20">
                OPERATOR
              </span>
            </div>
            <span className="text-[11px] text-[#70675F] font-medium">Control Center</span>
          </div>
        </div>

        {/* Operational Navigation */}
        <div className="px-3 py-5 flex-1 flex flex-col gap-1 overflow-y-auto">
          <p className="px-3 text-[11px] font-bold text-[#70675F] uppercase tracking-wider mb-2">
            Control Center
          </p>

          {adminNavLinks.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-bold transition-all duration-150 ${
                  isActive
                    ? "bg-[#C93B2F] text-white shadow-[0_4px_12px_rgba(201,59,47,0.25)]"
                    : "text-[#241F1B] hover:text-[#C93B2F] hover:bg-[#EDE1D4]"
                }`}
              >
                <item.icon
                  className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-[#70675F]"
                  }`}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom Status & Sign Out */}
        <div className="p-3 border-t border-[#DED3C7] flex flex-col gap-1 bg-[#FFFFFF]">
          <div className="flex items-center justify-between px-3 py-1.5 text-[12px] text-[#70675F]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2F7D5A] animate-pulse" />
              <span className="font-semibold text-[#241F1B]">Live Terminal</span>
            </div>
            <span className="text-[11px] text-[#70675F] font-medium">Online</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-bold text-[#70675F] hover:text-[#C93B2F] hover:bg-[#F9E3DE] transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Operator Logout</span>
          </button>
        </div>
      </aside>

      {/* ── 2. MOBILE SLIDE-OUT OFF-CANVAS DRAWER (< lg) ── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          {/* Dark Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={closeSidebar}
            aria-hidden="true"
          />

          {/* Slide-out Sidebar Panel */}
          <div className="fixed top-0 left-0 bottom-0 w-[290px] max-w-[85vw] bg-[#F3EAE0] border-r border-[#DED3C7] shadow-2xl flex flex-col z-[10000] animate-in slide-in-from-left duration-300">
            {/* Mobile Header with Close Button */}
            <div className="flex items-center justify-between h-[68px] px-5 border-b border-[#DED3C7] bg-[#FFFFFF]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl border border-[#DED3C7] flex items-center justify-center bg-[#FAF7F2] p-1 shrink-0">
                  <ParknexIcon className="w-5 h-5" variant="light" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black tracking-tight text-[16px] text-[#241F1B]">
                      PARK<span className="text-[#C93B2F]">NEX</span>
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#F9E3DE] text-[#C93B2F] uppercase">
                      OPERATOR
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[#70675F]">Control Desk</span>
                </div>
              </div>

              <button
                onClick={closeSidebar}
                className="p-2 rounded-xl bg-[#FAF7F2] border border-[#DED3C7] text-[#241F1B] hover:bg-[#EDE1D4] transition-colors cursor-pointer"
                aria-label="Close Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Live Stats Pill on Mobile */}
            <div className="p-3 bg-[#FFFFFF] border-b border-[#DED3C7]">
              <div className="grid grid-cols-3 gap-2 text-center text-[10.5px] font-bold">
                <div className="bg-[#FAF7F2] p-2 rounded-lg border border-[#DED3C7]">
                  <span className="text-[#2F7D5A] block text-[14px] font-mono font-black">{availableCount}</span>
                  <span className="text-[#70675F]">Available</span>
                </div>
                <div className="bg-[#FAF7F2] p-2 rounded-lg border border-[#DED3C7]">
                  <span className="text-[#C93B2F] block text-[14px] font-mono font-black">{occupiedCount}</span>
                  <span className="text-[#70675F]">Occupied</span>
                </div>
                <div className="bg-[#FAF7F2] p-2 rounded-lg border border-[#DED3C7]">
                  <span className="text-[#241F1B] block text-[14px] font-mono font-black">{vehiclesInside}</span>
                  <span className="text-[#70675F]">Inside</span>
                </div>
              </div>
            </div>

            {/* Navigation List */}
            <div className="px-3 py-4 flex-1 flex flex-col gap-1 overflow-y-auto">
              <p className="px-3 text-[10.5px] font-bold text-[#70675F] uppercase tracking-wider mb-1.5">
                Navigation
              </p>

              {adminNavLinks.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
                      isActive
                        ? "bg-[#C93B2F] text-white shadow-xs"
                        : "text-[#241F1B] hover:text-[#C93B2F] hover:bg-[#EDE1D4]"
                    }`}
                  >
                    <item.icon
                      className={`w-4.5 h-4.5 shrink-0 ${
                        isActive ? "text-white" : "text-[#70675F]"
                      }`}
                      strokeWidth={isActive ? 2.4 : 1.8}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Footer & Logout */}
            <div className="p-3 border-t border-[#DED3C7] bg-[#FFFFFF] flex flex-col gap-1">
              <div className="flex items-center justify-between px-3 py-1.5 text-[12px] text-[#70675F]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2F7D5A] animate-pulse" />
                  <span className="font-semibold text-[#241F1B]">Live Terminal</span>
                </div>
                <span className="text-[11px] text-[#2F7D5A] font-bold">Online</span>
              </div>
              <button
                onClick={() => {
                  closeSidebar();
                  signOut({ callbackUrl: "/auth/login" });
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-bold text-[#C93B2F] bg-[#F9E3DE] hover:bg-[#F3C7BD] transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Operator Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
