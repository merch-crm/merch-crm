import { Warehouse, MapPin } from "lucide-react";
import { ItemFormData, StorageLocation } from "@/app/(main)/dashboard/warehouse/types";

const typeLabels: Record<string, string> = {
  warehouse: "Склад",
  production: "Производство",
  office: "Офис",
};

const typeBadgeStyles: Record<string, string> = {
  warehouse: "bg-indigo-50 text-indigo-600 border-indigo-100",
  production: "bg-amber-50 text-amber-600 border-amber-100",
  office: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

interface StorageCardProps {
  formData: ItemFormData;
  storageLocations: StorageLocation[];
}

export function StorageCard({ formData, storageLocations }: StorageCardProps) {
  const location = storageLocations.find(l => l.id === formData.storageLocationId);
  const locationName = location?.name || 'Не выбран';
  const locationType = location?.type || 'warehouse';
  const typeLabel = typeLabels[locationType] || locationType;
  const badgeStyle = typeBadgeStyles[locationType] || typeBadgeStyles.warehouse;

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8 flex flex-col gap-3 h-full">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
            <Warehouse className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">Склад</h3>
            <p className="text-xs sm:text-xs font-bold text-slate-700 opacity-60">Остатки и хранение</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="text-xs font-black text-slate-400">остаток</div>
          <div className="flex items-baseline gap-1">
            <div className="text-2xl sm:text-[28px] font-black text-slate-900 leading-none ">{formData.quantity}</div>
            <span className="text-xs font-bold text-slate-400">шт</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Location row */}
        <div className="flex items-center justify-between p-3 sm:p-4 rounded-[16px] bg-[#F8FAFC] border border-slate-200/60 shadow-sm transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-slate-300 transition-colors shadow-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-[13px] font-bold text-slate-600 truncate max-w-[120px] sm:max-w-none">{locationName}</span>
          </div>
          <span className={`text-xs font-black px-2 py-0.5 rounded-full border shrink-0 ${badgeStyle}`}>
            {typeLabel.toLowerCase()}
          </span>
        </div>

        {/* Compact Thresholds Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-4 rounded-[16px] bg-[#F8FAFC] border border-slate-200/60 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-white border border-slate-200 flex items-center justify-center shadow-sm relative">
                <div className="w-2 h-2 rounded-full bg-amber-500 relative z-10" />
                <div className="absolute inset-0 w-2 h-2 m-auto rounded-full bg-amber-500 animate-ping opacity-40" />
              </div>
              <span className="text-[12px] font-bold text-slate-500">Низко:</span>
            </div>
            <span className="text-lg font-black text-slate-900">{formData.lowStockThreshold || 0}</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-[16px] bg-[#F8FAFC] border border-slate-200/60 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-white border border-slate-200 flex items-center justify-center shadow-sm relative">
                <div className="w-2 h-2 rounded-full bg-rose-500 relative z-10" />
                <div className="absolute inset-0 w-2 h-2 m-auto rounded-full bg-rose-500 animate-ping opacity-40" />
              </div>
              <span className="text-[12px] font-bold text-slate-500">Крит:</span>
            </div>
            <span className="text-lg font-black text-slate-900">{formData.criticalStockThreshold || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
