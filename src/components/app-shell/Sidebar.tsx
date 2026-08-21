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
import { ParknexIcon } from "@/components/ui/ParknexLogo";

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
    <aside className="hidden lg:flex flex-col w-[88px] bg-[#FAF7F2] border-r border-[#EAE3D9] h-screen sticky top-0 shrink-0 select-none">
      {/* Logo */}
      <div className="flex items-center justify-center h-[68px] border-b border-[#EAE3D9]">
        <Link href="/" className="flex items-center justify-center group" aria-label="PARKNEX Home">
          <div className="w-10 h-10 rounded-2xl border border-[#FADCD5] flex items-center justify-center bg-[#FFF5F2] group-hover:border-[#E8A594] transition-all duration-200 shadow-xs p-1.5">
            <ParknexIcon className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col items-center gap-2 py-5 flex-1 px-2.5">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`relative group flex flex-col items-center justify-center w-full min-h-[56px] rounded-xl py-2 px-1 transition-all duration-200 ${
                isActive
                  ? "bg-[#D84A2B]/[0.08] text-[#D84A2B]"
                  : "text-[#78716C] hover:text-[#1C1917] hover:bg-black/[0.03]"
              }`}
              aria-label={link.label}
            >
              {/* Active subtle background */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-[#D84A2B]/[0.08] border border-[#D84A2B]/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <link.icon
                className={`relative z-10 w-[20px] h-[20px] transition-colors duration-180 ${
                  isActive
                    ? "text-[#D84A2B]"
                    : "text-[#78716C] group-hover:text-[#1C1917]"
                }`}
                strokeWidth={isActive ? 2 : 1.6}
              />
              <span
                className={`relative z-10 text-[10.5px] font-medium mt-1 leading-tight tracking-tight transition-colors duration-180 text-center ${
                  isActive
                    ? "text-[#D84A2B] font-bold"
                    : "text-[#78716C] group-hover:text-[#1C1917]"
                }`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-1.5 pb-5 px-2.5 border-t border-[#EAE3D9] pt-3">
        <Link
          href="/profile"
          className="group flex flex-col items-center justify-center w-full min-h-[48px] rounded-xl py-2 px-1 text-[#78716C] hover:text-[#1C1917] hover:bg-black/[0.03] transition-all duration-180"
          aria-label="Settings"
        >
          <Settings className="w-[18px] h-[18px]" strokeWidth={1.6} />
          <span className="text-[10px] font-medium mt-1">Settings</span>
        </Link>
        <button
          className="group flex flex-col items-center justify-center w-full min-h-[48px] rounded-xl py-2 px-1 text-[#78716C] hover:text-[#EF4444] hover:bg-[#EF4444]/[0.06] transition-all duration-180 cursor-pointer"
          aria-label="Logout"
        >
          <LogOut className="w-[18px] h-[18px]" strokeWidth={1.6} />
          <span className="text-[10px] font-medium mt-1">Logout</span>
        </button>
      </div>
    </aside>
  );
}
