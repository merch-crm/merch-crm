"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Users, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ClientTypeFilter = "all" | "b2c" | "b2b";

interface ClientsSegmentTabsProps {
  value: ClientTypeFilter;
  onChange: (value: ClientTypeFilter) => void;
  counts?: {
    all: number;
    b2c: number;
    b2b: number;
  };
}

const tabs: { id: ClientTypeFilter; label: string; icon: typeof Users }[] = [
  { id: "all", label: "Все", icon: Users },
  { id: "b2c", label: "Частные лица", icon: User },
  { id: "b2b", label: "Организации", icon: Building2 },
];

export const ClientsSegmentTabs = memo(function ClientsSegmentTabs({
  value,
  onChange,
  counts,
}: ClientsSegmentTabsProps) {
  return (
    <div className="crm-filter-tray inline-flex p-1.5 bg-slate-100/50 rounded-[20px] border border-slate-200/30 shadow-inner">
      {tabs.map((tab) => {
        const isActive = value === tab.id;
        const Icon = tab.icon;
        const count = counts?.[tab.id];

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-[13px] font-bold transition-colors",
              isActive
                ? "text-white"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="clientSegmentTab"
                className="absolute inset-0 bg-primary rounded-[14px] shadow-lg shadow-primary/25"
                transition={{
                  type: "spring",
                  bounce: 0.2,
                  duration: 0.6,
                }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={cn(
                    "min-w-[20px] h-5 px-1.5 rounded-full text-xs font-black flex items-center justify-center",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-600"
                  )}
                >
                  {count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
});
