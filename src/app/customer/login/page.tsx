"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Car, ArrowRight, ShieldCheck } from "lucide-react";
import ParknexLogo from "@/components/ui/ParknexLogo";

export default function CustomerLogin() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/customer/dashboard" });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#D84A2B]/8 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo */}
        <Link href="/" className="flex justify-center mb-10">
          <ParknexLogo size="lg" />
        </Link>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[#D84A2B]/15 flex items-center justify-center mx-auto mb-6">
            <Car className="w-7 h-7 text-[#D84A2B]" />
          </div>

          <h1 className="text-[24px] font-black text-white text-center mb-2 tracking-tight">
            Welcome, Customer
          </h1>
          <p className="text-[14px] text-white/40 text-center mb-8 leading-relaxed">
            Sign in with Google to view your parking assignment, location, and history.
          </p>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-13 flex items-center justify-center gap-3 bg-white text-[#1C1917] text-[14.5px] font-bold rounded-2xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[12px] text-white/25 font-medium">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Token entry for SMS link */}
          <p className="text-[13px] text-white/35 text-center">
            Received an SMS parking link?{" "}
            <span className="text-white/60">Just tap the link</span> — no sign-in needed.
          </p>
        </div>

        {/* Operator link */}
        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-[13px] text-white/30 hover:text-white/60 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Mall Operator Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
