// app/(main)/dashboard/production/components/bento/material-consumption-card.tsx
"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,

} from "recharts";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ShoppingBag, TrendingUp } from "lucide-react";

interface ConsumptionItem {
  date: string;
  amount: number;
  prediction: number;
}

interface MaterialConsumptionCardProps {
  data: ConsumptionItem[];
  className?: string;
}

export function MaterialConsumptionCard({ data, className }: MaterialConsumptionCardProps) {
  const formattedData = (data || []).map(d => ({
    ...d,
    displayDate: format(new Date(d.date), "dd MMM", { locale: ru })
  }));

  return (
    <div className={cn("crm-card flex flex-col h-full", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Динамика расхода материалов</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
          <span>Прогноз потребления</span>
        </div>
      </div>

      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FB923C" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#FB923C" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Area 
              type="monotone" 
              name="Факт (ед.)" 
              dataKey="amount" 
              stroke="#6366F1" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorAmount)" 
            />
            <Area 
              type="monotone" 
              name="Прогноз (ед.)" 
              dataKey="prediction" 
              stroke="#FB923C" 
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1} 
              fill="url(#colorPred)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
