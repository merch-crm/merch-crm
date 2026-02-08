"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
    Banknote,
    Tag,
    Warehouse,
    TrendingUp,
    ArrowUp,
    ArrowDown,
    Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useBranding } from "@/components/branding-provider";
import { InventoryItem, ItemHistoryTransaction } from "../../../types";
import { Session } from "@/lib/auth";

interface ItemFinancialSectionProps {
    item: InventoryItem;
    history: ItemHistoryTransaction[];
    isEditing: boolean;
    editData: Partial<InventoryItem>;
    setEditData: React.Dispatch<React.SetStateAction<Partial<InventoryItem>>>;
    handleStartEdit: () => void;
    user: Session | null;
    className?: string;
}

export function ItemFinancialSection({
    item,
    history,
    isEditing,
    editData,
    setEditData,
    handleStartEdit,
    user,
    className
}: ItemFinancialSectionProps) {
    const { currencySymbol } = useBranding();
    const [costTimeframe, setCostTimeframe] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('1m');
    const [hoveredCostPoint, setHoveredCostPoint] = useState<number | null>(null);
    const [graphWidth, setGraphWidth] = useState(1000);
    const graphRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === graphRef.current) {
                    setGraphWidth(Math.max(100, entry.contentRect.width));
                }
            }
        });

        const el = graphRef.current;
        if (el) observer.observe(el);

        return () => {
            if (el) observer.unobserve(el);
            observer.disconnect();
        };
    }, []);

    // Calculate last purchase price (most recent supply)
    const lastInCostPrice = useMemo(() => {
        const supplyTxs = history.filter(tx => tx.type === 'in' && Number(tx.costPrice) > 0);
        if (supplyTxs.length > 0) {
            return Number(supplyTxs[0].costPrice);
        }
        return Number(item.costPrice) || 0;
    }, [history, item.costPrice]);

    // Calculate Weighted Average Cost (WAC)
    const weightedAverageCost = useMemo(() => {
        const supplyTxs = history.filter(tx => tx.type === 'in' && Number(tx.costPrice) > 0 && tx.changeAmount > 0);

        if (supplyTxs.length === 0) {
            return Number(item.costPrice) || 0;
        }

        let totalCost = 0;
        let totalQuantity = 0;

        for (const tx of supplyTxs) {
            const qty = tx.changeAmount;
            const price = Number(tx.costPrice);
            totalCost += qty * price;
            totalQuantity += qty;
        }

        if (totalQuantity === 0) {
            return Number(item.costPrice) || 0;
        }

        return totalCost / totalQuantity;
    }, [history, item.costPrice]);

    const costHistoryStats = useMemo(() => {
        const supplyTxs = history
            .filter(tx => tx.type === 'in' && tx.costPrice)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        const lastPriceFromHistory = supplyTxs.length > 0 ? Number(supplyTxs[supplyTxs.length - 1].costPrice) : 0;
        const currentPrice = (Number(item.costPrice) > 0) ? Number(item.costPrice) : (lastPriceFromHistory || 0);

        const groupedByDate: Record<string, { date: Date, prices: number[] }> = {};
        supplyTxs.forEach(tx => {
            const dateKey = format(new Date(tx.createdAt), 'yyyy-MM-dd');
            if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = { date: new Date(tx.createdAt), prices: [] };
            }
            groupedByDate[dateKey].prices.push(Number(tx.costPrice));
        });

        const supplyPoints = Object.values(groupedByDate).map(group => ({
            date: group.date,
            costs: group.prices,
            label: format(group.date, 'd MMM', { locale: ru }),
            avg: group.prices.reduce((a, b) => a + b, 0) / group.prices.length,
            hasData: true,
            lastDate: group.date
        }));

        let filteredPoints = [...supplyPoints];
        const now = new Date();

        if (costTimeframe === '1m') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(now.getMonth() - 1);
            filteredPoints = supplyPoints.filter(p => p.date >= oneMonthAgo);
        } else if (costTimeframe === '3m') {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            filteredPoints = supplyPoints.filter(p => p.date >= threeMonthsAgo);
        } else if (costTimeframe === '6m') {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            filteredPoints = supplyPoints.filter(p => p.date >= sixMonthsAgo);
        } else if (costTimeframe === '1y') {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(now.getFullYear() - 1);
            filteredPoints = supplyPoints.filter(p => p.date >= oneYearAgo);
        }

        filteredPoints.push({
            date: new Date(),
            costs: [currentPrice],
            label: "Тек.",
            avg: currentPrice,
            hasData: currentPrice > 0,
            lastDate: new Date()
        });

        const points = filteredPoints.filter(p => p.avg > 0);

        const allIndividualCosts = points.map(p => p.avg).filter(v => v > 0);

        let minVal = allIndividualCosts.length > 0 ? Math.min(...allIndividualCosts) : (currentPrice > 0 ? currentPrice : 100);
        let maxVal = allIndividualCosts.length > 0 ? Math.max(...allIndividualCosts) : (currentPrice > 0 ? currentPrice : 110);

        const diff = maxVal - minVal;
        if (diff === 0) {
            minVal = minVal > 0 ? minVal * 0.8 : 0;
            maxVal = maxVal > 0 ? maxVal * 1.2 : 100;
        } else {
            minVal = Math.max(0, minVal - diff * 0.15);
            maxVal = maxVal + diff * 0.15;
        }

        const firstPoint = supplyPoints[0];
        let yearlyChange = 0;
        if (firstPoint && firstPoint.avg > 0) {
            yearlyChange = ((currentPrice - firstPoint.avg) / firstPoint.avg) * 100;
        }

        const supplyTxsForWac = history.filter(tx => tx.type === 'in' && Number(tx.costPrice) > 0 && tx.changeAmount > 0);
        let wacForStats = currentPrice;
        if (supplyTxsForWac.length > 0) {
            let totalCost = 0;
            let totalQty = 0;
            for (const tx of supplyTxsForWac) {
                totalCost += tx.changeAmount * Number(tx.costPrice);
                totalQty += tx.changeAmount;
            }
            if (totalQty > 0) {
                wacForStats = totalCost / totalQty;
            }
        }

        return {
            points,
            max: maxVal,
            min: minVal,
            actualMax: allIndividualCosts.length > 0 ? Math.max(...allIndividualCosts) : currentPrice,
            actualMin: allIndividualCosts.length > 0 ? Math.min(...allIndividualCosts) : currentPrice,
            avg: wacForStats,
            yearlyChange: yearlyChange
        };
    }, [history, item.costPrice, costTimeframe]);


    if (user?.roleName === 'Менеджер') return null;

    return (
        <div className={cn(
            "glass-panel rounded-3xl p-6 transition-all bg-white relative overflow-hidden flex flex-col gap-6 shadow-sm hover:shadow-md duration-500",
            className
        )}>
            {/* Main Header */}
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white transition-all shadow-sm">
                    <Banknote className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Стоимость</h3>
            </div>

            {/* SECTION 1: Compact Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Cost Price */}
                <div className="group p-4 rounded-2xl bg-[#f8fafc] border border-slate-200 transition-all duration-300 hover:bg-white hover:border-slate-300 flex items-center gap-4 text-left h-full">
                    <div className="w-11 h-11 rounded-3xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 relative overflow-hidden shadow-sm border border-blue-100/50">
                        <div className="absolute inset-0 bg-white/40" />
                        <span className="text-lg font-bold relative z-10">{currencySymbol}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-normal mb-1 transition-colors group-hover:text-slate-500">Себестоимость</span>
                        {isEditing ? (
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    value={editData.costPrice ?? ""}
                                    onChange={(e) => setEditData((prev: any) => ({ ...prev, costPrice: e.target.value === "" ? 0 : parseFloat(e.target.value) }))}
                                    className="text-lg font-black text-slate-900 bg-white border-none p-1 w-full focus:ring-0 rounded-lg"
                                />
                            </div>
                        ) : (
                            <div className="cursor-pointer" onDoubleClick={handleStartEdit}>
                                <p className="text-lg font-black text-slate-900 tracking-tight group-hover:text-black transition-colors">
                                    {Math.round(weightedAverageCost).toLocaleString('ru-RU')} {currencySymbol}
                                </p>
                                {Math.abs(weightedAverageCost - lastInCostPrice) > 1 && (
                                    <span className="text-[10px] text-slate-400 block -mt-0.5">
                                        последняя: {lastInCostPrice.toLocaleString('ru-RU')} {currencySymbol}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Selling Price */}
                <div className="group p-4 rounded-2xl bg-[#f8fafc] border border-slate-200 transition-all duration-300 hover:bg-white hover:border-slate-300 flex items-center gap-4 text-left h-full">
                    <div className="w-11 h-11 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-500 shrink-0 relative overflow-hidden shadow-sm border border-emerald-100/50">
                        <div className="absolute inset-0 bg-white/40" />
                        <Tag className="w-5 h-5 relative z-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-normal mb-1 transition-colors group-hover:text-slate-500">Цена продажи</span>
                        {isEditing ? (
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    value={editData.sellingPrice ?? ""}
                                    onChange={(e) => setEditData((prev: any) => ({ ...prev, sellingPrice: e.target.value === "" ? 0 : parseFloat(e.target.value) }))}
                                    className="text-lg font-black text-slate-900 bg-white border-none p-1 w-full focus:ring-0 rounded-lg"
                                />
                            </div>
                        ) : (
                            <p className="text-lg font-black text-slate-900 tracking-tight cursor-pointer group-hover:text-black transition-colors" onDoubleClick={handleStartEdit}>
                                {(Number(item.sellingPrice) || 0).toLocaleString('ru-RU')} {currencySymbol}
                            </p>
                        )}
                    </div>
                </div>

                {/* Total Stock Value */}
                <div className="group p-4 rounded-2xl bg-[#f8fafc] border border-slate-200 transition-all duration-300 hover:bg-white hover:border-slate-300 flex items-center gap-4 text-left h-full">
                    <div className="w-11 h-11 rounded-3xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 relative overflow-hidden shadow-sm border border-amber-100/50">
                        <div className="absolute inset-0 bg-white/40" />
                        <Warehouse className="w-5 h-5 relative z-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-normal mb-1 transition-colors group-hover:text-slate-500">Склад по с/с</span>
                        <p className="text-lg font-black text-slate-900 tracking-tight group-hover:text-black transition-colors">
                            {Math.round(item.quantity * weightedAverageCost).toLocaleString('ru-RU')} {currencySymbol}
                        </p>
                    </div>
                </div>
            </div>

            {/* SECTION 2: History & Chart */}
            <div className="flex flex-col gap-4 mt-4 flex-1">
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">Аналитика цен</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-normal whitespace-nowrap">Динамика закупок</p>
                        </div>
                    </div>
                </div>

                {/* Prominent History Stats Row */}
                <div className="grid grid-cols-3 gap-3 relative z-10 px-0.5">
                    {[
                        { label: 'Максимум', value: costHistoryStats.actualMax, color: 'text-slate-900', icon: ArrowUp, iconColor: 'text-rose-500', bg: 'bg-rose-50' },
                        { label: 'Средняя', value: costHistoryStats.avg, color: 'text-primary', icon: Activity, iconColor: 'text-primary', bg: 'bg-primary/5' },
                        { label: 'Минимум', value: costHistoryStats.actualMin, color: 'text-slate-900', icon: ArrowDown, iconColor: 'text-emerald-500', bg: 'bg-emerald-50' }
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col gap-1.5 p-4 rounded-2xl bg-[#f8fafc] border border-slate-200 transition-all hover:bg-white hover:border-slate-300 group/stat">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-normal transition-colors group-hover/stat:text-slate-500">{stat.label}</span>
                                <stat.icon className={cn("w-3.5 h-3.5 transition-transform duration-500 group-hover/stat:scale-110", stat.iconColor)} />
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className={cn("text-xl font-black tracking-tight", stat.color)}>
                                    {Math.round(stat.value).toLocaleString()}
                                </span>
                                <span className="text-[10px] font-black text-slate-300">{currencySymbol}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-1 mt-auto">
                    {/* Timeframe Selector Row - Full Width */}
                    <div className="flex bg-slate-100/50 p-1.5 rounded-[28px] border border-slate-200/50 transition-all w-full">
                        {(['1m', '3m', '6m', '1y', 'all'] as const).map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setCostTimeframe(tf)}
                                className={cn(
                                    "relative flex-1 py-2 text-[10px] font-black transition-all duration-300 rounded-3xl",
                                    costTimeframe === tf ? "text-white" : "text-slate-400 hover:text-slate-900"
                                )}
                            >
                                {costTimeframe === tf && (
                                    <motion.div
                                        layoutId="activeCostTimeframeIndicatorLocal"
                                        className="absolute inset-0 bg-primary rounded-3xl shadow-lg shadow-primary/20"
                                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                    />
                                )}
                                <span className="relative z-10">
                                    {tf === '1m' ? 'Месяц' : tf === '3m' ? '3 месяца' : tf === '6m' ? 'Полгода' : tf === '1y' ? 'Год' : 'Все время'}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="relative h-[120px] w-full group/chart overflow-visible" ref={graphRef}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={costTimeframe}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute inset-0"
                            >
                                <svg width="100%" height="100%" viewBox={`0 0 ${graphWidth} 120`} className="overflow-visible">
                                    <defs>
                                        <linearGradient id="premiumChartCompactGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.1" />
                                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Grid Lines */}
                                    {[0, 25, 50, 75, 100].map(p => (
                                        <line
                                            key={p}
                                            x1="0"
                                            y1={`${p}%`}
                                            x2={graphWidth}
                                            y2={`${p}%`}
                                            stroke="#f1f5f9"
                                            strokeWidth="1"
                                            strokeOpacity="0.5"
                                        />
                                    ))}

                                    {(() => {
                                        const pts = costHistoryStats.points;
                                        if (pts.length < 2) return null;

                                        const paddingX = 40;
                                        const paddingY = 10;
                                        const currentGraphWidth = graphWidth - paddingX * 2;
                                        const graphHeight = 120 - paddingY * 2;
                                        const range = Math.max(1, costHistoryStats.max - costHistoryStats.min);

                                        const getY = (val: number) => 120 - paddingY - ((val - costHistoryStats.min) / range) * graphHeight;
                                        const getX = (i: number) => paddingX + (i / (pts.length - 1)) * currentGraphWidth;

                                        // Generate Path
                                        let d = `M ${getX(0)} ${getY(pts[0].avg)}`;
                                        for (let i = 0; i < pts.length - 1; i++) {
                                            const x1 = getX(i);
                                            const y1 = getY(pts[i].avg);
                                            const x2 = getX(i + 1);
                                            const y2 = getY(pts[i + 1].avg);
                                            const cp1x = x1 + (x2 - x1) * 0.4;
                                            const cp2x = x1 + (x2 - x1) * 0.6;
                                            d += ` C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
                                        }

                                        const areaD = `${d} L ${getX(pts.length - 1)} 120 L ${getX(0)} 120 Z`;

                                        return (
                                            <>
                                                <motion.path
                                                    d={areaD}
                                                    fill="url(#premiumChartCompactGradient)"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 1 }}
                                                />
                                                <motion.path
                                                    d={d}
                                                    fill="none"
                                                    stroke="#4f46e5"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: 1 }}
                                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                                />

                                                {/* Dots and Labels */}
                                                {pts.map((p, i) => (
                                                    <g
                                                        key={i}
                                                        onMouseEnter={() => setHoveredCostPoint(i)}
                                                        onMouseLeave={() => setHoveredCostPoint(null)}
                                                        className="cursor-pointer"
                                                    >
                                                        {/* Vertical Line on Hover */}
                                                        <AnimatePresence>
                                                            {hoveredCostPoint === i && (
                                                                <motion.line
                                                                    x1={getX(i)}
                                                                    y1={getY(p.avg)}
                                                                    x2={getX(i)}
                                                                    y2="105"
                                                                    stroke="#4f46e5"
                                                                    strokeWidth="1"
                                                                    strokeDasharray="4 2"
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 0.3 }}
                                                                    exit={{ opacity: 0 }}
                                                                />
                                                            )}
                                                        </AnimatePresence>

                                                        <motion.circle
                                                            cx={getX(i)}
                                                            cy={getY(p.avg)}
                                                            r="4"
                                                            fill="white"
                                                            stroke="#4f46e5"
                                                            strokeWidth="2.5"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            whileHover={{ r: 6, strokeWidth: 3 }}
                                                        />

                                                        {/* Invisible larger hit area for easier hover */}
                                                        <circle
                                                            cx={getX(i)}
                                                            cy={getY(p.avg)}
                                                            r="15"
                                                            fill="transparent"
                                                        />

                                                        {/* Tooltip */}
                                                        <AnimatePresence>
                                                            {hoveredCostPoint === i && (
                                                                <motion.g
                                                                    initial={{ opacity: 0, y: 5 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: 5 }}
                                                                    className="pointer-events-none"
                                                                >
                                                                    <rect
                                                                        x={getX(i) - 35}
                                                                        y={getY(p.avg) - 32}
                                                                        width="70"
                                                                        height="22"
                                                                        rx="8"
                                                                        fill="#1f1f1f"
                                                                        className="shadow-xl"
                                                                    />
                                                                    <text
                                                                        x={getX(i)}
                                                                        y={getY(p.avg) - 17}
                                                                        textAnchor="middle"
                                                                        className="text-[10px] font-black fill-white tabular-nums"
                                                                    >
                                                                        {Math.round(p.avg).toLocaleString()} {currencySymbol}
                                                                    </text>
                                                                    {/* Tooltip Arrow */}
                                                                    <path
                                                                        d={`M ${getX(i) - 4} ${getY(p.avg) - 10} L ${getX(i)} ${getY(p.avg) - 5} L ${getX(i) + 4} ${getY(p.avg) - 10} Z`}
                                                                        fill="#1f1f1f"
                                                                    />
                                                                </motion.g>
                                                            )}
                                                        </AnimatePresence>

                                                        <text
                                                            x={getX(i)}
                                                            y="115"
                                                            textAnchor="middle"
                                                            className="text-[9px] font-bold fill-slate-300 pointer-events-none"
                                                        >
                                                            {p.label}
                                                        </text>
                                                    </g>
                                                ))}
                                            </>
                                        );
                                    })()}
                                </svg>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
