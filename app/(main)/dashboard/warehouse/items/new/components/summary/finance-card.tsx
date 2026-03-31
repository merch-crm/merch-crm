import { Banknote, Tag } from "lucide-react";
import { ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { useBranding } from "@/components/branding-provider";

interface FinanceCardProps {
    formData: ItemFormData;
}

export function FinanceCard({ formData }: FinanceCardProps) {
    const { currencySymbol } = useBranding();

    const sellingPrice = parseFloat(formData.sellingPrice || "0");
    const costPrice = parseFloat(formData.costPrice || "0");

    return (
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8 flex flex-col gap-3 h-full">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                    <Banknote className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">Финансы</h3>
                    <p className="text-xs font-bold text-slate-700 opacity-60">Цены и маржин</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-[16px] bg-[#F8FAFC] border border-slate-200/60 shadow-sm transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[10px] bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-slate-300 transition-colors shadow-sm">
                            <Tag className="w-4 h-4" />
                        </div>
                        <span className="text-[12px] font-bold text-slate-500">Себестоимость</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-slate-900">{costPrice.toLocaleString()} {currencySymbol}</div>
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 rounded-[16px] bg-emerald-50/30 border border-emerald-100/50 shadow-sm hover:border-emerald-200/50 transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[10px] bg-white border border-emerald-100 flex items-center justify-center text-emerald-500 group-hover:border-emerald-200 transition-colors shadow-sm">
                            <Banknote className="w-4 h-4" />
                        </div>
                        <span className="text-[12px] font-bold text-slate-500">Цена продажи</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-slate-900">{sellingPrice.toLocaleString()} {currencySymbol}</div>
                </div>
            </div>
        </div>
    );
}
