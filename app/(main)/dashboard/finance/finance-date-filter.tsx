"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
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

const ranges = [
    { label: "День", value: "today" },
    { label: "Неделя", value: "7d" },
    { label: "Месяц", value: "30d" },
    { label: "Год", value: "365d" },
];

export function FinanceDateFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentRange = searchParams.get("range") || "30d"; // Default to Month
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
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-[18px] w-fit border border-slate-200/50 shadow-sm">
                {ranges.map((range) => (
                    <button
                        key={range.value}
                        onClick={() => handleRangeChange(range.value)}
                        className={cn(
                            "px-4 py-2 text-sm font-bold rounded-[18px] transition-all",
                            currentRange === range.value && !isCustom
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                        )}
                    >
                        {range.label}
                    </button>
                ))}
                <button
                    onClick={() => handleRangeChange("all")}
                    className={cn(
                        "px-4 py-2 text-sm font-bold rounded-[18px] transition-all",
                        currentRange === "all" && !isCustom
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    )}
                >
                    Все время
                </button>
            </div>

            <div className="flex items-center gap-2">
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <button
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-[18px] transition-all border border-slate-200 shadow-sm",
                                isCustom
                                    ? "bg-white text-slate-900"
                                    : "bg-white text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <CalendarIcon className={cn("w-4 h-4", isCustom ? "text-primary" : "text-slate-400")} />
                            <span>Выбрать период</span>
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-[1.5rem] overflow-hidden border-slate-200 shadow-2xl bg-white" align="end" sideOffset={8}>
                        <div className="p-4 bg-white">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={1}
                                locale={ru}
                                className="rounded-[18px]"
                            />

                            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
                                <div className="text-xs font-medium text-slate-500">
                                    {dateRange?.from ? (
                                        <>
                                            Выбрано: <span className="text-slate-900 font-bold">
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
                                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-[18px] font-bold px-6"
                                >
                                    Применить
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {(fromParam && toParam) ? (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-[18px] border border-slate-200 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-slate-600 font-bold text-sm">
                            {format(new Date(fromParam), "d MMMM", { locale: ru })}
                            {fromParam !== toParam && ` — ${format(new Date(toParam), "d MMMM", { locale: ru })}`}
                        </span>
                    </div>
                ) : currentRange !== "all" && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-[18px] border border-slate-200 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-slate-400 font-bold text-sm  tracking-normal text-[10px]">
                            {currentRange === "today" && "За сегодня"}
                            {currentRange === "7d" && "За последние 7 дней"}
                            {currentRange === "30d" && "За последние 30 дней"}
                            {currentRange === "365d" && "За последний год"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
