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
          const isActive =
            pathname === item.href ||
            (item.href === "/admin/booking" && (pathname === "/admin" || pathname === "/admin/"));

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
  );
}
