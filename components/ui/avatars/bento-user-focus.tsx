"use client";

import React from 'react';
import { Star, Shield, MoreHorizontal } from 'lucide-react';

export function BentoUserFocus() {
  return (
    <div className="w-full max-w-sm rounded-card bg-indigo-950 p-8 flex flex-col gap-3 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-base to-transparent opacity-40" />
      
      <div className="flex justify-between items-start">
         <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center text-white/40">
            <Shield className="size-6" />
         </div>
         <Star className="size-4 text-amber-400 fill-amber-400" />
      </div>

      <div className="flex flex-col items-center text-center gap-1">
         <div className="size-20 rounded-full bg-primary-base p-1 ring-8 ring-white/5 mb-3">
            <div className="size-full bg-slate-900 rounded-full flex items-center justify-center text-white text-2xl font-black">
               JD
            </div>
         </div>
         <h2 className="text-xl font-black text-white ">John Doe</h2>
         <p className="text-xs font-bold text-white/40  ">Enterprise Manager</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
         <div className="flex flex-col items-center py-2 bg-white/5 rounded-element">
            <span className="text-xs font-black text-white">45</span>
            <span className="text-[11px] font-black text-white/20  ">Deals</span>
         </div>
         <div className="flex flex-col items-center py-2 bg-white/5 rounded-element">
            <span className="text-xs font-black text-white">12.1k</span>
            <span className="text-[11px] font-black text-white/20  ">Revenue</span>
         </div>
      </div>

      <div className="absolute right-4 bottom-4">
         <button type="button" className="text-white/20 hover:text-white transition-colors flex items-center justify-center p-2 rounded-full hover:bg-white/5">
            <MoreHorizontal className="size-5" />
            <span className="sr-only">More options</span>
         </button>
      </div>
    </div>
  );
}
