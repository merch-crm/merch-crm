"use client";

import { Maximize, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UpscalerProps {
  isPending: boolean;
  processingType: string;
  onProcess: () => void;
}

export function Upscaler({ isPending, processingType, onProcess }: UpscalerProps) {
  const isActive = processingType === "upscale";

  return (
    <Button variant="outline" onClick={onProcess} disabled={isPending} className={cn( "h-20 rounded-[var(--radius-outer)] gap-3 border-slate-100 transition-all group hover:border-violet-200 hover:bg-slate-50/50 bg-white shadow-sm", isActive && "bg-violet-600 text-white border-violet-600 shadow-xl shadow-violet-100" )}>
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
        isActive ? "bg-white/20" : "bg-violet-50 text-violet-600"
      )}>
        {isActive ? <Loader2 className="w-6 h-6 animate-spin" /> : <Maximize className="w-6 h-6" />}
      </div>
      <div className="text-left leading-tight">
        <div className="text-sm font-black ">Увеличение</div>
        <div className="text-xs font-bold opacity-60 mt-0.5">Upscale x2</div>
      </div>
    </Button>
  );
}
