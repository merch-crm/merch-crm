// app/(main)/dashboard/production/components/bento/status-check-card.tsx
"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusCheckCardProps {
  className?: string;
  isOk?: boolean;
}

export function StatusCheckCard({ className, isOk = true }: StatusCheckCardProps) {
  return (
    <div className={cn(
      "crm-card flex flex-col items-center justify-center p-6 text-center",
      isOk ? "bg-emerald-50/30 border-emerald-100" : "bg-slate-50 border-slate-100",
      className
    )}>
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-500 scale-110",
        isOk ? "bg-emerald-100/50 text-emerald-600" : "bg-slate-100 text-slate-400"
      )}>
        <Check className="w-8 h-8 stroke-[3]" />
      </div>
      
      <h3 className={cn(
        "text-lg font-bold mb-1",
        isOk ? "text-emerald-900" : "text-slate-900"
      )}>
        {isOk ? "Всё под контролем" : "Есть вопросы"}
      </h3>
      
      <p className={cn(
        "text-sm font-medium",
        isOk ? "text-emerald-600/70" : "text-slate-400"
      )}>
        {isOk ? "Нет критичных задач" : "Требуется проверка"}
      </p>
      
      {isOk && (
        <p className="text-xs font-medium text-emerald-500 mt-6">
          Все задачи выполняются в срок
        </p>
      )}
    </div>
  );
}
