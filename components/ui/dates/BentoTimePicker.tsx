"use client";

import React, { useState, useEffect } from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { Typo } from "@/components/ui/typo";

/**
 * BentoTimePicker - Компонент выбора времени
 */
export function BentoTimePicker() {
  const [hours, setHours] = useState(13);
  const [minutes, setMinutes] = useState(40);
  const [isMounted, setIsMounted] = useState(false);
  const [hoursInput, setHoursInput] = useState<string | null>(null);
  const [minutesInput, setMinutesInput] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full max-w-[240px] h-[240px] bg-white rounded-card border border-gray-100 shadow-sm animate-pulse" />;

  const incrementHours = () => {
    const next = (hours + 1) % 24;
    setHours(next);
    setHoursInput(null);
  };
  const decrementHours = () => {
    const next = (hours - 1 + 24) % 24;
    setHours(next);
    setHoursInput(null);
  };
  const incrementMinutes = () => {
    const next = (minutes + 1) % 60;
    setMinutes(next);
    setMinutesInput(null);
  };
  const decrementMinutes = () => {
    const next = (minutes - 1 + 60) % 60;
    setMinutes(next);
    setMinutesInput(null);
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(-2);
    setHoursInput(val);
    const num = parseInt(val);
    if (!isNaN(num) && num < 24) setHours(num);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(-2);
    setMinutesInput(val);
    const num = parseInt(val);
    if (!isNaN(num) && num < 60) setMinutes(num);
  };

  const finalizeHours = () => setHoursInput(null);
  const finalizeMinutes = () => setMinutesInput(null);

  const NumberCol = ({ 
    value, 
    inputValue,
    label, 
    onInc, 
    onDec, 
    onChange,
    onBlur
  }: { 
    value: number; 
    inputValue: string | null;
    label: string; 
    onInc: () => void; 
    onDec: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
  }) => (
    <div className="flex flex-col items-center gap-2">
      <Typo as="span" className="text-[11px] font-black text-gray-400 mb-1">{label}</Typo>
      <button type="button" onClick={onInc} className="p-1 hover:bg-gray-100 rounded-lg transition-colors active:scale-90">
        <ChevronUp className="size-4 text-gray-400" />
      </button>
      
      <div className="size-16 bg-gray-950 rounded-element flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-gray-950/20 relative overflow-hidden group">
        <input
          type="text"
          inputMode="numeric"
          value={inputValue !== null ? inputValue : value.toString().padStart(2, '0')}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={(e) => e.target.select()}
          className="absolute inset-0 w-full h-full bg-transparent text-center focus:outline-none focus:ring-2 focus:ring-primary-base/50 rounded-element z-20 selection:bg-white/20 selection:text-white"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      <button type="button" onClick={onDec} className="p-1 hover:bg-gray-100 rounded-lg transition-colors active:scale-90">
        <ChevronDown className="size-4 text-gray-400" />
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-[240px] bg-white rounded-card border border-gray-100 shadow-crm-md p-6 relative group overflow-hidden transition-colors hover:border-slate-200">
      <div className="flex items-center gap-2 mb-6 px-1">
         <div className="size-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
            <Clock className="size-4" />
         </div>
         <Typo as="h4" className="text-[13px] font-black text-slate-900 tracking-wide leading-none">Выбрать время</Typo>
      </div>

      <div className="flex items-center justify-center gap-3 relative z-10">
         <NumberCol value={hours} inputValue={hoursInput} label="Часы" onInc={incrementHours} onDec={decrementHours} onChange={handleHoursChange} onBlur={finalizeHours} />
         <Typo as="div" className="pt-8 text-2xl font-black text-gray-300">:</Typo>
         <NumberCol value={minutes} inputValue={minutesInput} label="Минуты" onInc={incrementMinutes} onDec={decrementMinutes} onChange={handleMinutesChange} onBlur={finalizeMinutes} />
      </div>


      
      {/* Decorative Blur */}
      <div className="absolute -top-10 -right-10 size-32 bg-primary-base/5 rounded-full blur-2xl group-hover:bg-primary-base/10 transition-colors duration-700" />
      
      <style jsx>{`
        input::selection {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
      `}</style>
    </div>
  );
}
