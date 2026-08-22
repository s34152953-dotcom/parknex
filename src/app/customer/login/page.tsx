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
    <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-7 sm:p-9 shadow-[0_8px_24px_rgba(70,48,35,0.07)] flex flex-col w-full max-w-[480px] mx-auto">
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center mb-5">
        <Car className="w-7 h-7" />
      </div>

      <h1 className="text-[28px] sm:text-[32px] font-black text-[#241F1B] mb-2 tracking-tight leading-tight">
        Customer Sign In
      </h1>
      <p className="text-[14.5px] text-[#70675F] leading-relaxed mb-6">
        Sign in to view your parking location, live route guidance and digital exit pass.
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-[#C93B2F]/10 border border-[#C93B2F]/30 text-[#C93B2F] text-[13.5px] flex items-start gap-3">
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
        className="w-full h-13 flex items-center justify-center gap-3 bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] hover:bg-[#F3EAE0] text-[15px] font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer shadow-xs"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 text-[#241F1B] animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        <span>{loading ? "Connecting to Google..." : "Continue with Google"}</span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-[#DED3C7]" />
        <span className="text-[11.5px] text-[#938980] font-bold uppercase tracking-wider">Direct Access</span>
        <div className="flex-1 h-px bg-[#DED3C7]" />
      </div>

      {/* Token info */}
      <p className="text-[13.5px] text-[#70675F] text-center leading-relaxed">
        Received an SMS parking link? <br />
        <span className="text-[#241F1B] font-semibold">Tap the link in your message</span> to open your space directly.
      </p>

      {/* Operator link inside card footer */}
      <div className="mt-8 pt-6 border-t border-[#DED3C7] flex justify-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-[13.5px] text-[#70675F] hover:text-[#C93B2F] font-semibold transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-[#C93B2F]" />
          <span>Mall Operator Sign In</span>
        </Link>
      </div>
    </div>
  );
}

export default function CustomerLogin() {
  return (
    <main className="min-h-[100dvh] bg-[#FAF7F2] text-[#241F1B] flex flex-col box-border w-full selection:bg-[#F9E3DE] selection:text-[#C93B2F] pb-12">
      {/* Top Header */}
      <header className="w-full bg-[#FFFFFF] border-b border-[#DED3C7] py-4 px-4 sm:px-8 mb-8">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <Link href="/" className="group">
            <ParknexLogo size="md" variant="light" />
          </Link>
          <Link
            href="/"
            className="text-[13.5px] font-bold text-[#70675F] hover:text-[#241F1B] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Form Container */}
      <div className="w-full flex-1 flex items-center justify-center px-4 sm:px-6">
        <Suspense fallback={<div className="h-[360px] max-w-[480px] w-full bg-[#FFFFFF] rounded-2xl animate-pulse border border-[#DED3C7]" />}>
          <CustomerLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
