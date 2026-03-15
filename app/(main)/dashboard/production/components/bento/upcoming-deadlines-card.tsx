"use client";

import Link from "next/link";
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from "date-fns";
import { ru } from "date-fns/locale";
import { AlertTriangle, ArrowRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import type { CalendarDeadline } from "../../types";

interface UpcomingDeadlinesCardProps {
  deadlines: CalendarDeadline[];
  className?: string;
}

export function UpcomingDeadlinesCard({ deadlines, className }: UpcomingDeadlinesCardProps) {
  // Сортируем по дате и берём ближайшие 7 дней
  const upcomingDeadlines = deadlines
    .filter((d) => {
      const date = new Date(d.date);
      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return date >= now && date <= weekFromNow;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const hasData = upcomingDeadlines.length > 0;
  const totalOrders = upcomingDeadlines.reduce((acc, d) => acc + (d.ordersCount ?? d.count), 0);

  return (
    <div className={cn("crm-card flex flex-col", className)}>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ближайшие дедлайны</h3>
            <p className="text-xs font-medium text-slate-400">
              {hasData
                ? `${totalOrders} ${pluralize(totalOrders, "заказ", "заказа", "заказов")} на этой неделе`
                : "Нет дедлайнов на этой неделе"}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/production/tasks?view=calendar"
          className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          <span>Календарь</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Контент */}
      <div className="flex-1">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-sm font-bold text-emerald-600">Свободная неделя</p>
            <p className="text-xs text-slate-400 mt-1">Нет срочных дедлайнов</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingDeadlines.map((deadline) => (
              <DeadlineRow key={deadline.date} deadline={deadline} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface DeadlineRowProps {
  deadline: CalendarDeadline;
}

function DeadlineRow({ deadline }: DeadlineRowProps) {
  const date = new Date(deadline.date);
  const isDateToday = isToday(date);
  const isDateTomorrow = isTomorrow(date);
  const isOverdue = isPast(date) && !isDateToday;
  const priorities = deadline.priorities ?? { high: 0, medium: 0, low: 0 };
  const hasHighPriority = priorities.high > 0;

  const getDateLabel = () => {
    if (isDateToday) return "Сегодня";
    if (isDateTomorrow) return "Завтра";
    return format(date, "d MMMM", { locale: ru });
  };

  const getDateStyle = () => {
    if (isOverdue) return "bg-rose-100 text-rose-700 border-rose-200";
    if (isDateToday) return "bg-amber-100 text-amber-700 border-amber-200";
    if (isDateTomorrow) return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  return (
    <Link
      href={`/dashboard/production/tasks?dueDate=${deadline.date}`}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all",
        "hover:shadow-md hover:-translate-y-0.5 group",
        isOverdue
          ? "bg-rose-50/50 border-rose-200"
          : isDateToday
          ? "bg-amber-50/50 border-amber-200"
          : "bg-white border-slate-200"
      )}
    >
      {/* Дата */}
      <div className={cn(
        "px-3 py-2 rounded-lg border text-center shrink-0 min-w-[80px]",
        getDateStyle()
      )}>
        <div className="text-xs font-bold">{getDateLabel()}</div>
        {!isDateToday && !isDateTomorrow && (
          <div className="text-xs font-medium opacity-70">
            {format(date, "EEEEEE", { locale: ru })}
          </div>
        )}
      </div>

      {/* Информация */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">
            {deadline.ordersCount ?? deadline.count} {pluralize(deadline.ordersCount ?? deadline.count, "заказ", "заказа", "заказов")}
          </span>
          {hasHighPriority && (
            <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
              <AlertTriangle className="w-3 h-3" />
              {priorities.high} срочных
            </span>
          )}
        </div>
        <div className="text-xs font-medium text-slate-400 mt-0.5">
          {formatDistanceToNow(date, { addSuffix: true, locale: ru })}
        </div>
      </div>

      {/* Индикаторы приоритетов */}
      <div className="flex items-center gap-1 shrink-0">
        {priorities.high > 0 && (
          <div className="w-2 h-2 rounded-full bg-rose-500" />
        )}
        {priorities.medium > 0 && (
          <div className="w-2 h-2 rounded-full bg-amber-500" />
        )}
        {priorities.low > 0 && (
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        )}
      </div>

      {/* Стрелка */}
      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
    </Link>
  );
}
