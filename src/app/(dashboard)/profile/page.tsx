"use client";

import React from "react";
import { UserCircle, Mail, Phone, Shield, Bell, Moon, LogOut } from "lucide-react";

export default function ProfilePage() {
  const user = {
    name: "Alex Morgan",
    email: "alex.morgan@smartpark.io",
    phone: "+1 (555) 234-5678",
    membershipTier: "Gold Member",
    memberSince: "May 2025",
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full p-6 sm:p-10 bg-[#05070A] max-w-[900px] mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-white/[0.06] mb-8">
        <h1 className="text-[26px] font-extrabold text-white tracking-tight">
          User Profile & Settings
        </h1>
        <p className="text-[13px] text-sp-secondary mt-1">
          Manage your account preferences, contact info, and security credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-sp-surface/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-sp-elevated border border-white/10 flex items-center justify-center text-sp-blue mb-4 shadow-lg">
            <UserCircle className="w-12 h-12" strokeWidth={1.5} />
          </div>
          <h2 className="text-[18px] font-bold text-white">{user.name}</h2>
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-sp-blue/15 text-sp-blue border border-sp-blue/20 mt-1.5 uppercase tracking-wider">
            {user.membershipTier}
          </span>
          <p className="text-[11px] text-sp-muted mt-3">Member since {user.memberSince}</p>
        </div>

        {/* Info & Settings */}
        <div className="md:col-span-2 bg-sp-surface/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-[16px] font-bold text-white mb-4">Account Information</h3>
            <div className="flex flex-col gap-4 text-[13px]">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-sp-elevated/40 border border-white/[0.04]">
                <div className="flex items-center gap-3 text-sp-secondary">
                  <Mail className="w-4 h-4 text-sp-muted" />
                  <span>Email Address</span>
                </div>
                <span className="text-white font-medium">{user.email}</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-sp-elevated/40 border border-white/[0.04]">
                <div className="flex items-center gap-3 text-sp-secondary">
                  <Phone className="w-4 h-4 text-sp-muted" />
                  <span>Phone</span>
                </div>
                <span className="text-white font-medium">{user.phone}</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-sp-elevated/40 border border-white/[0.04]">
                <div className="flex items-center gap-3 text-sp-secondary">
                  <Shield className="w-4 h-4 text-sp-muted" />
                  <span>2FA Authentication</span>
                </div>
                <span className="text-sp-green font-semibold">Enabled</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.06] mt-6 flex justify-end">
            <button className="h-10 px-5 rounded-xl bg-sp-elevated border border-white/10 text-[13px] font-semibold text-sp-red hover:bg-sp-red/10 hover:border-sp-red/30 flex items-center gap-2 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
