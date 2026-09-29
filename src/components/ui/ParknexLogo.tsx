"use client";

import React from "react";

export function ParknexIcon({
  className = "w-10 h-10",
  variant = "light",
}: {
  className?: string;
  variant?: "dark" | "light";
  color?: string;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/parknex-symbol.png"
        alt="PARKNEX Icon"
        className={`w-full h-full object-contain ${
          variant === "dark" ? "brightness-110" : ""
        }`}
      />
    </div>
  );
}

export default function ParknexLogo({
  size = "md",
  showWordmark = true,
  variant = "light",
  className = "",
  quantumBadge = true,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  variant?: "dark" | "light";
  className?: string;
  quantumBadge?: boolean;
}) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  };

  const wordmarkSizes = {
    sm: "text-[18px]",
    md: "text-[21px]",
    lg: "text-[26px]",
    xl: "text-[32px]",
  };

  const textColor = variant === "dark" ? "text-white" : "text-[#241F1B]";

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <ParknexIcon className={iconSizes[size]} variant={variant} />

      {showWordmark && (
        <span
          className={`font-black uppercase tracking-[0.14em] leading-none ${wordmarkSizes[size]} ${textColor} inline-flex items-center`}
          style={{
            fontFamily: "var(--font-sora), 'Sora', sans-serif",
            fontWeight: 800,
          }}
        >
          PARK<span className="text-[#C93B2F]">NEX</span>
          {quantumBadge && (
            <span className="ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-gradient-to-r from-cyan-100 to-violet-100 text-[#0284C7] border border-cyan-300 shadow-2xs">
              Q
            </span>
          )}
        </span>
      )}
    </div>
  );
}
