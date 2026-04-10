import React from"react";
import Link from"next/link";
import { AlertTriangle, PackageCheck, Package, ArrowUpRight } from"lucide-react";
import { cn, formatUnit } from"@/lib/utils";
import { pluralize } from"@/lib/pluralize";

interface CriticalItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface StockAlertsProps {
  criticalItems: CriticalItem[];
}

export const StockAlerts = React.memo(({ criticalItems }: StockAlertsProps) => {
  return (
    <div
      className={cn("col-span-12 md:col-span-6 lg:col-span-7 crm-card flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300 bg-white h-full",
        criticalItems.length > 0 ?"ring-1 ring-rose-500/10" :""
      )}
      role="region"
      aria-label="Товары, требующие пополнения"
    >
      {/* Header */}
      <div className="flex items-center gap-3 bg-white relative z-10">
        <div className={cn("w-10 h-10 rounded-[12px] flex items-center justify-center shadow-lg text-white shrink-0",
          criticalItems.length > 0
            ?"bg-gradient-to-br from-rose-500 to-pink-500 shadow-rose-500/25"
            :"bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/25"
        )}>
          {criticalItems.length > 0 ? (
            <AlertTriangle className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
          ) : (
            <PackageCheck className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
          )}
        </div>
        <div>
          <h4 className={cn("text-[17px] font-bold leading-tight mb-0.5",
            criticalItems.length > 0 ?"text-rose-600" :"text-emerald-700"
          )}>
            {criticalItems.length > 0 ?"Требуют пополнения" :"Запасы в норме"}
          </h4>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {criticalItems.length > 0
              ? `${criticalItems.length} ${pluralize(criticalItems.length, 'позиция', 'позиции', 'позиций')} ниже лимита`
              : 'Все позиции соответствуют норме остатка'
            }
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="card-breakout border-b border-slate-100 mt-6" />

      <div className="flex-1 flex flex-col pt-6 relative">
        {criticalItems.length > 0 ? (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-y-auto max-h-[260px] custom-scrollbar pb-1">
            {criticalItems.map((item) => (
              <Link key={item.id} href={`/dashboard/warehouse/items/${item.id}`} aria-label={`Товар: ${item.name}, Остаток: ${item.quantity} ${formatUnit(item.unit)}`} className="group flex items-center justify-between p-3.5 rounded-[12px] bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-[10px] bg-rose-50 flex items-center justify-center border border-rose-100 shrink-0 transition-transform">
                    <Package className="w-5 h-5 text-rose-500" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-slate-900 truncate group-hover:text-rose-600 transition-colors">{item.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">Остаток</span>
                      <span className="text-xs font-black text-rose-500 tabular-nums">{item.quantity} {formatUnit(item.unit)}</span>
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-rose-500 group-hover:bg-rose-50 transition-all">
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center bg-emerald-50/20 rounded-[var(--radius-inner)] border border-dashed border-emerald-100/50 p-6 min-h-[160px]">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-100 mb-4">
              <PackageCheck className="w-7 h-7 text-emerald-500" aria-hidden="true" />
            </div>
            <p className="text-[15px] font-bold text-slate-700 mb-1">Дефицита товаров не обнаружено</p>
            <p className="text-xs font-medium text-slate-400 max-w-[250px] leading-relaxed">Система автоматически отслеживает минимальные остатки и уведомит вас</p>
          </div>
        )}
      </div>
    </div>
  );
});

StockAlerts.displayName ="StockAlerts";
