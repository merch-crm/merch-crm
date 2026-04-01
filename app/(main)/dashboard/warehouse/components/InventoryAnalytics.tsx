import React from"react";
import Link from"next/link";
import { TrendingUp, Clock, Package } from"lucide-react";
import { cn, formatUnit } from"@/lib/utils";
import { pluralize } from"@/lib/pluralize";

interface TopSoldItem {
    id: string;
    name: string;
    unit: string;
    totalSold: number;
}

interface StagnantItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    lastActivityAt: Date | null;
}

interface InventoryAnalyticsProps {
    topSoldItems: TopSoldItem[];
    stagnantItems: StagnantItem[];
}

const DaysSinceDisplay = ({ lastDate }: { lastDate: Date | string | null }) => {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    if (!mounted || !lastDate) {
        return <span className="text-xs font-black tabular-nums text-slate-400">{!lastDate ? 'никогда' : '...'}</span>;
    }

    const lastActivityDate = typeof lastDate === 'string' ? new Date(lastDate) : lastDate;
    const daysSince = Math.floor((Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)); // suppressHydrationWarning

    return (
        <span className={cn("text-xs font-black tabular-nums",
            daysSince > 90 ? "text-rose-500" :
            daysSince > 60 ? "text-orange-500" : "text-amber-500"
        )}>
            {daysSince} {pluralize(daysSince, "день", "дня", "дней")}
        </span>
    );
};

export const InventoryAnalytics = React.memo(({
    topSoldItems,
    stagnantItems
}: InventoryAnalyticsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Top-5 Sold Items */}
            <div
                className="crm-card bg-white shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
                role="region"
                aria-label="Топ продаж за 30 дней"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 text-white shrink-0">
                        <TrendingUp className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                    </div>
                    <div>
                        <h4 className="text-[15px] font-bold text-slate-900 leading-tight">Топ продаж</h4>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">За последние 30 дней</p>
                    </div>
                </div>
                <div className="card-breakout border-b border-slate-100 mt-5" />
                <div className="flex-1 pt-4">
                    {topSoldItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                                <TrendingUp className="w-5 h-5 text-slate-300" />
                            </div>
                            <p className="text-sm font-medium text-slate-400">Нет данных о продажах</p>
                        </div>
                    ) : (
                        <ol className="flex flex-col gap-2">
                            {topSoldItems.map((item, idx) => (
                                <li key={item.id}>
                                    <Link
                                        href={`/dashboard/warehouse/items/${item.id}`}
                                        className="group flex items-center gap-3 p-2.5 rounded-[10px] hover:bg-slate-50 transition-colors"
                                    >
                                        <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                                            idx === 0 ?"bg-amber-100 text-amber-600" :
                                                idx === 1 ?"bg-slate-100 text-slate-500" :
                                                    idx === 2 ?"bg-orange-100 text-orange-600" :"bg-slate-50 text-slate-400"
                                        )}>{idx + 1}</span>
                                        <span className="flex-1 text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">{item.name}</span>
                                        <span className="text-sm font-black text-emerald-600 tabular-nums shrink-0">
                                            {item.totalSold} {formatUnit(item.unit)}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>

            {/* Stagnant Items (30+ days without activity) */}
            <div
                className="crm-card bg-white shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
                role="region"
                aria-label="Товары без движения более 30 дней"
            >
                <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-[12px] flex items-center justify-center shadow-lg text-white shrink-0",
                        stagnantItems.length > 0
                            ?"bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25"
                            :"bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-500/25"
                    )}>
                        <Clock className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                    </div>
                    <div>
                        <h4 className={cn("text-[15px] font-bold leading-tight",
                            stagnantItems.length > 0 ?"text-amber-600" :"text-slate-900"
                        )}>Без движения 30+ дней</h4>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                            {stagnantItems.length > 0
                                ? `${stagnantItems.length} ${pluralize(stagnantItems.length, 'позиция', 'позиции', 'позиций')} без активности`
                                : 'Все позиции активны'}
                        </p>
                    </div>
                </div>
                <div className="card-breakout border-b border-slate-100 mt-5" />
                <div className="flex-1 pt-4">
                    {stagnantItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                                <Clock className="w-5 h-5 text-emerald-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-400">Все товары в активном обороте</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[260px] custom-scrollbar">
                            {stagnantItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/dashboard/warehouse/items/${item.id}`}
                                    className="group flex items-center gap-3 p-2.5 rounded-[10px] hover:bg-amber-50/50 border border-transparent hover:border-amber-100 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-[8px] bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                                        <Package className="w-4 h-4 text-amber-500" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-800 truncate group-hover:text-amber-700 transition-colors">{item.name}</div>
                                        <div className="text-xs text-slate-400">
                                            Остаток: <span className="font-bold text-slate-600">{item.quantity} {formatUnit(item.unit)}</span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <DaysSinceDisplay lastDate={item.lastActivityAt} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

InventoryAnalytics.displayName ="InventoryAnalytics";
