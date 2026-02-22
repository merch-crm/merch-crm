import { Banknote, Tag, Sparkles } from "lucide-react";
import { ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { useBranding } from "@/components/branding-provider";

interface FinanceCardProps {
    formData: ItemFormData;
}

export function FinanceCard({ formData }: FinanceCardProps) {
    const { currencySymbol } = useBranding();

    const sellingPrice = parseFloat(formData.sellingPrice || "0");
    const costPrice = parseFloat(formData.costPrice || "0");
    const profit = Math.max(0, sellingPrice - costPrice);
    const margin = Math.round((profit / (costPrice || 1)) * 100);

    return (
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm shadow-emerald-100/50">
                    <Banknote className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 ">Финансы</h3>
                    <p className="text-xs font-bold text-slate-700">Цены и маржин</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                            <Tag className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Себестоимость</span>
                    </div>
                    <div className="text-lg font-black text-slate-900">{costPrice.toLocaleString()} {currencySymbol}</div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-transform">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                            <Banknote className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-white/60">Цена продажи</span>
                    </div>
                    <div className="text-xl font-black">{sellingPrice.toLocaleString()} {currencySymbol}</div>
                </div>

                {/* Profit Indicator */}
                {sellingPrice > 0 && (
                    <div className="mt-2 p-4 rounded-2xl bg-emerald-50 border border-emerald-100/50 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs font-black text-emerald-600">
                            <span>Прибыль с единицы</span>
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                <span>Premium Meta</span>
                            </div>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <div className="text-2xl font-black text-emerald-900">
                                {profit.toLocaleString()} {currencySymbol}
                            </div>
                            <div className="text-sm font-black text-emerald-600 px-2 py-0.5 bg-white rounded-lg border border-emerald-100 shadow-sm">
                                +{margin}%
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
