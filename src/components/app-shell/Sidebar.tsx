"use client";

import Link from "next/link";
import {
  CircleParking,
  Car,
  Compass,
  Gift,
  Clock,
  UserCircle,
  LogOut,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

const sidebarLinks = [
  { label: "Parking", href: "/parking", icon: CircleParking },
  { label: "My Vehicle", href: "/my-car", icon: Car },
  { label: "Find My Car", href: "/find-my-car", icon: Compass },
  { label: "Rewards", href: "/rewards", icon: Gift },
  { label: "History", href: "/history", icon: Clock },
  { label: "Profile", href: "/profile", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[72px] bg-sp-surface border-r border-sp-border h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-center h-[72px] border-b border-sp-border">
        <Link href="/" className="flex items-center justify-center">
          <div className="w-9 h-9 rounded-full border border-sp-border flex items-center justify-center bg-sp-elevated/50 hover:bg-sp-elevated transition-colors duration-200">
            <CircleParking className="w-[18px] h-[18px] text-sp-white" strokeWidth={1.5} />
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col items-center gap-1 py-4 flex-1 px-2">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
          return (
            <Link
              key={link.label}
              href={link.href}
              className="relative group flex flex-col items-center justify-center w-full rounded-xl py-2.5 transition-colors duration-200"
              aria-label={link.label}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-sp-blue/10 border border-sp-blue/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <link.icon
                className={`relative z-10 w-[20px] h-[20px] transition-colors duration-200 ${
                  isActive
                    ? "text-sp-blue"
                    : "text-sp-muted group-hover:text-sp-nav"
                }`}
                strokeWidth={1.5}
              />
              <span
                className={`relative z-10 text-[9px] font-medium mt-1 transition-colors duration-200 ${
                  isActive
                    ? "text-sp-blue"
                    : "text-sp-muted group-hover:text-sp-nav"
                }`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-1 pb-4 px-2 border-t border-sp-border pt-3">
        <Link
          href="/settings"
          className="group flex flex-col items-center justify-center w-full rounded-xl py-2.5 transition-colors duration-200"
          aria-label="Settings"
        >
          <Settings className="w-[20px] h-[20px] text-sp-muted group-hover:text-sp-nav transition-colors duration-200" strokeWidth={1.5} />
          <span className="text-[9px] font-medium mt-1 text-sp-muted group-hover:text-sp-nav transition-colors duration-200">Settings</span>
        </Link>
        <button
          className="group flex flex-col items-center justify-center w-full rounded-xl py-2.5 transition-colors duration-200"
          aria-label="Logout"
        >
          <LogOut className="w-[20px] h-[20px] text-sp-muted group-hover:text-sp-red transition-colors duration-200" strokeWidth={1.5} />
          <span className="text-[9px] font-medium mt-1 text-sp-muted group-hover:text-sp-red transition-colors duration-200">Logout</span>
        </button>
      </div>
    </aside>
  );
}
