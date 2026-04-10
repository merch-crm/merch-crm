// app/(main)/dashboard/production/components/bento/conversion-stats-card.tsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import type { ConversionStats } from "../../types";

interface ConversionStatsCardProps {
 stats: ConversionStats | null;
 className?: string;
}

export function ConversionStatsCard({ stats, className }: ConversionStatsCardProps) {
 const { inQueue = 0, inProgress = 0, paused = 0, completedToday = 0 } = stats || {};

 const total = inQueue + inProgress + paused;

 const data = [
  { name: "Ожидают", value: inQueue, color: "#94A3B8" },
  { name: "В работе", value: inProgress, color: "#6366F1" },
  { name: "Пауза", value: paused, color: "#F43F5E" },
 ];

 return (
  <div className={cn("crm-card flex flex-col h-full", className)}>
   <h3 className="font-semibold text-slate-900 mb-4">Статус производства</h3>
   
   <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
    <div className="relative w-full h-[180px]">
     <ResponsiveContainer width="100%" height="100%">
      <PieChart>
       <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
        {(data || []).map((entry, index) => (
         <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
        ))}
       </Pie>
       <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
      </PieChart>
     </ResponsiveContainer>
     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span className="text-2xl font-bold text-slate-900">{total}</span>
      <span className="text-xs text-slate-400 font-semibold">Всего</span>
     </div>
    </div>

    <div className="w-full space-y-2 mt-4">
     {(data || []).map((item) => (
      <div key={item.name} className="flex items-center justify-between text-xs">
       <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
        <span className="text-slate-500">{item.name}</span>
       </div>
       <span className="font-bold text-slate-900">{item.value}</span>
      </div>
     ))}
     <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
      <span className="text-emerald-600 font-semibold">Выполнено сегодня</span>
      <span className="font-bold text-slate-900">{completedToday}</span>
     </div>
    </div>
   </div>
  </div>
 );
}
