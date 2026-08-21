"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Car, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import ParknexLogo from "@/components/ui/ParknexLogo";

function CustomerLoginForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/customer/dashboard" });
  };

  return (
    <div className="bg-[#10151D] border border-white/[0.08] rounded-3xl p-[24px] shadow-2xl shadow-black/60 flex flex-col w-[calc(100%-40px)] max-w-[440px] mx-auto">
      {/* Icon */}
      <div className="w-[56px] h-[56px] rounded-2xl bg-[#D84A2B]/15 flex items-center justify-center mb-[20px]">
        <Car className="w-[28px] h-[28px] text-[#D84A2B]" />
      </div>

      <h1 className="text-[30px] sm:text-[34px] font-black text-white mb-[8px] tracking-tight leading-tight">
        Customer Sign In
      </h1>
      <p className="text-[16px] text-white/50 leading-[1.5] mb-[24px]">
        Sign in to view your parking location, live route guidance and digital exit pass.
      </p>

      {error && (
        <div className="mb-[24px] p-[16px] rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[14px] flex items-start gap-[12px]">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>
            {error === "OAuthCallback" || error === "OAuthCallbackError"
              ? "Unable to complete Google sign-in. Please try again."
              : "Sign-in error. Please try again."}
          </span>
        </div>
      )}

      {/* Google Sign In */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full h-[56px] flex items-center justify-center gap-[12px] bg-white text-[#1C1917] text-[16px] font-bold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer shadow-md"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 text-[#1C1917] animate-spin" />
        ) : (
          <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        <span>{loading ? "Connecting to Google..." : "Continue with Google"}</span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-[16px] my-[24px]">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[12px] text-white/30 font-bold uppercase tracking-wider">Direct Access</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Token info */}
      <p className="text-[14px] text-white/50 text-center leading-[1.6]">
        Received an SMS parking link? <br />
        <span className="text-white">Tap the link in your message</span> to open your space directly.
      </p>

      {/* Operator link inside card footer */}
      <div className="mt-[32px] pt-[24px] border-t border-white/[0.08] flex justify-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-[8px] text-[14px] text-white/50 hover:text-white transition-colors"
        >
          <ShieldCheck className="w-[18px] h-[18px] text-[#D84A2B]" />
          <span>Mall Operator Sign In</span>
        </Link>
      </div>
    </div>
  );
}

export default function CustomerLogin() {
  return (
    <main className="min-h-[100dvh] bg-[#050507] text-[#F5F7FA] flex flex-col box-border w-full selection:bg-[#D84A2B]/20 selection:text-[#D84A2B] pb-[48px]">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#D84A2B]/8 blur-[120px]" />
      </div>

      {/* Normal column layout */}
      <div className="w-full flex flex-col relative z-10">
        {/* Logo with proper spacing from top edge */}
        <div className="flex justify-center pt-[64px] mb-[36px]">
          <Link href="/" aria-label="Go to ParkNex homepage">
            <ParknexLogo size="lg" variant="dark" />
          </Link>
        </div>

        <Suspense fallback={<div className="h-[340px] w-[calc(100%-40px)] max-w-[440px] mx-auto rounded-3xl bg-[#10151D] animate-pulse border border-white/10" />}>
          <CustomerLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
