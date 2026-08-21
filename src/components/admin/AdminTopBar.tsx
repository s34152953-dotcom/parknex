"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, CalendarPlus, Clock, QrCode, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ParknexIcon } from "@/components/ui/ParknexLogo";

const adminNavLinks = [
  { label: "Booking", href: "/admin/booking", icon: CalendarPlus },
  { label: "Booking History", href: "/admin/history", icon: Clock },
  { label: "Scan Exit Pass", href: "/admin/scan-exit", icon: QrCode },
];

export default function AdminTopBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname.includes("/admin/history")) return "Booking History & Audit";
    if (pathname.includes("/admin/scan-exit")) return "Scan Exit Pass Validation";
    return "Parking Booking & Slot Assignment";
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-[72px] bg-white/90 backdrop-blur-md border-b border-[#EAE3D9] flex items-center justify-between px-6 lg:px-10 gap-4 select-none">
        {/* Left Mobile Menu Trigger */}
        <div className="flex items-center gap-3.5 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center w-11 h-11 rounded-xl border border-[#E2D9CC] bg-white text-[#1C1917] hover:border-[#D84A2B]/40 transition-colors shadow-xs min-w-[44px]"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5 text-[#1C1917]" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl border border-[#FADCD5] flex items-center justify-center bg-[#FFF5F2] p-1 shrink-0">
              <ParknexIcon className="w-5 h-5" />
            </div>
            <span className="font-bold text-[15px] text-[#1C1917] tracking-tight">
              PARK<span className="text-[#D84A2B]">NEX</span> ADMIN
            </span>
          </div>
        </div>

        {/* Page Title (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <h1 className="text-[19px] font-bold text-[#1C1917] tracking-tight">
            {getPageTitle()}
          </h1>
          <span className="text-[11px] px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EAE3D9] text-[#78716C] font-semibold">
            Central Mall Grand
          </span>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 h-11 px-4 rounded-xl border border-[#E2D9CC] bg-white text-[13px] font-medium text-[#78716C] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[#1C1917] font-semibold">Gate Entrance 01</span>
          </div>

          <Link
            href="/admin/scan-exit"
            aria-label="Scan Exit Pass"
            className="h-11 px-4 sm:px-5 rounded-xl bg-[#D84A2B] text-white text-[13px] font-bold flex items-center gap-2 hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-xs cursor-pointer min-w-[44px]"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">Scan Exit</span>
          </Link>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#FBF8F3]/98 backdrop-blur-xl lg:hidden flex flex-col p-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D9] mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl border border-[#FADCD5] flex items-center justify-center bg-[#FFF5F2] p-1">
                  <ParknexIcon className="w-5 h-5" />
                </div>
                <span className="font-bold text-[16px] text-[#1C1917]">PARKNEX Admin</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="w-11 h-11 rounded-xl flex items-center justify-center bg-white border border-[#E2D9CC] text-[#1C1917] min-w-[44px]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
              {adminNavLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[15px] font-semibold transition-all min-h-[48px] ${
                      isActive
                        ? "bg-[#D84A2B]/10 text-[#D84A2B] border border-[#D84A2B]/20"
                        : "text-[#57534E] hover:text-[#1C1917] hover:bg-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#EAE3D9]">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-[#EF4444] font-medium min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Operator Logout</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
