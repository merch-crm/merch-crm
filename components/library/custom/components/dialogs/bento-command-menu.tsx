"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command, Search, User, Settings, CreditCard, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/components/library/custom/utils/cn";

const DEFAULT_COMMANDS = [
  { icon: <User className="size-4" />, label: "User Profile", shortcut: "⌘P" },
  { icon: <Settings className="size-4" />, label: "System Settings", shortcut: "⌘S" },
  { icon: <CreditCard className="size-4" />, label: "Billing & Plans", shortcut: "⌘B" },
  { icon: <LogOut className="size-4" />, label: "Sign Out", shortcut: "⌘L" },
];

export function BentoCommandMenu({ items: propItems }: { items?: { icon: React.ReactNode; label: string; shortcut: string }[] }) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const items = propItems || DEFAULT_COMMANDS;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full max-w-[320px] h-[320px] bg-white rounded-[32px] border border-slate-100 shadow-crm-md animate-pulse p-6" />;
  }

  const filteredItems = (items || []).filter(item => 
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div 
      role="combobox"
      aria-expanded="true"
      aria-haspopup="listbox"
      aria-controls="command-listbox"
      className="w-full max-w-[320px] bg-white rounded-[32px] border border-slate-100 shadow-crm-lg overflow-hidden flex flex-col group h-[320px] hover:border-primary-base/30 transition-colors duration-500"
    >
      <div className="p-4 border-b border-slate-50 bg-slate-50/50">
         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search commands..."
              aria-label="Search commands"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-[11px] font-black text-slate-900 uppercase tracking-tight outline-none focus:border-primary-base focus:ring-4 focus:ring-primary-base/5 transition-all shadow-sm placeholder:text-slate-200"
            />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide" id="command-listbox" role="listbox">
         <div className="px-3 py-3">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Recommended</span>
         </div>
         <div className="space-y-1">
            {filteredItems?.map((item, i) => (
              <motion.button
                key={i}
                type="button"
                role="option"
                aria-selected={selectedIndex === i}
                aria-label={item.label}
                onMouseEnter={() => setSelectedIndex(i)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-3 rounded-2xl transition-all duration-300 group/item border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-primary-base",
                  selectedIndex === i ? "bg-slate-100/50 border-slate-100 shadow-inner" : "hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3">
                   <div className={cn(
                     "size-8 rounded-xl flex items-center justify-center transition-all shadow-sm",
                     selectedIndex === i ? "bg-slate-900 text-white scale-110" : "bg-white text-slate-400 group-hover/item:text-slate-900"
                   )}>
                      {item.icon}
                   </div>
                   <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                   <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded-[6px] border border-slate-100 bg-white px-2 font-mono text-[9px] font-black text-slate-400 shadow-sm uppercase">
                      {item.shortcut}
                   </kbd>
                   <ChevronRight className={cn("size-3 text-slate-300 transition-transform duration-300", selectedIndex === i && "translate-x-1 text-primary-base")} />
                </div>
              </motion.button>
            ))}
         </div>
      </div>

      <div className="p-4 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Command className="size-3 text-slate-300" />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none text-[9px]">Press <kbd className="bg-white border border-slate-100 rounded px-1.5 font-sans">Esc</kbd> to exit</span>
         </div>
      </div>

    </div>
  );
}
