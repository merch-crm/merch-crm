"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, getDay } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DeadlineCalendarData, CalendarDeadline, CalendarOrder } from "../../types";

interface DeadlineCalendarCardProps {
  data: DeadlineCalendarData | null;
  onMonthChange?: (month: number, year: number) => void;
  className?: string;
}

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function DeadlineCalendarCard({ 
  data, 
  onMonthChange,
  className 
}: DeadlineCalendarCardProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (data && typeof data.year === 'number' && typeof data.month === 'number') {
      return new Date(data.year, data.month, 1);
    }
    return new Date();
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Получаем дни месяца
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    // Добавляем пустые дни в начале для выравнивания по дням недели
    const startDayOfWeek = getDay(start);
    // Преобразуем воскресенье (0) в 7, чтобы неделя начиналась с понедельника
    const emptyDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    return { days, emptyDays };
  }, [currentDate]);

  // Создаём карту дедлайнов для быстрого доступа
  const deadlinesMap = useMemo(() => {
    const map = new Map<string, CalendarDeadline>();
    if (data?.deadlines) {
      data.deadlines.forEach((d) => {
        map.set(d.date, d);
      });
    }
    return map;
  }, [data?.deadlines]);

  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate.getMonth(), newDate.getFullYear());
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
    onMonthChange?.(newDate.getMonth(), newDate.getFullYear());
  };

  const handleDayClick = (dateStr: string) => {
    if (deadlinesMap.has(dateStr)) {
      setSelectedDate(selectedDate === dateStr ? null : dateStr);
    }
  };

  const totalOrders = data?.totalOrders ?? 0;

  return (
    <div className={cn("crm-card flex flex-col", className)}>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Календарь дедлайнов</h3>
            <p className="text-xs font-medium text-slate-400">
              {totalOrders} {pluralize(totalOrders, "заказ", "заказа", "заказов")} в этом месяце
            </p>
          </div>
        </div>

        {/* Навигация по месяцам */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-700 min-w-[100px] text-center">
            {format(currentDate, "LLLL yyyy", { locale: ru })}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Календарь */}
      <div className="flex-1">
        {/* Дни недели */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day, index) => (
            <div
              key={day}
              className={cn(
                "text-center text-xs font-bold py-1",
                index >= 5 ? "text-slate-400" : "text-slate-500"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Дни месяца */}
        <div className="grid grid-cols-7 gap-1">
          {/* Пустые ячейки */}
          {Array.from({ length: calendarDays.emptyDays }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Дни */}
          {calendarDays.days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd", { locale: ru });
            const deadline = deadlinesMap.get(dateStr);
            const hasDeadline = !!deadline;
            const isCurrentDay = isToday(day);
            const isPast = day < new Date() && !isCurrentDay;
            const isSelected = selectedDate === dateStr;
            const dayOfWeek = getDay(day);
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            return (
              <CalendarDay
                key={dateStr}
                day={day}
                dateStr={dateStr}
                deadline={deadline}
                hasDeadline={hasDeadline}
                isCurrentDay={isCurrentDay}
                isPast={isPast}
                isSelected={isSelected}
                isWeekend={isWeekend}
                onClick={() => handleDayClick(dateStr)}
              />
            );
          })}
        </div>
      </div>

      {/* Легенда */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-xs font-bold text-slate-400">Высокий</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-slate-400">Средний</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-400">Низкий</span>
          </div>
        </div>

        <Link
          href="/dashboard/production/tasks?view=calendar"
          className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          <span>Полный календарь</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Компонент дня календаря
// ----------------------------------------------------------------------------

interface CalendarDayProps {
  day: Date;
  dateStr: string;
  deadline: CalendarDeadline | undefined;
  hasDeadline: boolean;
  isCurrentDay: boolean;
  isPast: boolean;
  isSelected: boolean;
  isWeekend: boolean;
  onClick: () => void;
}

function CalendarDay({
  day,

  deadline,
  hasDeadline,
  isCurrentDay,
  isPast,
  isSelected,
  isWeekend,
  onClick,
}: CalendarDayProps) {
  const dayNumber = format(day, "d", { locale: ru });

  // Определяем цвет индикатора по приоритету
  const getIndicatorColor = () => {
    if (!deadline || !deadline.priorities) return "bg-slate-400";
    if (deadline.priorities.high > 0) return "bg-rose-500";
    if (deadline.priorities.medium > 0) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const indicatorColor = getIndicatorColor();

  const content = (
    <button
      type="button"
      onClick={onClick}
      disabled={!hasDeadline}
      className={cn(
        "aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all",
        "text-sm font-bold",
        // Базовые стили
        !hasDeadline && !isCurrentDay && "text-slate-400",
        isWeekend && !hasDeadline && !isCurrentDay && "text-slate-300",
        isPast && !hasDeadline && "text-slate-300",
        // Текущий день
        isCurrentDay && "bg-primary text-white shadow-md shadow-primary/20",
        // Есть дедлайн
        hasDeadline && !isCurrentDay && "bg-slate-100 text-slate-900 hover:bg-slate-200 cursor-pointer",
        hasDeadline && isPast && !isCurrentDay && "bg-rose-50 text-rose-700",
        // Выбран
        isSelected && "ring-2 ring-primary ring-offset-1"
      )}
    >
      <span>{dayNumber}</span>
      
      {/* Индикатор дедлайна */}
      {hasDeadline && !isCurrentDay && (
        <div className="absolute bottom-1 flex items-center gap-0.5">
          {deadline && (deadline.ordersCount ?? 0) <= 3 ? (
            // Показываем точки для малого количества
            Array.from({ length: Math.min(deadline.ordersCount ?? 0, 3) }).map((_, i) => (
              <div
                key={i}
                className={cn("w-1 h-1 rounded-full", indicatorColor)}
              />
            ))
          ) : (
            // Показываем число для большого количества
            <span className={cn(
              "text-xs font-bold px-1 rounded",
              deadline!.priorities && deadline!.priorities.high > 0 ? "text-rose-600" : "text-slate-500"
            )}>
              {deadline!.ordersCount}
            </span>
          )}
        </div>
      )}

      {/* Индикатор текущего дня с дедлайнами */}
      {isCurrentDay && hasDeadline && deadline && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white">
          {deadline.ordersCount ?? 0}
        </div>
      )}
    </button>
  );

  // Если есть дедлайн, оборачиваем в Popover
  if (hasDeadline && deadline) {
    return (
      <Popover open={isSelected} onOpenChange={(open) => !open && onClick()}>
        <PopoverTrigger asChild>
          {content}
        </PopoverTrigger>
        <PopoverContent 
          className="w-72 p-0" 
          align="center"
          sideOffset={4}
        >
          <DeadlinePopover deadline={deadline} />
        </PopoverContent>
      </Popover>
    );
  }

  return content;
}

// ----------------------------------------------------------------------------
// Попап с деталями дедлайна
// ----------------------------------------------------------------------------

interface DeadlinePopoverProps {
  deadline: CalendarDeadline;
}

function DeadlinePopover({ deadline }: DeadlinePopoverProps) {
  const formattedDate = format(new Date(deadline.date), "d MMMM yyyy", { locale: ru });

  return (
    <div>
      {/* Заголовок */}
      <div className="p-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">{formattedDate}</h4>
          <span className="text-xs font-bold text-slate-500">
            {deadline.ordersCount ?? 0} {pluralize(deadline.ordersCount ?? 0, "заказ", "заказа", "заказов")}
          </span>
        </div>
        
        {/* Приоритеты */}
        {deadline.priorities && (
          <div className="flex items-center gap-2 mt-2">
            {deadline.priorities.high > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                <AlertTriangle className="w-3 h-3" />
                {deadline.priorities.high} срочных
              </span>
            )}
            {deadline.priorities.medium > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                {deadline.priorities.medium} средних
              </span>
            )}
            {deadline.priorities.low > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                {deadline.priorities.low} обычных
              </span>
            )}
          </div>
        )}
      </div>

      {/* Список заказов */}
      <div className="max-h-[200px] overflow-y-auto">
        {(deadline.orders || []).slice(0, 5).map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
        
        {(deadline.orders?.length || 0) > 5 && (
          <div className="p-2 text-center">
            <span className="text-xs font-medium text-slate-400">
              и ещё {(deadline.orders?.length || 0) - 5}...
            </span>
          </div>
        )}
      </div>

      {/* Ссылка */}
      <div className="p-2 border-t border-slate-100">
        <Link
          href={`/dashboard/production/tasks?dueDate=${deadline.date}`}
          className="flex items-center justify-center gap-1 py-2 rounded-lg bg-slate-50 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <span>Показать все</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

interface OrderRowProps {
  order: CalendarOrder;
}

function OrderRow({ order }: OrderRowProps) {
  const priorityStyles: Record<string, string> = {
    urgent: "bg-rose-50 border-rose-200 text-rose-700",
    high: "bg-rose-50 border-rose-200 text-rose-700",
    normal: "bg-amber-50 border-amber-200 text-amber-700",
    low: "bg-slate-50 border-slate-200 text-slate-600",
  };

  const currentPriorityStyle = (order.priority && priorityStyles[order.priority]) || "bg-slate-50 border-slate-200 text-slate-600";

  return (
    <Link
      href={`/dashboard/production/tasks/${order.id}`}
      className="flex items-center gap-3 p-2 hover:bg-slate-50 transition-colors"
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center border shrink-0",
        currentPriorityStyle
      )}>
        {order.priority === "high" || order.priority === "urgent" ? (
          <AlertTriangle className="w-4 h-4" />
        ) : (
          <Clock className="w-4 h-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900 truncate">
          Заказ #{order.number}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">
            {order.client || "Без клиента"}
          </span>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
    </Link>
  );
}
