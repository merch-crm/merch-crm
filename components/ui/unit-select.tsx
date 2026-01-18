"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UnitOption {
    id: string;
    name: string;
}

interface UnitSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: UnitOption[];
    className?: string;
    name?: string;
}

export function UnitSelect({ value, onChange, options, className, name }: UnitSelectProps) {
    return (
        <>
            {name && <input type="hidden" name={name} value={value} />}
            <DropdownMenu>

                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "flex items-center justify-between gap-2 px-3 h-10 rounded-[14px] border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all outline-none",
                            className
                        )}
                    >
                        <span className="truncate">{value || "Выберите"}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="min-w-[120px] bg-[#444444] border-none rounded-[14px] p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[100]"
                    align="start"
                    sideOffset={8}
                >
                    <div className="flex flex-col gap-0.5">
                        {options.map((option) => {
                            const isSelected = value === option.name;
                            return (
                                <DropdownMenuItem
                                    key={option.id}
                                    onClick={() => onChange(option.name)}
                                    className={cn(
                                        "flex items-center justify-between px-4 py-2.5 rounded-[14px] text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer outline-none border-none",
                                        isSelected
                                            ? "bg-[#5086ec] text-white"
                                            : "text-white/80 hover:bg-white/10 focus:bg-white/10 hover:text-white focus:text-white"
                                    )}
                                >
                                    <span className="flex-1 text-center">{option.name}</span>
                                    {isSelected && (
                                        <Check className="w-3.5 h-3.5 absolute left-3" strokeWidth={3} />
                                    )}
                                </DropdownMenuItem>
                            );
                        })}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

