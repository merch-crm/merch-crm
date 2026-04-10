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
} from "recharts";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DailyOutputData {
    date: string;
    completed: number;
    quantity: number;
}

interface TooltipPayloadItem {
    value: number;
    payload: DailyOutputData & { dateFormatted: string };
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}

interface DailyOutputChartProps {
    data: DailyOutputData[];
    title?: string;
    className?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
            <p className="font-medium">{label}</p>
            <p className="text-sm text-blue-600">Задач: {payload[0].value}</p>
            <p className="text-sm text-green-600">Изделий: {payload[0].payload.quantity} шт.</p>
        </div>
    );
}

export function DailyOutputChart({
    data,
    title = "Выработка по дням",
    className,
}: DailyOutputChartProps) {
    const chartData = useMemo(
        () =>
            (data || []).map((item) => ({
                ...item,
                dateFormatted: format(parseISO(item.date), "dd MMM", { locale: ru }),
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
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="dateFormatted" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="completed" fill="rgb(59, 130, 246)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
