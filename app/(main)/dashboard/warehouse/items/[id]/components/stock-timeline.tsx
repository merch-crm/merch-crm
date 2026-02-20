import React from "react";
import {
    Activity,
    Package,
    ShoppingCart,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { ru } from "date-fns/locale";

interface StockTimelineProps {
    currentQuantity: number;
    unit: string;
    lowStockThreshold: number;
    criticalStockThreshold?: number;
    analytics: {
        daysToLow: number;
        daysToCritical: number;
    };
}

// Helper for Russian declension
function getDayDeclension(number: number) {
    const abs = Math.abs(number);
    if (abs % 10 === 1 && abs % 100 !== 11) return "день";
    if (abs % 10 >= 2 && abs % 10 <= 4 && (abs % 100 < 10 || abs % 100 >= 20)) return "дня";
    return "дней";
}

export function StockTimeline({
    currentQuantity,
    unit,
    lowStockThreshold,
    criticalStockThreshold = 0,
    analytics
}: StockTimelineProps) {
    return (
        <div className="lg:col-span-3 bg-primary/5 rounded-3xl p-5 border border-primary/10 relative overflow-hidden group flex flex-col">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

            <div className="flex items-center gap-3 mb-6 shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground transition-all shadow-sm">
                    <Activity className="w-5 h-5" />
                </div>
                <h5 className="text-[11px] font-black text-primary leading-tight">Таймлайн<br />остатков</h5>
            </div>

            <div className="flex-1 relative mt-2">
                {/* Vertical Connecting Line */}
                <div className="absolute left-[15px] top-6 bottom-6 w-[1px] bg-gradient-to-b from-emerald-400 via-amber-400 to-rose-400 opacity-20 z-0" />

                <div className="flex flex-col gap-3 h-full relative z-10">
                    {/* Stage 1: Today */}
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center shadow-sm z-10 shrink-0">
                            <Package className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-emerald-600 truncate">Сегодня</span>
                                <span className="text-xs font-black text-muted-foreground shrink-0">{format(new Date(), 'd MMM', { locale: ru })}</span>
                            </div>
                            <div className="flex items-baseline gap-1.5 leading-none">
                                <span className={cn(
                                    "text-2xl font-black",
                                    currentQuantity <= criticalStockThreshold ? "text-rose-600" :
                                        currentQuantity <= lowStockThreshold ? "text-amber-600" : "text-foreground"
                                )}>{currentQuantity}</span>
                                <span className="text-xs font-black text-muted-foreground">{unit}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stage 2: Low Stock */}
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-10 border-2 transition-colors shrink-0",
                            analytics.daysToLow <= 7 ? "bg-amber-50 border-amber-500" : "bg-card border-border"
                        )}>
                            <ShoppingCart className={cn("w-4 h-4", analytics.daysToLow <= 7 ? "text-amber-600" : "text-muted-foreground/30")} />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-amber-600 truncate">Порог закупки</span>
                                {analytics.daysToLow !== Infinity && (
                                    <span className="text-xs font-black text-muted-foreground shrink-0">
                                        ~ {format(addDays(new Date(), analytics.daysToLow), 'd MMM', { locale: ru })}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center flex-wrap gap-2 leading-none">
                                <div className="flex items-baseline gap-1">
                                    <span className={cn(
                                        "text-2xl font-black",
                                        analytics.daysToLow === 0 ? "text-amber-600" : "text-foreground"
                                    )}>
                                        {analytics.daysToLow === 0 ? "—" : (analytics.daysToLow === Infinity ? "∞" : analytics.daysToLow)}
                                    </span>
                                    <span className="text-xs font-black text-muted-foreground">
                                        {analytics.daysToLow === 0 ? "достигнут" : (analytics.daysToLow === Infinity ? "дней" : getDayDeclension(analytics.daysToLow))}
                                    </span>
                                </div>
                                <span className={cn(
                                    "text-xs font-bold px-1.5 py-0.5 rounded whitespace-nowrap",
                                    analytics.daysToLow === 0 ? "bg-amber-500 text-white" : "bg-amber-100/50 text-amber-700"
                                )}>
                                    {lowStockThreshold} {unit}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stage 3: Critical */}
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-10 border-2 transition-colors shrink-0",
                            analytics.daysToCritical <= 3 ? "bg-rose-50 border-rose-500" : "bg-card border-border"
                        )}>
                            <AlertTriangle className={cn("w-4 h-4", analytics.daysToCritical <= 3 ? "text-rose-600" : "text-muted-foreground/30")} />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-rose-600 truncate">Критический</span>
                                {analytics.daysToCritical !== Infinity && (
                                    <span className="text-xs font-black text-muted-foreground shrink-0">
                                        ~ {format(addDays(new Date(), analytics.daysToCritical), 'd MMM', { locale: ru })}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center flex-wrap gap-2 leading-none">
                                <div className="flex items-baseline gap-1">
                                    <span className={cn(
                                        "text-2xl font-black",
                                        analytics.daysToCritical === 0 ? "text-rose-600" : "text-foreground"
                                    )}>
                                        {analytics.daysToCritical === 0 ? "—" : (analytics.daysToCritical === Infinity ? "∞" : analytics.daysToCritical)}
                                    </span>
                                    <span className="text-xs font-black text-muted-foreground">
                                        {analytics.daysToCritical === 0 ? "критично" : (analytics.daysToCritical === Infinity ? "дней" : getDayDeclension(analytics.daysToCritical))}
                                    </span>
                                </div>
                                <span className={cn(
                                    "text-xs font-bold px-1.5 py-0.5 rounded whitespace-nowrap",
                                    analytics.daysToCritical === 0 ? "bg-rose-500 text-white" : "bg-rose-100/50 text-rose-700"
                                )}>
                                    {criticalStockThreshold} {unit}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
