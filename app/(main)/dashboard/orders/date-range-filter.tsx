"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

const ranges = [
    { label: "Все время", value: "all" },
    { label: "Сегодня", value: "today" },
    { label: "Вчера", value: "yesterday" },
    { label: "7 дней", value: "7d" },
    { label: "30 дней", value: "30d" },
    { label: "90 дней", value: "90d" },
];

export function DateRangeFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentRange = searchParams.get("range") || "all";
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        fromParam && toParam
            ? { from: new Date(fromParam), to: new Date(toParam) }
            : undefined
    );
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const handleRangeChange = (range: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", range);
        params.delete("from");
        params.delete("to");
        router.push(`?${params.toString()}`);
        setIsPopoverOpen(false);
    };

    const handleApplyCustomRange = () => {
        if (dateRange?.from) {
            const params = new URLSearchParams(searchParams.toString());
            const fromStr = format(dateRange.from, "yyyy-MM-dd");
            const toStr = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : fromStr;

            params.set("from", fromStr);
            params.set("to", toStr);
            params.set("range", "custom");
            router.push(`?${params.toString()}`);
            setIsPopoverOpen(false);
        }
    };

    const isCustom = currentRange === "custom";

    return (
        <div className="flex flex-col gap-3">
            {/* Quick Range Buttons Grid */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 p-1 bg-slate-100/50 rounded-[22px] sm:rounded-2xl border border-slate-200/50 shadow-sm">
                {ranges.slice(0, 4).map((range) => (
                    <Button
                        key={range.value}
                        variant="ghost"
                        asChild
                        onClick={() => handleRangeChange(range.value)}
                        className={cn(
                            "px-4 py-2 text-[12px] sm:text-sm font-bold rounded-[14px] sm:rounded-[14px] transition-all whitespace-nowrap w-full sm:w-auto h-auto hover:bg-white/50",
                            currentRange === range.value && !isCustom
                                ? "bg-white text-primary shadow-sm hover:bg-white"
                                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                        )}
                    >
                        <button>{range.label}</button>
                    </Button>
                ))}

                {/* Custom Date Picker Button inside the same grid/flex container */}
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            asChild
                            className={cn(
                                "flex items-center justify-center gap-2 px-4 py-2 text-[12px] sm:text-sm font-bold rounded-[14px] transition-all whitespace-nowrap w-full sm:w-auto col-span-2 sm:col-span-1 h-auto hover:bg-white/50",
                                isCustom
                                    ? "bg-white text-primary shadow-sm hover:bg-white"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                            )}
                        >
                            <button>
                                <CalendarIcon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isCustom ? "text-primary" : "text-slate-400")} />
                                <span className="hidden sm:inline">Выбрать период</span>
                                <span className="sm:hidden">Период</span>
                                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-50" />
                            </button>
                        </Button>
                    </PopoverTrigger>
                    <AnimatePresence>
                        {isPopoverOpen && (
                            <PopoverContent
                                className="p-0 bg-transparent border-none shadow-none w-auto overflow-visible duration-0 data-[state=open]:animate-none data-[state=closed]:animate-none"
                                align="start"
                                sideOffset={8}
                                forceMount
                                asChild
                            >
                                <motion.div
                                    initial={{ opacity: 0, scaleY: 0.8, y: -10, originY: 0 }}
                                    animate={{ opacity: 1, scaleY: 1, y: 0 }}
                                    exit={{ opacity: 0, scaleY: 0.8, y: -10 }}
                                    transition={{
                                        duration: 0.3,
                                        ease: [0.23, 1, 0.32, 1],
                                        opacity: { duration: 0.2 }
                                    }}
                                    className="rounded-[22px] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.25),0_4px_16px_-4px_rgba(0,0,0,0.1)]"
                                >
                                    <div className="p-4 bg-white rounded-[22px] ring-1 ring-slate-900/10 border border-slate-200 overflow-hidden">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={dateRange?.from}
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            numberOfMonths={1}
                                            locale={ru}
                                        />

                                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
                                            <div className="text-xs font-medium text-slate-500">
                                                {dateRange?.from ? (
                                                    <>
                                                        Выбрано: <span className="text-primary font-bold">
                                                            {format(dateRange.from, "d MMM", { locale: ru })}
                                                            {dateRange.to && ` - ${format(dateRange.to, "d MMM", { locale: ru })}`}
                                                        </span>
                                                    </>
                                                ) : "Выберите даты"}
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={handleApplyCustomRange}
                                                disabled={!dateRange?.from}
                                                className="bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold shadow-lg shadow-primary/20 px-6"
                                            >
                                                Выбрать
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            </PopoverContent>
                        )}
                    </AnimatePresence>
                </Popover>

                {isCustom && fromParam && toParam && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-[14px] shadow-sm border border-slate-200/50 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-primary font-bold text-sm">
                            {format(new Date(fromParam), "dd.MM.yy")} — {format(new Date(toParam), "dd.MM.yy")}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRangeChange("all")}
                            className="w-6 h-6 p-0 text-slate-300 hover:text-rose-500 transition-colors hover:bg-transparent"
                        >
                            <Check className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
