"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserCircle, Mail, Phone, Shield, Bell, Moon, LogOut, ArrowRight, UserPlus, Car, Clock, QrCode, HelpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/ui/EmptyState";

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
          const stored = localStorage.getItem("parknex_user") || localStorage.getItem("smartpark_user");
          if (stored) {
            setProfile(JSON.parse(stored));
          } else {
            setProfile({
              name: "Alex Morgan",
              email: "alex.morgan@parknex.io",
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

  const quickActions = [
    { title: "Register Vehicle", href: "/vehicle", icon: Car, desc: "Add plate & ANPR credentials" },
    { title: "Parking History", href: "/history", icon: Clock, desc: "View invoices & past visits" },
    { title: "Digital Exit Pass", href: "/exit-pass", icon: QrCode, desc: "Active barrier authorization" },
    { title: "Help & Support", href: "#", icon: HelpCircle, desc: "Mall concierge & FAQs" },
  ];

  return (
    <div className="min-h-[calc(100vh-68px)] w-full p-6 sm:p-8 lg:p-10 xl:p-12 bg-[#FBF8F3] flex flex-col justify-start">
      <div className="w-full max-w-[1500px] mx-auto">
        {/* Header */}
        <div className="pb-6 border-b border-[#EAE3D9] mb-8">
          <h1 className="text-[26px] sm:text-[28px] lg:text-[32px] font-bold text-[#1C1917] tracking-tight">
            User Account & Preferences
          </h1>
          <p className="text-[14px] text-[#78716C] mt-1">
            Manage your credentials, vehicle telemetry alerts, and PARKNEX membership status
          </p>
        </div>

        {profile ? (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* User Identity Card */}
              <div className="lg:col-span-4 bg-white border border-[rgba(80,60,40,0.10)] rounded-2xl p-7 sm:p-8 flex flex-col items-center justify-center text-center shadow-[0_6px_24px_rgba(80,50,20,0.035)] h-full">
                <div className="w-24 h-24 rounded-full bg-[#FFF5F2] border-2 border-[#FADCD5] flex items-center justify-center text-[#D84A2B] mb-5 shadow-sm">
                  <UserCircle className="w-14 h-14" strokeWidth={1.5} />
                </div>
                <h2 className="text-[22px] sm:text-[24px] font-bold text-[#1C1917] tracking-tight">{profile.name}</h2>
                <span className="text-[11.5px] font-bold px-3.5 py-1 rounded-full bg-[#FFF5F2] text-[#D84A2B] border border-[#FADCD5] mt-2 uppercase tracking-wider">
                  {profile.tier || "Active Member"}
                </span>
                <p className="text-[13px] text-[#78716C] mt-4">
                  PARKNEX Member since 2024
                </p>
              </div>

              {/* Info & Settings */}
              <div className="lg:col-span-8 bg-white border border-[rgba(80,60,40,0.10)] rounded-2xl p-7 sm:p-8 flex flex-col justify-between shadow-[0_6px_24px_rgba(80,50,20,0.035)] h-full">
                <div>
                  <h3 className="text-[18px] sm:text-[20px] font-bold text-[#1C1917] mb-5 tracking-tight">Account Information</h3>
                  <div className="flex flex-col gap-3.5 text-[13.5px]">
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE3D9]">
                      <div className="flex items-center gap-3 text-[#78716C]">
                        <Mail className="w-4 h-4 text-[#A8A29E] shrink-0" />
                        <span>Email Address</span>
                      </div>
                      <span className="text-[#1C1917] font-semibold truncate">{profile.email || "alex.morgan@parknex.io"}</span>
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE3D9]">
                      <div className="flex items-center gap-3 text-[#78716C]">
                        <Phone className="w-4 h-4 text-[#A8A29E] shrink-0" />
                        <span>Phone Number</span>
                      </div>
                      <span className="text-[#1C1917] font-semibold">{profile.phone || "+1 (555) 382-9104"}</span>
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE3D9]">
                      <div className="flex items-center gap-3 text-[#78716C]">
                        <Shield className="w-4 h-4 text-[#A8A29E] shrink-0" />
                        <span>Account Verification</span>
                      </div>
                      <span className="text-[#10B981] font-bold flex items-center gap-1.5 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        Verified Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#EAE3D9] mt-6 flex justify-end items-center">
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      localStorage.removeItem("parknex_user");
                      localStorage.removeItem("smartpark_user");
                      setProfile(null);
                    }}
                    className="h-10 px-5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[13px] font-semibold text-[#EF4444] hover:bg-[#EF4444]/15 active:scale-95 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
              <h3 className="text-[18px] font-bold text-[#1C1917] mb-4 tracking-tight">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
                {quickActions.map((qa) => (
                  <Link
                    key={qa.title}
                    href={qa.href}
                    className="p-5 sm:p-6 rounded-2xl bg-white border border-[rgba(80,60,40,0.10)] hover:border-[#D84A2B]/40 hover:shadow-[0_8px_24px_rgba(80,50,20,0.06)] transition-all group flex flex-col justify-between shadow-[0_4px_18px_rgba(80,50,20,0.025)]"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center text-[#D84A2B] mb-4 group-hover:scale-105 transition-transform">
                      <qa.icon className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#1C1917] group-hover:text-[#D84A2B] transition-colors">{qa.title}</p>
                      <p className="text-[12.5px] text-[#78716C] mt-1">{qa.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={UserCircle}
            title="No Account Connected"
            description="Sign in or create a PARKNEX account to sync your vehicle details, active parking sessions, and reward vouchers."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/auth/login"
                  className="h-11 px-6 rounded-lg bg-[#D84A2B] text-white text-[13.5px] font-semibold hover:bg-[#C23E21] transition-colors inline-flex items-center justify-center gap-2 shadow-sm shadow-[#D84A2B]/20"
                >
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/auth/signup"
                  className="h-11 px-6 rounded-lg bg-white border border-[#E2D9CC] text-[#1C1917] text-[13.5px] font-semibold hover:border-[#D84A2B]/40 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </Link>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
