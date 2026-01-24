"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { StorageLocation } from "./storage-locations-tab";

interface LocationSelectProps {
    locations: StorageLocation[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    excludeId?: string;
    label?: string;
    className?: string;
    stocks?: Map<string, number>;
}

export function LocationSelect({
    locations,
    value,
    onChange,
    placeholder = "Выберите склад",
    disabled,
    excludeId,
    label,
    className,
    stocks
}: LocationSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedLocation = locations.find(l => l.id === value);

    const filteredLocations = locations.filter(l =>
        l.id !== excludeId &&
        l.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (id: string) => {
        onChange(id);
        setIsOpen(false);
        setSearchQuery("");
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="text-[10px] font-bold text-slate-400  ml-1 block mb-2">
                    {label}
                </label>
            )}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full h-12 px-5 rounded-2xl border flex items-center justify-between outline-none text-left transition-all",
                    isOpen
                        ? "border-primary bg-white ring-4 ring-primary/10"
                        : "border-slate-100 bg-slate-50/80 hover:bg-white hover:border-slate-200",
                    disabled && "opacity-50 cursor-not-allowed",
                    className
                )}
            >
                <span className={cn(
                    "font-bold text-sm truncate",
                    value ? "text-slate-900" : "text-slate-400"
                )}>
                    {selectedLocation?.name || placeholder}
                </span>
                <ChevronDown className={cn(
                    "w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ml-2",
                    isOpen && "rotate-180 text-primary"
                )} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-[100] bg-white rounded-2xl border border-slate-100 shadow-crm-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-slate-50 bg-slate-50/30">
                        <input
                            autoFocus
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Поиск склада..."
                            className="w-full h-10 px-4 rounded-xl bg-white border border-slate-100 focus:outline-none focus:border-primary/50 text-xs font-bold transition-all"
                        />
                    </div>

                    <div className="max-h-[220px] overflow-y-auto p-1">
                        {filteredLocations.length > 0 ? (
                            filteredLocations.map(loc => {
                                const isSelected = value === loc.id;
                                const qty = stocks?.get(loc.id);
                                return (
                                    <button
                                        key={loc.id}
                                        type="button"
                                        onClick={() => handleSelect(loc.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3 rounded-xl mb-0.5 transition-colors",
                                            isSelected
                                                ? "bg-primary text-white"
                                                : "text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        <span className="font-bold text-xs truncate">{loc.name}</span>
                                        {qty !== undefined && (
                                            <span className={cn(
                                                "ml-2 text-[10px] font-black px-2 py-0.5 rounded-full",
                                                isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                                            )}>
                                                {qty} шт
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-6 text-center">
                                <p className="text-[10px] font-bold text-slate-400 ">Не найдено</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
