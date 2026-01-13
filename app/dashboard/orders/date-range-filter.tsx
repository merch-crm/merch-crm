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

const ranges = [
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
        <div className="flex flex-wrap items-center gap-2 mb-6 p-1 bg-slate-100/50 rounded-2xl w-fit">
            {ranges.slice(0, 3).map((range) => (
                <button
                    key={range.value}
                    onClick={() => handleRangeChange(range.value)}
                    className={cn(
                        "px-4 py-2 text-sm font-semibold rounded-xl transition-all",
                        currentRange === range.value && !isCustom
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    )}
                >
                    {range.label}
                </button>
            ))}

            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />

            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                    <button className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all border border-transparent group",
                        isCustom
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "bg-white text-slate-700 shadow-sm hover:text-slate-900 border-slate-200"
                    )}>
                        <CalendarIcon className={cn("w-4 h-4", isCustom ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                        <span>
                            {isCustom && dateRange?.from
                                ? `${format(dateRange.from, "dd.MM.yy")} - ${dateRange.to ? format(dateRange.to, "dd.MM.yy") : format(dateRange.from, "dd.MM.yy")}`
                                : "Выбрать период"}
                        </span>
                        <ChevronDown className={cn("w-4 h-4 ml-1 opacity-50", isCustom ? "text-white" : "")} />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-slate-200 shadow-2xl bg-white" align="start" sideOffset={8}>
                    {/* Calendar */}
                    <div className="p-4 bg-white">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={1}
                            locale={ru}
                        />

                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                            <div className="text-xs font-medium text-slate-500">
                                {dateRange?.from ? (
                                    <>
                                        Выбрано: <span className="text-indigo-600 font-bold">
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
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-600/20"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Применить
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
