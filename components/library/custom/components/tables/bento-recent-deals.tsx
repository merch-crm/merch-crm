"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, TrendingUp, Layers, Fingerprint } from "lucide-react";
import { cn } from "../../utils/cn";
import { BentoCard, BentoIconContainer } from "../../ui/bento-primitives";

export interface DealItem {
  id: string;
  name: string;
  company: string;
  amount: string;
  stage: string;
  probability: number;
}

interface BentoRecentDealsProps {
  title: string;
  deals: DealItem[];
  className?: string;
  stages?: string[];
}

export function BentoRecentDeals({ 
  title = "Recent Pipeline Matrix", 
  deals, 
  className,
  stages = ["Lead", "Meeting", "Proposal", "Negotiation", "Closed"] 
}: BentoRecentDealsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <BentoCard className={cn("h-96 w-full animate-pulse", className)}>
        <div />
      </BentoCard>
    );
  }

  return (
    <BentoCard className={cn("p-8 flex flex-col gap-8 group/card transition-all duration-700 relative overflow-hidden", className)}>
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <BentoIconContainer className="size-8 bg-slate-950 text-white shadow-lg shadow-black/20">
            <Layers className="size-4" />
          </BentoIconContainer>
          <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">{title}</h3>
        </div>
        <button 
          type="button"
          aria-label="Access full deal registry"
          className="text-[10px] font-black text-primary-base uppercase tracking-widest flex items-center gap-2 px-4 py-2 bg-primary-base/5 rounded-full hover:bg-primary-base hover:text-white transition-all duration-500 shadow-sm outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20"
        >
          View Full Trace <ChevronRight className="size-3" />
        </button>
      </div>
      
      <div className="flex-1 space-y-4 relative z-10">
        {deals.map((deal, idx) => {
          const currentStageIndex = stages.indexOf(deal.stage);
          const progressPercent = Math.max(10, ((currentStageIndex + 1) / stages.length) * 100);

          return (
            <div 
              key={deal.id} 
              className="p-6 bg-slate-50/50 border border-slate-100/50 rounded-[2rem] hover:bg-white hover:shadow-2xl hover:border-white transition-all duration-700 group/item relative overflow-hidden"
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{deal.name}</h4>
                  <div className="flex items-center gap-2">
                    <Fingerprint className="size-3 text-slate-300" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter tabular-nums">{deal.company} // ID-{deal.id.slice(0, 4)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-sm font-black text-slate-950 uppercase tracking-tighter tabular-nums">{deal.amount}</div>
                  <div className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
                    <TrendingUp className="size-2.5" /> {deal.probability}% WIN ARC
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1 border-b border-primary-base/5 pb-2">
                  <span className="text-primary-base">NODE: {deal.stage}</span>
                  <span className="opacity-40">{currentStageIndex + 1} / {stages.length}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100/50 rounded-full overflow-hidden shadow-inner p-[1px] border border-slate-100">
                  <div 
                    className="h-full bg-slate-900 rounded-full transition-all duration-1000 ease-out shadow-premium group-hover/item:bg-primary-base group-hover/item:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="absolute -right-8 -bottom-8 size-32 bg-primary-base/5 rounded-full blur-3xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-1000" />
            </div>
          );
        })}
      </div>

      <div className="absolute top-0 right-0 size-64 bg-primary-base/5 blur-[100px] rounded-full -z-10 group-hover/card:bg-primary-base/10 transition-colors duration-1000" />
    </BentoCard>
  );
}
