"use client";

import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LineLoadData {
    id: string;
    name: string;
    code: string;
    color: string | null;
    tasksCount: number;
    totalQuantity: number;
    inProgress: number;
}

interface ChartEntry {
    name: string;
    fullName: string;
    tasks: number;
    quantity: number;
    inProgress: number;
    color: string;
}

interface TooltipPayloadItem {
    payload: ChartEntry;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
}

interface LineLoadChartProps {
    data: LineLoadData[];
    title?: string;
    className?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const entry = payload[0].payload;
    return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
            <p className="font-medium">{entry.fullName}</p>
            <p className="text-sm text-muted-foreground">Задач: {entry.tasks}</p>
            <p className="text-sm text-muted-foreground">В работе: {entry.inProgress}</p>
            <p className="text-sm text-muted-foreground">Количество: {entry.quantity} шт.</p>
        </div>
    );
}

export function LineLoadChart({
    data,
    title = "Загрузка линий",
    className,
}: LineLoadChartProps) {
    const chartData = useMemo(
        () =>
            (data || []).map((item) => ({
                name: item.code,
                fullName: item.name,
                tasks: item.tasksCount,
                quantity: item.totalQuantity,
                inProgress: item.inProgress,
                color: item.color || "#6b7280",
            })),
        [data]
    );

    if ((data || []).length === 0) {
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
                        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={60} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="tasks" radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
