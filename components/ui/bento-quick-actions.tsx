"use client";

import React from "react";
import { Plus, Send, FileUp, UserPlus, CalendarPlus, BarChart3, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface BentoQuickActionsProps {
  className?: string;
  onAction?: (id: string) => void;
}

const actions: QuickAction[] = [
  { id: "new-deal", label: "Новая сделка", icon: Plus, color: "bg-emerald-500 text-white" },
  { id: "send-email", label: "Написать письмо", icon: Send, color: "bg-blue-500 text-white" },
  { id: "upload", label: "Загрузить файл", icon: FileUp, color: "bg-amber-500 text-white" },
  { id: "add-contact", label: "Добавить контакт", icon: UserPlus, color: "bg-rose-500 text-white" },
  { id: "schedule", label: "Расписание", icon: CalendarPlus, color: "bg-cyan-500 text-white" },
  { id: "report", label: "Новый отчет", icon: BarChart3, color: "bg-indigo-500 text-white" },
];

export function BentoQuickActions({ className, onAction }: BentoQuickActionsProps) {
  const primary = actions[0];
  const secondary = actions.slice(1);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-card text-card-foreground shadow-crm-lg border border-border",
        "rounded-card p-5",
        "animate-in fade-in slide-in-from-bottom-5 duration-700",
        className
      )}
    >
      <h3 className="text-[11px] font-black text-slate-400 tracking-[0.2em] mb-4">Быстрые действия</h3>

      {/* Asymmetric layout: one giant + column of small */}
      <div className="grid grid-cols-[1fr_1fr] gap-3 h-[calc(100%-2.5rem)]">
        {/* Giant primary action */}
        {(() => {
          const PrimaryIcon = primary.icon;
          return (
            <button
              type="button"
              onClick={() => onAction?.(primary.id)}
              className={cn(
                "row-span-3 flex flex-col items-center justify-center gap-3 rounded-element cursor-pointer transition-all duration-300 hover:shadow-crm-md hover:scale-[0.98] active:scale-[0.95] outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                primary.color
              )}
            >
              <PrimaryIcon size={32} strokeWidth={1.5} />
              <span className="text-[11px] font-black tracking-tight">{primary.label}</span>
            </button>
          );
        })()}

        {/* Column of secondary actions */}
        {secondary.map((action, i) => {
          const ActionIcon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              style={{ animationDelay: `${150 + i * 70}ms` }}
              onClick={() => onAction?.(action.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer border border-border bg-secondary/50 text-card-foreground animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both hover:-translate-y-0.5 active:scale-[0.98]",
                "transition-all duration-200 hover:bg-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary-base w-full text-left"
              )}
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", action.color)}>
                <ActionIcon size={16} />
              </div>
              <span className="text-[11px] font-black tracking-tighter truncate leading-none">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
