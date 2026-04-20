"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface NavTabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  activeColor?: string;
  shadowColor?: string;
}

interface NavTabsProps {
  tabs: NavTabItem[];
  activeTab: string;
  onChange?: (id: string) => void;
  className?: string;
  containerClassName?: string;
}

export function NavTabs({
  tabs,
  activeTab,
  onChange,
  className,
  containerClassName
}: NavTabsProps) {
  return (
    <div 
      className={cn(
        "flex w-full items-center gap-1 p-1 rounded-[20px] sm:rounded-[24px] bg-white border border-slate-100 shadow-sm overflow-x-auto scrollbar-hide",
        containerClassName
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        const content = (
          <>
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className={cn(
                  "absolute inset-0 rounded-[14px] sm:rounded-[18px] shadow-lg",
                  tab.activeColor || "bg-slate-900",
                  tab.shadowColor || "shadow-black/10"
                )}
                transition={{
                  type: "tween",
                  ease: "circOut",
                  duration: 0.25,
                }}
              />
            )}
            
            <div className="relative z-10 flex items-center justify-center gap-2.5">
              <Icon 
                className={cn(
                  "w-4.5 h-4.5 sm:w-5 sm:h-5 shrink-0 transition-all duration-300",
                  isActive ? "scale-110" : "group-hover:scale-110 text-slate-500 group-hover:text-slate-900"
                )} 
              />
              <span className={cn(
                "hidden sm:inline-block text-[13px] sm:text-sm font-bold transition-colors duration-300",
                isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900"
              )}>
                {tab.label}
              </span>
            </div>
          </>
        );

        const commonProps = {
          className: cn(
            "relative flex flex-1 min-w-[44px] sm:min-w-fit items-center justify-center px-2 sm:px-6 py-2.5 sm:py-3.5 rounded-[14px] sm:rounded-[18px] transition-all duration-300 outline-none group whitespace-nowrap",
            isActive ? "text-white" : "text-slate-500",
            className
          ),
          onClick: () => onChange?.(tab.id)
        };

        if (tab.href) {
          return (
            <Link key={tab.id} {...commonProps} href={tab.href}>
              {content}
            </Link>
          );
        }

        return (
          <button key={tab.id} type="button" {...commonProps}>
            {content}
          </button>
        );
      })}
    </div>
  );
}
