"use client";

import { useMemo } from "react";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesDataPoint {
    date: string;
    sales: number;
    orders: number;
}

interface TooltipPayloadItem {
    value: number;
    payload: SalesDataPoint & { dateFormatted: string };
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}

interface SalesChartProps {
    data: SalesDataPoint[];
    title?: string;
    className?: string;
}

function formatCurrency(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ₽`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K ₽`;
    return `${value} ₽`;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
            <p className="font-medium">{label}</p>
            <p className="text-sm text-green-600">
                Продажи: {formatCurrency(payload[0].value)}
            </p>
            <p className="text-sm text-blue-600">
                Заказов: {payload[0].payload.orders}
            </p>
        </div>
    );
}

export function SalesChart({ data, title = "Динамика продаж", className }: SalesChartProps) {
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
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="rgb(34, 197, 94)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="rgb(34, 197, 94)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="dateFormatted" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="sales" stroke="rgb(34, 197, 94)" strokeWidth={2} fill="url(#salesGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
