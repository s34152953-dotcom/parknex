"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  CarFront,
  QrCode,
  Layers,
  History,
  AlertTriangle,
  Settings,
  LogOut,
} from "lucide-react";
import { ParknexIcon } from "@/components/ui/ParknexLogo";
import { signOut } from "next-auth/react";

const adminNavLinks = [
  { label: "Live Parking Map", href: "/admin/booking", icon: MapPin },
  { label: "New Entry", href: "/admin/new-entry", icon: CarFront },
  { label: "Gate Scanner", href: "/admin/scan-exit", icon: QrCode },
  { label: "Active Sessions", href: "/admin/active-sessions", icon: Layers },
  { label: "Parking History", href: "/admin/history", icon: History },
  { label: "Customer Issues", href: "/admin/customer-issues", icon: AlertTriangle },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-[#10151D] border-r border-white/[0.08] h-screen sticky top-0 shrink-0 select-none text-[#F5F7FA]">
      {/* Brand Header */}
      <div className="flex items-center gap-3 h-[72px] px-6 border-b border-white/[0.08]">
        <div className="w-10 h-10 rounded-2xl border border-[#D84A2B]/30 flex items-center justify-center bg-[#D84A2B]/10 shadow-xs p-1.5 shrink-0">
          <ParknexIcon className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black tracking-tight text-[17px] text-[#F5F7FA]">
              PARK<span className="text-[#D84A2B]">NEX</span>
            </span>
            <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#D84A2B]/20 text-[#D84A2B] uppercase tracking-wider border border-[#D84A2B]/30">
              OPERATOR
            </span>
          </div>
          <span className="text-[11px] text-[rgba(245,247,250,0.58)] font-medium">Control Center</span>
        </div>
      </div>

      {/* Operational Navigation */}
      <div className="px-3 py-5 flex-1 flex flex-col gap-1 overflow-y-auto">
        <p className="px-3 text-[10.5px] font-bold text-[rgba(245,247,250,0.4)] uppercase tracking-wider mb-2">
          Control Center
        </p>

        {adminNavLinks.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/admin/booking" && (pathname === "/admin" || pathname === "/admin/"));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-[#D84A2B] text-white shadow-[0_2px_12px_rgba(216,74,43,0.35)]"
                  : "text-[rgba(245,247,250,0.7)] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <item.icon
                className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                  isActive ? "text-white" : "text-[rgba(245,247,250,0.5)]"
                }`}
                strokeWidth={isActive ? 2.4 : 1.8}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Status & Sign Out */}
      <div className="p-3 border-t border-white/[0.08] flex flex-col gap-1 bg-[#0D1117]">
        <div className="flex items-center justify-between px-3 py-2 text-[11.5px] text-[rgba(245,247,250,0.6)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-medium">Live Terminal</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-white/70">
            v2.4-PRO
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-semibold text-[rgba(245,247,250,0.6)] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Operator Logout</span>
        </button>
      </div>
    </aside>
  );
}
