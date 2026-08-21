"use client";

import Link from "next/link";
import { motion } from "motion/react";
import ParknexLogo from "@/components/ui/ParknexLogo";
import { CalendarPlus, UserCheck } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E7DFD5]/80 shadow-[0_4px_20px_rgba(80,50,20,0.025)]"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-12">
        <div className="flex items-center justify-between h-[72px]">
          {/* Official PARKNEX Brand Logo on the left */}
          <Link href="/" className="flex items-center group">
            <ParknexLogo size="md" />
          </Link>

          {/* Right Action Navigation */}
          <div className="flex items-center gap-3">
            <Link
              href="/customer/cust_token_demo_a01"
              className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[#E2D9CC] bg-white text-[13px] font-semibold text-[#1C1917] hover:border-[#D84A2B]/40 hover:bg-[#FFFDFC] transition-all"
            >
              <UserCheck className="w-4 h-4 text-[#78716C]" />
              <span>Customer View</span>
            </Link>

            <Link
              href="/admin/booking"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#D84A2B] text-white text-[13px] font-semibold hover:bg-[#C23E21] active:scale-[0.98] transition-all shadow-xs"
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
