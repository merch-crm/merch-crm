// app/(main)/dashboard/production/components/bento/equipment-status-card.tsx
"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import {
 Settings,
 Wrench,
 AlertTriangle,
 CheckCircle,
 ArrowRight,
 Power,
 Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import { IconType } from "@/components/ui/stat-card";
import type { EquipmentStatusItem } from "../../types";

interface EquipmentStatusCardProps {
 equipment: EquipmentStatusItem[];
 className?: string;
}

const statusConfig: Record<string, {
 label: string;
 icon: IconType;
 color: string;
 bgColor: string;
 borderColor: string;
}> = {
 active: {
  label: "Работает",
  icon: CheckCircle as IconType,
  color: "text-emerald-600",
  bgColor: "bg-emerald-50",
  borderColor: "border-emerald-100",
 },
 maintenance: {
  label: "На ТО",
  icon: Wrench as IconType,
  color: "text-amber-600",
  bgColor: "bg-amber-50",
  borderColor: "border-amber-100",
 },
 repair: {
  label: "В ремонте",
  icon: AlertTriangle as IconType,
  color: "text-rose-600",
  bgColor: "bg-rose-50",
  borderColor: "border-rose-100",
 },
 inactive: {
  label: "Выключено",
  icon: Power as IconType,
  color: "text-slate-500",
  bgColor: "bg-slate-100",
  borderColor: "border-slate-200",
 },
 offline: {
  label: "Оффлайн",
  icon: Power as IconType,
  color: "text-slate-500",
  bgColor: "bg-slate-100",
  borderColor: "border-slate-200",
 },
 idle: {
  label: "Ожидание",
  icon: Clock as IconType,
  color: "text-slate-400",
  bgColor: "bg-slate-50",
  borderColor: "border-slate-100",
 },
};

export function EquipmentStatusCard({ equipment, className }: EquipmentStatusCardProps) {
 const hasData = equipment && equipment.length > 0;

 // Группируем по статусу
 const statusCounts = equipment.reduce((acc, eq) => {
  acc[eq.status] = (acc[eq.status] || 0) + 1;
  return acc;
 }, {} as Record<string, number>);

 const needsAttention = equipment.filter(
  (eq) => eq.status === "repair" || eq.status === "maintenance" || eq.needsMaintenance
 ).length;

 return (
  <div className={cn("crm-card flex flex-col", className)}>
   {/* Заголовок */}
   <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
     <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center border",
      needsAttention > 0
       ? "bg-amber-50 text-amber-600 border-amber-100"
       : "bg-slate-100 text-slate-600 border-slate-200"
     )}>
      <Settings className="w-5 h-5" />
     </div>
     <div>
      <h3 className="text-sm font-bold text-slate-900">Статус оборудования</h3>
      <p className="text-xs font-medium text-slate-400">
       {needsAttention > 0
        ? `${needsAttention} ${pluralize(needsAttention, "требует", "требуют", "требуют")} внимания`
        : "Всё оборудование в норме"}
      </p>
     </div>
    </div>

    <Link href="/dashboard/production/equipment" className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
     <span>Всё</span>
     <ArrowRight className="w-3.5 h-3.5" />
    </Link>
   </div>

   {/* Статусы */}
   {hasData && (
    <div className="flex items-center gap-2 mb-4">
     {Object.entries(statusCounts).map(([status, count]) => {
      const config = statusConfig[status] || statusConfig.inactive;
      return (
       <div
        key={status}
        className={cn(
         "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold",
         config.bgColor,
         config.borderColor,
         config.color
        )}
       >
        <config.icon className="w-3.5 h-3.5" />
        <span>{count}</span>
       </div>
      );
     })}
    </div>
   )}

   {/* Контент */}
   <div className="flex-1">
    {!hasData ? (
     <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
       <Settings className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-bold text-slate-500">Оборудование не добавлено</p>
      <p className="text-xs text-slate-400 mt-1">Добавьте станки и инструменты</p>
     </div>
    ) : (
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {(equipment || []).slice(0, 6).map((item) => (
       <EquipmentRow key={item.id} item={item} />
      ))}
     </div>
    )}
   </div>
  </div>
 );
}

interface EquipmentRowProps {
 item: EquipmentStatusItem;
}

function EquipmentRow({ item }: EquipmentRowProps) {
 const config = statusConfig[item.status] || statusConfig.inactive;
 const StatusIcon = config.icon;
 const showMaintenanceWarning = item.needsMaintenance && item.status === "active";

 return (
  <Link href={`/dashboard/production/equipment/${item.id}`} className={cn( "group flex items-start gap-3 p-3 rounded-xl border transition-all", "hover:shadow-md hover:-translate-y-0.5", config.bgColor, config.borderColor )}>
   {/* Иконка */}
   <div className={cn(
    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border bg-white/80",
    config.borderColor,
    config.color
   )}>
    {showMaintenanceWarning ? (
     <AlertTriangle className="w-5 h-5 text-amber-500" />
    ) : (
     <StatusIcon className="w-5 h-5" />
    )}
   </div>

   {/* Информация */}
   <div className="min-w-0 flex-1">
    <p className="text-sm font-bold text-slate-900 truncate leading-tight">
     {item.name}
    </p>
    <div className="flex items-center gap-2 mt-1">
     <span className={cn("text-xs font-bold", config.color)}>
      {config.label}
     </span>
     {showMaintenanceWarning && (
      <>
       <span className="w-1 h-1 rounded-full bg-slate-300" />
       <span className="text-xs font-medium text-amber-600">
        Скоро ТО
       </span>
      </>
     )}
    </div>
    {item.nextMaintenanceDate && item.status === "active" && (
     <p className="text-xs font-medium text-slate-400 mt-1">
      ТО {formatDistanceToNow(new Date(item.nextMaintenanceDate), {
       addSuffix: true,
       locale: ru,
      })}
     </p>
    )}
   </div>

   {/* Индикатор */}
   {showMaintenanceWarning && (
    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0 mt-1" />
   )}
  </Link>
 );
}
