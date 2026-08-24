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

  const performLogin = async (loginEmail: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await signIn("operator-credentials", {
        redirect: false,
        email: loginEmail,
        password: password,
      });

      if (result?.error) {
        setErrorMsg(result.error);
      } else if (result?.ok) {
        router.push(redirectPath);
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-7 sm:p-9 shadow-[0_8px_24px_rgba(70,48,35,0.07)]">
      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="email-input"
            className="block text-[12px] font-bold text-[#241F1B] uppercase tracking-wider mb-2"
          >
            Operator Email or Username
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#70675F] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="email-input"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parknexadmin.com"
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] placeholder:text-[#938980] text-[14px] focus:border-[#C93B2F] focus:outline-none focus:ring-3 focus:ring-[#F9E3DE] transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password-input"
            className="block text-[12px] font-bold text-[#241F1B] uppercase tracking-wider mb-2"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#70675F] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] placeholder:text-[#938980] text-[14px] focus:border-[#C93B2F] focus:outline-none focus:ring-3 focus:ring-[#F9E3DE] transition-all"
              required
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#C93B2F]/10 border border-[#C93B2F]/30 text-[#C93B2F] text-[13px] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-[#C93B2F] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 hover:bg-[#A92E25] active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(201,59,47,0.25)] mt-1 cursor-pointer disabled:opacity-60"
        >
          {loading ? "Authenticating..." : "Sign In as Operator"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-[#FAF7F2] text-[#241F1B] relative selection:bg-[#F9E3DE] selection:text-[#C93B2F] overflow-hidden">
      {/* Background Indian Cars Image with soft blur */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-15 pointer-events-none blur-[2px]"
        style={{
          backgroundImage: 'url("/images/hero-indian-cars.jpg")',
        }}
      />
      <div className="absolute inset-0 z-0 bg-[#FAF7F2]/80 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[480px]">
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="mb-4 group" aria-label="Go to ParkNex homepage">
            <ParknexLogo size="lg" variant="light" />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F9E3DE] border border-[#C93B2F]/20 text-[#C93B2F] text-[11.5px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            OPERATOR ACCESS
          </div>
          <p className="text-[14px] text-[#70675F]">
            Sign in to manage parking space allocations &amp; exit gates
          </p>
        </div>

        <Suspense fallback={<div className="h-[360px] bg-[#FFFFFF] rounded-2xl animate-pulse border border-[#DED3C7]" />}>
          <LoginForm />
        </Suspense>

        {/* Customer Portal Link */}
        <div className="mt-8 text-center">
          <Link
            href="/customer/login"
            className="inline-flex items-center gap-2 text-[13.5px] text-[#70675F] hover:text-[#C93B2F] font-semibold transition-colors"
          >
            <Car className="w-4 h-4 text-[#C93B2F]" />
            <span>Looking for Customer Parking? Sign In here</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
