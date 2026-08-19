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
      } else {
        // High quality preview rewards matching reference
        setRewards([
          {
            id: "rew-1",
            title: "50% Off 3-Hour Parking",
            partner: "Central Mall Parking",
            description: "Applicable on any basement parking level during weekdays between 10 AM to 6 PM.",
            discount: "50% OFF",
            code: "PARK50MALL",
            expires: "Valid till Sep 30",
            category: "Parking Credit",
          },
          {
            id: "rew-2",
            title: "Free Coffee & Pastry",
            partner: "Starbucks Reserve Level 1",
            description: "Complimentary tall beverage and butter croissant on min parking spend of $15.",
            discount: "FREE COMBO",
            code: "STARBUCKS-PK",
            expires: "Valid till Oct 15",
            category: "Dining & Cafe",
          },
          {
            id: "rew-3",
            title: "$20 Mall Shopping Voucher",
            partner: "Zara & H&M Fashion Floor",
            description: "Redeemable at all participating fashion retail outlets inside Central Mall Grand.",
            discount: "$20 CASHBACK",
            code: "FASHION20SP",
            expires: "Valid till Nov 05",
            category: "Shopping",
          },
          {
            id: "rew-4",
            title: "Free 60kW EV Fast Charge",
            partner: "ChargePoint Station B2",
            description: "Up to 30 mins complimentary fast charging session for registered EV vehicles.",
            discount: "FREE EV CHARGE",
            code: "EVCHARGE-FREE",
            expires: "Valid till Oct 31",
            category: "EV Charging",
          },
          {
            id: "rew-5",
            title: "VIP Valet Upgrade Pass",
            partner: "Central Mall VIP Concierge",
            description: "Complimentary premium curbside valet drop-off and pickup service at North Entrance.",
            discount: "FREE UPGRADE",
            code: "VALET-VIP-PASS",
            expires: "Valid till Dec 15",
            category: "Valet Service",
          },
          {
            id: "rew-6",
            title: "2-for-1 IMAX Movie Ticket",
            partner: "PVR Cinemas Floor 4",
            description: "Buy one get one free on any weekend IMAX or Dolby Atmos movie screening.",
            discount: "BUY 1 GET 1",
            code: "IMAX-SMARTPK",
            expires: "Valid till Nov 20",
            category: "Entertainment",
          },
        ]);
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
    <div className="min-h-[calc(100vh-64px)] w-full p-8 sm:p-10 lg:p-12 bg-[#040608] flex flex-col justify-start">
      <div className="max-w-[1240px] w-full mx-auto">
        {/* Header */}
        <div className="pb-6 border-b border-white/[0.06] mb-10">
          <h1 className="text-[24px] sm:text-[26px] font-extrabold text-white tracking-tight">
            Rewards & Partner Offers
          </h1>
          <p className="text-[13px] text-white/50 mt-1">
            Exclusive parking discounts and retail vouchers earned through your visits
          </p>
        </div>

        {rewards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {rewards.map((r) => (
              <div
                key={r.id}
                className="bg-[#080C14]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-7 shadow-2xl flex flex-col justify-between hover:border-white/20 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 uppercase tracking-wider shrink-0">
                      {r.category}
                    </span>
                    <span className="text-[13px] font-bold text-emerald-400 shrink-0 text-right">
                      {r.discount}
                    </span>
                  </div>

                  <h2 className="text-[18px] font-bold text-white mb-1.5 tracking-tight">
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

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11.5px] text-white/40 min-w-0 flex-1">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{r.expires}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(r.code, r.id)}
                    className="h-8 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-[11.5px] font-semibold text-white flex items-center gap-1.5 hover:bg-white/[0.08] active:scale-95 transition-all shadow-sm shrink-0"
                  >
                    {copiedId === r.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-white/40 shrink-0" />
                        <span className="max-w-[90px] truncate">{r.code}</span>
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
    </div>
  );
}
