"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
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
    <div className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-7 sm:p-9 shadow-[0_12px_40px_rgba(80,50,20,0.04)]">
      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div>
          <label htmlFor="email-input" className="block text-[12px] font-bold text-[#57534E] uppercase mb-2">
            Operator Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#A8A29E] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@parknex.io"
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9CC] text-[#1C1917] placeholder:text-[#A8A29E] text-[14px] focus:border-[#D84A2B] focus-visible:ring-2 focus-visible:ring-[#D84A2B]/20 focus:outline-none transition-all"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password-input" className="block text-[12px] font-bold text-[#57534E] uppercase">
              Password
            </label>
            <span className="text-[11.5px] font-medium text-[#78716C]">
              Operator Gate 01
            </span>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#A8A29E] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9CC] text-[#1C1917] placeholder:text-[#A8A29E] text-[14px] focus:border-[#D84A2B] focus-visible:ring-2 focus-visible:ring-[#D84A2B]/20 focus:outline-none transition-all"
              required
            />
          </div>
        </div>

        {errorMsg && (
          <p className="text-[12.5px] text-[#EF4444] font-medium" role="alert">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[50px] rounded-xl bg-[#D84A2B] text-white text-[14.5px] font-semibold flex items-center justify-center gap-2 hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-md shadow-[#D84A2B]/20 mt-2 cursor-pointer disabled:opacity-70"
        >
          {loading ? "Authenticating..." : "Sign In to Admin Operations"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#FBF8F3] selection:bg-[#D84A2B]/20 selection:text-[#D84A2B]">
      <div className="w-full max-w-[440px]">
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="mb-3 group" aria-label="Go to ParkNex homepage">
            <ParknexLogo size="lg" />
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5F2] border border-[#FADCD5] text-[#D84A2B] text-[11.5px] font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            OPERATOR PORTAL
          </div>
          <p className="text-[13.5px] text-[#78716C]">
            Sign in to access PARKNEX operator operations
          </p>
        </div>

        <Suspense fallback={<div className="h-[360px] bg-white rounded-3xl animate-pulse border border-[#EAE3D9]" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
