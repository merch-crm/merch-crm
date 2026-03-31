"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

const periods = [
    { label: "Сегодня", value: "today" },
    { label: "Эта неделя", value: "week" },
    { label: "Этот месяц", value: "month" },
    { label: "Квартал", value: "quarter" },
    { label: "Весь период", value: "all" },
];

export function PeriodSelector() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPeriod = searchParams.get("period") || "month";

    const setPeriod = (period: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("period", period);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-1 bg-white p-1 rounded-[18px] border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-1">
                {periods.map((period) => (
                    <Button
                        key={period.value}
                        variant="ghost"
                        size="sm"
                        onClick={() => setPeriod(period.value)}
                        className={cn(
                            "rounded-[18px] px-3.5 h-8 text-xs font-bold  transition-all",
                            currentPeriod === period.value
                                ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-200"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                    >
                        {period.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
