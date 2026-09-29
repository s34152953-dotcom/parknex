"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Car, ShieldCheck, Navigation, QrCode, Atom, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import ParknexLogo from "@/components/ui/ParknexLogo";
import QuantumOptimizerDashboard from "@/components/quantum/QuantumOptimizerDashboard";

// Dynamic import of ParkingHero to prevent SSR canvas issues and ensure fast load
const ParkingHero = dynamic(() => import("@/components/landing/ParkingHero"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] bg-[#FAF7F2] text-[#241F1B] selection:bg-[#F9E3DE] selection:text-[#C93B2F] box-border w-full flex flex-col">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#DED3C7] w-full">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] sm:h-[72px] flex items-center justify-between">
          <Link href="/" className="group flex items-center transition-transform hover:opacity-90 shrink-0">
            <ParknexLogo size="md" variant="light" quantumBadge={true} />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/quantum"
              className="hidden sm:flex items-center gap-2 px-3.5 h-[40px] rounded-xl text-[13px] font-bold text-[#C93B2F] bg-[#F9E3DE] hover:bg-[#F3EAE0] border border-[#C93B2F]/20 transition-all shadow-xs"
            >
              <Atom className="w-4 h-4 animate-spin" style={{ animationDuration: "8s" }} />
              <span>Quantum Lab</span>
            </Link>

            <Link
              href="/customer/login"
              className="flex items-center gap-2 px-3.5 h-[40px] rounded-xl text-[13px] font-bold text-[#241F1B] hover:text-[#C93B2F] border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] transition-all shadow-xs"
            >
              <Car className="w-4 h-4 text-[#C93B2F]" />
              <span className="hidden sm:inline">Attendee Pass</span>
              <span className="sm:hidden">Pass</span>
            </Link>

            <Link
              href="/auth/login"
              aria-label="Operator Sign In"
              className="flex items-center gap-2 px-3.5 h-[40px] rounded-xl text-[13px] font-bold text-[#241F1B] hover:text-[#C93B2F] border border-[#DED3C7] bg-[#FFFFFF] hover:bg-[#F3EAE0] transition-all shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#70675F]" />
              <span className="hidden sm:inline">Operator</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── 3D WEBGL HERO SECTION ── */}
      <ParkingHero />

      {/* ── QUANTUM EXPO TELEMETRY STRIP ── */}
      <section className="w-full px-4 sm:px-6 lg:px-8 bg-[#F3EAE0] py-5 border-y border-[#DED3C7]">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#70675F] font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C93B2F] animate-pulse" />
            <span>QUBO Quantum Annealing Space Allocation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2F7D5A]" />
            <span>Zero-Gridlock Corridor Routing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B7791F]" />
            <span>22kW EV Transformer Load Balancing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3569A8]" />
            <span>PaddleOCR Edge CCTV ANPR</span>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE QUANTUM BENCHMARK SUITE (FOR JUDGES & VISITORS) ── */}
      <section className="w-full bg-[#FAF7F2] py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#DED3C7]">
        <div className="w-full max-w-[1440px] mx-auto">
          <div className="mb-10 text-center sm:text-left max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9E3DE] border border-[#C93B2F]/20 text-[#C93B2F] text-[12px] font-mono font-bold uppercase tracking-wider mb-3">
              <Atom className="w-3.5 h-3.5 animate-spin text-[#C93B2F]" style={{ animationDuration: "6s" }} />
              <span>Interactive Algorithm Benchmark</span>
            </div>
            <h2 className="text-[28px] sm:text-[38px] font-black text-[#241F1B] leading-tight">
              Classical Greedy vs. Quantum Annealer
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#70675F] mt-3 leading-relaxed">
              Explore how our Quadratic Unconstrained Binary Optimization (QUBO) model prevents parking gridlock during mega-expo traffic surges, outperforming standard greedy heuristics.
            </p>
          </div>

          {/* Embedded Interactive Dashboard */}
          <QuantumOptimizerDashboard />
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section className="w-full bg-[#FAF7F2] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1440px] mx-auto">
          {/* Section Header */}
          <div className="mb-10 sm:mb-14">
            <div className="text-[13px] font-bold uppercase text-[#C93B2F] tracking-wider mb-2 font-mono">
              System Architecture
            </div>
            <h2 className="text-[28px] sm:text-[36px] lg:text-[40px] font-black text-[#241F1B] leading-tight max-w-[620px]">
              Quantum-optimized flow from entry to exit.
            </h2>
          </div>

          {/* 3 Step Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 01 */}
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_24px_rgba(70,48,35,0.06)] hover:border-[#CBBCAE] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[36px] font-black font-mono text-[#C93B2F]">01</span>
                  <div className="w-10 h-10 rounded-xl bg-[#F9E3DE] flex items-center justify-center text-[#C93B2F]">
                    <Car className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-[20px] font-bold text-[#241F1B] mb-2">ANPR Edge Ingestion</h3>
                <p className="text-[14.5px] text-[#70675F] leading-relaxed">
                  PaddleOCR computer vision edge nodes capture vehicle plates, fuel types, and EV charging status in under 120ms at Expo Gate checkpoints.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_24px_rgba(70,48,35,0.06)] hover:border-[#CBBCAE] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[36px] font-black font-mono text-[#C93B2F]">02</span>
                  <div className="w-10 h-10 rounded-xl bg-[#F9E3DE] flex items-center justify-center text-[#C93B2F]">
                    <Atom className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-[20px] font-bold text-[#241F1B] mb-2">QUBO Annealing Dispatch</h3>
                <p className="text-[14.5px] text-[#70675F] leading-relaxed">
                  The Simulated Quantum Annealing engine solves the Ising Hamiltonian, routing vehicles to orthogonal bays and avoiding aisle congestion.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_24px_rgba(70,48,35,0.06)] hover:border-[#CBBCAE] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[36px] font-black font-mono text-[#C93B2F]">03</span>
                  <div className="w-10 h-10 rounded-xl bg-[#F9E3DE] flex items-center justify-center text-[#C93B2F]">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-[20px] font-bold text-[#241F1B] mb-2">Digital Pass & Fast Exit</h3>
                <p className="text-[14.5px] text-[#70675F] leading-relaxed">
                  Attendees receive live turn-by-turn guidance and dynamic QR exit passes with cryptographically signed tokens for zero-wait clearance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-[#F3EAE0] border-t border-[#DED3C7] py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <ParknexLogo size="sm" variant="light" quantumBadge={true} />
          <div className="text-[13px] text-[#70675F] text-center sm:text-right font-medium">
            <span>PARKNEX Q · Official Quantum Mobility & Venue Dispatch OS · Quantum Expo 2026</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
