import React from"react";
import { Activity, ArrowUpRight, ShoppingBag, Trash2, ArrowLeftRight, RefreshCw } from"lucide-react";

interface ActivityStatItemProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
    hoverColor: string;
}

function ActivityStatItem({ icon: Icon, label, value, hoverColor }: ActivityStatItemProps) {
    return (
        <div
            className="flex flex-col items-start gap-1 group/item hover:bg-slate-50 p-2 rounded-lg transition-colors cursor-default"
            aria-label={`${label}: ${value}`}
        >
            <div className={`flex items-center gap-2 text-slate-400 ${hoverColor} transition-colors min-w-0 w-full`}>
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold leading-tight">{label}</span>
            </div>
            <span className="text-xl font-black text-slate-800 tabular-nums">{value}</span>
        </div>
    );
}

interface ActivityTrendProps {
    activity: {
        ins: number;
        usage: number;
        waste: number;
        transfers: number;
        adjustments: number;
    };
}

export const ActivityTrend = React.memo(({ activity }: ActivityTrendProps) => {
    return (
        <div
            className="col-span-12 crm-card shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col xl:flex-row items-start xl:items-center gap-3 xl:justify-between bg-white"
            role="region"
            aria-label="Активность склада за 30 дней"
        >
            <div className="flex items-center gap-3 shrink-0 w-full xl:w-auto">
                <div className="w-10 h-10 rounded-[12px] bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/10 shrink-0">
                    <Activity className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                    <h4 className="text-[15px] font-bold text-slate-900  whitespace-nowrap">Активность за 30 дней</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="relative flex h-2 w-2" aria-hidden="true">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold text-emerald-600">Система активна</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-5 gap-3 w-full xl:w-auto">
                <ActivityStatItem
                    icon={ArrowUpRight}
                    label="Поставки"
                    value={activity.ins}
                    hoverColor="group-hover/item:text-emerald-500"
                />
                <ActivityStatItem
                    icon={ShoppingBag}
                    label="Продажи"
                    value={activity.usage}
                    hoverColor="group-hover/item:text-blue-500"
                />
                <ActivityStatItem
                    icon={Trash2}
                    label="Списания"
                    value={activity.waste}
                    hoverColor="group-hover/item:text-rose-500"
                />
                <ActivityStatItem
                    icon={ArrowLeftRight}
                    label="Перемещения"
                    value={activity.transfers}
                    hoverColor="group-hover/item:text-indigo-500"
                />
                <ActivityStatItem
                    icon={RefreshCw}
                    label="Корректировки"
                    value={activity.adjustments}
                    hoverColor="group-hover/item:text-amber-500"
                />
            </div>
        </div>
    );
});

ActivityTrend.displayName ="ActivityTrend";
