"use client";

import React, { useState } from "react";
import { Check, Search, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface MultiSelectOption {
  id: string;
  title: string;
  description?: string;
  avatar?: string | null;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  maxCount?: number;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Выберите...",
  label,
  searchPlaceholder = "Поиск...",
  disabled = false,
  maxCount = 3,
  className
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedOptions = options.filter(opt => value.includes(opt.id));
  
  const filteredOptions = options.filter(opt =>
    opt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleOption = (id: string) => {
    const newValue = value.includes(id)
      ? value.filter(v => v !== id)
      : [...value, id];
    onChange(newValue);
  };

  const removeOption = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== id));
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-sm font-bold text-slate-700 pl-1">
          {label}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "w-full min-h-[48px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-left transition-all hover:border-primary/30 focus:outline-none flex flex-wrap gap-2 items-center",
              open && "border-primary/50 bg-white ring-4 ring-primary/5",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {selectedOptions.length > 0 ? (
              <>
                {selectedOptions.slice(0, maxCount).map(opt => (
                  <Badge 
                    key={opt.id}
                    variant="secondary"
                    className="bg-primary/10 text-primary border-none py-1 pr-1 pl-2 flex items-center gap-1 rounded-lg"
                  >
                    <span className="text-xs font-bold">{opt.title}</span>
                    <div 
                      role="button"
                      tabIndex={0}
                      onClick={(e) => removeOption(e, opt.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') removeOption(e as unknown as React.MouseEvent, opt.id); }}
                      className="p-0.5 rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </div>
                  </Badge>
                ))}
                {selectedOptions.length > maxCount && (
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none rounded-lg">
                    <span className="text-xs font-bold">+{selectedOptions.length - maxCount}</span>
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-sm text-slate-400 font-medium pl-1">{placeholder}</span>
            )}
            <ChevronDown className="ml-auto w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </PopoverTrigger>

        <PopoverContent 
          className="p-0 bg-white border border-slate-200 shadow-2xl rounded-2xl w-[var(--radix-popover-trigger-width)] overflow-hidden"
          align="start"
        >
          <div className="p-2 border-b border-slate-50 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9 h-10 bg-white border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              <div className="grid gap-0.5">
                {filteredOptions.map(option => {
                  const isSelected = value.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleOption(option.id)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left",
                        isSelected 
                          ? "bg-primary/5 text-primary" 
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className={cn("text-xs font-bold truncate", isSelected ? "text-primary" : "text-slate-900")}>
                          {option.title}
                        </span>
                        {option.description && (
                          <span className="text-xs text-slate-400 truncate">{option.description}</span>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4 shrink-0 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs font-bold text-slate-400">
                Ничего не найдено
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
