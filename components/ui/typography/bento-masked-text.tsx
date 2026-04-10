"use client";

import React, { useState, useEffect } from 'react';
import { EyeOff, ShieldCheck, Lock, Activity } from 'lucide-react';

export function BentoMaskedText() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full max-w-sm h-64 rounded-card bg-slate-50 border border-slate-100 animate-pulse" />
    );
  }

  return (
    <div className="w-full max-w-sm rounded-card bg-white border border-slate-100 shadow-premium p-8 flex flex-col gap-6 group overflow-hidden relative">
      <div className="flex justify-between items-center px-2 relative z-10">
         <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-lg shadow-black/20">
               <Lock className="size-4" />
            </div>
            <h3 className="text-xs font-black text-slate-900 tracking-tight leading-none">Security Matrix</h3>
         </div>
         <EyeOff className="size-4 text-slate-200 group-hover:text-primary-base transition-colors duration-500" />
      </div>

      <div className="relative h-32 flex items-center justify-center p-6 bg-slate-50 rounded-element border border-slate-100 shadow-inner overflow-hidden group/mask cursor-wait active:cursor-none">
        {/* Background dots grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-40 z-0" />
        
        <div className="relative z-10 flex items-center justify-center w-full h-full">
            <div className="text-xl font-black text-slate-950 tracking-tight transition-all duration-700 blur-xl opacity-0 group-hover/mask:blur-none group-hover/mask:opacity-100 select-none">
               CRM-TOKEN-2025
            </div>
            <p className="absolute text-xs font-black text-slate-300 tracking-tight pointer-events-none transition-all duration-700 opacity-100 group-hover/mask:opacity-0 flex items-center gap-3">
               <Activity className="size-3 text-primary-base animate-pulse" /> Scan to reveal
            </p>
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-slate-50 pt-6 relative z-10">
         <div className="flex items-center gap-3">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span className="text-xs font-black text-slate-400 tracking-tight">Production Only</span>
         </div>
         <button 
           type="button"
           aria-label="Revoke resource access"
           className="text-xs font-black text-primary-base tracking-tight hover:text-slate-950 transition-colors bg-primary-base/5 px-4 py-2 rounded-full border border-primary-base/10 hover:border-slate-200"
         >
           Revoke Access
         </button>
      </div>

      <div className="absolute -right-20 -bottom-20 size-64 bg-primary-base/5 rounded-full blur-[100px] -z-10 group-hover:bg-primary-base/10 transition-all duration-1000" />
    </div>
  );
}
