"use client";

import React, { useState, useEffect } from "react";
import { Minus, Plus, Settings2, Activity, Zap } from "lucide-react";
import { 
  Select
} from "@/components/ui/select";
import { cn } from "../utils/cn";

const formatStyleOptions = [
  { id: "currency", title: "Currency (USD)" },
  { id: "percent", title: "Percentage (%)" },
  { id: "decimal", title: "Standard Decimal" },
  { id: "unit", title: "Unit (Miles)" },
];

const formatOptionsMap: Record<string, Intl.NumberFormatOptions> = {
  currency: { currency: "USD", style: "currency", maximumFractionDigits: 2 },
  decimal: { style: "decimal", maximumFractionDigits: 2 },
  percent: { style: "percent", maximumFractionDigits: 0 },
  unit: { style: "unit", unit: "mile", maximumFractionDigits: 0 },
};

function OptionNumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };
  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) onChange(val);
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 leading-none">{label}</label>
      <div className="flex items-center bg-white rounded-[2rem] border border-slate-100 shadow-premium overflow-hidden h-14 group/field focus-within:ring-4 focus-within:ring-primary-base/5 transition-all">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label={`Decrement ${label}`}
          className="p-3 w-14 h-full text-slate-300 hover:text-primary-base hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all shrink-0 active:scale-90"
        >
          <Minus className="w-5 h-5 mx-auto" />
        </button>
        <div className="w-px h-6 bg-slate-100 shrink-0" />
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={handleInputChange}
          onBlur={() => {
            if (value < min) onChange(min);
            if (value > max) onChange(max);
          }}
          className="flex-1 w-full bg-transparent text-center text-[11px] font-black text-slate-950 uppercase tracking-widest outline-none tabular-nums"
        />
        <div className="w-px h-6 bg-slate-100 shrink-0" />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label={`Increment ${label}`}
          className="p-3 w-14 h-full text-slate-300 hover:text-primary-base hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all shrink-0 active:scale-90"
        >
          <Plus className="w-5 h-5 mx-auto" />
        </button>
      </div>
    </div>
  );
}

export function InteractiveProgressDemo() {
  const [value, setValue] = useState(750);
  const [minValue, setMinValue] = useState(5);
  const [maxValue, setMaxValue] = useState(1002);
  const [format, setFormat] = useState<string>("currency");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const percentage = Math.max(0, Math.min(100, ((value - minValue) / (maxValue - minValue)) * 100));

  let formattedValue = "";
  try {
    const formatter = new Intl.NumberFormat("en-US", formatOptionsMap[format]);
    const formatInput = format === "percent" ? (value / 100) : value;
    formattedValue = formatter.format(formatInput);
  } catch (e) {
    formattedValue = String(value);
  }

  if (!isMounted) {
    return (
      <div className="w-full h-96 rounded-[48px] bg-slate-50 border border-slate-100 animate-pulse" />
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 md:flex-row md:items-stretch p-8 rounded-[3rem] bg-white border border-slate-100 shadow-premium overflow-hidden">
      {/* Left side: Progress Bar */}
      <div className="flex w-full flex-1 flex-col items-center justify-center py-10 md:py-0 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50">
        <div className="w-full max-w-[320px] space-y-6">
          <div className="flex items-end justify-between px-2">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Transmission</span>
              <div className="flex items-center gap-2">
                <Activity className="size-3 text-primary-base animate-pulse" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Link</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-black text-slate-950 tracking-widest tabular-nums ">
                {formattedValue}
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter opacity-50">Current Iteration</span>
            </div>
          </div>
          
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-white shadow-inner p-1 border border-slate-100">
            <div
              className="absolute left-1 top-1 h-[calc(100%-8px)] rounded-full bg-primary-base transition-all duration-700 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              style={{ width: `calc(${percentage}% - 8px)` }}
            />
          </div>

          <div className="flex justify-between px-2">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">{minValue}</span>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">{maxValue}</span>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-slate-100 md:h-auto md:w-px md:shrink-0" />

      {/* Right side: Options */}
      <div className="flex w-full max-w-[280px] mx-auto md:mx-0 flex-col gap-6 py-2">
        <div className="flex items-center gap-3 px-2 mb-2">
          <div className="size-8 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-xl shadow-black/20">
            <Settings2 className="size-4" />
          </div>
          <span className="text-[12px] font-black text-slate-950 uppercase tracking-[0.3em]">Module Config</span>
        </div>

        <OptionNumberField label="Operational Value" value={value} min={minValue} max={maxValue} onChange={(v) => setValue(v)}
        />

        <div className="grid grid-cols-2 gap-4">
          <OptionNumberField label="Min Boundary" value={minValue} min={0} max={maxValue - 1} onChange={(v) => {
              setMinValue(v);
              if (value < v) setValue(v);
            }}
          />

          <OptionNumberField label="Max Boundary" value={maxValue} min={minValue + 1} max={10000} onChange={(v) => {
              setMaxValue(v);
              if (value > v) setValue(v);
            }}
          />
        </div>

        <div className="flex flex-col gap-3 w-full">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 leading-none flex items-center gap-2">
            <Zap className="size-3" /> Output Format
          </label>
          <div className="relative">
            <Select options={formatStyleOptions} value={format} onChange={setFormat} className="w-full" triggerClassName="h-14 px-6 rounded-[2rem] border border-slate-100 bg-white shadow-premium text-[11px] font-black text-slate-950 uppercase tracking-widest hover:border-primary-base/30 transition-all outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

