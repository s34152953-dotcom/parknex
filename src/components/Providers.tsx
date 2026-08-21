"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { SessionProvider } from "next-auth/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// We only initialize the client if the URL is present and not a mock
const convex = convexUrl && !convexUrl.includes("mock") ? new ConvexReactClient(convexUrl) : null;

export function Providers({ children }: { children: React.ReactNode }) {
  if (!convex) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF8F3] p-6 text-center">
        <div className="max-w-md bg-white border border-[#EF4444]/30 rounded-3xl p-8 shadow-sm">
          <h1 className="text-[20px] font-bold text-[#1C1917] mb-2">Server Configuration Error</h1>
          <p className="text-[14px] text-[#78716C]">
            The application cannot connect to the backend database. 
            Missing or invalid NEXT_PUBLIC_CONVEX_URL environment variable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SessionProvider>
      <ConvexProvider client={convex}>
        {children}
      </ConvexProvider>
    </SessionProvider>
  );
}
