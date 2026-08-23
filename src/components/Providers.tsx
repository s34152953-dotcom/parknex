"use client";

import React, { useMemo } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { SessionProvider } from "next-auth/react";

const FALLBACK_CONVEX_URL = "https://astute-pony-718.convex.cloud";

export function Providers({ children }: { children: React.ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || FALLBACK_CONVEX_URL;
  const convex = useMemo(() => new ConvexReactClient(convexUrl), [convexUrl]);

  return (
    <SessionProvider>
      <ConvexProvider client={convex}>
        {children}
      </ConvexProvider>
    </SessionProvider>
  );
}

