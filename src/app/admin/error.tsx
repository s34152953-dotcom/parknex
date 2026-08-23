"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Portal Error Boundary]:", error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-7 shadow-xs flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-[18px] font-black text-[#241F1B]">Operator Portal Error</h2>
          <p className="text-[13px] text-[#70675F] mt-1">
            {error?.message || "A section of the Operator Portal encountered an error."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full pt-1">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 h-10 px-4 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>

          <Link
            href="/admin"
            className="flex-1 h-10 px-4 rounded-xl bg-[#FAF7F2] hover:bg-[#EDE1D4] border border-[#DED3C7] text-[#241F1B] text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
