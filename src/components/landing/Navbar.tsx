"use client";

import Link from "next/link";
import { motion } from "motion/react";
import ParknexLogo from "@/components/ui/ParknexLogo";
import { CalendarPlus, UserCheck } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-[#E7DFD5]/80 shadow-[0_4px_20px_rgba(80,50,20,0.025)]"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-[72px]">
          {/* Official PARKNEX Brand Logo on the left */}
          <Link href="/" className="flex items-center group" aria-label="PARKNEX Homepage">
            <ParknexLogo size="md" />
          </Link>

          {/* Right Action Navigation */}
          <div className="flex items-center gap-3">
            <Link
              href="/customer/cust_token_demo_a01"
              aria-label="Open Customer Demo View"
              className="hidden sm:inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-[#E2D9CC] bg-white text-[13px] font-semibold text-[#1C1917] hover:border-[#D84A2B]/40 hover:bg-[#FFFDFC] active:scale-[0.98] transition-all min-w-[44px]"
            >
              <UserCheck className="w-4 h-4 text-[#78716C]" />
              <span>Customer View</span>
            </Link>

            <Link
              href="/admin/booking"
              aria-label="Open Admin Operations"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#D84A2B] text-white text-[13.5px] font-bold hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-xs min-w-[44px]"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Admin Operations</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
