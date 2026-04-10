"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface BentoTabsProps {
  tabs: Tab[];
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function BentoTabs({ 
  tabs, 
  defaultValue, 
  onChange, 
  className 
}: BentoTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.id);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  if (!isMounted) {
    return (
      <div className="flex gap-2 h-14 w-full bg-slate-50/50 rounded-full animate-pulse border border-slate-100" />
    );
  }

  return (
    <div 
      role="tablist"
      aria-label="Navigation Tabs"
      className={cn("inline-flex p-2 bg-slate-50/50 rounded-card border border-slate-100 shadow-premium backdrop-blur-sm", className)}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "relative px-8 py-3 rounded-full transition-all duration-700 flex items-center gap-3 overflow-hidden group/tab outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10",
              isActive 
                ? "text-white" 
                : "text-slate-400 hover:text-slate-900"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-0 bg-slate-950 rounded-full shadow-2xl shadow-black/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <span className={cn(
              "relative z-10 text-[11px] font-black tracking-[0.3em] transition-all duration-500",
              isActive ? "translate-x-0" : "group-hover/tab:translate-x-1"
            )}>
              {tab.label}
            </span>
            
            {tab.count !== undefined && (
              <span className={cn(
                "relative z-10 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest transition-all duration-500 border",
                isActive 
                  ? "bg-white/10 text-white border-white/10" 
                  : "bg-slate-100 text-slate-400 group-hover/tab:bg-primary-base/5 group-hover/tab:text-primary-base group-hover/tab:border-primary-base/10"
              )}>
                {tab.count.toString().padStart(2, '0')}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
