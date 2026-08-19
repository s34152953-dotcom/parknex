"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Home, Compass, Gift, Clock, Car, UserCircle, LogOut, Moon } from "lucide-react";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Parking", href: "/parking" },
  { label: "Rewards", href: "/rewards" },
  { label: "About", href: "#about" },
];

const mobileMenuLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "How It Works", href: "#how-it-works", icon: Compass },
  { label: "Parking", href: "/parking", icon: Car },
  { label: "Rewards", href: "/rewards", icon: Gift },
  { label: "History", href: "/history", icon: Clock },
  { label: "My Vehicle", href: "/my-car", icon: Car },
  { label: "Find My Car", href: "/find-my-car", icon: Compass },
  { label: "Profile", href: "/profile", icon: UserCircle },
  { label: "Logout", href: "#", icon: LogOut },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop / Tablet Navigation ─────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#05070A]/70 backdrop-blur-xl border-b border-white/[0.04]"
      >
        <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="flex items-center justify-between h-[72px] sm:h-[76px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-8 h-8 rounded-xl border border-white/10 flex items-center justify-center bg-white/[0.04] group-hover:border-white/20 group-hover:bg-white/[0.08] transition-all duration-200 shadow-inner shadow-white/5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                  <polygon
                    points="12 2 21 7.5 21 16.5 12 22 3 16.5 3 7.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
              <span className="text-[16px] font-bold tracking-[-0.02em] text-white font-[family-name:var(--font-manrope)]">
                SmartPark
              </span>
            </Link>

            {/* Center Nav Links */}
            <div className="hidden md:flex items-center gap-8 lg:gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[13.5px] font-medium text-white/70 hover:text-white transition-colors duration-200 tracking-[-0.01em]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Action / Get Started Pill */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <Link
                href="/auth/login"
                className="text-[13px] font-medium text-white/70 hover:text-white px-3 py-2 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/parking"
                className="inline-flex items-center justify-center h-[38px] px-5 rounded-full bg-white text-[#05070A] text-[13px] font-bold tracking-[-0.01em] hover:bg-white/90 active:scale-[0.98] transition-all duration-200 shadow-md shadow-white/10"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 text-white active:scale-95 transition-transform"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Menu (Overlay Drawer) ─────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.35, ease }}
            className="fixed inset-0 z-[100] bg-sp-black/98 backdrop-blur-2xl flex flex-col justify-between p-6"
          >
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center bg-sp-elevated/70">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-sp-white">
                      <polygon
                        points="12 2 21 7.5 21 16.5 12 22 3 16.5 3 7.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <span className="text-[16px] font-bold text-sp-white">SmartPark</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-sp-white"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex flex-col gap-1.5 pt-6">
                {mobileMenuLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.04 * i, ease }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14.5px] font-medium transition-colors duration-200
                        ${link.label === "Home"
                          ? "bg-sp-blue/15 text-sp-blue border border-sp-blue/20"
                          : "text-sp-nav hover:text-sp-white hover:bg-sp-elevated/50"
                        }`}
                    >
                      <link.icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Bottom Dark Mode Switch */}
            <div className="pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 text-sp-nav text-[14px]">
                  <Moon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  Dark Mode
                </div>
                <div className="w-11 h-6 rounded-full bg-sp-blue flex items-center px-0.5 cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-white ml-auto" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
