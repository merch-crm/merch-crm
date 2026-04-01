"use client";

import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useIsClient } from "@/hooks/use-is-client";

interface MiniCalendarProps {
  /** Текущая дата */
  currentDate?: Date;
  /** Даты с маркерами */
  markedDates?: Map<string, { count: number; color: string }>;
  /** Callback при клике на дату */
  onDateClick?: (date: Date) => void;
  /** Дополнительный класс */
  className?: string;
}

const WEEKDAYS_SHORT = ["П", "В", "С", "Ч", "П", "С", "В"];

export function MiniCalendar({
  currentDate,
  markedDates = new Map(),
  onDateClick,
  className,
}: MiniCalendarProps) {
  const isClient = useIsClient();
  const effectiveDate = useMemo(() => currentDate || new Date(), [currentDate]); // suppressHydrationWarning

  const calendarDays = useMemo(() => {
    const start = startOfMonth(effectiveDate);
    const end = endOfMonth(effectiveDate);
    const days = eachDayOfInterval({ start, end });
    const startDayOfWeek = getDay(start);
    const emptyDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    return { days, emptyDays };
  }, [effectiveDate]);

  return (
    <div className={cn("", className)}>
      {/* Дни недели */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAYS_SHORT.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className={cn(
              "text-center text-xs font-bold py-0.5",
              index >= 5 ? "text-slate-300" : "text-slate-400"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Дни */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: calendarDays.emptyDays }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {calendarDays.days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd", { locale: ru });
          const marker = markedDates.get(dateStr);
          const isCurrentDay = isClient ? isToday(day) : false;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onDateClick?.(day)}
              className={cn(
                "aspect-square rounded flex items-center justify-center relative",
                "text-xs font-bold transition-colors",
                isCurrentDay
                  ? "bg-primary text-white"
                  : "text-slate-500 hover:bg-slate-100",
                marker && !isCurrentDay && "bg-slate-50"
              )}
            >
              {format(day, "d", { locale: ru })}
              {marker && (
                <div
                  className={cn(
                    "absolute bottom-0.5 w-1 h-1 rounded-full",
                    marker.color || "bg-primary"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
