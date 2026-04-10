"use client";

import React from 'react';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export function BentoIdentityCard() {
  return (
    <div className="w-full max-w-sm rounded-card bg-slate-900 p-8 flex flex-col gap-3 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 blur-[60px] rounded-full" />
      
      <div className="flex items-center gap-3 relative z-10">
         <div className="size-20 rounded-card bg-primary-base p-1 ring-4 ring-slate-800">
            <div className="w-full h-full bg-slate-800 rounded-card flex items-center justify-center text-white text-2xl font-black">
               LM
            </div>
         </div>
         <div className="flex flex-col">
            <h2 className="text-xl font-black text-white leading-tight">Leonid Molchanov</h2>
            <p className="text-[11px] font-black text-primary-base   mt-1">Lead Developer</p>
         </div>
      </div>

      <div className="space-y-3 relative z-10 pt-4 border-t border-slate-800">
         <div className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors cursor-pointer group/item">
            <Mail className="size-4 group-hover/item:text-primary-base" />
            <span className="text-[11px] font-bold">leonid@merchcrm.com</span>
         </div>
         <div className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors cursor-pointer group/item">
            <Phone className="size-4 group-hover/item:text-emerald-400" />
            <span className="text-[11px] font-bold">+1 (555) 000-1234</span>
         </div>
         <div className="flex items-center gap-3 text-slate-400">
            <MapPin className="size-4" />
            <span className="text-[11px] font-bold">Remote • CET Timezone</span>
         </div>
      </div>

      <button type="button" className="w-full mt-2 py-3 rounded-element bg-white text-slate-900 text-xs font-black   flex items-center justify-center gap-2 hover:bg-primary-base hover:text-white transition-all shadow-xl">
         View Full Profile <ExternalLink className="size-3" />
      </button>
    </div>
  );
}
