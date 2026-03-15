// app/(main)/dashboard/production/components/bento/attention-card.tsx
"use client";

import Link from "next/link";
import { AlertCircle, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import type { AttentionStats } from "../../types";

interface AttentionCardProps {
  stats: AttentionStats | null;
  className?: string;
}

export function AttentionCard({ stats, className }: AttentionCardProps) {
  const urgent = stats?.urgent ?? 0;
  const overdue = stats?.overdue ?? 0;
  const total = stats?.total ?? 0;

  const hasIssues = total > 0;

  return (
    <div
      className={cn(
        "crm-card col-span-12 lg:col-span-5",
        "relative group flex flex-col justify-between overflow-hidden",
        "min-h-[220px]",
        hasIssues 
          ? "!border-rose-200 hover:!border-rose-300" 
          : "!border-emerald-200 hover:!border-emerald-300",
        className
      )}
    >
      {/* Декоративный элемент */}
      <div className={cn(
        "absolute right-0 top-0 w-40 h-40 rounded-full -mr-12 -mt-12 blur-2xl opacity-50 pointer-events-none",
        hasIssues ? "bg-rose-100" : "bg-emerald-100"
      )} />

      {/* Заголовок */}
      <div className="flex items-center gap-3 relative z-10">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border",
          hasIssues 
            ? "bg-rose-50 border-rose-200 text-rose-500" 
            : "bg-emerald-50 border-emerald-200 text-emerald-500"
        )}>
          {hasIssues ? <AlertCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
        </div>
        <div>
          <h3 className={cn(
            "text-lg font-bold leading-tight",
            hasIssues ? "text-rose-900" : "text-emerald-900"
          )}>
            {hasIssues ? "Требуют внимания" : "Всё под контролем"}
          </h3>
          <p className={cn(
            "text-sm font-medium",
            hasIssues ? "text-rose-400" : "text-emerald-400"
          )}>
            {hasIssues ? "Срочные и просроченные" : "Нет критичных задач"}
          </p>
        </div>
      </div>

      {/* Контент */}
      <div className="relative z-10 mt-auto">
        {hasIssues ? (
          <>
            <div className="text-6xl sm:text-7xl font-bold text-rose-600 leading-none mb-2">
              {total}
            </div>
            
            {/* Детализация */}
            <div className="flex flex-wrap gap-2 mt-3">
              {overdue > 0 && (
                <Link
                  href="/dashboard/production/tasks?filter=overdue"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold hover:bg-rose-200 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{overdue} {pluralize(overdue, "просрочена", "просрочены", "просрочено")}</span>
                </Link>
              )}
              {urgent > 0 && (
                <Link
                  href="/dashboard/production/tasks?filter=urgent"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold hover:bg-amber-200 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{urgent} {pluralize(urgent, "срочная", "срочных", "срочных")}</span>
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="text-5xl font-bold text-emerald-600 leading-none mb-2">
              ✓
            </div>
            <p className="text-sm font-bold text-emerald-500">
              Все задачи выполняются в срок
            </p>
          </>
        )}
      </div>

      {/* Ссылка */}
      {hasIssues && (
        <Link
          href="/dashboard/production/tasks?filter=attention"
          className={cn(
            "absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center",
            "bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors",
            "opacity-0 group-hover:opacity-100"
          )}
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
      )}
    </div>
  );
}
