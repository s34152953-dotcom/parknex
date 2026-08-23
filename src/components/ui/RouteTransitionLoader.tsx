"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import ParknexLogo from "./ParknexLogo";

export default function RouteTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // Intercept standard internal link clicks to detect route transitions
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target || !target.href) return;

      const url = new URL(target.href, window.location.href);
      const isInternal = url.origin === window.location.origin;
      const isDifferentPath = url.pathname !== window.location.pathname || url.search !== window.location.search;
      const isTargetBlank = target.getAttribute("target") === "_blank";

      if (isInternal && isDifferentPath && !isTargetBlank && !e.ctrlKey && !e.metaKey) {
        setIsNavigating(true);
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  // Show overlay only if navigation exceeds 250ms
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isNavigating) {
      timer = setTimeout(() => {
        setShowOverlay(true);
      }, 250);
    } else {
      setShowOverlay(false);
    }

    return () => clearTimeout(timer);
  }, [isNavigating]);

  // Complete transition when pathname / searchParams change
  useEffect(() => {
    setIsNavigating(false);
    setShowOverlay(false);
  }, [pathname, searchParams]);

  if (!showOverlay) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAF7F2]/95 backdrop-blur-xs transition-opacity duration-200"
      role="status"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <ParknexLogo size="lg" variant="light" />
        <div className="w-24 h-1 bg-[#DED3C7] rounded-full overflow-hidden">
          <div className="w-full h-full bg-[#C93B2F] animate-[pageEnter_0.8s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
