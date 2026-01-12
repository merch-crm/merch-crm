"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, subDays, startOfDay, endOfDay, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DayPicker, type DateRange } from "react-day-picker";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const ranges = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "7 days", value: "7d" },
    { label: "30 days", value: "30d" },
    { label: "90 days", value: "90d" },
];

// Custom DayButton component with teal styling
function CustomDayButton(props: any) {
    const { day, modifiers, children, ...buttonProps } = props;

    let style: React.CSSProperties = {
        width: '40px',
        height: '40px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: '#334155',
    };

    if (modifiers.range_start || modifiers.range_end) {
        style = {
            ...style,
            backgroundColor: '#14b8a6',
            color: 'white',
            borderRadius: '12px',
            fontWeight: '600',
        };
    } else if (modifiers.range_middle) {
        style = {
            ...style,
            backgroundColor: '#ccfbf1',
            color: '#0f766e',
            borderRadius: '0',
        };
    } else if (modifiers.selected) {
        style = {
            ...style,
            backgroundColor: '#14b8a6',
            color: 'white',
            borderRadius: '12px',
        };
    } else if (modifiers.today) {
        style = {
            ...style,
            color: '#14b8a6',
            fontWeight: '700',
        };
    }

    if (modifiers.outside) {
        style = {
            ...style,
            color: '#cbd5e1',
            opacity: 0.4,
        };
    }

    if (modifiers.disabled) {
        style = {
            ...style,
            color: '#cbd5e1',
            opacity: 0.4,
            cursor: 'not-allowed',
        };
    }

    return (
        <button
            {...buttonProps}
            style={style}
            onMouseEnter={(e) => {
                if (!modifiers.range_start && !modifiers.range_end && !modifiers.selected && !modifiers.disabled) {
                    e.currentTarget.style.backgroundColor = '#ccfbf1';
                    e.currentTarget.style.color = '#0f766e';
                }
            }}
            onMouseLeave={(e) => {
                if (!modifiers.range_start && !modifiers.range_end && !modifiers.selected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#334155';
                }
            }}
        >
            {children}
        </button>
    );
}

// Custom HeadCell component for teal weekday headers
function CustomHeadCell(props: any) {
    const { children, ...rest } = props;
    return (
        <th
            {...rest}
            style={{
                color: '#14b8a6',
                fontWeight: '700',
                fontSize: '12px',
                textTransform: 'uppercase',
                textAlign: 'center',
                padding: '8px',
                width: '40px',
                height: '40px',
            }}
        >
            {children}
        </th>
    );
}

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

    const handleReset = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("range");
        params.delete("from");
        params.delete("to");
        router.push(`?${params.toString()}`);
        setDateRange(undefined);
        setIsPopoverOpen(false);
    };

    const handleApplyCustomRange = () => {
        if (dateRange?.from && dateRange?.to) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("from", format(dateRange.from, "yyyy-MM-dd"));
            params.set("to", format(dateRange.to, "yyyy-MM-dd"));
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
                    {range.label === "Today" ? "Сегодня" : range.label === "Yesterday" ? "Вчера" : "7 дней"}
                </button>
            ))}

            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />

            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                    <button className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all border border-transparent",
                        isCustom
                            ? "bg-white text-slate-900 shadow-sm border-slate-200"
                            : "text-slate-500 hover:text-slate-900 transition-colors"
                    )}>
                        <CalendarIcon className="w-4 h-4" />
                        <span>{isCustom && dateRange?.from && dateRange?.to
                            ? `${format(dateRange.from, "dd.MM.yy")} - ${format(dateRange.to, "dd.MM.yy")}`
                            : "Выбрать период"}</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-[24px] overflow-hidden border-slate-200 shadow-2xl bg-white" align="start" sideOffset={8}>
                    {/* Calendar */}
                    <div className="p-4 bg-white relative">
                        <DayPicker
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            locale={ru}
                            className="rdp-custom"
                            classNames={{
                                months: "space-y-4",
                                month: "space-y-4",
                                caption: "flex justify-center pt-1 relative items-center mb-6",
                                caption_label: "text-sm font-bold text-slate-900",
                                nav: "space-x-1 flex items-center",
                                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-lg hover:bg-slate-100",
                                nav_button_previous: "absolute left-1",
                                nav_button_next: "absolute right-1",
                                table: "w-full border-collapse",
                                head_row: "",
                                head_cell: "text-teal-500 font-bold text-xs uppercase w-10 h-10 text-center",
                                row: "",
                                cell: "text-center p-0 relative",
                                day: "h-10 w-10 p-0 font-medium inline-flex items-center justify-center rounded-lg hover:bg-teal-50 hover:text-teal-700 text-slate-700 transition-colors",
                                day_range_start: "!bg-teal-500 !text-white !rounded-xl hover:!bg-teal-600",
                                day_range_end: "!bg-teal-500 !text-white !rounded-xl hover:!bg-teal-600",
                                day_range_middle: "!bg-teal-50 !text-teal-700 !rounded-none",
                                day_selected: "bg-teal-500 text-white rounded-xl",
                                day_today: "text-teal-600 font-bold",
                                day_outside: "text-slate-300 opacity-40",
                                day_disabled: "text-slate-300 opacity-40 cursor-not-allowed",
                                day_hidden: "invisible",
                            }}
                            components={{
                                DayButton: CustomDayButton,
                                Chevron: (props) => (
                                    props.orientation === "left"
                                        ? <ChevronLeft className="h-4 w-4 text-slate-500" />
                                        : <ChevronRight className="h-4 w-4 text-slate-500" />
                                ),
                            }}
                            formatters={{
                                formatCaption: (date) => format(date, "MMMM yyyy", { locale: ru }).replace(/^\w/, c => c.toUpperCase()),
                                formatWeekdayName: (date) => format(date, "EEEEEE", { locale: ru })
                            }}
                        />

                        {isCustom && (
                            <div className="mt-6 flex justify-end gap-2 pr-2">
                                <Button
                                    size="sm"
                                    onClick={handleApplyCustomRange}
                                    className="bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold px-8 py-6 shadow-lg text-base"
                                >
                                    Выбрать
                                </Button>
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div >
    );
}
