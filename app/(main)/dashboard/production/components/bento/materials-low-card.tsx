"use client";

import Link from "next/link";
import { Package, AlertTriangle, ArrowRight, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import type { MaterialAlert } from "../../types";

interface MaterialsLowCardProps {
  materials: MaterialAlert[];
  className?: string;
}

/**
 * Виджет материалов на исходе.
 * Показывает позиции со склада, которых осталось меньше минимального порога.
 */
export function MaterialsLowCard({ materials, className }: MaterialsLowCardProps) {
  const hasData = materials && materials.length > 0;
  // Считаем критические позиции (меньше 20% от минимума)
  const criticalCount = materials.filter((m) => (m.percentOfMin ?? 0) <= 20).length;

  return (
    <div className={cn(
      "crm-card flex flex-col h-full",
      criticalCount > 0 && "!border-rose-100 bg-rose-50/10",
      className
    )}>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
            criticalCount > 0
              ? "bg-rose-50 text-rose-600 border-rose-100"
              : hasData
              ? "bg-amber-50 text-amber-600 border-amber-100"
              : "bg-emerald-50 text-emerald-600 border-emerald-100"
          )}>
            {criticalCount > 0 ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Package className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Материалы на исходе</h3>
            <p className="text-xs font-medium text-slate-400">
              {hasData
                ? `${materials.length} ${pluralize(materials.length, "позиция", "позиции", "позиций")} требует пополнения`
                : "Все материалы в норме"}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/warehouse/items?filter=low"
          className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          <span>На склад</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Контент */}
      <div className="flex-1">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center p-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-sm font-bold text-emerald-600">Запасы в норме</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              Все материалы выше минимального порога остатков
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(materials || []).slice(0, 4).map((material) => (
              <MaterialRow key={material.id} material={material} />
            ))}
            
            {materials.length > 4 && (
              <p className="text-center text-xs font-bold text-slate-400 pt-1">
                И еще {materials.length - 4} {pluralize(materials.length - 4, "позиция", "позиции", "позиций")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MaterialRowProps {
  material: MaterialAlert;
}

/** Строка одного материала с прогресс-баром */
function MaterialRow({ material }: MaterialRowProps) {
  const percentOfMin = material.percentOfMin ?? 0;
  const isCritical = percentOfMin <= 20;
  const isWarning = percentOfMin <= 50 && !isCritical;

  const statusColor = isCritical
    ? "text-rose-600"
    : isWarning
    ? "text-amber-600"
    : "text-slate-600";

  const progressColor = isCritical
    ? "bg-rose-500"
    : isWarning
    ? "bg-amber-500"
    : "bg-slate-400";

  return (
    <Link
      href={`/dashboard/warehouse/items/${material.id}`}
      className={cn(
        "block p-3 rounded-xl border transition-all",
        "hover:shadow-md hover:-translate-y-0.5 group",
        isCritical
          ? "bg-rose-50/50 border-rose-100"
          : isWarning
          ? "bg-amber-50/50 border-amber-100"
          : "bg-slate-50 border-slate-100"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 truncate leading-tight group-hover:text-primary transition-colors">
            {material.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {material.sku && (
              <span className="text-xs font-bold text-slate-400">
                {material.sku}
              </span>
            )}
            {material.category && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-200" />
                <span className="text-xs font-bold text-slate-400 truncate max-w-[80px]">
                  {material.category}
                </span>
              </>
            )}
          </div>
        </div>

        <div className={cn("text-right shrink-0 ml-3", statusColor)}>
          <div className="text-sm font-bold leading-tight">
            {material.currentQuantity ?? 0} / {material.minQuantity ?? 0}
          </div>
          <div className="text-xs font-bold opacity-80">
            {material.unit}
          </div>
        </div>
      </div>

      {/* Кастомный прогресс-бар */}
      <div className="h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", progressColor)}
          style={{ width: `${Math.min(percentOfMin, 100)}%` }}
        />
      </div>

      {/* Алерт для критических остатков */}
      {isCritical && (
        <div className="flex items-center justify-end mt-2 animate-pulse">
          <span className="text-xs font-bold text-rose-600 flex items-center gap-1 bg-rose-100 px-1.5 py-0.5 rounded-md">
            <ShoppingCart className="w-2.5 h-2.5" />
            ТРЕБУЕТСЯ ЗАКАЗ
          </span>
        </div>
      )}
    </Link>
  );
}
