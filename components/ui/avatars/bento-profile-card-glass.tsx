"use client";

import React, { useState, useEffect } from 'react';
import { Settings, LogOut, ChevronRight, User } from 'lucide-react';

export function BentoProfileCardGlass() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full max-w-sm h-[320px] rounded-card bg-white border border-slate-100 shadow-crm-md animate-pulse p-6" />;
  }

  return (
    <div className="w-full max-w-sm rounded-card bg-white p-3 border border-slate-100 shadow-premium relative group/card hover:border-slate-200 transition-colors duration-500 overflow-hidden">
      <div className="bg-slate-900 h-28 rounded-card overflow-hidden relative shadow-inner">
         {/* Texture overlay */}
         <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay" />
         <div className="absolute -top-10 -right-10 size-32 bg-slate-800 blur-[50px] rounded-full group-hover/card:scale-150 transition-transform duration-700" />
      </div>

      <div className="px-8 pb-8 -mt-12 relative z-10 flex flex-col items-center">
         <div className="size-24 rounded-card border-8 border-white bg-white shadow-2xl flex items-center justify-center relative group/avatar overflow-hidden">
            <div className="absolute inset-0 bg-slate-100 group-hover/avatar:bg-slate-50 group-hover/avatar:bg-slate-100 transition-colors" />
            <User className="size-10 text-slate-300 group-hover/avatar:text-primary-base transition-colors relative z-10" />
         </div>
         
         <div className="mt-6 flex flex-col items-center gap-2">
            <h3 className="text-[11px] font-black text-slate-900 tracking-[0.25em] leading-none">Леонид М.</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
               <div className="size-1.5 rounded-full bg-emerald-500" />
               <span className="text-[9px] font-black text-slate-400 tracking-widest leading-none">Руководитель проекта</span>
            </div>
         </div>

         <div className="w-full mt-8 flex flex-col gap-2 pt-6 border-t border-slate-50">
            <button 
              type="button" 
              aria-label="Настройки аккаунта"
              className="flex items-center justify-between p-4 rounded-element bg-white border border-transparent hover:border-slate-100 hover:bg-slate-50 hover:shadow-sm transition-all group/item outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
            >
               <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center transition-all group-hover/item:scale-110 group-hover/item:rotate-6 group-hover/item:bg-slate-100 group-hover/item:text-primary-base shadow-sm">
                     <Settings className="size-4" />
                  </div>
                  <span className="text-[11px] font-black text-slate-700 tracking-widest leading-none">Безопасность</span>
               </div>
               <ChevronRight className="size-4 text-slate-300 group-hover/item:text-primary-base group-hover/item:translate-x-1 transition-all" />
            </button>
            
            <button 
              type="button" 
              aria-label="Завершить текущую сессию"
              className="flex items-center justify-between p-4 rounded-element bg-white border border-transparent hover:border-rose-100 hover:bg-rose-50 hover:shadow-sm transition-all group/item text-rose-500 outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
               <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-400 flex items-center justify-center transition-all group-hover/item:scale-110 group-hover/item:-rotate-6 group-hover/item:bg-rose-100 group-hover/item:text-rose-600 shadow-sm">
                     <LogOut className="size-4" />
                  </div>
                  <span className="text-[11px] font-black tracking-widest leading-none transition-colors group-hover/item:text-rose-600">Выйти из системы</span>
               </div>
               <ChevronRight className="size-4 text-rose-200 group-hover/item:text-rose-500 group-hover/item:translate-x-1 transition-all" />
            </button>
         </div>
      </div>
    </div>
  );
}
