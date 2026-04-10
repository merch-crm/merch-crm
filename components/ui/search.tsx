"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Search as SearchIcon, Loader2, X } from "lucide-react";
import { rnd } from "@/lib/random-utils";
import { Field, type FieldStatus } from "./field";
import { fieldVariants } from "./field-variants";

export interface SearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onSubmit' | 'size'> {
  placeholders?: string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  status?: FieldStatus;
  isLoading?: boolean;
  className?: string;
  placeholderInterval?: number;
  showShortcut?: boolean;
  shortcutText?: string;
  size?: "md" | "sm";
  variant?: "solid" | "outline" | "ghost" | "minimal" | "default";
}

export const Search = React.forwardRef<HTMLInputElement, SearchProps>(({
  placeholders,
  onChange,
  onSubmit,
  onClear,
  label,
  description,
  error,
  status = "default",
  isLoading,
  required,
  className,
  placeholderInterval = 3000,
  showShortcut = true,
  shortcutText = "⌘K",
  size = "md",
  variant: _variant = "solid",
  placeholder,
  value: propValue,
  ...props
}, forwardedRef) => {
  const activePlaceholders = placeholders || (placeholder ? [placeholder] : ["Поиск..."]);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [internalValue, setInternalValue] = useState("");
  const value = propValue !== undefined ? (propValue as string) : internalValue;

  const [animating, setAnimating] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Combine internal and forwarded ref
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = (forwardedRef || internalInputRef) as React.RefObject<HTMLInputElement>;
  
  const [isMounted, setIsMounted] = React.useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const newDataRef = useRef<{ x: number; y: number; r: number; color: string }[]>([]);

  // Sync internal state if propValue is controlled
  useEffect(() => {
    if (propValue !== undefined) {
      setInternalValue(propValue as string);
    }
  }, [propValue]);

  // Placeholder Rotation Logic
  const startAnimation = useCallback(() => {
    if (activePlaceholders.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % activePlaceholders.length);
    }, placeholderInterval);
  }, [activePlaceholders.length, placeholderInterval]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation();
    }
  }, [startAnimation]);

  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startAnimation, handleVisibilityChange]);

  // Animation (Particle) Logic
  const draw = useCallback(() => {
    if (!inputRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    
    const computedStyles = getComputedStyle(inputRef.current);
    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = "#FFF";
    ctx.fillText(value, 16, 40);

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData: { x: number; y: number; r: number; color: string }[] = [];

    for (let t = 0; t < 800; t++) {
      const i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        const e = i + 4 * n;
        if (pixelData[e + 3] > 0) {
          newData.push({
            x: n,
            y: t,
            r: 1,
            color: "rgba(15, 23, 42, 1)", // slate-900
          });
        }
      }
    }
    newDataRef.current = newData;
  }, [value, inputRef]);

  useEffect(() => {
    if (value) draw();
  }, [value, draw]);

  const animate = (start: number) => {
    const animateFrame = (pos: number = 0) => {
      requestAnimationFrame(() => {
        const newArr = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) continue;
            current.x += rnd() > 0.5 ? 1 : -1;
            current.y += rnd() > 0.5 ? 1 : -1;
            current.r -= 0.05 * rnd();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800);
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color } = t;
            if (n > pos) {
              ctx.beginPath();
              ctx.rect(n, i, s, s);
              ctx.fillStyle = color;
              ctx.fill();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          setInternalValue("");
          if (propValue === undefined) {
             setInternalValue("");
          }
          if (onChange) {
            const event = {
                target: { value: "" },
                currentTarget: { value: "" },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
          }
          setAnimating(false);
          if (onSubmit) onSubmit(value);
        }
      });
    };
    animateFrame(start);
  };

  const handleClear = () => {
    setInternalValue("");
    if (onClear) onClear();
    if (onChange) {
      const event = {
        target: { value: "" },
        currentTarget: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, 800, 800);
    }
    inputRef.current?.focus();
  };

  const handleAnimateSubmit = () => {
    if (!value || animating) return;
    setAnimating(true);
    draw();
    const maxX = newDataRef.current.reduce((prev, curr) => (curr.x > prev ? curr.x : prev), 0);
    animate(maxX);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) handleAnimateSubmit();
  };

  return (
    <Field label={label} description={description} error={error} status={status} isLoading={isLoading} required={required} className={className}>
      <form
        onSubmit={handleFormSubmit}
        className={cn(
          fieldVariants({ status: error ? "danger" : status, size: size === "md" ? "default" : size }),
          "relative overflow-hidden group/search flex items-center p-0 w-full",
          animating && "pointer-events-none"
        )}
      >
        <div className={cn(
            "absolute z-20 text-slate-400 group-focus-within/search:text-slate-900 transition-colors pointer-events-none",
            size === "sm" ? "left-3.5" : "left-4"
        )}>
          {isLoading ? (
            <Loader2 className={cn("animate-spin", size === "sm" ? "size-3.5" : "size-4")} />
          ) : (
            <SearchIcon className={cn(size === "sm" ? "size-3.5" : "size-4")} strokeWidth={2.5} />
          )}
        </div>

        <canvas
          ref={canvasRef}
          className={cn(
            "absolute pointer-events-none text-base transform scale-50 top-[18%] left-10 origin-top-left z-30 transition-opacity duration-200",
            !animating ? "opacity-0" : "opacity-100"
          )}
        />

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            if (!animating) {
              setInternalValue(e.target.value);
              onChange?.(e);
            }
          }}
          type="text"
          className={cn(
            "w-full bg-transparent h-full text-slate-900 focus:outline-none z-10 transition-colors",
            size === "sm" ? "pl-10 pr-20 text-[13px]" : "pl-12 pr-24 text-[14px]",
            animating && "text-transparent"
          )}
          {...props}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-40">
          <AnimatePresence>
            {value && !animating && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={handleClear}
                className="size-8 rounded-[8px] flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all active:scale-90"
              >
                <X className="size-4" strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Submit Arrow Button (only if onSubmit is provided natively) */}
          {onSubmit ? (
            <button
              disabled={!value || animating}
              type="submit"
              className={cn(
                  "rounded-[8px] bg-slate-900 flex items-center justify-center hover:bg-slate-800 disabled:bg-slate-100 transition-all active:scale-95 shadow-sm",
                  size === "sm" ? "size-7" : "size-8"
              )}
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("text-white", size === "sm" ? "size-3" : "size-3.5")}
              >
                <motion.path
                  d="M5 12l14 0"
                  initial={{ strokeDasharray: "50%", strokeDashoffset: "50%" }}
                  animate={{ strokeDashoffset: value ? 0 : "50%" }}
                  transition={{ duration: 0.3 }}
                />
                <path d="M13 18l6 -6" />
                <path d="M13 6l6 6" />
              </motion.svg>
            </button>
          ) : (
            !value && showShortcut && (
                <div className={cn(
                    "rounded-[6px] mr-1 border border-slate-200 bg-white font-black text-slate-400 select-none shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
                    size === "sm" ? "px-1 py-0.5 text-[9px]" : "px-1.5 py-0.5 text-[10px]"
                )}>
                  {shortcutText}
                </div>
            )
          )}
        </div>

        {/* Animated Placeholders */}
        <div className={cn(
            "absolute inset-0 flex items-center pointer-events-none z-0",
            size === "sm" ? "px-10" : "px-12"
        )}>
          <AnimatePresence mode="wait">
            {!value && isMounted && (
              <motion.p
                key={`placeholder-${currentPlaceholder}`}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                    "font-normal text-slate-400 truncate w-full",
                    size === "sm" ? "text-[13px]" : "text-[14px]"
                )}
              >
                {activePlaceholders[currentPlaceholder]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </form>
    </Field>
  );
});

Search.displayName = "Search";
