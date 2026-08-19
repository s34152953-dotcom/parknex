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
    baseRate: 40.0, // $40 / hr
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
    <div className="min-h-[calc(100vh-64px)] w-full p-6 sm:p-10 bg-[#05070A] max-w-[900px] mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-white/[0.06] mb-8">
        <h1 className="text-[26px] font-extrabold text-white tracking-tight">
          Parking Checkout
        </h1>
        <p className="text-[13px] text-sp-secondary mt-1">
          Review your parking duration, eligible rewards, and complete payment
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Parking Summary */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Parking Session Info */}
          <div className="bg-sp-surface/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
            <h2 className="text-[16px] font-bold text-white mb-4">
              Session Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-sp-elevated/60 border border-white/[0.06] text-[13px]">
              <div>
                <p className="text-sp-muted text-[11px] uppercase">Vehicle</p>
                <p className="text-white font-bold mt-0.5">Hyundai Creta</p>
                <p className="text-[11px] text-sp-secondary">KA-01-MJ-2024</p>
              </div>
              <div>
                <p className="text-sp-muted text-[11px] uppercase">Location</p>
                <p className="text-white font-bold mt-0.5">Floor B2 · Zone A</p>
                <p className="text-[11px] text-sp-cyan">Slot A-18 (Pillar 18)</p>
              </div>
              <div>
                <p className="text-sp-muted text-[11px] uppercase">Duration</p>
                <p className="text-white font-bold mt-0.5">1 hr 45 min</p>
                <p className="text-[11px] text-sp-secondary">Billed: 2 hrs</p>
              </div>
            </div>
          </div>

          {/* Applicable Rewards */}
          <div className="bg-sp-surface/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-sp-blue" />
                Available Rewards & Discounts
              </h2>
              <span className="text-[11px] text-sp-green font-semibold">1 Applied</span>
            </div>

            <div className="flex flex-col gap-3">
              <div
                onClick={() => setSelectedReward("reward-1")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedReward === "reward-1"
                    ? "bg-sp-blue/10 border-sp-blue/40"
                    : "bg-sp-elevated/40 border-white/[0.06] hover:border-white/15"
                }`}
              >
                <div>
                  <p className="text-[14px] font-bold text-white">Mall Dining Voucher</p>
                  <p className="text-[12px] text-sp-secondary mt-0.5">
                    $20 OFF parking on food court orders above $50
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedReward === "reward-1"
                      ? "bg-sp-blue border-sp-blue text-white"
                      : "border-white/20"
                  }`}
                >
                  {selectedReward === "reward-1" && <Check className="w-3 h-3" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Payment Breakdown Card */}
        <div className="bg-sp-surface/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col justify-between h-full">
          <div>
            <h2 className="text-[16px] font-bold text-white mb-4">Tariff Breakdown</h2>
            <div className="flex flex-col gap-3 text-[13px] border-b border-white/[0.06] pb-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sp-secondary">Parking (2 hrs @ $40)</span>
                <span className="text-white font-medium">${pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sp-green">
                <span>Reward Discount</span>
                <span>-${pricing.rewardDiscount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[16px] font-bold text-white mb-6">
              <span>Total Payable</span>
              <span className="text-[22px] text-sp-blue">
                ${pricing.finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full h-[50px] rounded-2xl bg-sp-blue text-white text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-sp-blue-hover active:scale-[0.98] transition-all shadow-lg shadow-sp-blue/30"
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
            <p className="text-[11px] text-center text-sp-muted flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sp-green" />
              Secured 256-bit encrypted checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
