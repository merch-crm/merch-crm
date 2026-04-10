"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Search, MessageSquare, Database, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_DOCK_ITEMS = [
  { icon: <Home className="size-5" />, label: "Главная", color: "bg-indigo-500" },
  { icon: <Search className="size-5" />, label: "Поиск", color: "bg-emerald-500" },
  { icon: <MessageSquare className="size-5" />, label: "Чат", color: "bg-rose-500", badge: 3 },
  { icon: <Database className="size-5" />, label: "База", color: "bg-amber-500" },
  { icon: <Settings className="size-5" />, label: "Опции", color: "bg-slate-700" },
];

export function BentoFloatingDock({ items: propItems }: { items?: { icon: React.ReactNode; label: string; color: string; badge?: number }[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const items = propItems || DEFAULT_DOCK_ITEMS;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full flex justify-center py-6 h-24 items-end animate-pulse" />;
  }

  return (
    <div className="w-full flex justify-center py-6 group/dock">
      <div className="flex items-end gap-3 px-6 py-4 bg-white/80 backdrop-blur-xl rounded-card border border-gray-100 shadow-crm-lg transition-all hover:shadow-2xl">
         {(items || []).map((item, i) => (
           <div key={i} className="relative flex flex-col items-center">
              <AnimatePresence>
                 {hovered === i && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.8 }}
                       className="absolute -top-12 px-3 py-1.5 bg-gray-900 text-white text-[11px] font-black rounded-xl shadow-xl whitespace-nowrap z-50 border border-white/10"
                    >
                       {item.label}
                       <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-gray-900" />
                    </motion.div>
                 )}
              </AnimatePresence>
              
              <motion.button
                type="button"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                whileHover={{ 
                  scale: 1.3, 
                  y: -10,
                  transition: { type: "spring", stiffness: 400, damping: 20 }
                }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "size-12 rounded-element flex items-center justify-center text-white shadow-lg transition-all relative group/item",
                  item.color,
                  "hover:shadow-2xl"
                )}
              >
                 {item.icon}
                 {item.badge && (
                    <span className="absolute -top-1 -right-1 size-5 bg-white text-gray-900 text-[11px] font-black rounded-full flex items-center justify-center shadow-sm animate-bounce">
                       {item.badge}
                    </span>
                 )}

                 <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/item:opacity-100 rounded-element transition-opacity pointer-events-none" />
              </motion.button>
              
              {hovered === i && (
                 <motion.div 
                   layoutId="dot"
                   className="mt-2 size-1.5 bg-primary-base rounded-full shadow-sm"
                 />
              )}
           </div>
         ))}
      </div>
    </div>
  );
}
