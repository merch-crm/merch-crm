"use client";

import { memo } from "react";
import { Ruler, Grid3X3, Percent, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CalculationResult } from "../../types";

interface LayoutInfoCardProps {
    result: CalculationResult;
    rollWidthMm: number;
}

export const LayoutInfoCard = memo(function LayoutInfoCard({
    result,
    rollWidthMm,
}: LayoutInfoCardProps) {
    const stats = [
        {
            icon: Ruler,
            label: "Длина плёнки",
            value: `${result.totalLengthM.toFixed(2)} м`,
            description: `${(result.totalLengthM * 1000).toFixed(0)} мм`,
        },
        {
            icon: Layers,
            label: "Площадь плёнки",
            value: `${result.totalAreaM2.toFixed(4)} м²`,
            description: `${rollWidthMm} мм ширина`,
        },
        {
            icon: Grid3X3,
            label: "Площадь принтов",
            value: `${result.printsAreaM2.toFixed(4)} м²`,
            description: `${result.totalPrints} принтов`,
        },
        {
            icon: Percent,
            label: "Эффективность",
            value: `${result.efficiencyPercent.toFixed(1)}%`,
            description: getEfficiencyLabel(result.efficiencyPercent),
        },
    ];

    return (
        <Card>
            <CardContent className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-slate-100">
                                <stat.icon className="h-4 w-4 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                                <p className="font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
});

function getEfficiencyLabel(efficiency: number): string {
    if (efficiency >= 90) return "Отлично";
    if (efficiency >= 75) return "Хорошо";
    if (efficiency >= 60) return "Нормально";
    return "Можно лучше";
}
