"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick?: () => void;
  children?: DropdownItem[];
}

interface BentoDropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
}

export function BentoDropdownMenu({ trigger, items, className }: BentoDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveSubMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isMounted) return <div className="inline-flex">{trigger}</div>;

  return (
    <div className="relative inline-flex" ref={menuRef}>
      <button 
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)} 
        className="cursor-pointer active:scale-95 transition-transform bg-transparent border-none p-0 appearance-none outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2 rounded-xl"
      >
        {trigger}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10, rotateX: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10, rotateX: -5 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "absolute top-full mt-3 right-0 z-[120] min-w-[260px] bg-white rounded-card border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-2 overflow-visible",
              className
            )}
            role="menu"
          >
            <div className="space-y-1">
              {items?.map((item) => (
                <div key={item.id} className="relative group/item">
                  <button
                    type="button"
                    role="menuitem"
                    aria-haspopup={item.children ? "true" : "false"}
                    aria-expanded={activeSubMenu === item.id}
                    onClick={() => {
                      if (item.children) {
                        setActiveSubMenu(activeSubMenu === item.id ? null : item.id);
                      } else {
                        item.onClick?.();
                        setIsOpen(false);
                      }
                    }}
                    onMouseEnter={() => item.children && setActiveSubMenu(item.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-element hover:bg-slate-50 transition-all group/item outline-none focus-visible:ring-2 focus-visible:ring-primary-base",
                      activeSubMenu === item.id ? "bg-slate-50" : ""
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "size-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/item:bg-slate-900 group-hover/item:text-white transition-all transform group-hover/item:scale-110",
                        activeSubMenu === item.id && "bg-slate-900 text-white"
                      )}>
                        {item.icon || <Sparkles className="size-4" />}
                      </div>
                      <span className="text-[11px] font-black text-slate-700 tracking-tight group-hover/item:text-slate-900">
                        {item.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.shortcut && (
                        <kbd className="text-[9px] font-black text-slate-300 tracking-widest px-2 py-0.5 rounded-lg border border-slate-100 bg-white font-sans">
                          {item.shortcut}
                        </kbd>
                      )}
                      {item.children && (
                        <ChevronRight className={cn("size-3 text-slate-300 group-hover/item:text-blue-600 transition-transform duration-300", activeSubMenu === item.id && "rotate-90")} />
                      )}
                    </div>
                  </button>

                  {/* Submenu */}
                  <AnimatePresence>
                    {item.children && activeSubMenu === item.id && (
                      <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.95 }}
                        className="absolute left-full top-0 ml-3 min-w-[220px] bg-white rounded-card border border-slate-100 shadow-2xl p-2 z-[130]"
                        role="menu"
                      >
                        {item.children?.map(sub => (
                          <button
                            type="button"
                            key={sub.id}
                            role="menuitem"
                            onClick={() => {
                              sub.onClick?.();
                              setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-left group/sub outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
                          >
                            <div className="size-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover/sub:text-primary-base group-hover/sub:bg-primary-base/5 transition-all">
                               {sub.icon || <Sparkles className="size-3" />}
                            </div>
                            <span className="text-[11px] font-black text-slate-500 tracking-tight group-hover/sub:text-slate-900 leading-none">
                               {sub.label}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Glossy Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50 rounded-card" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
