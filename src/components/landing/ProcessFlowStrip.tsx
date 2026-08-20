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
    <section className="relative z-20 w-full bg-[#07090D] border-t border-white/[0.05] py-5 px-8 sm:px-12 lg:px-16 overflow-x-auto scrollbar-none">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between min-w-[940px] gap-2">
        {steps.map((step, idx) => (
          <div key={step.label} className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#0E131F] border border-white/[0.08] flex items-center justify-center text-white/70">
                <step.icon className="w-4 h-4 text-sky-400" strokeWidth={1.5} />
              </div>
              <span className="text-[12px] font-medium text-white/80 whitespace-nowrap">
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight className="w-3.5 h-3.5 text-white/30 mx-2 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
