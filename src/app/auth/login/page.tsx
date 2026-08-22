"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Lock, Mail, ShieldCheck, Car, AlertCircle } from "lucide-react";
import ParknexLogo from "@/components/ui/ParknexLogo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") || "/admin/booking";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const performLogin = async (loginEmail: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await signIn("operator-credentials", {
        redirect: false,
        email: loginEmail.toLowerCase().trim(),
        password: password,
      });

      if (result?.error) {
        setErrorMsg(result.error || "Invalid email or password.");
        setLoading(false);
      } else if (result?.ok) {
        setSuccess(true);
        // Clean navigation so middleware and server components receive the updated session cookies
        window.location.href = redirectPath;
      } else {
        setErrorMsg("Unable to sign in. Please verify your credentials.");
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred during login.");
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email);
  };

  return (
    <div className="bg-[#10151D] border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/60">
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <div>
          <label
            htmlFor="email-input"
            className="block text-[12px] font-bold text-white/70 uppercase tracking-wider mb-2"
          >
            Operator Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@parknex.io"
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/25 text-[14px] focus:border-[#D84A2B] focus:bg-white/[0.07] focus:outline-none transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password-input"
            className="block text-[12px] font-bold text-white/70 uppercase tracking-wider mb-2"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/25 text-[14px] focus:border-[#D84A2B] focus:bg-white/[0.07] focus:outline-none transition-all"
              required
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className="w-full h-13 rounded-xl bg-[#D84A2B] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-lg shadow-[#D84A2B]/25 mt-1 cursor-pointer disabled:opacity-60"
        >
          {success ? "Access Granted. Opening Operations Hub..." : loading ? "Authenticating..." : "Sign In as Operator"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-5 sm:p-8 bg-[#050507] text-[#F5F7FA] relative selection:bg-[#D84A2B]/20 selection:text-[#D84A2B]">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#D84A2B]/8 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[460px]">
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="mb-4 group" aria-label="Go to ParkNex homepage">
            <ParknexLogo size="lg" variant="dark" />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D84A2B]/10 border border-[#D84A2B]/30 text-[#F87171] text-[11.5px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            OPERATOR ACCESS
          </div>
          <p className="text-[14px] text-white/50">
            Sign in to manage parking space allocations & exit gates
          </p>
        </div>

        <Suspense fallback={<div className="h-[360px] bg-[#10151D] rounded-3xl animate-pulse border border-white/10" />}>
          <LoginForm />
        </Suspense>

        {/* Customer Portal Link */}
        <div className="mt-8 text-center">
          <Link
            href="/customer/login"
            className="inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-white transition-colors"
          >
            <Car className="w-4 h-4 text-[#D84A2B]" />
            <span>Looking for Customer Parking? Sign In here</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
