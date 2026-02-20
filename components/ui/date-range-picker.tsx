"use client";

import * as React from "react";
import { format, isSameMonth, addMonths, subMonths, setMonth, setYear, startOfMonth, endOfMonth } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useDateRangePicker, DateRange } from "@/components/hooks/useDateRangePicker";

// Названия месяцев и дней на русском
const MONTHS = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];


interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
    minDate?: Date;
    maxDate?: Date;
    className?: string;
}

function DateRangePickerCalendar({
    value,
    onChange,
    minDate,
    maxDate,
    className,
}: DateRangePickerProps) {
    const { state, actions } = useDateRangePicker(value, onChange, minDate, maxDate);
    const { currentMonth, showMonthSelect, showYearSelect, days, years } = state;
    const { setCurrentMonth, setHoveredDate, setShowMonthSelect, setShowYearSelect, handleDayClick, isInRange, isRangeStart, isRangeEnd, isDisabled } = actions;

    return (
        <div className={cn("bg-white rounded-2xl p-5 shadow-xl border border-slate-100 w-[340px]", className)}>
            {/* Хедер с селектами месяца и года */}
            <div className="flex items-center gap-2 mb-4">
                {/* Селект месяца */}
                <div className="relative flex-1">
                    <button type="button"
                        onClick={() => {
                            setShowMonthSelect(!showMonthSelect);
                            setShowYearSelect(false);
                        }}
                        className="w-full h-10 px-4 bg-slate-100 rounded-full text-sm font-bold text-slate-700 flex items-center justify-between hover:bg-slate-200 transition-colors"
                    >
                        {MONTHS[currentMonth.getMonth()]}
                        <ChevronRight className={cn("w-4 h-4 transition-transform", showMonthSelect && "rotate-90")} />
                    </button>
                    {showMonthSelect && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-2 z-10 grid grid-cols-3 gap-1">
                            {MONTHS.map((month, index) => (
                                <button type="button"
                                    key={month}
                                    onClick={() => {
                                        setCurrentMonth(setMonth(currentMonth, index));
                                        setShowMonthSelect(false);
                                    }}
                                    className={cn(
                                        "px-2 py-2 text-xs font-medium rounded-lg transition-colors",
                                        currentMonth.getMonth() === index
                                            ? "bg-primary text-white"
                                            : "hover:bg-slate-100 text-slate-700"
                                    )}
                                >
                                    {month.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Селект года */}
                <div className="relative flex-1">
                    <button type="button"
                        onClick={() => {
                            setShowYearSelect(!showYearSelect);
                            setShowMonthSelect(false);
                        }}
                        className="w-full h-10 px-4 bg-slate-100 rounded-full text-sm font-bold text-slate-700 flex items-center justify-between hover:bg-slate-200 transition-colors"
                    >
                        {currentMonth.getFullYear()}
                        <ChevronRight className={cn("w-4 h-4 transition-transform", showYearSelect && "rotate-90")} />
                    </button>
                    {showYearSelect && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-2 z-10 max-h-48 overflow-y-auto">
                            {years.map((year) => (
                                <button type="button"
                                    key={year}
                                    onClick={() => {
                                        setCurrentMonth(setYear(currentMonth, year));
                                        setShowYearSelect(false);
                                    }}
                                    className={cn(
                                        "w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left",
                                        currentMonth.getFullYear() === year
                                            ? "bg-primary text-white"
                                            : "hover:bg-slate-100 text-slate-700"
                                    )}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Навигация по месяцам */}
            <div className="flex items-center justify-between mb-4">
                <button type="button"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button type="button"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
            </div>

            {/* Дни недели */}
            <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="h-10 flex items-center justify-center text-xs font-bold text-slate-400"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Дни месяца */}
            <div className="grid grid-cols-7">
                {days.map((day, index) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isStart = isRangeStart(day);
                    const isEnd = isRangeEnd(day);
                    const inRange = isInRange(day);
                    const disabled = isDisabled(day);

                    return (
                        <div
                            key={index}
                            className="relative h-10 flex items-center justify-center"
                        >
                            {/* Фон диапазона */}
                            {inRange && !isStart && !isEnd && (
                                <div className="absolute inset-y-1 inset-x-0 bg-primary/15" />
                            )}
                            {inRange && isStart && (
                                <div className="absolute inset-y-1 left-1/2 right-0 bg-primary/15" />
                            )}
                            {inRange && isEnd && (
                                <div className="absolute inset-y-1 left-0 right-1/2 bg-primary/15" />
                            )}

                            <button type="button"
                                onClick={() => !disabled && handleDayClick(day)}
                                onMouseEnter={() => setHoveredDate(day)}
                                onMouseLeave={() => setHoveredDate(null)}
                                disabled={disabled}
                                className={cn(
                                    "relative z-10 w-10 h-10 rounded-full text-sm font-medium transition-all",
                                    !isCurrentMonth && "text-slate-300",
                                    isCurrentMonth && !isStart && !isEnd && !disabled && "text-slate-700 hover:bg-slate-100",
                                    (isStart || isEnd) && "bg-primary text-white shadow-lg shadow-primary/25",
                                    inRange && !isStart && !isEnd && isCurrentMonth && "text-primary font-bold",
                                    disabled && "cursor-not-allowed opacity-40"
                                )}
                            >
                                {day.getDate()}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Полный компонент с попапом и инпутом
interface DateRangePickerInputProps extends DateRangePickerProps {
    placeholder?: string;
    label?: string;
    onApply?: () => void;
    onCancel?: () => void;
}

function DateRangePicker({
    value,
    onChange,
    placeholder = "Выберите период",
    label,
    minDate,
    maxDate,
    onApply,
    onCancel,
    className,
}: DateRangePickerInputProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [tempValue, setTempValue] = React.useState<DateRange>(value);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Закрытие при клике вне
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setTempValue(value);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value]);

    const handleApply = () => {
        onChange(tempValue);
        setIsOpen(false);
        onApply?.();
    };

    const handleCancel = () => {
        setTempValue(value);
        setIsOpen(false);
        onCancel?.();
    };

    const formatRange = () => {
        if (!value.from) return placeholder;
        if (!value.to) return format(value.from, "d MMM yyyy", { locale: ru });
        return `${format(value.from, "d MMM", { locale: ru })} — ${format(value.to, "d MMM yyyy", { locale: ru })}`;
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {label && (
                <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">{label}</label>
            )}

            {/* Триггер */}
            <button type="button"
                onClick={() => {
                    setTempValue(value);
                    setIsOpen(!isOpen);
                }}
                className={cn(
                    "w-full h-11 px-4 bg-white border border-slate-200 rounded-md text-sm font-medium text-left flex items-center gap-3 transition-all",
                    "hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    isOpen && "ring-2 ring-primary/20 border-primary"
                )}
            >
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className={cn(!value.from && "text-slate-400")}>
                    {formatRange()}
                </span>
            </button>

            {/* Попап */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        <DateRangePickerCalendar
                            value={tempValue}
                            onChange={setTempValue}
                            minDate={minDate}
                            maxDate={maxDate}
                            className="shadow-none border-none"
                        />

                        {/* Футер с кнопками */}
                        <div className="flex items-center gap-3 p-4 pt-0">
                            <button type="button"
                                onClick={handleCancel}
                                className="flex-1 h-11 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                Отмена
                            </button>
                            <button type="button"
                                onClick={handleApply}
                                disabled={!tempValue.from}
                                className="flex-1 h-11 rounded-xl text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Применить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Пресеты быстрого выбора
interface DateRangePreset {
    label: string;
    getValue: () => DateRange;
}

interface DateRangePickerWithPresetsProps extends DateRangePickerInputProps {
    presets?: DateRangePreset[];
}

const DEFAULT_PRESETS: DateRangePreset[] = [
    {
        label: "Сегодня",
        getValue: () => {
            const today = new Date();
            return { from: today, to: today };
        },
    },
    {
        label: "Вчера",
        getValue: () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return { from: yesterday, to: yesterday };
        },
    },
    {
        label: "Последние 7 дней",
        getValue: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 6);
            return { from: start, to: end };
        },
    },
    {
        label: "Последние 30 дней",
        getValue: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 29);
            return { from: start, to: end };
        },
    },
    {
        label: "Этот месяц",
        getValue: () => {
            const now = new Date();
            return { from: startOfMonth(now), to: now };
        },
    },
    {
        label: "Прошлый месяц",
        getValue: () => {
            const now = new Date();
            const lastMonth = subMonths(now, 1);
            return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
        },
    },
];

function DateRangePickerWithPresets({
    value,
    onChange,
    presets = DEFAULT_PRESETS,
    placeholder = "Выберите период",
    label,
    minDate,
    maxDate,
    className,
}: DateRangePickerWithPresetsProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [tempValue, setTempValue] = React.useState<DateRange>(value);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setTempValue(value);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value]);

    const handleApply = () => {
        onChange(tempValue);
        setIsOpen(false);
    };

    const handleCancel = () => {
        setTempValue(value);
        setIsOpen(false);
    };

    const handlePreset = (preset: DateRangePreset) => {
        const range = preset.getValue();
        setTempValue(range);
    };

    const formatRange = () => {
        if (!value.from) return placeholder;
        if (!value.to) return format(value.from, "d MMM yyyy", { locale: ru });
        return `${format(value.from, "d MMM", { locale: ru })} — ${format(value.to, "d MMM yyyy", { locale: ru })}`;
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {label && (
                <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">{label}</label>
            )}

            <button type="button"
                onClick={() => {
                    setTempValue(value);
                    setIsOpen(!isOpen);
                }}
                className={cn(
                    "w-full h-11 px-4 bg-white border border-slate-200 rounded-md text-sm font-medium text-left flex items-center gap-3 transition-all",
                    "hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    isOpen && "ring-2 ring-primary/20 border-primary"
                )}
            >
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className={cn(!value.from && "text-slate-400")}>
                    {formatRange()}
                </span>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex">
                        {/* Пресеты */}
                        <div className="w-44 border-r border-slate-100 p-3 space-y-1">
                            {presets.map((preset) => (
                                <button type="button"
                                    key={preset.label}
                                    onClick={() => handlePreset(preset)}
                                    className="w-full px-3 py-2 text-left text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>

                        {/* Календарь */}
                        <div>
                            <DateRangePickerCalendar
                                value={tempValue}
                                onChange={setTempValue}
                                minDate={minDate}
                                maxDate={maxDate}
                                className="shadow-none border-none"
                            />

                            <div className="flex items-center gap-3 p-4 pt-0">
                                <button type="button"
                                    onClick={handleCancel}
                                    className="flex-1 h-11 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    Отмена
                                </button>
                                <button type="button"
                                    onClick={handleApply}
                                    disabled={!tempValue.from}
                                    className="flex-1 h-11 rounded-xl text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Применить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export {
    DateRangePicker,
    DateRangePickerCalendar,
    DateRangePickerWithPresets,
    DEFAULT_PRESETS,
    type DateRange,
    type DateRangePreset,
};
