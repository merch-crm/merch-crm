"use client";

import React, { useReducer, useEffect } from "react";
import { Pipette, Check } from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/components/library/custom/utils/cn";
import { isLightColor } from "@/lib/color-utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

const swatchColors = ["#F43F5E", "#D946EF", "#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#84CC16"];
const RAINBOW_GRADIENT = 'radial-gradient(circle closest-side, white 20%, transparent 85%), conic-gradient(from 90deg, hsl(0,90%,65%), hsl(45,90%,65%), hsl(120,90%,55%), hsl(180,90%,60%), hsl(220,90%,65%), hsl(300,90%,65%), hsl(360,90%,65%))';

// --- Swatches Group ---

export interface ColorPickerSwatchesGroupProps {
  value?: string;
  onChange?: (color: string) => void;
  colors?: string[];
}

interface SwatchesState {
  internalColor: string;
  customColor: string;
  isCustomOpen: boolean;
}

type SwatchesAction = 
  | { type: 'SELECT_COLOR'; color: string }
  | { type: 'SET_CUSTOM_COLOR'; color: string }
  | { type: 'TOGGLE_CUSTOM_POPOVER'; open: boolean };

function swatchesReducer(state: SwatchesState, action: SwatchesAction): SwatchesState {
  switch (action.type) {
    case 'SELECT_COLOR':
      return { ...state, internalColor: action.color };
    case 'SET_CUSTOM_COLOR':
      return { ...state, customColor: action.color };
    case 'TOGGLE_CUSTOM_POPOVER':
      return { ...state, isCustomOpen: action.open };
    default:
      return state;
  }
}

