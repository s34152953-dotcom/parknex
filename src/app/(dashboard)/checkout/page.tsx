"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Clock,
  Car,
  Gift,
  ShieldCheck,
  ArrowRight,
  Check,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedReward, setSelectedReward] = useState<string | null>("reward-1");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const pricing = {
    baseRate: 40.0,
    durationHours: 2,
    subtotal: 80.0,
    rewardDiscount: 20.0,
    finalTotal: 60.0,
  };

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      router.push("/exit-pass");
    }, 1200);
  };

  return (
    <div className="min-h-[calc(100vh-68px)] w-full p-6 sm:p-8 lg:p-10 xl:p-12 bg-[#FBF8F3] flex flex-col justify-start">
      <div className="w-full max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="pb-6 border-b border-[#EAE3D9] mb-8">
          <h1 className="text-[26px] sm:text-[28px] lg:text-[32px] font-bold text-[#1C1917] tracking-tight">
            Parking Checkout
          </h1>
          <p className="text-[14px] text-[#78716C] mt-1">
            Review your parking duration, eligible rewards, and complete payment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Parking Summary */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            {/* Parking Session Info */}
            <div className="bg-white border border-[rgba(80,60,40,0.10)] rounded-2xl p-6 sm:p-8 shadow-[0_6px_24px_rgba(80,50,20,0.035)]">
              <h2 className="text-[18px] font-bold text-[#1C1917] mb-5">
                Session Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D9] text-[13.5px]">
                <div>
                  <p className="text-[#A8A29E] text-[11px] font-bold uppercase tracking-wider">Vehicle</p>
                  <p className="text-[#1C1917] font-bold mt-1 text-[15px]">Porsche Taycan 4S</p>
                  <p className="text-[12px] text-[#78716C] font-mono">KA-01-MJ-2024</p>
                </div>
                <div>
                  <p className="text-[#A8A29E] text-[11px] font-bold uppercase tracking-wider">Location</p>
                  <p className="text-[#1C1917] font-bold mt-1 text-[15px]">Floor B2 · Zone A</p>
                  <p className="text-[12px] text-[#D84A2B] font-semibold">Slot A-14 (Pillar 18)</p>
                </div>
                <div>
                  <p className="text-[#A8A29E] text-[11px] font-bold uppercase tracking-wider">Duration</p>
                  <p className="text-[#1C1917] font-bold mt-1 text-[15px]">1 hr 24 min</p>
                  <p className="text-[12px] text-[#78716C]">Billed: 2 hrs</p>
                </div>
              </div>
            </div>

            {/* Applicable Rewards */}
            <div className="bg-white border border-[rgba(80,60,40,0.10)] rounded-2xl p-6 sm:p-8 shadow-[0_6px_24px_rgba(80,50,20,0.035)]">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[18px] font-bold text-[#1C1917] flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#D84A2B]" />
                  Available Rewards & Discounts
                </h2>
                <span className="text-[12px] text-[#10B981] font-bold px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20">1 Applied</span>
              </div>

              <div className="flex flex-col gap-3">
                <div
                  onClick={() => setSelectedReward(selectedReward === "reward-1" ? null : "reward-1")}
                  className={`p-4 sm:p-5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                    selectedReward === "reward-1"
                      ? "bg-[#FFF5F2] border-[#D84A2B]"
                      : "bg-[#FAF7F2] border-[#EAE3D9] hover:border-[#D84A2B]/40"
                  }`}
                >
                  <div>
                    <p className="text-[15px] font-bold text-[#1C1917]">Mall Dining Voucher</p>
                    <p className="text-[13px] text-[#78716C] mt-0.5">
                      $20 OFF parking on food court orders above $50
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${
                      selectedReward === "reward-1"
                        ? "bg-[#D84A2B] border-[#D84A2B] text-white"
                        : "border-[#E2D9CC] bg-white"
                    }`}
                  >
                    {selectedReward === "reward-1" && <Check className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Payment Breakdown Card */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white border border-[rgba(80,60,40,0.10)] rounded-2xl p-6 sm:p-8 shadow-[0_6px_24px_rgba(80,50,20,0.035)] flex flex-col justify-between">
            <div>
              <h2 className="text-[18px] font-bold text-[#1C1917] mb-5">Tariff Breakdown</h2>
              <div className="flex flex-col gap-3.5 text-[13.5px] border-b border-[#EAE3D9] pb-5 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-[#78716C]">Parking (2 hrs @ $40)</span>
                  <span className="text-[#1C1917] font-semibold">${pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-[#10B981] font-semibold">
                  <span>Reward Discount</span>
                  <span>-${pricing.rewardDiscount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[16px] font-bold text-[#1C1917] mb-6">
                <span>Total Payable</span>
                <span className="text-[28px] font-extrabold text-[#D84A2B]">
                  ${pricing.finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 pt-4">
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full min-h-[50px] rounded-lg bg-[#D84A2B] text-white text-[14.5px] font-semibold flex items-center justify-center gap-2 hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-md shadow-[#D84A2B]/20 cursor-pointer"
              >
                {isProcessing ? (
                  "Authorizing Pass..."
                ) : (
                  <>
                    Pay & Generate Pass
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-[12px] text-center text-[#78716C] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                Secured 256-bit encrypted checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
