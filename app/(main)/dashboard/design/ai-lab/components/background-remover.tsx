"use client";

import { Eraser, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackgroundRemoverProps {
    isPending: boolean;
    processingType: string;
    onProcess: () => void;
}

export function BackgroundRemover({ isPending, processingType, onProcess }: BackgroundRemoverProps) {
    const isActive = processingType === "bg-removal";

    return (
        <Button 
            variant="outline"
            onClick={onProcess} 
            disabled={isPending}
            className={cn(
                "h-20 rounded-[var(--radius-outer)] gap-3 border-slate-100 transition-all group hover:border-primary/20 hover:bg-slate-50/50 bg-white shadow-sm",
                isActive && "bg-primary text-white border-primary shadow-xl shadow-primary/20"
            )}
        >
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                isActive ? "bg-white/20" : "bg-primary/5 text-primary"
            )}>
                {isActive ? <Loader2 className="w-6 h-6 animate-spin" /> : <Eraser className="w-6 h-6" />}
            </div>
            <div className="text-left leading-tight">
                <div className="text-sm font-black tracking-tight">Удалить фон</div>
                <div className="text-xs font-bold opacity-60 mt-0.5">Трассировка</div>
            </div>
        </Button>
    );
}
