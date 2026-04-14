"use client";

import React, { useState, useMemo, useId, useEffect } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Popover from "./popover";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import * as SelectPrimitive from "@radix-ui/react-select"

export interface SelectOption {
    id: string;
    title: string;
    description?: string;
    icon?: React.ReactNode;
    color?: string;
    badge?: string | number;
}

type LayoutType = "list" | "grid-2" | "grid-3" | "list-with-search";

function getOptimalLayout(options: SelectOption[]): LayoutType {
    if (!options || options.length === 0) return "list";
    const count = options.length;

    const avgLength = options.reduce((sum, o) => sum + o.title.length, 0) / count;

    if (count <= 3) return "list";
    if (avgLength <= 4 && count <= 15) return "grid-3";
    if (avgLength <= 10 && count <= 8) return "grid-2";
    if (count > 15) return "list-with-search";
    return "list";
}

interface SelectAppearance {
    className?: string;
    compact?: boolean;
    variant?: "solid" | "outline" | "ghost" | "minimal" | "default";
    color?: "primary" | "neutral" | "success" | "warning" | "danger";
    center?: boolean;
    triggerClassName?: string;
    align?: "start" | "center" | "end";
    alignOffset?: number;
}

interface SelectSearch {
    showSearch?: boolean;
    searchPlaceholder?: string;
}

export interface SelectProps extends SelectAppearance, SelectSearch {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    gridColumns?: 2 | 3;
    autoLayout?: boolean;
    name?: string;
    clearable?: boolean;
    error?: boolean;
}

