"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Shuffle } from "lucide-react";

// --- Утилиты для конвертации цветов ---

function hsvToHex(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) => v - v * s * Math.max(0, Math.min(k(n), 4 - k(n), 1));
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`.toUpperCase();
}

function hexToHsv(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d === 0) h = 0;
  else if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else if (max === b) h = (r - g) / d + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s: s * 100, v: v * 100 };
}

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E", 
  "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899", "#F43F5E"
];

export interface LuminColorPickerProps {
  color?: string;
  onChange?: (color: string) => void;
  className?: string;
}

export function LuminColorPicker({ color = "#73C242", onChange, className }: LuminColorPickerProps) {
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const [internalHex, setInternalHex] = useState(color);
  const [prevColorProp, setPrevColorProp] = useState(color);

  const [isMounted, setIsMounted] = useState(false);

  const areaRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  const handleHsvChange = useCallback((updater: (prev: {h: number, s: number, v: number}) => {h: number, s: number, v: number}) => {
    setHsv(prev => {
      const next = updater(prev);
      const hex = hsvToHex(next.h, next.s, next.v);
      setInternalHex(hex);
      onChange?.(hex);
      return next;
    });
  }, [onChange]);

  useEffect(() => {
    setIsMounted(true);
    // Обновляем внутренний стейт ТОЛЬКО если ИЗМЕНИЛСЯ внешний пропс color
    if (color !== prevColorProp) {
      setHsv(hexToHsv(color));
      setInternalHex(color);
      setPrevColorProp(color);
    }
  }, [color, prevColorProp]);

  if (!isMounted) return <div className="size-[260px] bg-white rounded-[20px] animate-pulse" />;

  const handleRandomColor = () => {
    handleHsvChange(() => ({
      // audit-ok: hydration (inside event handler)
      h: Math.floor(Math.random() * 360),
      s: Math.floor(Math.random() * 100),
      // audit-ok: hydration
      v: Math.floor(Math.random() * 100)
    }));
  };

  const handleAreaPointerDown = (e: React.PointerEvent) => {
    const area = areaRef.current;
    if (!area) return;
    area.setPointerCapture(e.pointerId);

    const updateColor = (ev: PointerEvent | React.PointerEvent) => {
      const rect = area.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, ev.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, ev.clientY - rect.top));
      
      const newS = (x / rect.width) * 100;
      const newV = 100 - (y / rect.height) * 100;
      handleHsvChange(prev => ({ ...prev, s: newS, v: newV }));
    };

    updateColor(e);

    const handlePointerMove = (ev: PointerEvent) => updateColor(ev);
    const handlePointerUp = (ev: PointerEvent) => {
      area.releasePointerCapture(ev.pointerId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };


  const handleHuePointerDown = (e: React.PointerEvent) => {
    const hueBar = hueRef.current;
    if (!hueBar) return;
    hueBar.setPointerCapture(e.pointerId);

    const updateHue = (ev: PointerEvent | React.PointerEvent) => {
      const rect = hueBar.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, ev.clientX - rect.left));
      const newH = (x / rect.width) * 360;
      handleHsvChange(prev => ({ ...prev, h: newH }));
    };

    updateHue(e);

    const handlePointerMove = (ev: PointerEvent) => updateHue(ev);
    const handlePointerUp = (ev: PointerEvent) => {
      hueBar.releasePointerCapture(ev.pointerId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-[20px] p-[10px] shadow-[0_20px_40px_-5px_rgba(0,0,0,0.15)] border border-gray-100/60 w-[260px] flex flex-col gap-3",
        className
      )}
    >
      {/* 1. Пресеты */}
      <div className="flex justify-between items-center w-full -mb-1">
        {PRESET_COLORS.map(preset => (
          <button
            key={preset}
            type="button"
            className="size-[18px] rounded-full transition-transform hover:scale-110 active:scale-95 focus:outline-none shadow-sm"
            style={{ backgroundColor: preset }}
            aria-label={`Select preset ${preset}`}
            onClick={() => {
              const parsed = hexToHsv(preset);
              handleHsvChange(() => parsed);
            }}
          />
        ))}
      </div>

      {/* 2. Область выбора цвета (градиент) */}
      <div 
        ref={areaRef}
        onPointerDown={handleAreaPointerDown}
        className="w-full h-[200px] rounded-[14px] flex-shrink-0 relative cursor-crosshair touch-none select-none"
        style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent pointer-events-none rounded-[14px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none rounded-[14px]" />
        <div className="absolute inset-0 rounded-[14px] border border-black/10 pointer-events-none" />
        
        {/* Указатель */}
        <div 
          className="absolute size-[18px] rounded-full border-2 border-white shadow-[0_1px_4px_rgba(0,0,0,0.25)] pointer-events-none"
          style={{ 
            left: `${hsv.s}%`, 
            top: `${100 - hsv.v}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: internalHex 
          }}
        />
      </div>

      {/* 3. Ползунок Hue и Рандом кнопка */}
      <div className="flex items-center gap-3">
        {/* Hue Tracker */}
        <div 
          ref={hueRef}
          onPointerDown={handleHuePointerDown}
          className="h-4 rounded-full w-full border border-black/5 relative cursor-pointer touch-none select-none"
          style={{
            background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
          }}
        >
          {/* Thumb */}
          <div 
            className="absolute top-1/2 size-6 rounded-full border-2 border-white shadow-sm pointer-events-none -translate-y-1/2"
            style={{ 
              left: `calc((100% - 24px) * ${hsv.h / 360})`,
              backgroundColor: `hsl(${hsv.h}, 100%, 50%)`
            }}
          />
        </div>

        {/* Random generator (Shuffle) */}
        <button
          type="button"
          onClick={handleRandomColor}
          className="size-8 shrink-0 bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#3F3F46] rounded-full flex items-center justify-center transition-all active:scale-95 border-none outline-none shadow-sm"
        >
          <Shuffle className="size-[14px]" strokeWidth={2.5} />
        </button>
      </div>

      {/* 4. Инпут HEX значения */}
      <div className="bg-[#F4F4F5] rounded-[12px] px-3 h-10 flex items-center gap-2 w-full">
        <div 
          className="size-[18px] rounded-full flex-shrink-0"
          style={{ backgroundColor: internalHex }}
        />
        <input 
          type="text"
          value={internalHex}
          onChange={(e) => {
            const val = e.target.value.toUpperCase();
            setInternalHex(val);
            if (/^#[0-9A-F]{6}$/i.test(val)) {
              handleHsvChange(() => hexToHsv(val));
            }
          }}
          className="bg-transparent border-none p-0 focus:ring-0 text-[15px] font-medium text-slate-800 w-full outline-none"
          maxLength={7}
        />
      </div>
      
    </div>
  );
}
