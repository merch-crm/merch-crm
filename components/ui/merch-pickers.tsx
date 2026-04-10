"use client";

import { useState } from "react";
import { ColorPicker } from "@/components/ui/color-picker";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Palette, MousePointer2 } from "lucide-react";

// --- Components -----------------------------------------------------------

const PRESET_COLORS = [
  "#F43F5E", // Rose
  "#D946EF", // Fuchsia
  "#8B5CF6", // Violet
  "#3B82F6", // Blue
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#84CC16"  // Lime
];

/**
 * Premium version of MerchPickersWithFields.
 * Aligned with the high-fidelity "Modern Industrial Craft" standard.
 */
export function MerchPickersWithFields() {
  const [color, setColor] = useState("#73C242");

  return (
    <div className="flex flex-col gap-6 w-full max-w-[400px]">
      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="size-4 text-zinc-900" strokeWidth={2.5} />
          <Label className="text-[14px] font-bold text-zinc-900 tracking-tight uppercase tracking-widest">
            Конфигуратор цвета
          </Label>
        </div>
        <p className="text-[13px] text-zinc-400 font-medium leading-relaxed">
          Используйте палитру для выбора фирменного цвета вашего мерча.
        </p>
      </div>
      
      <div className="p-8 rounded-[28px] border border-zinc-100 bg-[#f8f9fa] shadow-sm flex flex-col items-center gap-6">
        <ColorPicker color={color} onChange={setColor} className="shadow-[0_8px_30px_rgba(0,0,0,0.08)] bg-white p-1 rounded-[22px]" />
        
        <div className="w-full flex items-center gap-4 p-4 rounded-[20px] border border-zinc-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div 
            className="size-11 rounded-xl border border-zinc-100 shadow-sm shrink-0 transition-all duration-300 transform scale-100 hover:scale-105" 
            style={{ backgroundColor: color }} 
          />
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-zinc-900 tracking-tight">ВЫБРАННЫЙ HEX</span>
            <span className="text-[14px] font-mono text-zinc-400 font-black uppercase tracking-tighter">{color}</span>
          </div>
          <button 
            type="button"
            className="ml-auto size-9 flex items-center justify-center rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(color);
            }}
          >
            <MousePointer2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Premium version of MerchPickersCustomRender.
 */
export function MerchPickersCustomRender() {
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  return (
    <div className="flex flex-col gap-4 w-full max-w-[400px]">
      <div className="flex items-center gap-2 px-1">
        <Label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest">
          Быстрые пресеты
        </Label>
        <div className="h-px bg-zinc-100 flex-1 ml-1" />
      </div>
      
      <div className="flex flex-wrap gap-3 p-6 rounded-[28px] border border-zinc-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={cn(
              "size-10 rounded-[14px] border-2 transition-all duration-500 ease-in-out relative group",
              selectedColor === color 
                ? "border-zinc-900 shadow-lg scale-110" 
                : "border-transparent hover:border-zinc-100 hover:scale-105"
            )}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
          >
            <div className={cn(
              "absolute inset-0 size-full flex items-center justify-center transition-opacity duration-300",
              selectedColor === color ? "opacity-100" : "opacity-0"
            )}>
              <div className="size-2 rounded-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.2)]" />
            </div>
            
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
              {color}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
