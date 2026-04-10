"use client";

import { useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApplicationTypeData {
    id: string;
    name: string;
    color: string | null;
    tasksCount: number;
    percentage: number;
}

interface ChartEntry {
    name: string;
    value: number;
    color: string;
    percentage: number;
}

interface TooltipPayloadItem {
    payload: ChartEntry;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
}

interface LegendEntry {
    value: string;
    color: string;
}


interface ApplicationTypesChartProps {
    data: ApplicationTypeData[];
    title?: string;
    className?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const entry = payload[0].payload;
    return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
            <p className="font-medium">{entry.name}</p>
            <p className="text-sm text-muted-foreground">
                {entry.value} задач ({entry.percentage}%)
            </p>
        </div>
    );
}

function renderLegend(props: unknown) {
    const { payload } = props as { payload?: LegendEntry[] };
    return (
        <div className="flex flex-wrap justify-center gap-3 mt-3">
            {payload?.map((entry: LegendEntry, index: number) => (
                <div key={index} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs text-muted-foreground">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}

export function ApplicationTypesChart({
    data,
    title = "По типам нанесения",
    className,
}: ApplicationTypesChartProps) {
    const chartData = useMemo(
        () =>
            data
                .filter((item) => item.tasksCount > 0)
                .map((item) => ({
                    name: item.name,
                    value: item.tasksCount,
                    color: item.color || "#6b7280",
                    percentage: item.percentage,
                })),
        [data]
    );

    if (chartData.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                        Нет данных для отображения
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} cx="50%" cy="45%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                                {chartData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={renderLegend} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
