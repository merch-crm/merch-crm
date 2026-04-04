"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Shield, Bell, Zap, Cloud, MousePointer2, Cpu, Globe, Lock } from "lucide-react";
import { cn } from "@/components/library/custom/utils/cn";

interface SettingItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  color: string;
}

const DEFAULT_SETTINGS: SettingItem[] = [
  { id: 'notif', label: "Neural Alerts", icon: Bell, active: true, color: "text-blue-500" },
  { id: 'safe', label: "Shield Protocol", icon: Shield, active: false, color: "text-emerald-500" },
  { id: 'fast', label: "Overdrive Mode", icon: Zap, active: true, color: "text-amber-500" },
  { id: 'sync', label: "Node Backbone", icon: Globe, active: true, color: "text-indigo-500" },
];

export function BentoSettingsToggles({ items: propItems }: { items?: SettingItem[] }) {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setSettings(propItems || DEFAULT_SETTINGS);
  }, [propItems]);

  const toggle = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  if (!isMounted) {
    return (
      <div className="w-full max-w-[320px] h-[400px] bg-white rounded-[48px] border border-slate-100 shadow-premium animate-pulse p-10" />
    );
  }

  return (
    <div className="w-full max-w-[320px] bg-white rounded-[48px] border border-slate-100 shadow-premium p-10 flex flex-col gap-8 group/card relative overflow-hidden hover:border-primary-base/30 transition-all duration-700">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-base/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover/card:bg-primary-base/10 transition-colors duration-700" />
      
      <div className="flex items-center justify-between relative z-10">
         <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <Cpu className="size-4 text-slate-950" />
            </div>
            <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">Config</h4>
         </div>
         <div className="flex items-center gap-1">
            <div className="size-1 rounded-full bg-slate-200" />
            <div className="size-1 rounded-full bg-slate-100" />
         </div>
      </div>

      <div className="space-y-3 relative z-10" role="group" aria-label="System configuration toggles">
         {(settings || []).map((item) => (
           <button 
             key={item.id} 
             type="button"
             aria-pressed={item.active}
             aria-label={`Toggle system parameter: ${item.label}`}
             onClick={() => toggle(item.id)}
             className={cn(
               "w-full flex items-center justify-between p-4 rounded-3xl transition-all duration-500 border outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10 active:scale-[0.98]",
               item.active 
                ? "bg-white border-slate-100 shadow-xl shadow-slate-950/[0.02]" 
                : "bg-slate-50/50 border-transparent opacity-60 hover:opacity-100 hover:bg-slate-50"
             )}
           >
              <div className="flex items-center gap-4">
                 <div className={cn(
                   "size-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm", 
                   item.active ? "bg-slate-950 text-white" : "bg-white text-slate-300 border border-slate-100"
                 )}>
                    <item.icon className="size-5" />
                 </div>
                 <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">{item.label}</span>
              </div>
              
              <div 
                className={cn(
                  "w-12 h-7 rounded-full p-1.5 transition-all duration-500 flex items-center shadow-inner",
                  item.active ? "bg-slate-950" : "bg-slate-200"
                )}
                aria-hidden="true"
              >
                 <motion.div 
                   animate={{ x: item.active ? 20 : 0 }}
                   transition={{ type: "spring", stiffness: 400, damping: 25 }}
                   className={cn(
                     "size-4 rounded-full shadow-2xl transition-colors duration-500",
                     item.active ? "bg-white" : "bg-white"
                   )}
                 />
              </div>
           </button>
         ))}
      </div>

      <div className="pt-2 relative z-10">
         <button 
           type="button"
           aria-label="Commit all system changes"
           className="w-full h-14 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-950 hover:bg-slate-50 hover:shadow-xl transition-all duration-500 text-[11px] font-black uppercase tracking-[0.3em] outline-none focus-visible:ring-4 focus-visible:ring-slate-100"
         >
            Save State
         </button>
      </div>
    </div>
  );
}
