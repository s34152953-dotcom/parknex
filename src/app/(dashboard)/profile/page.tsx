"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserCircle, Mail, Phone, Shield, Bell, Moon, LogOut, ArrowRight, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  tier?: string;
}

export default function ProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setProfile({
            name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Alex Morgan",
            email: user.email,
            phone: user.phone || "+1 (555) 382-9104",
            tier: "Elite Diamond Member",
          });
        } else {
          // Check local stored session or load preview user matching reference
          const stored = localStorage.getItem("smartpark_user");
          if (stored) {
            setProfile(JSON.parse(stored));
          } else {
            setProfile({
              name: "Alex Morgan",
              email: "alex.morgan@smartpark.io",
              phone: "+1 (555) 382-9104",
              tier: "Elite Diamond Member",
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [supabase]);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full p-8 sm:p-10 lg:p-12 bg-[#040608] flex flex-col justify-start">
      <div className="max-w-[1040px] w-full mx-auto">
        {/* Header */}
        <div className="pb-6 border-b border-white/[0.06] mb-8">
          <h1 className="text-[24px] sm:text-[26px] font-extrabold text-white tracking-tight">
            User Account & Security
          </h1>
          <p className="text-[13px] text-white/50 mt-1">
            Manage your credentials, vehicle notifications, and security preferences
          </p>
        </div>

        {profile ? (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.8fr)] gap-6 items-stretch">
            {/* User Card */}
            <div className="bg-[#080C14]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-sky-400 mb-5 shadow-xl">
                <UserCircle className="w-14 h-14" strokeWidth={1.5} />
              </div>
              <h2 className="text-[20px] font-bold text-white tracking-tight">{profile.name}</h2>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/20 mt-2 uppercase tracking-wider">
                {profile.tier || "Active User"}
              </span>
              <p className="text-[12px] text-white/40 mt-4">
                SmartPark Member since 2024
              </p>
            </div>

            {/* Info & Settings */}
            <div className="md:col-span-2 bg-[#080C14]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-[17px] font-bold text-white mb-5 tracking-tight">Account Information</h3>
                <div className="flex flex-col gap-3.5 text-[13px]">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3 text-white/60">
                      <Mail className="w-4 h-4 text-white/40" />
                      <span>Email Address</span>
                    </div>
                    <span className="text-white font-medium">{profile.email || "alex.morgan@smartpark.io"}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3 text-white/60">
                      <Phone className="w-4 h-4 text-white/40" />
                      <span>Phone Number</span>
                    </div>
                    <span className="text-white font-medium">{profile.phone || "+1 (555) 382-9104"}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3 text-white/60">
                      <Shield className="w-4 h-4 text-white/40" />
                      <span>Account Verification</span>
                    </div>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/[0.06] mt-6 flex justify-end items-center">
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    localStorage.removeItem("smartpark_user");
                    setProfile(null);
                  }}
                  className="h-10 px-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[13px] font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Clean Sign In / Register Prompt Empty State */
          <div className="w-full py-20 px-6 rounded-3xl bg-[#080C14]/50 border border-white/[0.06] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/40 mb-4 shadow-xl">
              <UserCircle className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h2 className="text-[19px] font-bold text-white mb-2">
              No Account Connected
            </h2>
            <p className="text-[13.5px] text-white/50 max-w-[380px] mb-7 leading-relaxed">
              Sign in or create a SmartPark account to sync your vehicle details, active parking sessions, and reward vouchers.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/auth/login"
                className="h-11 px-6 rounded-full bg-white text-[#040608] text-[13.5px] font-bold hover:bg-white/90 transition-colors shadow-lg shadow-white/10 flex items-center gap-2"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/signup"
                className="h-11 px-6 rounded-full bg-white/[0.04] border border-white/10 text-white text-[13.5px] font-semibold hover:bg-white/[0.08] transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
