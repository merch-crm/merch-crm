"use client";

import * as React from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LocationOption {
    id: string;
    name: string;
}

interface StorageLocationSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: LocationOption[];
    className?: string;
    placeholder?: string;
    name?: string;
}

export function StorageLocationSelect({ value, onChange, options, className, placeholder, name }: StorageLocationSelectProps) {
    const safeOptions = Array.isArray(options) ? options : [];
    const selectedOption = safeOptions.find(o => o.id === value);

    return (
        <>
            {name && <input type="hidden" name={name} value={value} />}
            <DropdownMenu>

                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "w-full h-14 px-5 rounded-[14px] border border-slate-100 bg-slate-50 flex items-center justify-between group hover:border-indigo-500/30 hover:bg-white transition-all outline-none",
                            className
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <MapPin className={cn("w-5 h-5 transition-colors", value ? "text-indigo-500" : "text-slate-400")} />
                            <span className={cn(
                                "text-sm font-black truncate",
                                value ? "text-slate-900" : "text-slate-400"
                            )}>
                                {selectedOption ? selectedOption.name : (placeholder || "Выберите склад...")}
                            </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-[var(--radix-dropdown-menu-trigger-width)] bg-[#444444] border-none rounded-[14px] p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[100]"
                    align="start"
                    sideOffset={8}
                >
                    <div className="flex flex-col gap-1">
                        {safeOptions.length > 0 ? (
                            safeOptions.map((option) => {
                                const isSelected = value === option.id;
                                return (
                                    <DropdownMenuItem
                                        key={option.id}
                                        onClick={() => onChange(option.id)}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-3.5 rounded-[14px] text-[12px] font-black uppercase tracking-wider transition-all cursor-pointer outline-none border-none",
                                            isSelected
                                                ? "bg-[#5086ec] text-white"
                                                : "text-white/80 hover:bg-white/10 focus:bg-white/10 hover:text-white focus:text-white"
                                        )}
                                    >
                                        <span className="flex-1">{option.name}</span>
                                        {isSelected && (
                                            <Check className="w-4 h-4 ml-2" strokeWidth={3} />
                                        )}
                                    </DropdownMenuItem>
                                );
                            })
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <MapPin className="w-8 h-8 text-white/20 mx-auto mb-2" />
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-relaxed">
                                    Склады еще не созданы.<br />
                                    Добавьте склад в настройках.
                                </p>
                            </div>
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

