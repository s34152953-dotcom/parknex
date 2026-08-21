"use client";

import React, { use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Clock } from "lucide-react";
import { ParknexIcon } from "@/components/ui/ParknexLogo";

export default function CustomerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const pathname = usePathname();

  const isHistoryActive = pathname.endsWith("/history");
  const isFindActive = !isHistoryActive;

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#1C1917] flex flex-col items-center">
      {/* ── Top Header Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#EAE3D9] flex items-center justify-between px-6 sm:px-10 h-[70px] max-w-[1400px]">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border border-[#FADCD5] flex items-center justify-center bg-[#FFF5F2] p-1.5 shrink-0">
            <ParknexIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-[16px] text-[#1C1917]">
              PARK<span className="text-[#D84A2B]">NEX</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] text-[#78716C] ml-2 font-medium">
              · Central Mall Grand
            </span>
          </div>
        </div>

        {/* ONLY TWO PRIMARY CUSTOMER NAVIGATION TABS */}
        <nav className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-2xl border border-[#E2D9CC]">
          <Link
            href={`/customer/${token}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
              isFindActive
                ? "bg-[#D84A2B] text-white shadow-xs"
                : "text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Find My Space</span>
          </Link>

          <Link
            href={`/customer/${token}/history`}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
              isHistoryActive
                ? "bg-[#D84A2B] text-white shadow-xs"
                : "text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>History</span>
          </Link>
        </nav>
      </header>

      {/* Main Mobile-First Customer Content Container */}
      <main className="w-full max-w-[800px] flex-1 px-4 sm:px-6 py-6 sm:py-8 flex flex-col">
        {children}
      </main>
    </div>
  );
}
