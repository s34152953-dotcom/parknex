"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Gift, Tag, Clock, Store, Check, Copy, ArrowRight } from "lucide-react";

interface RewardItem {
  id: string;
  title: string;
  partner: string;
  description: string;
  discount: string;
  code: string;
  expires: string;
  category: string;
}

export default function RewardsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rewards, setRewards] = useState<RewardItem[]>([]);

  useEffect(() => {
    try {
      const savedRewards = localStorage.getItem("smartpark_rewards");
      if (savedRewards) {
        setRewards(JSON.parse(savedRewards));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full p-6 sm:p-10 bg-[#040608] max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-white/[0.06] mb-8">
        <h1 className="text-[26px] font-extrabold text-white tracking-tight">
          Rewards & Partner Offers
        </h1>
        <p className="text-[13px] text-white/50 mt-1">
          Exclusive parking discounts and retail vouchers earned through SmartPark visits
        </p>
      </div>

      {rewards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((r) => (
            <div
              key={r.id}
              className="bg-[#080C14]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col justify-between hover:border-white/20 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 uppercase tracking-wider">
                    {r.category}
                  </span>
                  <span className="text-[14px] font-bold text-emerald-400">
                    {r.discount}
                  </span>
                </div>

                <h2 className="text-[17px] font-bold text-white mb-1">
                  {r.title}
                </h2>
                <p className="text-[12px] font-medium text-white/60 flex items-center gap-1.5 mb-3">
                  <Store className="w-3.5 h-3.5 text-white/40" />
                  {r.partner}
                </p>
                <p className="text-[12.5px] text-white/60 leading-relaxed mb-6">
                  {r.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                  <Clock className="w-3.5 h-3.5" />
                  {r.expires}
                </div>
                <button
                  onClick={() => handleCopy(r.code, r.id)}
                  className="h-8 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-[12px] font-semibold text-white flex items-center gap-1.5 hover:bg-white/[0.08] active:scale-95 transition-all"
                >
                  {copiedId === r.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-white/40" />
                      {r.code}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Designed Empty State */
        <div className="w-full py-20 px-6 rounded-3xl bg-[#080C14]/50 border border-white/[0.06] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/40 mb-4 shadow-xl">
            <Gift className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h2 className="text-[19px] font-bold text-white mb-2">
            No Rewards Unlocked Yet
          </h2>
          <p className="text-[13.5px] text-white/50 max-w-[380px] mb-7 leading-relaxed">
            Park frequently at participating malls and partner venues to earn free parking credits and shopping vouchers.
          </p>
          <Link
            href="/parking"
            className="h-11 px-6 rounded-full bg-white text-[#040608] text-[13.5px] font-bold hover:bg-white/90 transition-colors shadow-lg shadow-white/10 flex items-center gap-2"
          >
            Start Parking
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
