"use client";

import { useState } from "react";
import { Plus, Search, Calendar, ShieldCheck, ShieldAlert, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createPromocode, togglePromocode, CreatePromocodeData } from "../actions";
import { useRouter } from "next/navigation";

export interface Promocode {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    value: string;
    minOrderAmount: string;
    maxDiscountAmount: string;
    startDate: string | null;
    expiresAt: string | null;
    usageLimit: number | null;
    usageCount: number;
    isActive: boolean;
    createdAt: string | Date;
}

export function PromocodesClient({ initialData }: { initialData: Promocode[] }) {
    const [promos, setPromos] = useState(initialData || []);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const filteredPromos = promos.filter(p =>
        p.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggle = async (id: string, current: boolean) => {
        const res = await togglePromocode(id, !current);
        if (res.success) {
            setPromos(prev => prev.map(p => p.id === id ? { ...p, isActive: !current } : p));
            toast(`Промокод ${!current ? 'активирован' : 'деактивирован'}`, "success");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => router.back()}
                        className="group w-12 h-12 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95 shrink-0 shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">Промокоды</h1>
                        <p className="text-slate-500 font-medium mt-1">Управление скидками и акциями</p>
                    </div>
                </div>

                <Button
                    onClick={() => setIsAdding(true)}
                    className="h-12 btn-primary rounded-[var(--radius)] px-6 gap-2 font-bold shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Создать промокод
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Поиск по коду..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-14 pr-6 rounded-[var(--radius)] bg-slate-50 border border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-medium text-slate-900 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPromos.map((promo) => (
                    <div key={promo.id} className={cn(
                        "bg-white p-8 rounded-[2rem] border transition-all duration-300 group hover:shadow-2xl hover:shadow-slate-200 relative overflow-hidden",
                        promo.isActive ? "border-slate-200" : "border-slate-200 opacity-60 grayscale"
                    )}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn(
                                "px-4 py-2 rounded-[18px] text-sm font-bold tracking-normal ",
                                promo.isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-200 text-slate-500"
                            )}>
                                {promo.code}
                            </div>
                            <button
                                onClick={() => handleToggle(promo.id, promo.isActive)}
                                className={cn(
                                    "p-2 rounded-full transition-all",
                                    promo.isActive ? "bg-emerald-50 text-emerald-600 hover:bg-rose-50 hover:text-rose-600" : "bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                                )}
                            >
                                {promo.isActive ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="text-4xl font-bold text-slate-900 tracking-normal">
                                    {promo.discountType === 'percentage' ? `${promo.value}%` : `${Number(promo.value).toLocaleString()} ₽`}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400  tracking-normal mt-1">скидка</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                <div>
                                    <div className="text-xs font-bold text-slate-900">{promo.usageCount} / {promo.usageLimit || '∞'}</div>
                                    <div className="text-[9px] font-bold text-slate-400  tracking-tight">Использовано</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-900">{promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'Бессрочно'}</div>
                                    <div className="text-[9px] font-bold text-slate-400  tracking-tight">Истекает</div>
                                </div>
                            </div>

                            {Number(promo.minOrderAmount) > 0 && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-[18px]">
                                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-[10px] font-bold text-slate-500  tracking-tight">От {Number(promo.minOrderAmount).toLocaleString()} ₽</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isAdding && (
                <AddPromocodeDialog
                    onClose={() => setIsAdding(false)}
                    onSuccess={(newPromo) => {
                        setPromos([newPromo, ...promos]);
                        setIsAdding(false);
                    }}
                />
            )}
        </div>
    );
}

function AddPromocodeDialog({ onClose, onSuccess }: { onClose: () => void, onSuccess: (p: Promocode) => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries()) as unknown as CreatePromocodeData;

        try {
            const res = await createPromocode(data);
            if (res.success) {
                toast("Промокод создан", "success");
                onSuccess(res.data as unknown as Promocode);
            } else {
                toast(res.error || "Ошибка", "error");
            }
        } catch {
            toast("Ошибка", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <form onSubmit={handleSubmit} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16" />

                <h2 className="text-2xl font-bold text-slate-900 mb-8 relative">Новый промокод</h2>

                <div className="space-y-6 relative">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">Код</label>
                        <input name="code" required placeholder="SUMMER2024" className="w-full h-14 px-6 rounded-[var(--radius)] bg-slate-50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-lg  tracking-normal placeholder:text-slate-300" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">Тип скидки</label>
                            <select name="discountType" className="w-full h-14 px-6 rounded-[var(--radius)] bg-slate-50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm">
                                <option value="percentage">Процент %</option>
                                <option value="fixed">Фиксированная ₽</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">Значение</label>
                            <input name="value" type="number" required placeholder="10" className="w-full h-14 px-6 rounded-[var(--radius)] bg-slate-50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">Мин. сумма заказа</label>
                            <input name="minOrderAmount" type="number" placeholder="0" className="w-full h-14 px-6 rounded-[var(--radius)] bg-slate-50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">Лимит использований</label>
                            <input name="usageLimit" type="number" placeholder="∞" className="w-full h-14 px-6 rounded-[var(--radius)] bg-slate-50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">Дата начала</label>
                            <div className="relative">
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input name="startDate" type="date" className="w-full h-14 px-6 rounded-[var(--radius)] bg-slate-50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">Дата окончания</label>
                            <div className="relative">
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input name="endDate" type="date" className="w-full h-14 px-6 rounded-[var(--radius)] bg-slate-50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="h-14 flex-1 rounded-[var(--radius)] font-bold">Отмена</Button>
                        <Button type="submit" disabled={isLoading} className="h-14 flex-1 btn-primary rounded-[var(--radius)] font-bold shadow-xl shadow-primary/20">{isLoading ? "Создание..." : "Создать"}</Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
