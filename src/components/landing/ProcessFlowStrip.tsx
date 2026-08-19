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
    <section className="relative z-20 w-full bg-[#07090D] border-t border-white/[0.05] py-5 px-6 overflow-x-auto scrollbar-none">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between min-w-[980px] gap-2">
        {steps.map((step, idx) => (
          <div key={step.label} className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sp-elevated/80 border border-white/[0.06] flex items-center justify-center text-sp-nav">
                <step.icon className="w-4 h-4 text-sp-secondary" strokeWidth={1.5} />
              </div>
              <span className="text-[12.5px] font-medium text-sp-nav whitespace-nowrap">
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight className="w-3.5 h-3.5 text-sp-muted/60 mx-1 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
