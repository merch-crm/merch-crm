"use client";

import { useState } from "react";
import {
    Plus,
    Ticket,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Calendar,
    Edit3,
    ArrowRight,
    Search,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
    togglePromocodeActive,
    deletePromocode,
    createPromocode,
    updatePromocode
} from "./actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promocode | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const handleToggle = async (id: string, current: boolean) => {
        const res = await togglePromocodeActive(id, !current);
        if (res.success) {
            setData(prev => prev.map(p => p.id === id ? { ...p, isActive: !current } : p));
        }
    };

    const handleDelete = (id: string) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        const res = await deletePromocode(deleteConfirmId);
        setDeleteConfirmId(null);
        if (res.success) {
            setData(prev => prev.filter(p => p.id !== deleteConfirmId));
        }
    };

    const handleOpenEdit = (promo: Promocode) => {
        setEditingPromo(promo);
        setIsDialogOpen(true);
    };

    const handleOpenCreate = () => {
        setEditingPromo(null);
        setIsDialogOpen(true);
    };

    const filteredData = data.filter(p =>
        p.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary/5 rounded-[22px] flex items-center justify-center border border-primary/10">
                        <Ticket className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            Промокоды
                            <span className="bg-primary/10 text-primary text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                {data.length}
                            </span>
                        </h1>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mt-1">Маркетинговые инструменты лояльности</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ПОИСК КОДА..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-[18px] text-[11px] font-bold tracking-normal focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-300"
                        />
                    </div>
                    <Button
                        onClick={handleOpenCreate}
                        size="lg"
                        className="rounded-2xl shadow-xl shadow-primary/20 font-bold"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Создать
                    </Button>
                </div>
            </div>

            {/* Premium Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredData.map((promo) => (
                    <div
                        key={promo.id}
                        className={cn(
                            "group bg-white rounded-[12px] border border-slate-100 p-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden flex flex-col justify-between",
                            !promo.isActive && "opacity-75"
                        )}
                    >
                        {/* High-end decorative background */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />

                        <div>
                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className={cn(
                                    "px-2.5 py-1 rounded-full text-[9px] font-bold  tracking-normal border",
                                    promo.isActive
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        : "bg-slate-50 text-slate-400 border-slate-100"
                                )}>
                                    {promo.isActive ? "● Активен" : "○ Пауза"}
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenEdit(promo)}
                                        className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleToggle(promo.id, promo.isActive)}
                                        className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors"
                                    >
                                        {promo.isActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(promo.id)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className="text-[10px] font-bold text-slate-400  tracking-normal mb-1.5">Код купона</div>
                                <div className="text-xl font-bold text-slate-900 tracking-normal mb-4 group-hover:text-primary transition-colors">
                                    {promo.code}
                                </div>

                                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-50">
                                    <div>
                                        <div className="text-[9px] font-bold text-slate-300  tracking-normal mb-1">Выгода</div>
                                        <div className="text-lg font-bold text-primary">
                                            {promo.discountType === 'percentage' ? `${promo.value}%` : `${promo.value} ₽`}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold text-slate-300  tracking-normal mb-1">Лимит</div>
                                        <div className="text-lg font-bold text-slate-900">
                                            {promo.usageCount}<span className="text-slate-200">/</span><span className="text-slate-400">{promo.usageLimit || "∞"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Calendar className="w-3.5 h-3.5 opacity-60" />
                                <span className="text-[9px] font-bold  tracking-tight">
                                    {promo.expiresAt
                                        ? format(new Date(promo.expiresAt), "dd.MM.yyyy", { locale: ru })
                                        : "БЕССРОЧНО"
                                    }
                                </span>
                            </div>
                            <div className="bg-slate-50 px-2 py-0.5 rounded text-[8px] font-bold text-slate-400  tracking-normal">
                                {promo.discountType === 'percentage' ? "Процент" : "Прямая"}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredData.length === 0 && (
                    <div className="col-span-full py-24 bg-slate-50/50 rounded-[12px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-white rounded-[12px] shadow-sm flex items-center justify-center mb-6">
                            <Ticket className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-base font-bold text-slate-400  tracking-normal">Ничего не найдено</h3>
                        <p className="text-[11px] text-slate-300 font-bold mt-2  tracking-normal">Измените условия поиска или создайте новый купон</p>
                    </div>
                )}
            </div>

            {/* Premium Dialog Overlay */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[12px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-top-4 duration-400 relative overflow-hidden">
                        {/* Decorative element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full opacity-50 -mr-10 -mt-10" />

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight ">
                                    {editingPromo ? "Редактировать" : "Новый промокод"}
                                </h2>
                                <p className="text-slate-400 text-[10px] font-bold  tracking-normal mt-1">Заполните данные для купона</p>
                            </div>
                            <button
                                onClick={() => setIsDialogOpen(false)}
                                className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form action={async (formData) => {
                            setIsLoading(true);
                            const values = {
                                code: (formData.get("code") as string).toUpperCase(),
                                discountType: formData.get("discountType") as "percentage" | "fixed",
                                value: Number(formData.get("value")),
                                usageLimit: formData.get("usageLimit")?.toString(),
                                expiresAt: formData.get("expiresAt")?.toString() || null
                            };

                            const res = editingPromo
                                ? await updatePromocode(editingPromo.id, values)
                                : await createPromocode(values);

                            setIsLoading(false);
                            if (res.success) {
                                window.location.reload();
                            }
                        }} className="space-y-6 relative z-10">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">Код купона</label>
                                <input
                                    name="code"
                                    required
                                    defaultValue={editingPromo?.code}
                                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-[12px] text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all  placeholder:text-slate-300"
                                    placeholder="SUMMER2026"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">Тип скидки</label>
                                    <select
                                        name="discountType"
                                        defaultValue={editingPromo?.discountType === 'fixed_amount' ? 'fixed' : editingPromo?.discountType}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-[12px] text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                    >
                                        <option value="percentage">Процент %</option>
                                        <option value="fixed">Фикс. сумма ₽</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">Значение</label>
                                    <input
                                        name="value"
                                        type="number"
                                        required
                                        defaultValue={editingPromo?.value}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-[12px] text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">Лимит использований</label>
                                    <input
                                        name="usageLimit"
                                        type="number"
                                        defaultValue={editingPromo?.usageLimit || ""}
                                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-[12px] text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Безлимитно"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">Дата истечения</label>
                                    <div className="relative">
                                        <input
                                            name="expiresAt"
                                            type="date"
                                            defaultValue={editingPromo?.expiresAt ? format(new Date(editingPromo.expiresAt), "yyyy-MM-dd") : ""}
                                            className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-[12px] text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                        />
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="flex-1 py-4 text-[11px] font-bold  tracking-normal text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-[12px] transition-all"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-[2] bg-primary text-white py-4 rounded-[12px] text-[11px] font-bold  tracking-normal hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? "Сохранение..." : (
                                        <>
                                            {editingPromo ? "Сохранить изменения" : "Подтвердить создание"}
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deleteConfirmId}
                onClose={() => setDeleteConfirmId(null)}
                onConfirm={confirmDelete}
                title="Удаление промокода"
                description="Вы уверены, что хотите удалить этот промокод? Это действие нельзя отменить."
                confirmText="Удалить"
                variant="destructive"
            />
        </div>
    );
}
