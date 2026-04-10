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

interface OrdersByStatusData {
    status: string;
    count: number;
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


interface OrdersByStatusChartProps {
    data: OrdersByStatusData[];
    title?: string;
    className?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
    new: { label: "Новый", color: "#6b7280" },
    pending: { label: "Ожидает", color: "#9ca3af" },
    confirmed: { label: "Подтверждён", color: "#3b82f6" },
    awaiting_payment: { label: "Ожидает оплаты", color: "#eab308" },
    paid: { label: "Оплачен", color: "#22c55e" },
    in_work: { label: "В работе", color: "#a855f7" },
    in_progress: { label: "В работе", color: "#a855f7" },
    ready: { label: "Готов", color: "#14b8a6" },
    shipped: { label: "Отправлен", color: "#60a5fa" },
    completed: { label: "Завершён", color: "#16a34a" },
    cancelled: { label: "Отменён", color: "#ef4444" },
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const entry = payload[0].payload;
    return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
            <p className="font-medium">{entry.name}</p>
            <p className="text-sm text-muted-foreground">
                {entry.value} заказов ({entry.percentage}%)
            </p>
        </div>
    );
}

function renderLegend(props: { payload?: readonly { value?: string; color?: string }[] }) {
    const { payload } = props;
    return (
        <div className="flex flex-wrap justify-center gap-3 mt-3">
            {payload?.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs text-muted-foreground">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}

export function OrdersByStatusChart({
    data,
    title = "Распределение по статусам",
    className,
}: OrdersByStatusChartProps) {
    const chartData = useMemo(
        () =>
            (data || []).map((item) => ({
                name: statusConfig[item.status]?.label ?? item.status,
                value: item.count,
                color: statusConfig[item.status]?.color ?? "#6b7280",
                percentage: item.percentage,
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
                        <PieChart>
                            <Pie data={chartData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value">
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
