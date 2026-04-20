"use client";

import React, { useState, createElement } from "react";
import { Search, ChevronDown, Package } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ICON_GROUPS, getDynamicGradient, ALL_ICONS_MAP } from "./category-utils";

interface CategoryIconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  color: string;
  className?: string;
}

const GROUP_SHORT: Record<string, string> = {
  "ОДЕЖДА": "Одежда", "СКЛАД И ЛОГИСТИКА": "Склад", "ПРОИЗВОДСТВО И ИНСТРУМЕНТЫ": "Произв.", "ФИНАНСЫ И ПРОДАЖИ": "Финансы", "БИЗНЕС И КЛИЕНТЫ": "Бизнес",
};

export function CategoryIconPicker({ value, onChange, color, className }: CategoryIconPickerProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState(ICON_GROUPS[0]?.name ?? "");

  const CurrentIcon = (ALL_ICONS_MAP && ALL_ICONS_MAP[value]) || (ALL_ICONS_MAP && ALL_ICONS_MAP["tshirt-custom"]) || Package;
  const currentIconEntry = ICON_GROUPS.flatMap(g => g.icons).find(i => i.name === value);

  const isSearching = search.trim().length > 0;

  const searchResults = isSearching
    ? ICON_GROUPS.flatMap(g => g.icons).filter(icon =>
      icon.label.toLowerCase().includes(search.toLowerCase()) ||
      icon.name.toLowerCase().includes(search.toLowerCase())
    )
    : [];

  const currentGroupIcons = isSearching
    ? []
    : (ICON_GROUPS.find(g => g.name === tab)?.icons ?? []);

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setSearch("");
      }}
      modal={true}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "w-full h-full min-h-[100px] rounded-[24px] border border-slate-200/60 hover:border-slate-400/40 bg-white/50 hover:bg-white backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-black/5 flex items-center justify-center group outline-none gap-4 px-6 transition-all duration-300",
            isOpen && "border-slate-900/10 shadow-xl shadow-black/5 bg-white",
            className
          )}
        >
          <div
            className={cn("w-14 h-14 rounded-[18px] shrink-0 flex items-center justify-center text-white shadow-xl shadow-black/5 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3"
            )}
            style={getDynamicGradient(color)}
          >
            <CurrentIcon className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div className="flex-1 flex flex-col items-start justify-center min-w-0 py-1">
            <div className="text-base font-black text-slate-900 leading-tight tracking-tight uppercase group-hover:text-black transition-colors">{currentIconEntry?.label ?? "Иконка"}</div>
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-1">Изменить выбор</span>
          </div>
          <div className="size-8 flex items-center justify-center rounded-full bg-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
            <ChevronDown className={cn("w-4 h-4 text-slate-400 group-hover:text-inherit transition-transform duration-300", isOpen && "rotate-180" )} />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] flex flex-col p-0 overflow-hidden rounded-[32px] border border-slate-200/60 shadow-2xl shadow-black/10 bg-white/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200" 
        align="start" 
        side="bottom" 
        sideOffset={12} 
        avoidCollisions={false}
      >
        {/* Search Bar */}
        <div className="p-4 pb-3 shrink-0">
          <div className="relative group/search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within/search:text-slate-900 transition-colors" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск иконки..."
              className="w-full h-12 rounded-[20px] bg-slate-100/50 border border-slate-200/60 pl-11 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-bold placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest outline-none focus:bg-white focus:border-slate-900/10 focus:ring-8 focus:ring-slate-900/5 transition-all duration-300"
            />
          </div>
        </div>

        {/* Tabs */}
        {!isSearching && (
          <div className="px-4 pb-3 flex flex-wrap gap-2 shrink-0">
            {ICON_GROUPS.map((g) => (
              <Button
                key={g.name}
                type="button"
                variant="ghost"
                onClick={() => setTab(g.name)}
                className={cn(
                  "shrink-0 h-7 px-3.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all duration-300",
                  tab === g.name
                    ? "bg-slate-900 text-white shadow-lg shadow-black/5"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                )}
              >
                {GROUP_SHORT[g.name] ?? g.name}
              </Button>
            ))}
          </div>
        )}

        {/* Icons */}
        <div
          className="overflow-y-auto overflow-x-hidden h-[120px] sm:h-[194px] custom-scrollbar"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="px-4 pt-1 pb-6">
            {isSearching ? (
              searchResults.length > 0 ? (
                <div className="grid grid-cols-4 gap-2.5">
                  {searchResults.map(icon => (
                    <IconCell key={icon.name} icon={icon} isSelected={value === icon.name} color={color} onSelect={(name) => { onChange(name); setIsOpen(false); }}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center flex flex-col items-center gap-2">
                  <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center">
                    <Search className="size-5 text-slate-300" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ничего не найдено</p>
                </div>
              )
            ) : (
              <div className="grid grid-cols-4 gap-2.5">
                {currentGroupIcons.map(icon => (
                  <IconCell key={icon.name} icon={icon} isSelected={value === icon.name} color={color} onSelect={(name) => { onChange(name); setIsOpen(false); }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function IconCell({
  icon,
  isSelected,
  color,
  onSelect,
}: {
  icon: { name: string; icon: React.ComponentType<{ className?: string }>; label: string };
  isSelected: boolean;
  color: string;
  onSelect: (name: string) => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onSelect(icon.name)}
      title={icon.label}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-3 rounded-[20px] group/c h-auto transition-all duration-300",
        isSelected
          ? cn("text-white shadow-xl shadow-black/10 hover:text-white ring-4 ring-white/50")
          : "text-slate-500 bg-slate-50/50 hover:bg-white hover:text-slate-900 border border-slate-200/40 hover:border-slate-900/10 hover:shadow-lg hover:shadow-black/5 active:scale-95"
      )}
      style={isSelected ? getDynamicGradient(color) : {}}
    >
      <div className={cn(
        "size-8 rounded-[12px] flex items-center justify-center transition-all duration-500",
        isSelected ? "bg-white/20" : "bg-white shadow-sm group-hover/c:shadow-md"
      )}>
        {createElement(icon.icon || Package, {
          className: cn("w-5 h-5 shrink-0 transition-transform duration-500 group-hover/c:scale-110",
            isSelected ? "stroke-[2.5]" : "stroke-[2] text-slate-700"
          )
        })}
      </div>
      <span className={cn("text-[10px] font-bold uppercase tracking-tight text-center w-full line-clamp-1",
        isSelected ? "text-white" : "text-slate-500 group-hover/c:text-slate-900"
      )}>
        {icon.label}
      </span>
    </Button>
  );
}
