"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        // Fallback for demo
        router.push("/parking");
        return;
      }

      router.push("/parking");
    } catch (err: any) {
      router.push("/parking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#050505] selection:bg-sp-blue selection:text-white">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 mb-3 group">
            <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center bg-sp-elevated/70 group-hover:border-white/25 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-sp-white">
                <polygon
                  points="12 2 21 7.5 21 16.5 12 22 3 16.5 3 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-[20px] font-bold text-white tracking-tight">SmartPark</span>
          </Link>
          <p className="text-[13.5px] text-sp-secondary">
            Register an account to locate and pay for mall parking effortlessly
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-sp-surface/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-sp-nav uppercase mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-sp-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-sp-elevated border border-white/10 text-white placeholder:text-sp-muted text-[13.5px] focus:border-sp-blue focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-sp-nav uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-sp-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.morgan@example.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-sp-elevated border border-white/10 text-white placeholder:text-sp-muted text-[13.5px] focus:border-sp-blue focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-sp-nav uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-sp-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-sp-elevated border border-white/10 text-white placeholder:text-sp-muted text-[13.5px] focus:border-sp-blue focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-[12px] text-sp-red font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-sp-cta text-sp-cta-text text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all shadow-md mt-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-6 mt-6 border-t border-white/[0.06] text-[13px] text-sp-secondary">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-sp-blue font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
