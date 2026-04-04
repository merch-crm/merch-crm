"use client";

import React, { useState, useRef, useEffect } from "react";
import { Shuffle, Pipette, Check } from "lucide-react";
import { LuminColorPicker } from "@/components/ui/lumin-color-picker";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/components/library/custom/utils/cn";

interface EyeDropper {
  open: () => Promise<{ sRGBHex: string }>;
}

declare global {
  interface Window {
    EyeDropper: {
      new (): EyeDropper;
    };
  }
}

/**
 * 1. Custom Render Function
 */
const swatchColors = ["#F43F5E", "#D946EF", "#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#84CC16"];

export function CustomRenderFunction() {
  const [selectedColor, setSelectedColor] = useState(swatchColors[0]);

  return (
    <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Select a color swatch">
      {swatchColors.map((color) => {
        const isSelected = selectedColor === color;
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setSelectedColor(color)}
            className="relative size-[34px] flex-shrink-0 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2"
            style={{ 
              backgroundColor: color,
              // Используем inset тени, чтобы выделенное кольцо рисовалось *внутри* исходного размера кнопки.
              boxShadow: isSelected ? `inset 0 0 0 1.5px ${color}, inset 0 0 0 4px #F4F4F5` : 'none'
            }}
            title={color}
            aria-label={`Select color ${color}`}
          >
            {isSelected && (
              <Check className="size-[14px] text-white" strokeWidth={3} />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 4. Compact Color Picker Snippet for UI Kit
 */
export function CompactColorPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [hexColor, setHexColor] = useState("#3B82F6");
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent | MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside, true);
    }
    return () => document.removeEventListener('pointerdown', handleClickOutside, true);
  }, [isOpen]);

  const openEyeDropper = async () => {
    if (!('EyeDropper' in window)) {
      toast("Pipette (EyeDropper API) is not supported by your browser", "warning");
      return;
    }
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      setHexColor(result.sRGBHex.toUpperCase());
    } catch (e) {
      // User canceled
    }
  };

  if (!isMounted) return null;

  return (
    <div 
      className="relative flex flex-col items-center pt-12 px-4 transition-all duration-300"
      style={{ paddingBottom: isOpen ? '420px' : '24px' }}
    >
      <div 
        ref={containerRef}
        className="flex items-center justify-between bg-white p-[10px] rounded-[20px] border border-slate-100 shadow-crm-md overflow-visible z-20 relative w-[260px] group/picker hover:border-primary-base/30 transition-colors"
      >
        
        {/* Color button + Text container */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            aria-label="Toggle color picker"
            onClick={() => setIsOpen(!isOpen)}
            className="size-10 flex-shrink-0 rounded-[10px] border border-black/5 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2 transition-transform active:scale-95" 
            style={{ backgroundColor: hexColor }}
          />
          <div className="flex flex-col min-w-[70px]">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Color</span>
            <span className="text-[15px] font-black text-slate-900 uppercase tracking-tighter leading-none tabular-nums">{hexColor}</span>
          </div>
        </div>

        {/* Separator + Pipette */}
        <div className="flex items-center pr-1">
          <div className="w-px h-8 bg-slate-100 mx-2" />
          <button 
            type="button"
            aria-label="Pick color from screen"
            onClick={openEyeDropper}
            className="size-10 flex-shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary-base hover:bg-primary-base/5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
          >
            <Pipette size={18} strokeWidth={2.5} />
          </button>
        </div>

        {isOpen && (
          <div 
            className="absolute top-[70px] left-0 z-50 animate-in fade-in zoom-in-95 duration-200 shadow-2xl rounded-3xl"
          >
            <LuminColorPicker 
              color={hexColor} 
              onChange={setHexColor} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
