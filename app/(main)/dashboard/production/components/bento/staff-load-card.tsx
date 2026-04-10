// app/(main)/dashboard/production/components/bento/staff-load-card.tsx
"use client";

import Link from "next/link";
import { Users, TrendingUp, ArrowRight, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import type { StaffLoadData } from "../../types";

interface StaffLoadCardProps {
 data: StaffLoadData | null;
 className?: string;
}

export function StaffLoadCard({ data, className }: StaffLoadCardProps) {
 const { staff = [], averageLoad = 0, averageEfficiency = 0 } = data || {};

 const getLoadColor = (load: number) => {
  if (load > 85) return "bg-rose-500";
  if (load > 60) return "bg-amber-500";
  return "bg-emerald-500";
 };

 const getInitials = (name: string) => {
  return name
   .split(" ")
   .map((n) => n[0])
   .join("")
   .toUpperCase();
 };

 const hasStaff = staff.length > 0;

 return (
  <div className={cn("crm-card flex flex-col", className)}>
   {/* Заголовок */}
   <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
     <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
      <Users className="w-4 h-4 text-blue-600" />
     </div>
     <h3 className="font-semibold text-slate-900">Загрузка персонала</h3>
    </div>
    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
     <TrendingUp className="w-3 h-3" />
     <span>{averageEfficiency}% эфф.</span>
    </div>
   </div>

   {hasStaff ? (
    <div className="flex-1 flex flex-col min-h-0">
     {/* Общий показатель */}
     <div className="flex items-center justify-between mb-4 px-1">
      <div className="text-xs text-slate-500">Средняя нагрузка</div>
      <div className="text-sm font-bold text-slate-900">{averageLoad}%</div>
     </div>
     <Progress value={averageLoad} className="h-1.5 mb-6" />

     {/* Список сотрудников */}
     <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
      {staff.slice(0, 5).map((person) => (
       <div key={person.id} className="group">
        <div className="flex items-center justify-between mb-1.5">
         <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="w-8 h-8 border border-slate-100">
           <AvatarImage src={person.avatarUrl || ""} alt={person.name} />
           <AvatarFallback className="text-xs bg-slate-100 text-slate-500">
            {getInitials(person.name)}
           </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
           <div className="text-xs font-semibold text-slate-900 truncate">
            {person.name}
           </div>
           <div className="text-xs text-slate-500 truncate">
            {person.lineName || person.position}
           </div>
          </div>
         </div>
         <div className="text-xs font-bold text-slate-900 bg-slate-50 px-1.5 py-0.5 rounded">
          {person.loadPercentage}%
         </div>
        </div>
        <div className="relative h-1 w-full bg-slate-100 rounded-full overflow-hidden">
         <div
          className={cn("absolute h-full transition-all duration-500", getLoadColor(person.loadPercentage))}
          style={{ width: `${person.loadPercentage}%` }}
         />
        </div>
       </div>
      ))}
     </div>
    </div>
   ) : (
    <div className="flex-1 flex flex-col items-center justify-center py-6">
     <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
      <UserCheck className="w-5 h-5 text-blue-300" />
     </div>
     <div className="text-sm text-slate-400">Нет активных сотрудников</div>
    </div>
   )}

   {/* Ссылка */}
   <Link href="/dashboard/production/staff" className="mt-4 flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors group">
    <span>Управление сменой</span>
    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
   </Link>
  </div>
 );
}
