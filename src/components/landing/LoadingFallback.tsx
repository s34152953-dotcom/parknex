"use client";

import React from "react";
import ParknexLogo from "@/components/ui/ParknexLogo";
import { Loader2 } from "lucide-react";

export default function LoadingFallback({ isReady = false }: { isReady?: boolean }) {
  return (
    <div
      className={`absolute inset-0 z-10 transition-opacity duration-1000 pointer-events-none ${
        isReady ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background realistic Indian cars image */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat bg-[center_right_20%] sm:bg-[center_right_15%] lg:bg-[right_center] w-full h-full opacity-45"
        style={{
          backgroundImage: 'url("/images/hero-indian-cars.jpg")',
        }}
      />

      {/* Warm beige editorial overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              to right,
              #FAF7F2 0%,
              rgba(250, 247, 242, 0.97) 38%,
              rgba(250, 247, 242, 0.75) 60%,
              rgba(250, 247, 242, 0.35) 100%
            )
          `,
        }}
      />

      {/* Subtle loader indicator if scene is taking a moment */}
      {!isReady && (
        <div className="absolute top-6 right-6 flex items-center gap-2 bg-[#FFFFFF]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#DED3C7] shadow-xs">
          <Loader2 className="w-3.5 h-3.5 text-[#C93B2F] animate-spin" />
          <span className="text-[11.5px] font-bold text-[#70675F]">Initializing 3D Parking Cellar...</span>
        </div>
      )}
    </div>
  );
}
