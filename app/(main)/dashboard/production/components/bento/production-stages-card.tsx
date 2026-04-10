// app/(main)/dashboard/production/components/bento/production-stages-card.tsx
"use client";

import { 
 FileText, 
 Printer, 
 Stamp, 
 Package,
 ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import { IconType } from "@/components/ui/stat-card";

interface ProductionStage {
 id: string;
 name: string;
 icon: IconType;
 count: number;
 color: string;
 bgColor: string;
 borderColor: string;
}

interface ProductionStagesCardProps {
 /** Количество заказов на этапе подготовки */
 preparation: number;
 /** Количество заказов на этапе печати */
 printing: number;
 /** Количество заказов на этапе нанесения */
 application: number;
 /** Количество заказов на этапе упаковки */
 packaging: number;
 className?: string;
}

export function ProductionStagesCard({
 preparation,
 printing,
 application,
 packaging,
 className,
}: ProductionStagesCardProps) {
 const stages: ProductionStage[] = [
  {
   id: "preparation",
   name: "Подготовка",
   icon: FileText as IconType,
   count: preparation,
   color: "text-blue-600",
   bgColor: "bg-blue-50",
   borderColor: "border-blue-100",
  },
  {
   id: "printing",
   name: "Печать",
   icon: Printer as IconType,
   count: printing,
   color: "text-violet-600",
   bgColor: "bg-violet-50",
   borderColor: "border-violet-100",
  },
  {
   id: "application",
   name: "Нанесение",
   icon: Stamp as IconType,
   count: application,
   color: "text-amber-600",
   bgColor: "bg-amber-50",
   borderColor: "border-amber-100",
  },
  {
   id: "packaging",
   name: "Упаковка",
   icon: Package as IconType,
   count: packaging,
   color: "text-emerald-600",
   bgColor: "bg-emerald-50",
   borderColor: "border-emerald-100",
  },
 ];

 const total = preparation + printing + application + packaging;

 return (
  <div className={cn("crm-card", className)}>
   {/* Заголовок */}
   <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-bold text-slate-700">Этапы производства</h3>
    <span className="text-xs font-bold text-slate-400">
     всего {total} {pluralize(total, "заказ", "заказа", "заказов")}
    </span>
   </div>

   {/* Этапы */}
   <div className="flex items-center gap-2">
    {stages.map((stage, index) => {
     const Icon = stage.icon;
     const isLast = index === stages.length - 1;
     
     return (
      <div key={stage.id} className="flex items-center flex-1">
       {/* Карточка этапа */}
       <div className={cn(
        "flex-1 p-3 rounded-xl border transition-all",
        "hover:shadow-sm cursor-pointer group",
        stage.bgColor,
        stage.borderColor
       )}>
        <div className="flex items-center gap-2 mb-2">
         <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          "bg-white/80 shadow-sm",
          stage.color
         )}>
          <Icon className="w-4 h-4" />
         </div>
         <span className="text-xs font-bold text-slate-600 hidden sm:block">
          {stage.name}
         </span>
        </div>
        <div className={cn("text-2xl font-bold", stage.color)}>
         {stage.count}
        </div>
       </div>

       {/* Стрелка между этапами */}
       {!isLast && (
        <ArrowRight className="w-4 h-4 text-slate-300 mx-1 shrink-0 hidden md:block" />
       )}
      </div>
     );
    })}
   </div>

   {/* Прогресс-бар */}
   <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden flex">
    {stages.map((stage) => {
     const percentage = total > 0 ? (stage.count / total) * 100 : 0;
     if (percentage === 0) return null;
     
     return (
      <div
       key={stage.id}
       className={cn("h-full transition-all", stage.bgColor.replace('bg-', 'bg-').replace('-50', '-400'))}
       style={{ width: `${percentage}%` }}
      />
     );
    })}
   </div>
  </div>
 );
}
