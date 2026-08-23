"use client";

import React from "react";

export default function LoadingFallback({ isReady = false }: { isReady?: boolean }) {
  return (
    <div
      className={`absolute inset-0 z-0 transition-opacity duration-500 pointer-events-none bg-[#FAF7F2] ${
        isReady ? "opacity-0" : "opacity-100"
      }`}
    />
  );
}
