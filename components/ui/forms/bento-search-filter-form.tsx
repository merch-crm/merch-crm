"use client";

import React, { useState } from "react";
import { Search, Filter, SlidersHorizontal, Calendar, Tag, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function BentoSearchFilterForm({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = [
    { id: "all", label: "All Items" },
    { id: "production", label: "Production" },
    { id: "warehouse", label: "Warehouse" },
    { id: "shipping", label: "Shipping" }
  ];

  return (
    <div className={cn(
      "bg-white dark:bg-zinc-950 text-slate-950 dark:text-zinc-50 shadow-premium border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 rounded-card flex flex-col w-full max-w-4xl mx-auto relative overflow-hidden",
      className
    )}>
      <div className="relative z-10 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300 dark:text-zinc-700 group-focus-within:text-primary-base transition-colors" />
          <input 
            type="text" 
            placeholder="Search projects, tasks, or members..."
            className="w-full pl-14 pr-6 py-5 bg-[#F1F5F9] border border-slate-200 rounded-card text-sm font-bold focus:border-primary-base transition-all outline-none shadow-inner"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
             <kbd className="hidden sm:flex h-6 items-center gap-1 rounded bg-white dark:bg-zinc-800 border px-1.5 font-mono text-[11px] font-black text-slate-400">
                <span className="text-xs">⌘</span>K
             </kbd>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex items-center justify-center gap-2 px-6 py-5 rounded-card border transition-all font-black text-xs  ",
              isFilterOpen 
                ? "bg-primary-base border-primary-base text-white shadow-lg" 
                : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 hover:border-slate-300"
            )}
          >
            <Filter size={16} /> Filters
          </button>
          
          <button type="button" className="flex items-center justify-center size-14 rounded-card bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:shadow-xl active:scale-95 transition-all">
             <Sparkles size={20} />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-3 mt-8 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={cn(
              "whitespace-nowrap px-1 pb-3 text-xs font-black   transition-all relative",
              activeTab === cat.id ? "text-primary-base" : "text-slate-300 dark:text-zinc-700 hover:text-slate-400"
            )}
          >
            {cat.label}
            {activeTab === cat.id && (
               <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-base rounded-full animate-in fade-in zoom-in duration-300" />
            )}
          </button>
        ))}
      </div>

      {isFilterOpen && (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-8 border-t border-slate-100 dark:border-zinc-800/50 animate-in slide-in-from-top-4 duration-500">
           {[
             { label: "Status", icon: Tag, value: "In Progress" },
             { label: "Timeline", icon: Calendar, value: "Next 7 Days" },
             { label: "Priority", icon: SlidersHorizontal, value: "All High" }
           ].map((filter, i) => (
             <div key={i} className="bg-[#F8FAFC] dark:bg-zinc-900 p-4 rounded-card border border-slate-100 dark:border-zinc-800 flex items-center justify-between group cursor-pointer hover:bg-white dark:hover:bg-zinc-900 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-center gap-3">
                   <div className="size-8 rounded-xl bg-white dark:bg-zinc-800 border dark:border-zinc-700 flex items-center justify-center text-slate-400 group-hover:text-primary-base transition-colors">
                      <filter.icon size={14} />
                   </div>
                   <div>
                      <p className="text-[11px] font-black   text-slate-400 leading-none">{filter.label}</p>
                      <p className="text-xs font-bold mt-1">{filter.value}</p>
                   </div>
                </div>
                <ChevronDown size={14} className="text-slate-300" />
             </div>
           ))}
        </div>
      )}

      {/* Background patterns */}
      <div className="absolute -top-12 -right-12 size-48 bg-primary-base/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
