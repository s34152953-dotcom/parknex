"use client";

import Link from "next/link";
import { motion } from "motion/react";
import ParknexLogo from "@/components/ui/ParknexLogo";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/75 backdrop-blur-md border-b border-[#E7DFD5]/80 shadow-[0_4px_20px_rgba(80,50,20,0.025)]"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-12">
        <div className="flex items-center h-[72px]">
          {/* Official PARKNEX Brand Logo on the left */}
          <Link href="/" className="flex items-center group">
            <ParknexLogo size="md" />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
