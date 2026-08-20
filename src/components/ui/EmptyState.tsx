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
    <div className={`w-full flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-[#333333] bg-[#0a0a0a] ${className}`}>
      <div className="w-16 h-16 rounded-xl bg-[#141414] border border-[#333333] flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-[#00E5FF]" strokeWidth={1.5} />
      </div>
      <h3 className="text-[16px] font-bold text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-[13px] text-[#A0A0A0] max-w-[280px] mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
