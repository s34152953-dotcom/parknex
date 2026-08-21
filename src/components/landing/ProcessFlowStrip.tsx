"use client";

import {
  Car,
  Camera,
  MapPin,
  ClipboardList,
  Gift,
  ShoppingBag,
  CreditCard,
  QrCode,
  LogOut,
  ArrowRight,
} from "lucide-react";

const steps = [
  { label: "Enter Mall", icon: Car },
  { label: "Camera Detects Vehicle", icon: Camera },
  { label: "Select Floor & Slot", icon: MapPin },
  { label: "Register Parking", icon: ClipboardList },
  { label: "Get Rewards & Offers", icon: Gift },
  { label: "Shop & Dine", icon: ShoppingBag },
  { label: "Checkout", icon: CreditCard },
  { label: "Exit Pass", icon: QrCode },
  { label: "Exit Mall", icon: LogOut },
];

export default function ProcessFlowStrip() {
  return (
    <section className="relative z-20 w-full bg-[#FAF7F2] border-t border-[#E7DFD5] py-5 px-6 sm:px-10 lg:px-12 overflow-x-auto scrollbar-none">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between min-w-[960px] gap-3">
        {steps.map((step, idx) => (
          <div key={step.label} className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E7DFD5] flex items-center justify-center text-[#D84A2B] shadow-xs">
                <step.icon className="w-4.5 h-4.5 text-[#D84A2B]" strokeWidth={1.75} />
              </div>
              <span className="text-[13px] font-semibold text-[#1C1917] whitespace-nowrap">
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E] mx-2 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
