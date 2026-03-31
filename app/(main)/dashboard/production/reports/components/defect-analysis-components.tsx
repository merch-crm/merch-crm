"use client";

import { Badge } from "@/components/ui/badge";

interface DefectByType {
    type: string;
    count: number;
    percentage: number;
    color: string;
}

/**
 * Круговая диаграмма распределения брака
 */
export function DefectsByTypeChart({ data = [] }: { data: DefectByType[] }) {
    const safeData = data || [];
    if (!safeData.length) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400">
                Брак не зафиксирован
            </div>
        );
    }

    return (
        <div className="h-64 flex items-center justify-center">
            <div className="w-40 h-40 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    {safeData.reduce(
                        (acc, item, index) => {
                            const startAngle = acc.offset;
                            const angle = (item.percentage / 100) * 360;
                            const endAngle = startAngle + angle;

                            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                            const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                            const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

                            const largeArc = angle > 180 ? 1 : 0;

                            acc.paths.push(
                                <path
                                    key={index}
                                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill={item.color}
                                    className="transition-all hover:opacity-80"
                                />
                            );
                            acc.offset = endAngle;
                            return acc;
                        },
                        { paths: [] as React.ReactNode[], offset: -90 }
                    ).paths}
                </svg>
            </div>
        </div>
    );
}

/**
 * Список брака по типам
 */
export function DefectsTable({ data = [] }: { data: DefectByType[] }) {
    const safeData = data || [];
    return (
        <div className="space-y-2">
            {safeData.map((item, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-slate-700">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">{item.count} шт</span>
                        <Badge variant="secondary">{item.percentage.toFixed(1)}%</Badge>
                    </div>
                </div>
            ))}
        </div>
    );
}
