"use client";

import React, { useState, createElement } from "react";
import { Search, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ICON_GROUPS, getGradientStyles, ALL_ICONS_MAP } from "./category-utils";
import { Button } from "@/components/ui/button";
import { ScrollAreaFixed } from "@/components/ui/scroll-area";

interface CategoryIconPickerProps {
    value: string;
    onChange: (iconName: string) => void;
    color: string;
    className?: string;
}

export function CategoryIconPicker({ value, onChange, color, className }: CategoryIconPickerProps) {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const filteredGroups = ICON_GROUPS.map(group => ({
        ...group,
        icons: group.icons.filter(icon =>
            icon.label.toLowerCase().includes(search.toLowerCase()) ||
            icon.name.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(group => group.icons.length > 0);

    const CurrentIcon = ALL_ICONS_MAP[value] || ALL_ICONS_MAP["tshirt-custom"];

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "w-full h-full min-h-[80px] rounded-[var(--radius-inner)] bg-white border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-slate-50 transition-all duration-300 flex flex-col items-center justify-center gap-2 group outline-none",
                        className
                    )}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-[14px] flex items-center justify-center shadow-lg text-white bg-gradient-to-br transition-transform duration-500 group-hover:scale-110",
                        getGradientStyles(color)
                    )}>
                        <CurrentIcon className="w-6 h-6 stroke-[2.5]" />
                    </div>
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[320px] p-0 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-[var(--radius-outer)] overflow-hidden"
                align="center"
                side="top"
                sideOffset={12}
                collisionPadding={16}
            >
                <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Поиск иконки..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9 bg-white border-slate-200 rounded-xl text-sm font-medium"
                            autoFocus
                        />
                    </div>
                </div>

                <ScrollAreaFixed maxHeight={300} className="p-2" variant="thin">
                    <div className="pr-2">
                        {filteredGroups.length > 0 ? (
                            <div className="grid gap-4">
                                {filteredGroups.map((group) => (
                                    <div key={group.name} className="space-y-1.5">
                                        <div className="px-2">
                                            <h4 className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
                                                {group.name}
                                            </h4>
                                        </div>
                                        <div className="grid grid-cols-5 gap-1">
                                            {group.icons.map((icon) => {
                                                const isSelected = value === icon.name;
                                                return (
                                                    <button
                                                        key={icon.name}
                                                        type="button"
                                                        onClick={() => {
                                                            onChange(icon.name);
                                                            setIsOpen(false);
                                                        }}
                                                        title={icon.label}
                                                        className={cn(
                                                            "aspect-square rounded-xl flex items-center justify-center transition-all duration-200 relative group/icon",
                                                            isSelected
                                                                ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                                                                : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                                                        )}
                                                    >
                                                        {createElement(icon.icon, {
                                                            className: cn("w-5 h-5 transition-transform duration-200 group-hover/icon:scale-110", isSelected ? "stroke-[2.5]" : "stroke-[1.5]")
                                                        })}
                                                        {isSelected && (
                                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white text-primary rounded-full flex items-center justify-center shadow-sm ring-1 ring-primary/20">
                                                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-sm font-bold text-slate-400">Ничего не найдено</p>
                            </div>
                        )}
                    </div>
                </ScrollAreaFixed>
            </PopoverContent>
        </Popover>
    );
}
