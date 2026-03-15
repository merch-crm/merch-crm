// app/(main)/dashboard/production/components/bento/daily-output-card.tsx
"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from "recharts";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

interface DailyOutputItem {
  date: string;
  completed: number;
  defects: number;
  target: number;
}

interface DailyOutputCardProps {
  data: DailyOutputItem[];
  className?: string;
}

export function DailyOutputCard({ data, className }: DailyOutputCardProps) {
  const formattedData = (data || []).map(d => ({
    ...d,
    displayDate: format(new Date(d.date), "dd.MM", { locale: ru })
  }));

  return (
    <div className={cn("crm-card flex flex-col h-full", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Выработка за период</h3>
        </div>
      </div>

      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="displayDate" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ fontSize: 10, paddingTop: 10 }}
            />
            <ReferenceLine y={100} label={{ position: 'right', value: 'Цель', fill: '#94a3b8', fontSize: 10 }} stroke="#e2e8f0" strokeDasharray="3 3" />
            <Bar 
              name="Выполнено" 
              dataKey="completed" 
              fill="#6366F1" 
              radius={[4, 4, 0, 0]} 
              activeBar={{ fill: '#4F46E5' }}
            />
            <Bar 
              name="Брак" 
              dataKey="defects" 
              fill="#F43F5E" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
