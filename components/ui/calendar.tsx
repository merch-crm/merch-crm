"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { ru } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            locale={ru}
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                month_caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-sm font-bold text-slate-900",
                nav: "flex items-center",
                button_previous: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-white p-0 opacity-100 hover:bg-slate-50 border-slate-200 absolute left-1 z-10"
                ),
                button_next: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-white p-0 opacity-100 hover:bg-slate-50 border-slate-200 absolute right-1 z-10"
                ),
                month_grid: "w-full space-y-1",
                weekdays: "flex w-full justify-between mb-2",
                weekday: "text-slate-400 w-9 font-bold text-[10px] uppercase text-center flex-1",
                week: "flex w-full mt-1",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-bold aria-selected:opacity-100 hover:bg-slate-100 rounded-md transition-colors w-full text-slate-900"
                ),
                day_button: "h-9 w-9 p-0 font-bold w-full flex items-center justify-center text-inherit",
                range_start: "bg-indigo-600 text-white rounded-l-md",
                range_end: "bg-indigo-600 text-white rounded-r-md",
                selected: "bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white",
                today: "bg-slate-100 text-indigo-600 font-black",
                outside: "text-slate-300 opacity-50",
                disabled: "text-slate-300 opacity-50",
                range_middle: "bg-slate-100 !text-slate-900 !rounded-none",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
                    return <Icon className="h-4 w-4" />;
                },
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
