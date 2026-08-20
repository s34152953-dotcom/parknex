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
      const savedRewards = localStorage.getItem("smartpark_rewards");
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
    <div className="min-h-[calc(100vh-68px)] w-full p-6 sm:p-10 lg:p-12 bg-[#FBF8F3] flex flex-col justify-start">
      <div className="max-w-[1240px] w-full mx-auto">
        {/* Header */}
        <div className="pb-6 border-b border-[#EAE3D9] mb-8">
          <h1 className="text-[26px] sm:text-[28px] font-bold text-[#1C1917] tracking-tight">
            Rewards & Partner Offers
          </h1>
          <p className="text-[13.5px] text-[#78716C] mt-1">
            Exclusive parking discounts and retail vouchers earned through your visits
          </p>
        </div>

        {rewards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {rewards.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-[rgba(80,60,40,0.10)] rounded-2xl p-6 sm:p-7 flex flex-col hover:border-[#D84A2B]/40 hover:shadow-[0_8px_30px_rgba(80,50,20,0.06)] shadow-[0_4px_20px_rgba(80,50,20,0.025)] transition-all duration-180"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-md bg-[#FFF5F2] text-[#D84A2B] border border-[#FADCD5] uppercase tracking-wider shrink-0">
                      {r.category}
                    </span>
                    <span className="text-[13px] font-bold text-[#10B981] shrink-0 text-right">
                      {r.discount}
                    </span>
                  </div>

                  <h2 className="text-[18px] font-bold text-[#1C1917] mb-1.5 tracking-tight">
                    {r.title}
                  </h2>
                  <p className="text-[12.5px] font-medium text-[#78716C] flex items-center gap-1.5 mb-3">
                    <Store className="w-3.5 h-3.5 text-[#A8A29E]" />
                    {r.partner}
                  </p>
                  <p className="text-[13px] text-[#78716C] leading-relaxed mb-6">
                    {r.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EAE3D9] flex items-center justify-between gap-3 mt-auto">
                  <div className="flex items-center gap-1.5 text-[12px] text-[#A8A29E] min-w-0 flex-1">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{r.expires}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(r.code, r.id)}
                    className="h-9 px-3.5 rounded-lg bg-[#FFF5F2] border border-[#FADCD5] text-[12px] font-mono font-bold text-[#D84A2B] inline-flex items-center justify-center gap-1.5 hover:bg-[#FFEAE4] active:scale-95 transition-all shrink-0"
                  >
                    {copiedId === r.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span>COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#D84A2B] shrink-0" />
                        <span className="max-w-[100px] truncate">{r.code}</span>
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
                className="h-11 px-6 rounded-lg bg-[#D84A2B] text-white text-[13.5px] font-semibold hover:bg-[#C23E21] transition-colors inline-flex items-center justify-center gap-2 shadow-sm shadow-[#D84A2B]/20"
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
