"use client";

import React, { useState } from "react";
import { Gift, Tag, Clock, Store, Check, Copy } from "lucide-react";

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

  const rewards: RewardItem[] = [
    {
      id: "rew-1",
      title: "2 Hours Free Parking",
      partner: "Central Cinema",
      description: "Get 2 hours complimentary parking on movie ticket booking of 2 or more seats.",
      discount: "FREE 2 HRS",
      code: "CINEPARK24",
      expires: "Valid for 3 days",
      category: "Entertainment",
    },
    {
      id: "rew-2",
      title: "$15 OFF Parking Fee",
      partner: "Starbucks Mall",
      description: "Enjoy $15 instant deduction on spending $30 or more on beverages and snacks.",
      discount: "$15 OFF",
      code: "BREWPARK15",
      expires: "Valid today",
      category: "Dining",
    },
    {
      id: "rew-3",
      title: "50% Discount on Valet",
      partner: "Central Mall Premium Services",
      description: "Exclusive half-price valet parking for verified SmartPark Gold members.",
      discount: "50% OFF",
      code: "VALET50",
      expires: "Valid this week",
      category: "Services",
    },
  ];

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full p-6 sm:p-10 bg-[#05070A] max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-white/[0.06] mb-8">
        <h1 className="text-[26px] font-extrabold text-white tracking-tight">
          Rewards & Offers
        </h1>
        <p className="text-[13px] text-sp-secondary mt-1">
          Exclusive parking discounts and partner vouchers available for your visit
        </p>
      </div>

      {rewards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((r) => (
            <div
              key={r.id}
              className="bg-sp-surface/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col justify-between hover:border-white/20 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-sp-blue/15 text-sp-blue border border-sp-blue/20 uppercase tracking-wider">
                    {r.category}
                  </span>
                  <span className="text-[14px] font-bold text-sp-green">
                    {r.discount}
                  </span>
                </div>

                <h2 className="text-[17px] font-bold text-white mb-1">
                  {r.title}
                </h2>
                <p className="text-[12px] font-medium text-sp-secondary flex items-center gap-1.5 mb-3">
                  <Store className="w-3.5 h-3.5 text-sp-muted" />
                  {r.partner}
                </p>
                <p className="text-[12.5px] text-sp-secondary leading-relaxed mb-6">
                  {r.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-sp-muted">
                  <Clock className="w-3.5 h-3.5" />
                  {r.expires}
                </div>
                <button
                  onClick={() => handleCopy(r.code, r.id)}
                  className="h-8 px-3 rounded-lg bg-sp-elevated border border-white/10 text-[12px] font-semibold text-white flex items-center gap-1.5 hover:bg-sp-elevated/80 active:scale-95 transition-all"
                >
                  {copiedId === r.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-sp-green" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-sp-muted" />
                      {r.code}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <Gift className="w-10 h-10 text-sp-muted mx-auto mb-3" />
          <h2 className="text-[16px] font-bold text-white">No rewards available right now.</h2>
          <p className="text-[13px] text-sp-secondary mt-1">Check back later for new offers.</p>
        </div>
      )}
    </div>
  );
}
