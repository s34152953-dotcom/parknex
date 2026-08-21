"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Gift, Tag, Clock, Store, Check, Copy, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

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
      const savedRewards = localStorage.getItem("parknex_rewards") || localStorage.getItem("smartpark_rewards");
      if (savedRewards) {
        setRewards(JSON.parse(savedRewards));
      } else {
        // High quality preview rewards
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
    <div className="min-h-[calc(100vh-68px)] w-full p-6 sm:p-8 lg:p-10 xl:p-12 bg-[#FBF8F3] flex flex-col justify-start">
      <div className="w-full max-w-[1500px] mx-auto">
        {/* Header */}
        <div className="pb-6 border-b border-[#EAE3D9] mb-8">
          <h1 className="text-[26px] sm:text-[28px] lg:text-[32px] font-bold text-[#1C1917] tracking-tight">
            Rewards & Partner Offers
          </h1>
          <p className="text-[14px] text-[#78716C] mt-1">
            Exclusive parking discounts and retail vouchers earned through your visits
          </p>
        </div>

        {rewards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {rewards.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-[rgba(80,60,40,0.08)] rounded-3xl p-7 sm:p-8 flex flex-col justify-between hover:border-[#D84A2B]/40 hover:shadow-[0_12px_36px_rgba(80,50,20,0.06)] shadow-[0_6px_28px_rgba(80,50,20,0.025)] transition-all duration-220 min-w-0"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4.5 min-w-0">
                    <span className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#FFF5F2] text-[#D84A2B] border border-[#FADCD5] uppercase tracking-wider shrink-0">
                      {r.category}
                    </span>
                    <span className="text-[12.5px] sm:text-[13px] font-extrabold text-[#10B981] shrink-0 text-right">
                      {r.discount}
                    </span>
                  </div>

                  <h2 className="text-[19px] sm:text-[20px] font-bold text-[#1C1917] mb-2 tracking-tight">
                    {r.title}
                  </h2>
                  <p className="text-[13px] font-medium text-[#78716C] flex items-center gap-1.5 mb-3.5">
                    <Store className="w-4 h-4 text-[#A8A29E] shrink-0" />
                    <span className="truncate">{r.partner}</span>
                  </p>
                  <p className="text-[13.5px] text-[#78716C] leading-relaxed mb-6">
                    {r.description}
                  </p>
                </div>

                <div className="pt-4.5 border-t border-[#EAE3D9] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mt-auto min-w-0">
                  <div className="flex items-center gap-2 text-[12.5px] text-[#A8A29E] min-w-0">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span className="truncate">{r.expires}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(r.code, r.id)}
                    className="h-10 px-4 rounded-xl bg-[#FFF5F2] border border-[#FADCD5] text-[12px] font-mono font-bold text-[#D84A2B] inline-flex items-center justify-center gap-2 hover:bg-[#FFEAE4] active:scale-[0.98] transition-all shrink-0 whitespace-nowrap cursor-pointer"
                  >
                    {copiedId === r.id ? (
                      <>
                        <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                        <span>COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-[#D84A2B] shrink-0" />
                        <span>{r.code}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Gift}
            title="No Rewards Unlocked Yet"
            description="Park frequently at participating malls and partner venues to earn free parking credits and shopping vouchers."
            action={
              <Link
                href="/parking"
                className="h-11 px-6 rounded-xl bg-[#D84A2B] text-white text-[13.5px] font-semibold hover:bg-[#C23E21] active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 shadow-sm shadow-[#D84A2B]/20 cursor-pointer"
              >
                Start Parking
                <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
