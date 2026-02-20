import { useState } from "react";
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, startOfWeek, endOfWeek, addMonths, subMonths, setMonth, setYear } from "date-fns";

export interface DateRange {
    from: Date | null;
    to: Date | null;
}

export function useDateRangePicker(value: DateRange, onChange: (range: DateRange) => void, minDate?: Date, maxDate?: Date) {
    const [currentMonth, setCurrentMonth] = useState(value.from || new Date());
    const [selectingEnd, setSelectingEnd] = useState(false);
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    const [showMonthSelect, setShowMonthSelect] = useState(false);
    const [showYearSelect, setShowYearSelect] = useState(false);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

    const handleDayClick = (day: Date) => {
        if (!selectingEnd || !value.from) {
            onChange({ from: day, to: null });
            setSelectingEnd(true);
        } else {
            if (day < value.from) {
                onChange({ from: day, to: value.from });
            } else {
                onChange({ from: value.from, to: day });
            }
            setSelectingEnd(false);
        }
    };

    const isInRange = (day: Date) => {
        if (!value.from) return false;
        const end = value.to || (selectingEnd && hoveredDate ? hoveredDate : null);
        if (!end) return false;
        const start = value.from < end ? value.from : end;
        const finish = value.from < end ? end : value.from;
        return isWithinInterval(day, { start, end: finish });
    };

    const isRangeStart = (day: Date) => {
        if (!value.from) return false;
        return isSameDay(day, value.from);
    };

    const isRangeEnd = (day: Date) => {
        if (!value.to) {
            if (selectingEnd && hoveredDate) {
                return isSameDay(day, hoveredDate);
            }
            return false;
        }
        return isSameDay(day, value.to);
    };

    const isDisabled = (day: Date) => {
        if (minDate && day < minDate) return true;
        if (maxDate && day > maxDate) return true;
        return false;
    };

    return {
        state: { currentMonth, selectingEnd, hoveredDate, showMonthSelect, showYearSelect, days, years },
        actions: {
            setCurrentMonth, setHoveredDate, setShowMonthSelect, setShowYearSelect, handleDayClick,
            isInRange, isRangeStart, isRangeEnd, isDisabled
        }
    };
}
