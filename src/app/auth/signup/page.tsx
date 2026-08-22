"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ParknexLogo from "@/components/ui/ParknexLogo";

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
        setErrorMsg(error.message || "Registration failed. Please try again.");
        return;
      }

      router.push("/customer/login?registered=1");
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#FAF7F2] text-[#241F1B] selection:bg-[#F9E3DE] selection:text-[#C93B2F]">
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="mb-3 group">
            <ParknexLogo size="lg" variant="light" />
          </Link>
          <p className="text-[13.5px] text-[#70675F]">
            Register an account to locate and pay for mall parking effortlessly
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-7 sm:p-9 shadow-[0_8px_24px_rgba(70,48,35,0.07)]">
          <form onSubmit={handleSignup} className="flex flex-col gap-4.5">
            <div>
              <label className="block text-[12px] font-bold text-[#241F1B] uppercase mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#70675F] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] placeholder:text-[#938980] text-[13.5px] focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#241F1B] uppercase mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#70675F] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.morgan@example.com"
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] placeholder:text-[#938980] text-[13.5px] focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#241F1B] uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#70675F] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#FFFFFF] border border-[#DED3C7] text-[#241F1B] placeholder:text-[#938980] text-[13.5px] focus:border-[#C93B2F] focus:ring-3 focus:ring-[#F9E3DE] focus:outline-none transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#C93B2F]/10 border border-[#C93B2F]/30 text-[#C93B2F] text-[12.5px]">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(201,59,47,0.25)] transition-all cursor-pointer disabled:opacity-50 mt-1"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#DED3C7] text-center">
            <span className="text-[13px] text-[#70675F]">Already registered? </span>
            <Link href="/customer/login" className="text-[13px] text-[#C93B2F] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
