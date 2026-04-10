"use client";

import { Ruler, TrendingUp, Maximize, Layers } from "lucide-react";
import { LayoutResult } from "@/lib/types/calculators";

interface VisualizerStatsProps {
 layoutResult: LayoutResult;
}

export function VisualizerStats({ layoutResult }: VisualizerStatsProps) {
 return (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-t border-border/40 bg-background/50 backdrop-blur-sm rounded-b-3xl overflow-hidden">
   {/* Stat 1: Print Length */}
   <div className="flex items-center gap-3 p-6 border-r border-border/40 transition-all hover:bg-card group/stat">
    <div className="bg-primary/10 p-3 rounded-2xl group-hover/stat:bg-primary group-hover/stat:text-primary-foreground transition-all duration-300">
     <Ruler className="h-5 w-5 text-primary group-hover/stat:text-primary-foreground" />
    </div>
    <div className="flex flex-col">
     <span className="text-xs font-bold text-muted-foreground/70">Длина печати</span>
     <span className="text-lg font-bold text-foreground tabular-nums">
      {(layoutResult.stats.totalLengthMm / 10).toFixed(1)} <span className="text-sm font-medium text-muted-foreground/60">см</span>
     </span>
    </div>
   </div>
   
   {/* Stat 2: Efficiency */}
   <div className="flex items-center gap-3 p-6 border-r border-border/40 transition-all hover:bg-card group/stat">
    <div className="bg-dept-production/10 p-3 rounded-2xl group-hover/stat:bg-dept-production group-hover/stat:text-white transition-all duration-300">
     <TrendingUp className="h-5 w-5 text-dept-production group-hover/stat:text-white" />
    </div>
    <div className="flex flex-col">
     <span className="text-xs font-bold text-dept-production/80">Полезная площадь</span>
     <span className="text-lg font-bold text-dept-production tabular-nums">
      {layoutResult.stats.efficiency}<span className="text-sm text-dept-production/70">%</span>
     </span>
    </div>
   </div>

   {/* Stat 3: Total Area */}
   <div className="flex items-center gap-3 p-6 border-r border-border/40 transition-all hover:bg-card group/stat">
    <div className="bg-dept-sales/10 p-3 rounded-2xl group-hover/stat:bg-dept-sales group-hover/stat:text-white transition-all duration-300">
     <Maximize className="h-5 w-5 text-dept-sales group-hover/stat:text-white" />
    </div>
    <div className="flex flex-col">
     <span className="text-xs font-bold text-muted-foreground/70">Общая площадь</span>
     <span className="text-lg font-bold text-foreground tabular-nums">
      {(layoutResult.stats.totalAreaMm2 / 1000000).toFixed(3)} <span className="text-sm font-medium text-muted-foreground/60">м²</span>
     </span>
    </div>
   </div>

   {/* Stat 4: Print Count */}
   <div className="flex items-center gap-3 p-6 transition-all hover:bg-card group/stat">
    <div className="bg-dept-management/10 p-3 rounded-2xl group-hover/stat:bg-dept-management group-hover/stat:text-white transition-all duration-300">
     <Layers className="h-5 w-5 text-dept-management group-hover/stat:text-white" />
    </div>
    <div className="flex flex-col">
     <span className="text-xs font-bold text-muted-foreground/70">Кол-во макетов</span>
     <span className="text-lg font-bold text-foreground tabular-nums">
      {layoutResult.stats.printCount} <span className="text-sm font-medium text-muted-foreground/60">шт</span>
     </span>
    </div>
   </div>
  </div>
 );
}
