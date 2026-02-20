import { Warehouse, AlertCircle } from "lucide-react";
import { formatUnit } from "@/lib/utils";
import { ItemFormData, StorageLocation } from "@/app/(main)/dashboard/warehouse/types";

interface StorageCardProps {
    formData: ItemFormData;
    storageLocations: StorageLocation[];
}

export function StorageCard({ formData, storageLocations }: StorageCardProps) {
    const locationName = storageLocations.find(l => l.id === formData.storageLocationId)?.name || 'Не выбран';

    return (
        <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl shadow-slate-900/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-1000" />

            <div className="relative z-10 flex flex-col h-full gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                            <Warehouse className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-white/40 leading-none mb-1">Склад</h4>
                            <p className="text-sm font-bold text-white leading-none">
                                {locationName}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-black text-white/40 mb-1">Остаток</div>
                        <div className="text-3xl font-black leading-none">{formData.quantity} <span className="text-sm text-white/50">{formatUnit(formData.unit)}</span></div>
                    </div>
                </div>

                <div className="h-px bg-white/10 w-full" />

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-xs font-black text-white/30 truncate">Порог (Low)</span>
                            </div>
                            <div className="text-xl font-bold">{formData.lowStockThreshold || 0}</div>
                        </div>
                        <div className="flex flex-col p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                <span className="text-xs font-black text-white/30 truncate">Порог (Crit)</span>
                            </div>
                            <div className="text-xl font-bold">{formData.criticalStockThreshold || 0}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
