'use client';

import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, setMonth, setYear } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Typo } from "@/components/ui/typo";

type ViewMode = 'calendar' | 'months' | 'years';

const MONTH_NAMES_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export function BentoCalendar() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [view, setView] = useState<ViewMode>('calendar');

  useEffect(() => {
    setIsMounted(true);
    setCurrentDate(new Date()); // audit-ok: hydration
  }, []);

  if (!isMounted || !currentDate) {
    return (
      <div className="w-full max-w-[280px] h-[340px] bg-white rounded-card border border-gray-100 shadow-sm animate-pulse p-6">
        <div className="flex items-center justify-between mb-6">
           <div className="h-4 w-24 bg-gray-50 rounded-full" />
           <div className="flex gap-2">
              <div className="size-6 bg-gray-50 rounded-lg" />
              <div className="size-6 bg-gray-50 rounded-lg" />
           </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mt-4">
           {Array.from({ length: 35 }).map((_, i) => (
             <div key={i} className="aspect-square bg-gray-50 rounded-xl" />
           ))}
        </div>
      </div>
    );
  }

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const yearRangeStart = Math.floor(currentYear / 12) * 12;

  const handlePrev = () => {
    if (view === 'calendar') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'years') setCurrentDate(setYear(currentDate, currentYear - 12));
  };

  const handleNext = () => {
    if (view === 'calendar') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'years') setCurrentDate(setYear(currentDate, currentYear + 12));
  };

  const handleSelectMonth = (monthIndex: number) => {
    setCurrentDate(setMonth(currentDate, monthIndex));
    setView('calendar');
  };

  const handleSelectYear = (year: number) => {
    setCurrentDate(setYear(currentDate, year));
    setView('months');
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = (monthStart.getDay() + 6) % 7; // Monday = 0

  return (
    <div className="w-full max-w-[280px] bg-white rounded-card border border-gray-100 shadow-crm-md p-5 flex flex-col gap-3 group transition-colors hover:border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
         <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
               <CalendarIcon className="size-4" />
            </div>
            <button
              type="button"
              onClick={() => setView(view === 'years' ? 'calendar' : 'years')}
              className={cn(
                "text-[13px] font-black tracking-wide leading-none transition-colors cursor-pointer hover:text-primary-base",
                view === 'years' ? "text-primary-base" : "text-slate-900"
              )}
            >
              <Typo as="span">
                {view === 'years' ? `${yearRangeStart}–${yearRangeStart + 11}` : format(currentDate, "yyyy", { locale: ru })}
              </Typo>
            </button>
         </div>
         <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous"
              onClick={handlePrev}
              className={cn(
                "p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors focus:ring-1 focus:ring-primary-base outline-none",
                view === 'months' && "invisible"
              )}
            >
               <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={handleNext}
              className={cn(
                "p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors focus:ring-1 focus:ring-primary-base outline-none",
                view === 'months' && "invisible"
              )}
            >
               <ChevronRight className="size-4" />
            </button>
         </div>
      </div>

      {/* Month label (clickable) */}
      {view === 'calendar' && (
        <div className="flex items-center px-1">
          <button
            type="button"
            onClick={() => setView('months')}
            className="text-[11px] font-black text-slate-950 tracking-wider hover:text-primary-base transition-colors cursor-pointer capitalize"
          >
            <Typo as="span">
              {format(currentDate, "LLLL", { locale: ru })}
            </Typo>
          </button>
        </div>
      )}

      {/* === CALENDAR VIEW === */}
      {view === 'calendar' && (
        <div className="grid grid-cols-7 gap-1">
          {['П', 'В', 'С', 'Ч', 'П', 'С', 'В'].map((day, i) => (
            <Typo as="span" key={i} className="text-[10px] font-black text-slate-400 text-center py-1 tracking-wide">{day}</Typo>
          ))}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days?.map((day, i) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const todayDay = isToday(day);
            return (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedDate(day)}
              aria-label={format(day, "d MMMM yyyy", { locale: ru })}
              className={cn(
                "aspect-square flex items-center justify-center text-[11px] font-black rounded-xl transition-all cursor-pointer border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2 relative",
                isSelected
                  ? "bg-primary-base text-white shadow-md scale-105"
                  : todayDay
                    ? "ring-2 ring-slate-100 text-primary-base"
                    : "hover:bg-slate-50 hover:border-slate-100 text-slate-900",
                !isSameMonth(day, currentDate) && "text-slate-200 pointer-events-none"
              )}
            >
              <Typo as="span" className="relative z-10">{format(day, "d", { locale: ru })}</Typo>
            </button>
            );
          })}
        </div>
      )}

      {/* === MONTHS VIEW === */}
      {view === 'months' && (
        <div className="grid grid-cols-3 gap-2 py-2">
          {MONTH_NAMES_SHORT.map((name, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectMonth(i)}
              className={cn(
                "py-3 rounded-xl text-[11px] font-black tracking-wide transition-all cursor-pointer border border-transparent",
                i === currentMonth
                  ? "bg-primary-base text-white shadow-md"
                  : "text-slate-700 hover:bg-slate-50 hover:border-slate-100"
              )}
            >
              <Typo as="span">{name}</Typo>
            </button>
          ))}
        </div>
      )}

      {/* === YEARS VIEW === */}
      {view === 'years' && (
        <div className="grid grid-cols-3 gap-2 py-2">
          {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => handleSelectYear(year)}
              className={cn(
                "py-3 rounded-xl text-[11px] font-black tracking-wide transition-all cursor-pointer border border-transparent",
                year === currentYear
                  ? "bg-primary-base text-white shadow-md"
                  : "text-slate-700 hover:bg-slate-50 hover:border-slate-100"
              )}
            >
              <Typo as="span">{year}</Typo>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
