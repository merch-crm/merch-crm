"use client";

import React from "react";
import { Flame, Zap, TrendingUp, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BentoLeadScoreProps {
  className?: string;
  score?: number;
  name?: string;
  company?: string;
  signals?: string[];
}

export function BentoLeadScore({
  className,
  score = 87,
  name = "Ольга Кузнецова",
  company = "TechVentures Ltd",
  signals = ["Посетил страницу цен 3×", "Скачал вайтпейпер", "Открыл 5 писем"],
}: BentoLeadScoreProps) {
  const isHot = score >= 80;
  const isWarm = score >= 50 && score < 80;

  const scoreColor = isHot 
    ? "text-emerald-500" 
    : isWarm 
      ? "text-amber-500" 
      : "text-muted-foreground";
  
  const scoreBg = isHot
    ? "from-emerald-500/10 to-emerald-500/5"
    : isWarm
      ? "from-amber-500/10 to-amber-500/5"
      : "from-muted/20 to-muted/5";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-card text-card-foreground shadow-crm-lg border border-border",
        "rounded-card p-6 flex flex-col",
        "animate-in fade-in zoom-in-[0.95] duration-700",
        className
      )}
    >
      {/* Grain overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Giant score number — Brutalist minimalism */}
      <div className={cn("relative z-10 bg-gradient-to-br rounded-element p-6 mb-4 -m-1", scoreBg)}>
        <div className="flex items-end justify-between">
          <div className="animate-in zoom-in-[0.5] fade-in duration-500 delay-200 fill-mode-both">
            <span className={cn("text-7xl md:text-8xl font-black  leading-none", scoreColor)}>
              {score}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1 mb-2">
            {isHot && <Flame size={24} className="text-emerald-500" />}
            {isWarm && <Zap size={24} className="text-amber-500" />}
            <span className="text-[11px] font-black tracking-tight text-slate-400">
              {isHot ? "Горячий" : isWarm ? "Теплый" : "Холодный"}
            </span>

          </div>
        </div>
      </div>

      {/* Lead info */}
      <div className="relative z-10 mb-4 px-1">
        <h3 className="text-[11px] font-black tracking-tight text-slate-900">{name}</h3>
        <p className="text-[11px] font-bold text-slate-400 tracking-tighter">{company}</p>
      </div>


      {/* Signals */}
      <div className="relative z-10 mt-auto space-y-2">
        {signals.map((signal, i) => (
          <div
            key={signal}
            style={{ animationDelay: `${400 + i * 100}ms` }}
            className="flex items-center gap-2 text-[11px] font-bold text-slate-400 tracking-tight animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both"
          >
            <TrendingUp size={12} className={scoreColor} />
            <span>{signal}</span>
          </div>

        ))}
      </div>

      {/* CTA */}
      <button
        type="button"
        className="relative z-10 mt-5 flex items-center gap-1 text-[11px] font-black text-primary cursor-pointer group tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-primary-base rounded-lg transition-transform hover:translate-x-1 duration-300 w-fit"
      >

        Профиль лида 
        <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}
