"use client";

import { createElement } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlassEmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    className?: string;
}

export function GlassEmptyState({ icon, title, description, className }: GlassEmptyStateProps) {
    return (
        <div className={cn("p-12 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500", className)}>
            <div className="relative mb-6">
                {/* Background Glass Orb */}
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 animate-pulse" />

                {/* Main Glass Icon Container */}
                <div className="relative w-20 h-20 rounded-[var(--radius)] bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/50 dark:border-zinc-800/50 flex items-center justify-center shadow-crm-lg overflow-hidden group">
                    {/* Glossy Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    {createElement(icon, {
                        className: "w-10 h-10 text-primary/60 dark:text-primary/40 drop-shadow-sm"
                    })}
                </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                {title}
            </h3>
            {description && (
                <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 max-w-[240px]">
                    {description}
                </p>
            )}
        </div>
    );
}
