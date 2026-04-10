'use client';

import React, { useState, useEffect, useRef } from "react";
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, isSameDay, isAfter, isBefore } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectionPhase = 'idle' | 'selecting-start' | 'selecting-end';

export function BentoDateRange() {
  const [range, setRange] = useState<{ from: Date; to: Date } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [picker, setPicker] = useState<{
    isOpen: boolean;
    phase: SelectionPhase;
    tempFrom: Date | null;
    hoveredDate: Date | null;
    viewDate: Date | null;
  }>({
    isOpen: false,
    phase: 'idle',
    tempFrom: null,
    hoveredDate: null,
    viewDate: null
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const from = new Date(); // audit-ok: hydration
    const to = addDays(from, 14);
    setRange({ from, to });
    setPicker(prev => ({ ...prev, viewDate: from }));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPicker(prev => ({ ...prev, isOpen: false, phase: 'idle', tempFrom: null }));
      }
    };
    if (picker.isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [picker.isOpen]);

  if (!isMounted || !range || !picker.viewDate) {
    return (
      <div className="w-full max-w-[340px] h-48 bg-white rounded-card border border-gray-100 shadow-sm animate-pulse p-6">
        <div className="flex items-center justify-between mb-6">
           <div className="h-4 w-32 bg-gray-50 rounded-full" />
           <div className="h-4 w-16 bg-gray-50 rounded-full" />
        </div>
        <div className="h-12 bg-gray-50 rounded-element w-full mb-4" />
        <div className="h-4 w-24 bg-gray-50 rounded-full" />
      </div>
    );
  }

  const daysDiff = differenceInDays(range.to, range.from);

  const handleOpenPicker = (target: 'start' | 'end') => {
    setPicker(prev => ({
      ...prev,
      isOpen: true,
      phase: 'selecting-start',
      tempFrom: null,
      viewDate: target === 'start' ? range.from : range.to
    }));
  };

  const handleDayClick = (day: Date) => {
    if (picker.phase === 'selecting-start' || picker.phase === 'idle') {
      setPicker(prev => ({ ...prev, tempFrom: day, phase: 'selecting-end' }));
    } else if (picker.phase === 'selecting-end' && picker.tempFrom) {
      const from = isBefore(day, picker.tempFrom) ? day : picker.tempFrom;
      const to = isAfter(day, picker.tempFrom) ? day : picker.tempFrom;
      setRange({ from, to });
      setPicker(prev => ({ ...prev, isOpen: false, phase: 'idle', tempFrom: null }));
    }
  };

  // Calendar grid
  const monthStart = startOfMonth(picker.viewDate);
  const monthEnd = endOfMonth(picker.viewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = (monthStart.getDay() + 6) % 7;

  const isInRange = (day: Date) => {
    if (picker.phase === 'selecting-end' && picker.tempFrom && picker.hoveredDate) {
      const from = isBefore(picker.hoveredDate, picker.tempFrom) ? picker.hoveredDate : picker.tempFrom;
      const to = isAfter(picker.hoveredDate, picker.tempFrom) ? picker.hoveredDate : picker.tempFrom;
      return isWithinInterval(day, { start: from, end: to });
    }
    return isWithinInterval(day, { start: range.from, end: range.to });
  };

  const isRangeStart = (day: Date) => {
    if (picker.phase === 'selecting-end' && picker.tempFrom) return isSameDay(day, picker.tempFrom);
    return isSameDay(day, range.from);
  };

  const isRangeEnd = (day: Date) => {
    if (picker.phase === 'selecting-end' && picker.tempFrom && picker.hoveredDate) {
      const end = isAfter(picker.hoveredDate, picker.tempFrom) ? picker.hoveredDate : picker.tempFrom;
      return isSameDay(day, end);
    }
    return isSameDay(day, range.to);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Card */}
      <div
        role="region"
        aria-label="Active period overview"
        className="w-full max-w-[340px] bg-white rounded-card border border-gray-100 shadow-crm-md p-6 flex flex-col gap-3 group overflow-hidden relative hover:border-emerald-500/30 transition-colors"
      >
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                 <Calendar className="size-4" />
              </div>
              <h4 className="text-[11px] font-black text-slate-900 tracking-wide leading-none">Активный период</h4>
           </div>
           <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100 tracking-wider shadow-sm shadow-emerald-500/5">
              Активно
           </div>
        </div>

        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3 py-2 border-y border-slate-50">
           <button
             type="button"
             onClick={() => handleOpenPicker('start')}
             className="flex flex-col gap-1 items-start cursor-pointer hover:bg-emerald-50/50 -m-2 p-2 rounded-xl transition-colors"
           >
              <span className="text-[10px] font-black text-emerald-500 tracking-wide leading-none">Начало</span>
              <span className="text-[11px] font-black text-slate-900 tracking-tight">{format(range.from, "dd MMM yyyy", { locale: ru })}</span>
           </button>
           <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-all shadow-inner group-hover:scale-110">
              <ArrowRight className="size-4" />
           </div>
           <button
             type="button"
             onClick={() => handleOpenPicker('end')}
             className="flex flex-col gap-1 items-end cursor-pointer hover:bg-emerald-50/50 -m-2 p-2 rounded-xl transition-colors"
           >
              <span className="text-[10px] font-black text-emerald-500 tracking-wide leading-none">Завершение</span>
              <span className="text-[11px] font-black text-slate-900 tracking-tight">{format(range.to, "dd MMM yyyy", { locale: ru })}</span>
           </button>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-black tracking-wide">
           <div className="flex items-center gap-1.5 text-slate-900">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span>{daysDiff} Дней</span>
           </div>
        </div>

        <div className="absolute -right-10 -bottom-10 size-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
      </div>

      {/* Calendar Popover */}
      {picker.isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-[280px] bg-white rounded-element border border-gray-100 shadow-xl p-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-black text-slate-900 capitalize">
              {format(picker.viewDate, "LLLL yyyy", { locale: ru })}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPicker(prev => ({ ...prev, viewDate: prev.viewDate ? new Date(prev.viewDate.getFullYear(), prev.viewDate.getMonth() - 1, 1) : null }))}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors text-[11px] font-black"
              >←</button>
              <button
                type="button"
                onClick={() => setPicker(prev => ({ ...prev, viewDate: prev.viewDate ? new Date(prev.viewDate.getFullYear(), prev.viewDate.getMonth() + 1, 1) : null }))}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors text-[11px] font-black"
              >→</button>
            </div>
          </div>

          {/* Hint */}
          <div className="text-[10px] font-bold text-slate-400 text-center mb-1">
            {picker.phase === 'selecting-start' || picker.phase === 'idle' ? 'Выберите начало' : 'Выберите конец'}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {['П', 'В', 'С', 'Ч', 'П', 'С', 'В'].map((d, i) => (
              <span key={i} className="text-[9px] font-black text-slate-400 text-center py-1">{d}</span>
            ))}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {days.map((day, i) => {
              const inRange = isInRange(day);
              const rangeStart = isRangeStart(day);
              const rangeEnd = isRangeEnd(day);

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  onMouseEnter={() => setPicker(prev => ({ ...prev, hoveredDate: day }))}
                  className={cn(
                    "aspect-square flex items-center justify-center text-[10px] font-black transition-all cursor-pointer relative",
                    rangeStart || rangeEnd
                      ? "bg-emerald-500 text-white rounded-lg z-10 shadow-sm"
                      : inRange
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-700 hover:bg-slate-50 rounded-lg",
                    inRange && !rangeStart && !rangeEnd && "rounded-none",
                    rangeStart && inRange && "rounded-r-none",
                    rangeEnd && inRange && "rounded-l-none",
                  )}
                >
                  {format(day, "d", { locale: ru })}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
