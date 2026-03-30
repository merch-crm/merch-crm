"use client";

import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer
} from 'recharts';

interface ChartDataItem {
    name: string;
    hours: number;
    productivity: number;
}

interface PortalChartProps {
    data: ChartDataItem[];
}

export default function PortalChart({ data }: PortalChartProps) {
    if (!data || data.length === 0) return (
        <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold">
            Нет данных для отображения
        </div>
    );

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 800 }} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 800 }}
                />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderRadius: '16px', 
                        border: 'none',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                        color: '#fff'
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: 900, color: '#fff' }}
                    labelStyle={{ fontSize: '12px', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.05em' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="hours" 
                    name="Часы"
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorHours)" 
                    animationDuration={1500}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
