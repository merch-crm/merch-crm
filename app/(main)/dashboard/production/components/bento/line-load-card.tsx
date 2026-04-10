// app/(main)/dashboard/production/components/bento/line-load-card.tsx
"use client";

import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

interface LineLoadItem {
 id: string;
 name: string;
 load: number;
 status: 'active' | 'idle' | 'maintenance';
 tasksCount: number;
 color: string;
}

interface LineLoadCardProps {
 items: LineLoadItem[];
 className?: string;
}

export function LineLoadCard({ items, className }: LineLoadCardProps) {
 return (
  <div className={cn("crm-card flex flex-col h-full", className)}>
   <div className="flex items-center gap-2 mb-4">
    <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
     <Activity className="w-4 h-4 text-sky-600" />
    </div>
    <h3 className="font-semibold text-slate-900">Загрузка линий</h3>
   </div>

   <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
    {(items || []).map((line) => (
     <div key={line.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="flex items-center justify-between mb-2">
       <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: line.color }} />
        <span className="text-xs font-bold text-slate-900">{line.name}</span>
       </div>
       <div className={cn(
        "w-2 h-2 rounded-full",
        line.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
       )} />
      </div>
      
      <div className="flex items-center justify-between text-xs mb-1.5">
       <span className="text-slate-500">{line.tasksCount} задач в очереди</span>
       <span className={cn(
        "font-bold",
        line.load > 90 ? "text-rose-600" : line.load > 70 ? "text-amber-600" : "text-slate-900"
       )}>{line.load}%</span>
      </div>

      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
       <div 
        className={cn(
         "h-full transition-all duration-700",
         line.load > 90 ? "bg-rose-500" : line.load > 70 ? "bg-amber-500" : "bg-sky-500"
        )}
        style={{ width: `${line.load}%` }}
       />
      </div>
     </div>
    ))}
   </div>
  </div>
 );
}
