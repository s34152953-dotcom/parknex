"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarPlus,
  Clock,
  QrCode,
  LogOut,
  Settings,
} from "lucide-react";
import { ParknexIcon } from "@/components/ui/ParknexLogo";

const adminNavLinks = [
  { label: "Booking", href: "/admin/booking", icon: CalendarPlus },
  { label: "Booking History", href: "/admin/history", icon: Clock },
  { label: "Scan Exit Pass", href: "/admin/scan-exit", icon: QrCode },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-[#FAF7F2] border-r border-[#EAE3D9] h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 h-[72px] px-6 border-b border-[#EAE3D9]">
        <div className="w-10 h-10 rounded-2xl border border-[#FADCD5] flex items-center justify-center bg-[#FFF5F2] shadow-xs p-1.5 shrink-0">
          <ParknexIcon className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-[17px] text-[#1C1917]">
              PARK<span className="text-[#D84A2B]">NEX</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#D84A2B]/10 text-[#D84A2B] uppercase tracking-wider">
              ADMIN
            </span>
          </div>
          <span className="text-[11px] text-[#78716C] font-medium">Smart Parking Operations</span>
        </div>
      </div>

      {/* Operational Navigation */}
      <div className="px-4 py-6 flex-1 flex flex-col gap-1.5">
        <p className="px-3 text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider mb-2">
          Operations Menu
        </p>

        {adminNavLinks.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/admin/booking" && (pathname === "/admin" || pathname === "/admin/"));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-[#D84A2B]/[0.09] text-[#D84A2B] border border-[#D84A2B]/20 shadow-xs"
                  : "text-[#57534E] hover:text-[#1C1917] hover:bg-black/[0.03]"
              }`}
            >
              <item.icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? "text-[#D84A2B]" : "text-[#78716C]"
                }`}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-[#EAE3D9] flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-3 py-2 text-[12px] text-[#78716C]">
          <span>Central Mall Grand</span>
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
        </div>
        <Link
          href="/auth/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#78716C] hover:text-[#EF4444] hover:bg-[#EF4444]/[0.06] transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Operator Logout</span>
        </Link>
      </div>
    </aside>
  );
}
