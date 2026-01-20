"use client";

import { useState } from "react";
import {
    Plus,
    Ticket,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
    togglePromocodeActive,
    deletePromocode,
    createPromocode
} from "./actions";

interface Promocode {
    id: string;
    code: string;
    discountType: string;
    value: string;
    isActive: boolean;
    usageCount: number;
    usageLimit: number | null;
    expiresAt: string | Date | null;
    createdAt: string | Date;
}

export function PromocodesClient({ initialData }: { initialData: Promocode[] }) {
    const [data, setData] = useState(initialData);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (id: string, current: boolean) => {
        const res = await togglePromocodeActive(id, !current);
        if (res.success) {
            setData(prev => prev.map(p => p.id === id ? { ...p, isActive: !current } : p));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Вы уверены?")) return;
        const res = await deletePromocode(id);
        if (res.success) {
            setData(prev => prev.filter(p => p.id !== id));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Промокоды</h1>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-3">Управление программами лояльности и скидками</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="group bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-[20px] font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Создать промокод
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((promo) => (
                    <div
                        key={promo.id}
                        className={cn(
                            "bg-white rounded-[24px] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden",
                            !promo.isActive && "opacity-60 grayscale-[0.5]"
                        )}
                    >
                        {/* Status Indicator */}
                        <div className={cn(
                            "absolute top-0 right-0 w-32 h-12 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] rotate-45 translate-x-12 -translate-y-2",
                            promo.isActive ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                        )}>
                            {promo.isActive ? "Активен" : "Пауза"}
                        </div>

                        <div className="flex flex-col h-full">
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-4 bg-slate-50 rounded-[18px] group-hover:bg-indigo-50 transition-colors">
                                    <Ticket className="w-8 h-8 text-indigo-600" />
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleToggle(promo.id, promo.isActive)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {promo.isActive ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(promo.id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Код</div>
                                    <div className="text-2xl font-black text-slate-900 tracking-tighter">{promo.code}</div>
                                </div>

                                <div className="flex gap-8">
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Скидка</div>
                                        <div className="text-xl font-bold text-indigo-600">
                                            {promo.discountType === 'percentage' ? `${promo.value}%` : `${promo.value} ₽`}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Использовано</div>
                                        <div className="text-xl font-bold text-slate-900">
                                            {promo.usageCount} {promo.usageLimit ? `/ ${promo.usageLimit}` : ""}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">
                                            {promo.expiresAt
                                                ? format(new Date(promo.expiresAt), "dd MMM yyyy", { locale: ru })
                                                : "Бессрочно"
                                            }
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                        {promo.discountType === 'percentage' ? "Процентная" : "Фикс. сумма"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="col-span-full py-20 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200 text-center">
                        <Ticket className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-400">Промокодов пока нет</h3>
                        <p className="text-sm text-slate-300 mt-2">Создайте первый промокод для ваших клиентов</p>
                    </div>
                )}
            </div>

            {/* Simple Add Dialog Overlay */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-8">Новый промокод</h2>
                        <form action={async (formData) => {
                            setIsLoading(true);
                            const values = {
                                code: formData.get("code") as string,
                                discountType: formData.get("discountType") as "percentage" | "fixed_amount",
                                value: Number(formData.get("value")),
                                usageLimit: formData.get("usageLimit")?.toString(),
                                expiresAt: formData.get("expiresAt")?.toString() || null
                            };
                            const res = await createPromocode(values);
                            setIsLoading(false);
                            if (res.success) {
                                window.location.reload();
                            }
                        }} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Код (напр. SUMMER2026)</label>
                                    <input name="code" required className="w-full px-5 py-4 bg-slate-50 border-none rounded-[18px] text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all uppercase" placeholder="KOD" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Тип скидки</label>
                                    <select name="discountType" className="w-full px-5 py-4 bg-slate-50 border-none rounded-[18px] text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all">
                                        <option value="percentage">Процент %</option>
                                        <option value="fixed">Фикс. сумма ₽</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Значение</label>
                                    <input name="value" type="number" required className="w-full px-5 py-4 bg-slate-50 border-none rounded-[18px] text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="10" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Лимит использований</label>
                                    <input name="usageLimit" type="number" className="w-full px-5 py-4 bg-slate-50 border-none rounded-[18px] text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="100" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Дата истечения</label>
                                <input name="expiresAt" type="date" className="w-full px-5 py-4 bg-slate-50 border-none rounded-[18px] text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all" />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Отмена</button>
                                <button type="submit" disabled={isLoading} className="flex-[2] bg-slate-900 text-white py-4 rounded-[18px] text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
                                    {isLoading ? "Создание..." : "Подтвердить"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