export function ColorPickerSwatchesGroup({ value, onChange, colors = swatchColors }: ColorPickerSwatchesGroupProps) {
  const [state, dispatch] = useReducer(swatchesReducer, {
    internalColor: colors[0],
    customColor: "",
    isCustomOpen: false,
  });

  const selectedColor = value !== undefined ? value : state.internalColor;
  
  const handleSelect = (color: string) => {
    dispatch({ type: 'SELECT_COLOR', color });
    onChange?.(color);
  };

  return (
    <div 
      className="grid w-full items-center gap-1.5 sm:gap-2 justify-items-center" 
      style={{ gridTemplateColumns: `repeat(${colors.length + 1}, minmax(0, 1fr))` }}
      role="radiogroup" 
      aria-label="Select a color swatch"
    >
      {colors.map((color) => {
        const isSelected = selectedColor?.toLowerCase() === color.toLowerCase();
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => handleSelect(color)}
            className="relative w-full max-w-[40px] aspect-square rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2"
            style={{ 
              backgroundColor: color,
              boxShadow: isSelected ? `inset 0 0 0 1.5px ${color}, inset 0 0 0 4px #F4F4F5` : 'none'
            }}
            title={color}
            aria-label={`Select color ${color}`}
          >
            {isSelected && (
              <Check className={cn("w-[45%] h-[45%] max-w-[16px] max-h-[16px]", isLightColor(color) ? "text-slate-800" : "text-white")} strokeWidth={3} />
            )}
          </button>
        );
      })}

      <Popover 
        open={state.isCustomOpen} 
        onOpenChange={(open) => dispatch({ type: 'TOGGLE_CUSTOM_POPOVER', open })}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={() => {
              if (state.customColor && !state.isCustomOpen) handleSelect(state.customColor);
            }}
            className="relative w-full max-w-[40px] aspect-square rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2 overflow-hidden"
            style={{
              background: state.customColor 
                ? state.customColor 
                : RAINBOW_GRADIENT,
              boxShadow: (selectedColor === state.customColor && state.customColor) 
                ? `inset 0 0 0 1.5px ${state.customColor}, inset 0 0 0 4px #F4F4F5` 
                : 'none'
            }}
            title="Свой цвет"
            aria-label="Выбрать свой цвет"
          >
            {selectedColor === state.customColor && state.customColor && (
               <Check className={cn("w-[45%] h-[45%] max-w-[16px] max-h-[16px]", isLightColor(state.customColor) ? "text-slate-800" : "text-white")} strokeWidth={3} />
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent 
          className="w-auto p-0 border-none shadow-premium bg-transparent rounded-3xl z-[9999]" 
          align="end" 
          sideOffset={8}
        >
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
            <ColorPicker 
              color={state.customColor || "#3B82F6"} 
              onChange={(hex) => {
                dispatch({ type: 'SET_CUSTOM_COLOR', color: hex });
                handleSelect(hex);
              }} 
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// --- Compact Color Picker ---

interface CompactState {
  isOpen: boolean;
  hexColor: string;
  isMounted: boolean;
}

type CompactAction = 
  | { type: 'SET_OPEN'; open: boolean }
  | { type: 'SET_COLOR'; color: string }
  | { type: 'MOUNT' };

function compactReducer(state: CompactState, action: CompactAction): CompactState {
  switch (action.type) {
    case 'SET_OPEN':
      return { ...state, isOpen: action.open };
    case 'SET_COLOR':
      return { ...state, hexColor: action.color };
    case 'MOUNT':
      return { ...state, isMounted: true };
    default:
      return state;
  }
}

export function ColorPickerCompact() {
  const [state, dispatch] = useReducer(compactReducer, {
    isOpen: false,
    hexColor: "",
    isMounted: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    dispatch({ type: 'MOUNT' });
  }, []);

  const openEyeDropper = async () => {
    if (!('EyeDropper' in window)) {
      toast("Pipette (EyeDropper API) is not supported by your browser", "warning");
      return;
    }
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      dispatch({ type: 'SET_COLOR', color: result.sRGBHex.toUpperCase() });
    } catch (_e) {
      // User canceled
    }
  };

  if (!state.isMounted) return null;

  return (
    <div 
      className="relative flex flex-col items-center pt-12 px-4 transition-all duration-300"
      style={{ paddingBottom: state.isOpen ? '420px' : '24px' }}
    >
      <Popover 
        open={state.isOpen} 
        onOpenChange={(open) => dispatch({ type: 'SET_OPEN', open })}
      >
        <PopoverTrigger asChild>
          <button 
            type="button"
            className="flex items-center justify-between bg-white p-[10px] rounded-[20px] border border-slate-100 shadow-crm-md overflow-visible relative w-[260px] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2"
          >
            <div className="flex items-center gap-3">
              <div 
                className={cn(
                  "size-10 flex-shrink-0 rounded-[10px]",
                  state.hexColor && "border border-black/5 shadow-sm"
                )} 
                style={state.hexColor 
                  ? { backgroundColor: state.hexColor } 
                  : { background: RAINBOW_GRADIENT }
                }
              />
              <div className="flex flex-col min-w-[70px] text-left">
                <span className="text-[11px] font-bold text-slate-400 leading-none mb-0.5">Цвет</span>
                <span className="text-[15px] font-black text-slate-900 leading-none tabular-nums">{state.hexColor || "Выбрать"}</span>
              </div>
            </div>

            <div className="flex items-center pr-1">
              <div className="w-px h-8 bg-slate-100 mx-2" />
              <div 
                role="button"
                tabIndex={0}
                aria-label="Pick color from screen"
                onClick={(e) => {
                  e.stopPropagation();
                  openEyeDropper();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    openEyeDropper();
                  }
                }}
                className="size-10 flex-shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary-base hover:bg-primary-base/5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-base relative z-10"
              >
                <Pipette size={18} strokeWidth={2.5} />
              </div>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 border-none shadow-premium bg-transparent rounded-3xl z-[9999]" 
          align="center" 
          sideOffset={8}
        >
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden z-50">
            <ColorPicker color={state.hexColor || "#3B82F6"} onChange={(color) => dispatch({ type: 'SET_COLOR', color })} />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// --- Square/Circle Variants ---

interface ColorPickerTriggerProps {
  value?: string;
  onChange?: (color: string) => void;
  label?: string;
  className?: string;
}

export function ColorPickerSquare({ value, onChange, label, className }: ColorPickerTriggerProps) {
  const [isOpen, setIsOpen] = useReducer((s: boolean, a: boolean) => a, false);
  const [internalColor, setInternalColor] = useReducer((s: string, a: string) => a, "");
  
  const color = value !== undefined ? value : internalColor;
  const setColor = onChange || setInternalColor;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <label className="text-sm font-bold text-slate-700 ml-1 block">{label}</label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Pick a color"
            className={cn(
              "size-10 flex-shrink-0 rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2 transition-transform active:scale-95 overflow-hidden",
              color && "border border-black/5 shadow-sm"
            )}
            style={color ? { backgroundColor: color } : { background: RAINBOW_GRADIENT }}
          />
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 border-none shadow-premium bg-transparent rounded-3xl z-[9999]" 
          align="start" 
          sideOffset={8}
        >
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden z-50">
            <ColorPicker color={color || "#3B82F6"} onChange={setColor} />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function ColorPickerCircle({ value, onChange, label, className }: ColorPickerTriggerProps) {
  const [isOpen, setIsOpen] = useReducer((s: boolean, a: boolean) => a, false);
  const [internalColor, setInternalColor] = useReducer((s: string, a: string) => a, "");
  
  const color = value !== undefined ? value : internalColor;
  const setColor = onChange || setInternalColor;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <label className="text-sm font-bold text-slate-700 ml-1 block">{label}</label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Pick a color"
            className={cn(
              "size-10 flex-shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2 transition-transform active:scale-95 overflow-hidden",
              color && "border border-black/5 shadow-sm"
            )}
            style={color ? { backgroundColor: color } : { background: RAINBOW_GRADIENT }}
          />
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 border-none shadow-premium bg-transparent rounded-3xl z-[9999]" 
          align="start" 
          sideOffset={8}
        >
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden z-50">
            <ColorPicker color={color || "#3B82F6"} onChange={setColor} />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

