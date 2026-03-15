// app/(main)/dashboard/production/components/bento/staff-on-shift-card.tsx
"use client";

import Link from "next/link";
import { Users, ArrowRight, UserCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { StaffLoadItem } from "../../types";

interface StaffOnShiftCardProps {
  staff: StaffLoadItem[];
  averageLoad?: number;
  averageEfficiency?: number;
  className?: string;
}

export function StaffOnShiftCard({
  staff,
  averageLoad = 0,
  averageEfficiency = 0,
  className,
}: StaffOnShiftCardProps) {
  const hasData = staff && staff.length > 0;

  return (
    <div className={cn("crm-card flex flex-col", className)}>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Команда на смене</h3>
            <p className="text-xs font-medium text-slate-400">
              {hasData
                ? `${staff.length} ${pluralize(staff.length, "сотрудник", "сотрудника", "сотрудников")}`
                : "Нет активных сотрудников"}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/production/staff"
          className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          <span>Все</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Статистика */}
      {hasData && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex-1">
            <div className="text-xs font-medium text-slate-400">Ср. загрузка</div>
            <div className={cn(
              "text-sm font-bold",
              averageLoad >= 80 ? "text-rose-600" :
              averageLoad >= 50 ? "text-amber-600" :
              "text-emerald-600"
            )}>
              {averageLoad}%
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex-1">
            <div className="text-xs font-medium text-slate-400">Эффективность</div>
            <div className={cn(
              "text-sm font-bold",
              averageEfficiency >= 80 ? "text-emerald-600" :
              averageEfficiency >= 50 ? "text-amber-600" :
              "text-rose-600"
            )}>
              {averageEfficiency}%
            </div>
          </div>
        </div>
      )}

      {/* Контент */}
      <div className="flex-1">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-500">Смена не открыта</p>
            <p className="text-xs text-slate-400 mt-1">Нет активных сотрудников</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(staff || []).slice(0, 6).map((person) => (
              <StaffRow key={person.id} person={person} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface StaffRowProps {
  person: StaffLoadItem;
}

function StaffRow({ person }: StaffRowProps) {
  const initials = person.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Определяем цвет загрузки
  const loadColor = person.loadPercentage >= 80
    ? "text-rose-600 bg-rose-50 border-rose-100"
    : person.loadPercentage >= 50
    ? "text-amber-600 bg-amber-50 border-amber-100"
    : "text-emerald-600 bg-emerald-50 border-emerald-100";

  return (
    <Link
      href={`/dashboard/production/staff/${person.id}`}
      className={cn(
        "flex items-center justify-between p-2.5 rounded-xl border transition-all",
        "hover:shadow-sm hover:border-slate-200 bg-white border-slate-100",
        "group"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Аватар */}
        <Avatar className="w-9 h-9 border-2 border-white shadow-sm shrink-0">
          {person.avatarUrl && <AvatarImage src={person.avatarUrl} alt={person.name} />}
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Информация */}
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate leading-tight">
            {person.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {person.position && (
              <span className="text-xs font-medium text-slate-400 truncate">
                {person.position}
              </span>
            )}
            {person.lineName && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                <span className="text-xs font-medium text-primary truncate">
                  {person.lineName}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Метрики */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Активные задачи */}
        {(person.activeTasks ?? 0) > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-bold">{person.activeTasks}</span>
          </div>
        )}

        {/* Завершено сегодня */}
        {(person.completedToday ?? 0) > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <UserCheck className="w-3 h-3" />
            <span className="text-xs font-bold">{person.completedToday}</span>
          </div>
        )}

        {/* Загрузка */}
        <div className={cn(
          "px-2 py-1 rounded-lg text-xs font-bold border",
          loadColor
        )}>
          {person.loadPercentage}%
        </div>
      </div>
    </Link>
  );
}
