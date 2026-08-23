"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import ParknexLogo from "@/components/ui/ParknexLogo";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Root Error Boundary]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241F1B] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-8 shadow-sm flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-[20px] font-black text-[#241F1B]">Something went wrong</h1>
          <p className="text-[13.5px] text-[#70675F]">
            {error?.message || "An unexpected error occurred while loading this page."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 h-11 px-4 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[13.5px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex-1 h-11 px-4 rounded-xl bg-[#FAF7F2] hover:bg-[#EDE1D4] border border-[#DED3C7] text-[#241F1B] text-[13.5px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
