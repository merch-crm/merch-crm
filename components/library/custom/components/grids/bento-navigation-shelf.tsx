"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid, ChevronRight, Home, Layout, FileText, Database, Layers } from "lucide-react";
import { cn } from "@/components/library/custom/utils/cn";

const DEFAULT_ITEMS = [
  { icon: <Home className="size-4" />, label: "Главная", count: null },
  { icon: <Layout className="size-4" />, label: "Доски", count: 12 },
  { icon: <FileText className="size-4" />, label: "Отчёты", count: 5 },
  { icon: <Database className="size-4" />, label: "Данные", count: null },
  { icon: <Layers className="size-4" />, label: "Модули", count: 24 },
];

/**
 * BentoNavigationShelf - A navigation shelf for the dashboard.
 * Normalized to project UX standards: 11px font for labels, no uppercase.
 * Accessibility: Semantic buttons with type="button".
 */
export function BentoNavigationShelf({ items: propItems }: { items?: { icon: React.ReactNode; label: string; count: number | null }[] }) {
  const [activeTab, setActiveTab] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const items = propItems || DEFAULT_ITEMS;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full max-w-[280px] h-[320px] bg-white rounded-[2rem] border border-gray-100 shadow-sm animate-pulse" />;
  }

  return (
    <div className="w-full max-w-[280px] bg-white rounded-[2rem] border border-gray-100 shadow-crm-md p-4 flex flex-col gap-2 group relative overflow-hidden h-[320px]">
      <div className="flex items-center gap-2 px-3 py-2 mb-2">
         <Grid className="size-4 text-primary-base" />
         <h4 className="text-xs font-black text-gray-900  leading-none">Навигация</h4>
      </div>

      <div className="space-y-1 relative z-10 flex-1 overflow-y-auto pr-1 scrollbar-hide">
         {(items || []).map((item, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => setActiveTab(i)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 border group/nav",
                activeTab === i ? "bg-gray-50 border-gray-100 shadow-sm" : "bg-transparent border-transparent hover:bg-gray-50/50"
              )}
            >
               <div className="flex items-center gap-3">
                  <div className={cn(
                    "size-9 rounded-xl flex items-center justify-center transition-all shadow-sm",
                    activeTab === i ? "bg-primary-base text-white shadow-primary-base/20" : "bg-white text-gray-400 group-hover/nav:text-gray-900 border border-gray-50"
                  )}>
                     {item.icon}
                  </div>
                  <span className={cn("text-[11px] font-black transition-colors", activeTab === i ? "text-gray-900" : "text-gray-500 group-hover/nav:text-gray-900")}>
                     {item.label}
                  </span>
               </div>
               <div className="flex items-center gap-2">
                  {item.count !== null && (
                     <span className={cn(
                       "text-[11px] font-black px-2 py-0.5 rounded-full",
                       activeTab === i ? "bg-primary-base/10 text-primary-base" : "bg-gray-100 text-gray-400"
                     )}>
                        {item.count}
                     </span>
                  )}
                  <ChevronRight className={cn("size-3.5 transition-all", activeTab === i ? "opacity-100 translate-x-0 text-primary-base" : "opacity-0 -translate-x-2")} />
               </div>
            </motion.button>
         ))}
      </div>

      <div className="absolute -left-20 -bottom-20 size-64 bg-indigo-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </div>
  );
}