function Select({
    options,
    value,
    onChange,
    label,
    placeholder = "Выберите опцию",
    className,
    disabled = false,
    showSearch,
    searchPlaceholder = "Поиск...",
    compact = false,
    variant = "solid",
    color = "neutral",
    gridColumns,
    autoLayout = true,
    center = false,
    triggerClassName,
    name,
    align = "start",
    alignOffset = 0,
    clearable = false,
    error = false
}: SelectProps) {
    const triggerId = useId();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const computedLayout = useMemo(() => {
        if (gridColumns) {
            return gridColumns === 2 ? "grid-2" : "grid-3";
        }
        if (!autoLayout) return "list";
        return getOptimalLayout(options);
    }, [options, gridColumns, autoLayout]);

    const effectiveGridColumns = computedLayout === "grid-2" ? 2 : computedLayout === "grid-3" ? 3 : undefined;
    const effectiveShowSearch = showSearch ?? (computedLayout === "list-with-search");

    const selectedOption = options.find(opt => opt.id === value);

    const filteredOptions = options.filter(opt =>
        Boolean(opt.id) &&
        (opt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    const handleSelect = (id: string) => {
        onChange(id);
        setOpen(false);
        setSearchQuery("");
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        setSearchQuery("");
    };

    return (
        <div className={cn("relative", (variant === "default" || variant === "outline") && "space-y-1.5", className)}>
            {label && (
                <label
                    htmlFor={triggerId}
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                >
                    {label}
                </label>
            )}

            {name && <input type="hidden" name={name} value={value} />}

            <Popover.Root open={mounted ? open : false} onOpenChange={setOpen}>
                <Popover.Trigger asChild>
                    <button
                        id={triggerId}
                        type="button"
                        disabled={disabled}
                        aria-haspopup="listbox"
                        aria-expanded={open}
                        className={cn(
                            "w-full px-4 h-[60px] rounded-2xl text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 group/btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center border",
                            // Unified Variants
                            variant === "solid" && [
                                color === "primary" && "bg-primary text-white border-primary hover:bg-primary/90",
                                color === "neutral" && "bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100 hover:border-slate-300",
                                color === "success" && "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700",
                                color === "danger" && "bg-rose-600 text-white border-rose-600 hover:bg-rose-700",
                                color === "warning" && "bg-amber-500 text-white border-amber-500 hover:bg-amber-600",
                            ],
                            (variant === "outline" || variant === "default") && [
                                "bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                                color === "primary" && "text-primary border-primary/20 hover:bg-primary/[0.02] hover:border-primary/30",
                                color === "success" && "text-emerald-700 border-emerald-200 hover:bg-emerald-50",
                                color === "danger" && "text-rose-700 border-rose-200 hover:bg-rose-50",
                            ],
                            (variant === "ghost" || variant === "minimal") && [
                                "bg-transparent border-transparent hover:bg-slate-100 text-slate-600",
                                color === "primary" && "text-primary hover:bg-primary/5",
                            ],
                            center ? "justify-center" : "justify-between",
                            error && "border-rose-500 bg-rose-50/30 ring-rose-500/10",
                            triggerClassName
                        )}
                    >
                        <div className="flex items-center gap-2 overflow-hidden w-full">
                            {selectedOption?.icon && !compact && variant !== "minimal" && (
                                <div className={cn("shrink-0 transition-colors", open ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600")}>
                                    {selectedOption.icon}
                                </div>
                            )}
                            {selectedOption?.icon && compact && (
                                <div className={cn("shrink-0 transition-colors", open ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600")}>
                                    {selectedOption.icon}
                                </div>
                            )}
                            {selectedOption ? (
                                <div className="flex min-w-0 w-full flex-col truncate">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span
                                            suppressHydrationWarning
                                            className={cn("transition-colors truncate",
                                                compact ? "text-xs font-bold" : "text-base font-bold text-slate-900"
                                            )}
                                        >{selectedOption.title}</span>
                                        {selectedOption?.badge && !compact && variant !== "minimal" && (
                                            <span className="text-xs font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full shrink-0 border border-indigo-100/50">
                                                {selectedOption.badge}
                                            </span>
                                        )}
                                    </div>
                                    {selectedOption.description && !effectiveGridColumns && (
                                        <span className="text-xs font-medium text-slate-400 truncate w-full block mt-0.5">
                                            {selectedOption.description}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span 
                                    suppressHydrationWarning 
                                    className={cn("transition-colors truncate",
                                        compact ? "text-xs" : "text-base text-slate-400 font-bold"
                                    )}
                                >{placeholder}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                            {clearable && value && (
                                <div
                                    role="button"
                                    onClick={handleClear}
                                    className="p-1 rounded-md hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </div>
                            )}
                            <ChevronDown className={cn("shrink-0 transition-transform duration-300", variant === "minimal" ? "w-3 h-3" : "w-4 h-4", open ? "rotate-180" : "" )} />
                        </div>
                    </button>
                </Popover.Trigger>
                <AnimatePresence>
                    {open && mounted && (
                        <Popover.Content
                            className="!p-0 !bg-white !border !border-slate-200 !shadow-lg !w-auto !rounded-[12px] !ring-0 !overflow-hidden !duration-0 data-[state=open]:!animate-none data-[state=closed]:!animate-none"
                            align={align}
                            alignOffset={alignOffset}
                            sideOffset={6}
                            collisionPadding={8}
                            forceMount
                            asChild
                        >
                            <motion.div
                                initial={{ opacity: 0, scaleY: 0.95, y: -4, originY: 0 }}
                                animate={{ opacity: 1, scaleY: 1, y: 0 }}
                                exit={{ opacity: 0, scaleY: 0.95, y: -4 }}
                                transition={{
                                    duration: 0.2,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                className={cn("z-50",
                                    variant === "minimal" ? "min-w-[140px]" : "min-w-[var(--radix-popover-trigger-width)]"
                                )}>
                                <div className={cn("flex flex-col max-h-[350px] w-full h-full custom-scrollbar",
                                    !effectiveGridColumns && "py-1"
                                )}>
                                    {effectiveShowSearch && (
                                        <div className="pb-2 border-b border-slate-100/60 mb-1 block px-1.5 pt-1.5 bg-white sticky top-0 z-10">
                                            <div className="relative">
                                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <Input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder={searchPlaceholder}
                                                    aria-label={searchPlaceholder}
                                                    className="w-full h-11 pl-10 pr-3 rounded-[14px] bg-slate-50/50 border border-slate-200/60 shadow-none text-xs font-bold focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-slate-100 focus-visible:border-slate-300 transition-all placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className={cn("overflow-y-auto scrollbar-hide flex-1", !effectiveGridColumns && "px-1")} role="listbox">
                                        {filteredOptions.length > 0 ? (
                                            <div className={cn("w-full",
                                                effectiveGridColumns ? ["grid gap-1.5 p-1.5",
                                                    effectiveGridColumns === 2 ? "grid-cols-2" : "grid-cols-3"
                                                ] : "flex flex-col gap-0.5"
                                            )}>
                                                {filteredOptions.map((option, index) => {
                                                    const isSelected = option.id === value;
                                                    const isLastOdd = effectiveGridColumns === 2 && index === filteredOptions.length - 1 && filteredOptions.length % 2 !== 0;

                                                    return (
                                                        <button
                                                            key={option.id}
                                                            type="button"
                                                            role="option"
                                                            aria-selected={isSelected}
                                                            onClick={() => handleSelect(option.id)}
                                                            className={cn("transition-colors relative text-left outline-none cursor-pointer focus:outline-none group/item",
                                                                effectiveGridColumns ? [
                                                                    "h-10 rounded-[8px] text-xs font-bold flex items-center px-2",
                                                                    isLastOdd ? "col-span-2" : "",
                                                                    isSelected ? "bg-slate-100 border-slate-300 text-slate-900 shadow-sm" : "bg-white border border-slate-200/60 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                                                ] : [
                                                                    "flex items-center justify-between px-3 py-2 min-h-[44px] hover:bg-slate-50 text-[14px] font-medium text-slate-700 rounded-[10px]",
                                                                    isSelected ? "bg-slate-100 !font-semibold text-slate-900 shadow-sm" : ""
                                                                ]
                                                            )}
                                                        >
                                                            {effectiveGridColumns && (
                                                                <div className="flex items-center gap-2 w-full min-w-0">
                                                                    {option.icon && <div className="shrink-0 opacity-70 group-hover/item:opacity-100 transition-opacity">{option.icon}</div>}
                                                                    <span className="truncate flex-1">{option.title}</span>
                                                                    {option.badge && (
                                                                        <span className={cn("text-xs font-black px-1.5 py-0.5 rounded-full shrink-0",
                                                                            isSelected ? "bg-white text-indigo-600 shadow-sm" : "bg-slate-100 text-slate-500 group-hover/item:bg-slate-200"
                                                                        )}>
                                                                            {option.badge}
                                                                        </span>
                                                                    )}
                                                                    {isSelected && <Check className="w-3 h-3 text-slate-900 stroke-[3] shrink-0" />}
                                                                </div>
                                                            )}

                                                            {!effectiveGridColumns && (
                                                                <>
                                                                    <div className="flex items-center gap-3 min-w-0 w-full">
                                                                        {(option.color || option.icon) ? (
                                                                            <div className={cn("w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 transition-all border",
                                                                                isSelected ? "bg-white border-slate-200 text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)]" : "bg-slate-50 border-slate-200/50 text-slate-500 group-hover/item:border-slate-300 group-hover/item:bg-white",
                                                                                option.color && "p-0 border-black/5 overflow-hidden ring-1 ring-inset ring-black/5"
                                                                            )}>
                                                                                {option.color ? (
                                                                                    <div className="w-full h-full rounded-[6px] scale-90 shadow-sm" style={{ backgroundColor: option.color }} />
                                                                                ) : (
                                                                                    <div className="flex items-center justify-center">{option.icon}</div>
                                                                                )}
                                                                            </div>
                                                                        ) : null}

                                                                        <div className="flex flex-col min-w-0 flex-1">
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <span className={cn("text-[14px] truncate", isSelected ? "font-bold text-slate-900" : "font-medium text-slate-700")}>
                                                                                    {option.title}
                                                                                </span>
                                                                                {option.badge && (
                                                                                    <span className={cn("text-xs font-black px-1.5 py-0.5 rounded-full shrink-0",
                                                                                        isSelected ? "bg-white text-indigo-600 shadow-sm" : "bg-slate-200 text-slate-500 group-hover/item:bg-slate-300 group-hover/item:text-slate-600"
                                                                                    )}>
                                                                                        {option.badge}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {option.description && (
                                                                                <div className={cn("text-xs font-medium leading-tight truncate mt-0.5", isSelected ? "text-slate-500" : "text-slate-400")}>
                                                                                    {option.description}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-6 text-center">
                                                <p className="text-xs font-bold text-muted-foreground/50">Ничего не найдено</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </Popover.Content>
                    )}
                </AnimatePresence>
            </Popover.Root>
        </div>
    );
}

const Group = SelectPrimitive.Group
const Value = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-[60px] w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2 text-base font-bold text-slate-900 ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-[12px] border border-slate-200 bg-white text-slate-900 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-content-available-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-[8px] py-2 pl-8 pr-2 text-sm font-medium outline-none focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const Root = SelectPrimitive.Root
const Trigger = SelectTrigger;
const Content = SelectContent;
const Item = SelectItem;

export { 
    Select,
    Root,
    Group,
    Value,
    Trigger,
    Content,
    Item,
    Root as SelectRoot,
    Group as SelectGroup,
    Value as SelectValue,
    Trigger as SelectTrigger,
    Content as SelectContent,
    Item as SelectItem,
}
