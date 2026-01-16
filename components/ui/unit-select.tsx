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
                            "inline-flex items-center gap-1 text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors outline-none",
                            className
                        )}
                    >
                        {value || "Выберите"}
                        <ChevronDown className="w-3 h-3 opacity-60" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="min-w-[120px] bg-[#444444] border-none rounded-[1.25rem] p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[100]"
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
                                        "flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer outline-none border-none",
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

