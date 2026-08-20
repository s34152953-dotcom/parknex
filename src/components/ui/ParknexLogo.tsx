"use client";

import React from "react";

export function ParknexIcon({
  className = "w-10 h-10",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* 100% Exact Matching Official Symbol Image */}
      <img
        src="/images/parknex-symbol.png"
        alt="PARKNEX Icon"
        className="w-full h-full object-contain mix-blend-multiply"
        style={{ filter: "contrast(1.05)" }}
      />
    </div>
  );
}

export default function ParknexLogo({
  size = "md",
  showWordmark = true,
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
}) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const wordmarkSizes = {
    sm: "text-[20px]",
    md: "text-[24px]",
    lg: "text-[30px]",
    xl: "text-[38px]",
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Exact 100% Matching Logo Icon */}
      <ParknexIcon className={iconSizes[size]} />

      {/* Brand Wordmark */}
      {showWordmark && (
        <span
          className={`font-black uppercase text-[#1C1917] tracking-[0.14em] leading-none ${wordmarkSizes[size]}`}
          style={{
            fontFamily: "var(--font-sora), 'Sora', sans-serif",
            fontWeight: 800,
          }}
        >
          PARKNEX
        </span>
      )}
    </div>
  );
}
