"use client";

import { useState } from "react";
import { Bell, ChevronDown, Menu, X, Home, Compass, Gift, Clock, Car, UserCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import ParknexLogo from "@/components/ui/ParknexLogo";

const ease = [0.16, 1, 0.3, 1] as const;

const mobileNavLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Parking", href: "/parking", icon: Car },
  { label: "My Vehicle", href: "/my-car", icon: Car },
  { label: "Find My Car", href: "/find-my-car", icon: Compass },
  { label: "Rewards", href: "/rewards", icon: Gift },
  { label: "History", href: "/history", icon: Clock },
  { label: "Profile", href: "/profile", icon: UserCircle },
];

export default function TopBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Derive page title from pathname
  const getTitle = () => {
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    if (segments.length === 0) return "Dashboard";
    const last = segments[segments.length - 1];
    return last
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-[68px] bg-white/80 backdrop-blur-md border-b border-[#EAE3D9] flex items-center justify-between px-6 lg:px-8 gap-4 select-none">
        {/* Left Mobile Hamburger + Logo */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-[#E2D9CC] bg-white text-[#1C1917] hover:border-[#D84A2B]/40 transition-colors shadow-xs"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-[#1C1917]" />
          </button>

          <Link href="/" className="flex items-center">
            <ParknexLogo size="sm" />
          </Link>
        </div>

        {/* Page Title (Desktop) */}
        <h1 className="hidden lg:block text-[18px] font-bold text-[#1C1917] tracking-tight">
          {getTitle()}
        </h1>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Mall selector */}
          <button className="hidden sm:flex items-center gap-2.5 h-10 px-4 rounded-xl border border-[#E2D9CC] bg-white text-[13px] font-medium text-[#78716C] hover:border-[#D84A2B]/40 hover:text-[#1C1917] transition-all duration-180 shadow-xs shrink-0 cursor-pointer">
            <span className="text-[#1C1917] font-semibold">Central Mall Grand</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#A8A29E]" />
          </button>

          {/* Notifications */}
          <button
            className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-[#E2D9CC] bg-white text-[#78716C] hover:text-[#D84A2B] hover:border-[#D84A2B]/40 transition-all duration-180 shadow-xs shrink-0 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" strokeWidth={1.75} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#D84A2B]" />
          </button>

          {/* Profile Avatar */}
          <Link
            href="/profile"
            className="w-10 h-10 rounded-xl bg-white border border-[#E2D9CC] hover:border-[#D84A2B]/40 hover:text-[#D84A2B] flex items-center justify-center text-[#78716C] transition-all shadow-xs shrink-0"
            aria-label="Profile"
          >
            <UserCircle className="w-5 h-5" strokeWidth={1.75} />
          </Link>
        </div>
      </header>

      {/* ── Mobile Menu for Dashboard ──────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="fixed inset-0 z-[100] bg-[#FBF8F3]/98 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col h-full px-6 py-5">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#EAE3D9]">
                <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center">
                  <ParknexLogo size="sm" />
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[#1C1917] bg-white border border-[#E2D9CC]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1.5 flex-1">
                {mobileNavLinks.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.05 * i, ease }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14.5px] font-semibold transition-colors duration-180
                          ${isActive
                            ? "bg-[#D84A2B]/10 text-[#D84A2B] border border-[#D84A2B]/20"
                            : "text-[#57534E] hover:text-[#1C1917] hover:bg-white"
                          }`}
                      >
                        <link.icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
