"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Car, ShieldCheck, QrCode, Navigation, Clock } from "lucide-react";
import ParknexLogo from "@/components/ui/ParknexLogo";

const ease = [0.16, 1, 0.3, 1] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <ParknexLogo size="md" />
          <Link
            href="/auth/login"
            className="text-[13px] font-semibold text-white/60 hover:text-white transition-colors"
          >
            Operator Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#D84A2B]/10 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="relative z-10 max-w-[680px]"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D84A2B]/30 bg-[#D84A2B]/10 text-[#F87171] text-[12px] font-bold uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F87171] animate-pulse" />
            Smart Parking — Real Time
          </div>

          <h1 className="text-[clamp(2.8rem,6vw,5rem)] font-black leading-[0.95] tracking-[-0.04em] text-white mb-6">
            Park in seconds.<br />
            <span className="text-[#D84A2B]">Find your car</span> instantly.
          </h1>

          <p className="text-[17px] text-white/50 leading-relaxed mb-10 max-w-[500px] mx-auto">
            Walk in, get your slot assignment via SMS, navigate to your car on your phone. No app download needed.
          </p>

          {/* Two clear CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/customer/login"
              className="group flex items-center gap-3 h-14 px-8 rounded-2xl bg-[#D84A2B] text-white text-[15px] font-bold hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-lg shadow-[#D84A2B]/20 w-full sm:w-auto justify-center"
            >
              <Car className="w-5 h-5" />
              I&apos;m a Customer
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/auth/login"
              className="flex items-center gap-3 h-14 px-8 rounded-2xl border border-white/10 bg-white/5 text-white text-[15px] font-semibold hover:bg-white/10 active:scale-[0.98] transition-all w-full sm:w-auto justify-center"
            >
              <ShieldCheck className="w-5 h-5 text-white/50" />
              Operator Sign In
            </Link>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
          className="relative z-10 mt-24 max-w-[900px] w-full"
        >
          <p className="text-[12px] font-bold text-white/30 uppercase tracking-widest mb-8">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Car, step: "01", title: "Drive in", desc: "Tell the parking operator your vehicle number at the gate" },
              { icon: Navigation, step: "02", title: "Get your slot", desc: "Receive an SMS with your assigned slot and navigation link" },
              { icon: QrCode, step: "03", title: "Drive out", desc: "Scan your digital exit pass — no ticket needed" },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#D84A2B]/15 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#D84A2B]" />
                </div>
                <div className="text-[11px] font-bold text-white/20 mb-1">Step {step}</div>
                <div className="text-[16px] font-bold text-white mb-1">{title}</div>
                <div className="text-[13.5px] text-white/40 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
