"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Bell, Lock, Smartphone, Globe, Shield } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

const menuItems = [
  { id: 'gen', label: 'GENERAL', icon: Monitor },
  { id: 'notif', label: 'ALERTS', icon: Bell },
  { id: 'sec', label: 'SECURITY', icon: Lock },
];

export function BentoDualPanelSettings() {
  const [activeTab, setActiveTab] = useState('gen');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-2 p-4 bg-slate-50 rounded-[48px] border border-slate-100 shadow-inner animate-pulse">
        <div className="md:col-span-1 h-[450px] bg-white rounded-[40px]" />
        <div className="md:col-span-2 h-[450px] bg-white rounded-[40px]" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-5 p-5 bg-slate-100 rounded-[52px] border border-slate-200 overflow-hidden shadow-premium">
      {/* Sidebar Panel */}
      <div className="md:col-span-4 bg-white p-6 sm:p-8 flex flex-col gap-6 rounded-[40px] shadow-sm border border-slate-50">
         <div className="flex flex-col gap-2">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">Settings Panel</h3>
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-tight leading-none">Matrix Control Node</p>
         </div>
         
         <div className="flex flex-col gap-3" role="tablist" aria-orientation="vertical">
            {menuItems.map((item) => {
               const isActive = activeTab === item.id;
               return (
                <button 
                   key={item.id}
                   type="button"
                   role="tab"
                   aria-selected={isActive}
                   aria-controls={`panel-${item.id}`}
                   onClick={() => setActiveTab(item.id)}
                   className={cn(
                      "flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 border outline-none group/tab focus-visible:ring-4 focus-visible:ring-primary-base/10",
                      isActive 
                        ? 'bg-slate-950 text-white shadow-2xl border-slate-900' 
                        : 'bg-slate-50/50 border-transparent text-slate-400 hover:bg-white hover:border-slate-100 hover:text-slate-900'
                   )}
                >
                   <item.icon className={cn("size-4 transition-transform group-hover/tab:scale-110", isActive ? "text-primary-base" : "text-slate-300")} />
                   <span className="text-[11px] font-black uppercase tracking-[0.15em] leading-none">{item.label}</span>
                </button>
               );
            })}
         </div>

         <div className="mt-6 p-8 bg-slate-950 rounded-[32px] text-white flex flex-col gap-4 relative overflow-hidden group/sync shadow-2xl">
            <div className="absolute -top-10 -right-10 size-32 bg-primary-base/20 blur-[50px] rounded-full group-hover/sync:scale-150 transition-transform duration-700" />
            <Smartphone className="size-6 text-primary-base relative z-10" />
            <div className="flex flex-col gap-2 relative z-10">
               <span className="text-[11px] font-black uppercase tracking-widest text-primary-base leading-none">Sync Status</span>
               <span className="text-[11px] font-black uppercase tracking-tight text-white/30 leading-none">2 Active Units Linked</span>
            </div>
         </div>
      </div>

      {/* Main Content Panel */}
      <div className="md:col-span-8 bg-white p-8 sm:p-10 flex flex-col gap-6 rounded-[40px] shadow-sm relative overflow-hidden group/main min-h-[500px] border border-slate-50">
         <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">System Parameters</h2>
              <p className="text-[11px] font-black text-slate-300 uppercase tracking-tight leading-none">Primary Configuration Layer</p>
            </div>
            <div className="size-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 transition-colors group-hover/main:text-primary-base group-hover/main:border-primary-base/20 shadow-sm">
              <Globe className="size-5" />
            </div>
         </div>

         <div className="space-y-4 pt-4" role="tabpanel" id={`panel-${activeTab}`}>
            <button 
              type="button"
              className="w-full p-8 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between group/item hover:border-primary-base transition-all duration-300 hover:bg-white hover:shadow-xl outline-none focus-visible:ring-4 focus-visible:ring-primary-base/5"
            >
               <div className="flex flex-col gap-2 items-start">
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">Core Language</span>
                  <p className="text-[11px] font-black text-slate-300 uppercase tracking-tight leading-none">English (International Matrix)</p>
               </div>
               <Shield className="size-5 text-slate-200 group-hover/item:text-primary-base transition-all" />
            </button>

            <button 
              type="button"
              className="w-full p-8 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between group/item hover:border-emerald-500 transition-all duration-300 hover:bg-white hover:shadow-xl outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/5 text-left"
            >
               <div className="flex flex-col gap-2 items-start">
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">Neural Search Layer</span>
                  <p className="text-[11px] font-black text-emerald-500 uppercase tracking-tight leading-none">Active V2.1 Process</p>
               </div>
               <div className="size-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] animate-pulse" />
            </button>
         </div>

         <div className="mt-auto flex justify-end gap-3 pt-8 border-t border-slate-50">
            <button 
              type="button" 
              className="px-8 py-3 text-slate-400 font-black text-[11px] uppercase tracking-widest hover:text-slate-900 transition-colors"
            >
              Reset
            </button>
            <button 
              type="button" 
              className="px-10 py-4 bg-slate-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-primary-base hover:shadow-primary-base/20 transition-all active:scale-95 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20"
            >
              Commit Changes
            </button>
         </div>
      </div>
    </div>
  );
}
