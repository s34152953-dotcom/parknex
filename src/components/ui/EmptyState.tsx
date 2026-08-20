import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`w-full flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-[rgba(80,60,40,0.10)] bg-white/80 backdrop-blur-md shadow-[0_6px_24px_rgba(80,50,20,0.035)] ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center mb-5 text-[#D84A2B] shadow-sm">
        <Icon className="w-8 h-8" strokeWidth={1.5} />
      </div>
      <h3 className="text-[17px] font-bold text-[#1C1917] mb-2 tracking-tight">{title}</h3>
      <p className="text-[13.5px] text-[#78716C] max-w-[360px] mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
