"use client";

import { useState } from "react";
import { Bell, ChevronDown, Menu, X, CircleParking, Home, Compass, Gift, Clock, Car, UserCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

const mobileNavLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Parking", href: "/parking", icon: CircleParking },
  { label: "My Vehicle", href: "/my-car", icon: Car },
  { label: "Find My Car", href: "/find-my-car", icon: Compass },
  { label: "Rewards", href: "/rewards", icon: Gift },
  { label: "History", href: "/history", icon: Clock },
  { label: "Profile", href: "/profile", icon: UserCircle },
  { label: "Logout", href: "#", icon: LogOut },
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
      <header className="sticky top-0 z-40 h-16 bg-sp-black border-b border-[#333333] flex items-center px-6 lg:px-8 gap-4 select-none">
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-sp-border bg-sp-elevated/40 text-sp-white hover:border-sp-border-hover transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-sp-white" />
        </button>

        {/* Logo for mobile */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mr-auto">
          <div className="w-8 h-8 rounded-full border border-sp-border flex items-center justify-center bg-sp-elevated/50">
            <CircleParking className="w-4 h-4 text-sp-white" strokeWidth={1.5} />
          </div>
        </Link>

        {/* Page title (desktop) */}
        <h1 className="hidden lg:block text-[17px] font-bold text-sp-white tracking-[-0.015em]">
          {getTitle()}
        </h1>

        {/* Right controls — single aligned group */}
        <div className="flex items-center gap-3">
          {/* Mall selector */}
          <button className="hidden sm:flex items-center gap-2 h-9 px-3.5 rounded-xl border border-sp-border bg-sp-elevated/40 text-[12.5px] font-medium text-sp-nav hover:text-sp-white hover:border-sp-border-hover transition-colors duration-200 shadow-sm shrink-0">
            <span className="text-sp-white font-semibold">Central Mall Grand</span>
            <ChevronDown className="w-3.5 h-3.5 text-sp-muted" />
          </button>

          {/* Notifications */}
          <button
            className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-sp-border bg-sp-elevated/40 text-sp-nav hover:text-sp-white hover:border-sp-border-hover transition-colors duration-200 shadow-sm shrink-0"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" strokeWidth={1.5} />
          </button>

          {/* Profile avatar */}
          <Link
            href="/profile"
            className="w-9 h-9 rounded-xl bg-sp-elevated border border-sp-border hover:border-sp-border-hover flex items-center justify-center transition-colors shadow-sm shrink-0"
            aria-label="Profile"
          >
            <UserCircle className="w-5 h-5 text-sp-muted hover:text-sp-white" strokeWidth={1.5} />
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
            className="fixed inset-0 z-[100] bg-sp-black/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col h-full px-6 py-5">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full border border-sp-border flex items-center justify-center bg-sp-elevated/50">
                    <CircleParking className="w-4 h-4 text-sp-white" strokeWidth={1.5} />
                  </div>
                  <span className="text-[15px] font-semibold text-sp-white">SmartPark</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-sp-white" />
                </button>
              </div>

              <nav className="flex flex-col gap-1 flex-1">
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
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-medium transition-colors duration-200
                          ${isActive
                            ? "bg-sp-blue/10 text-sp-blue"
                            : "text-sp-nav hover:text-sp-white hover:bg-sp-elevated/50"
                          }`}
                      >
                        <link.icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
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
