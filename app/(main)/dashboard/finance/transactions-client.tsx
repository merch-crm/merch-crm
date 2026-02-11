"use client";

import { useState } from "react";
import {
    CreditCard,
    ArrowDownRight,
    ArrowUpRight,
    Search,
    Plus,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumSelect } from "@/components/ui/premium-select";
import { useBranding } from "@/components/branding-provider";
import { useToast } from "@/components/ui/toast";
import { createExpense, CreateExpenseData } from "./actions";
import { playSound } from "@/lib/sounds";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { ResponsiveModal } from "@/components/ui/responsive-modal";


interface Transaction {
    id: string;
    type: 'payment' | 'expense';
    amount: string;
    category: string;
    description: string | null;
    date: string | Date;
    orderNumber?: string;
    clientName?: string;
    method?: string;
}

export function TransactionsClient({
    initialPayments,
    initialExpenses
}: {
    initialPayments: {
        id: string;
        amount: string;
        isAdvance: boolean;
        comment: string | null;
        createdAt: string | Date;
        method: string;
        order?: {
            orderNumber: string;
            client?: {
                firstName: string;
                lastName: string;
            };
        };
    }[],
    initialExpenses: {
        id: string;
        amount: string;
        category: string;
        description: string | null;
        date: string;
    }[]
}) {
    const { currencySymbol } = useBranding();
    const [view, setView] = useState<'all' | 'payments' | 'expenses'>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddingExpense, setIsAddingExpense] = useState(false);


    // Map payments and expenses to a unified format
    const allTransactions: Transaction[] = [
        ...initialPayments.map(p => ({
            id: p.id,
            type: 'payment' as const,
            amount: p.amount,
            category: p.isAdvance ? 'Аванс' : 'Оплата',
            description: p.comment,
            date: p.createdAt,
            orderNumber: p.order?.orderNumber,
            clientName: `${p.order?.client?.lastName} ${p.order?.client?.firstName}`,
            method: p.method
        })),
        ...initialExpenses.map(e => ({
            id: e.id,
            type: 'expense' as const,
            amount: e.amount,
            category: e.category,
            description: e.description,
            date: e.date,
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filtered = allTransactions.filter(t => {
        const matchesSearch =
            (t.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (t.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (t.clientName?.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesView =
            view === 'all' ? true :
                view === 'payments' ? t.type === 'payment' :
                    t.type === 'expense';

        return matchesSearch && matchesView;
    });

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="crm-filter-tray w-full overflow-hidden flex items-center p-1.5 rounded-[22px]">
                {/* Search Box */}
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Поиск..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="crm-filter-tray-search w-full pl-12 pr-10 focus:outline-none min-w-0 h-12 bg-transparent border-none"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 h-8 w-8"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />

                <div className="flex-1 min-w-0 flex items-center">
                    <div className="flex items-center p-1 gap-1 overflow-x-auto no-scrollbar flex-nowrap w-full">
                        {[
                            { id: 'all', label: 'Все' },
                            { id: 'payments', label: 'Доходы', activeColor: 'bg-emerald-500', shadowColor: 'shadow-emerald-500/20' },
                            { id: 'expenses', label: 'Расходы', activeColor: 'bg-rose-500', shadowColor: 'shadow-rose-500/20' }
                        ].map((t) => {
                            const isActive = view === t.id;
                            return (
                                <Button
                                    key={t.id}
                                    variant="ghost"
                                    onClick={() => setView(t.id as "all" | "payments" | "expenses")}
                                    className={cn(
                                        "crm-filter-tray-tab shrink-0 relative",
                                        isActive && "active"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeFinanceTab"
                                            className={cn(
                                                "absolute inset-0 rounded-[16px] z-0",
                                                t.activeColor || "bg-primary shadow-primary/20",
                                                t.shadowColor
                                            )}
                                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                        />
                                    )}
                                    <span className="relative z-10">{t.label}</span>
                                </Button>
                            );
                        })}
                    </div>
                </div>

                <div className="shrink-0 ml-1">
                    <Button
                        onClick={() => setIsAddingExpense(true)}
                        className="h-11 w-11 sm:h-auto sm:w-auto sm:px-6 !bg-primary text-white gap-2 border-none rounded-full sm:rounded-2xl flex items-center justify-center p-0 sm:p-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Добавить</span>
                    </Button>
                </div>
            </div>

            <div className="crm-card border-none bg-white overflow-hidden shadow-sm">
                <ResponsiveDataView
                    data={filtered}
                    mobileGridClassName="flex flex-col divide-y divide-slate-100 md:hidden"
                    desktopClassName="hidden md:block "
                    renderTable={() => (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-4 text-[10px] font-bold text-slate-400 tracking-normal">Дата</th>
                                        <th className="px-8 py-4 text-[10px] font-bold text-slate-400 tracking-normal">Категория / Субъект</th>
                                        <th className="px-8 py-4 text-[10px] font-bold text-slate-400 tracking-normal">Описание</th>
                                        <th className="px-8 py-4 text-[10px] font-bold text-slate-400 tracking-normal text-right">Сумма</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((t) => (
                                        <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="text-sm font-bold text-slate-900">{new Date(t.date).toLocaleDateString()}</div>
                                                <div className="text-[10px] text-slate-400 font-bold tracking-normal mt-0.5">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner",
                                                        t.type === 'payment' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                    )}>
                                                        {t.type === 'payment' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900 tracking-normal">{t.category}</div>
                                                        {t.orderNumber && <div className="text-[10px] font-bold text-primary">Заказ #{t.orderNumber} • {t.clientName}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-xs text-slate-500 font-medium line-clamp-1 max-w-xs">{t.description || "—"}</div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className={cn(
                                                    "text-lg font-bold tracking-normal",
                                                    t.type === 'payment' ? "text-emerald-600" : "text-rose-600"
                                                )}>
                                                    {t.type === 'payment' ? '+' : '-'}{Number(t.amount).toLocaleString()} {currencySymbol}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    renderCard={(t) => (
                        <div
                            key={t.id}
                            className="group relative flex items-center justify-between p-4 transition-all duration-300 active:bg-slate-50"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className={cn(
                                    "w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm transition-transform group-active:scale-90",
                                    t.type === 'payment' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                )}>
                                    {t.type === 'payment' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-sm font-black text-slate-900 truncate leading-tight">
                                            {t.category}
                                        </span>
                                        <span className={cn(
                                            "text-sm font-black tracking-tight",
                                            t.type === 'payment' ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {t.type === 'payment' ? '+' : '-'}{Math.round(Number(t.amount)).toLocaleString()} {currencySymbol}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                            <span>{new Date(t.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                                            <span>•</span>
                                            <span className="truncate max-w-[120px]">{t.description || "Без описания"}</span>
                                        </div>
                                        {t.orderNumber && (
                                            <span className="text-[9px] font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded-[4px] uppercase tracking-tighter">
                                                #{t.orderNumber}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                />

                {filtered.length === 0 && (
                    <div className="py-20 text-center">
                        <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">Транзакций не найдено</h3>
                        <p className="text-slate-500 text-sm">Попробуйте изменить параметры поиска или фильтры</p>
                    </div>
                )}
            </div>

            {isAddingExpense && (
                <AddExpenseDialog
                    onClose={() => setIsAddingExpense(false)}
                    onSuccess={() => {
                        setIsAddingExpense(false);
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}

function AddExpenseDialog({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const { currencySymbol } = useBranding();
    const [isLoading, setIsLoading] = useState(false);
    const [category, setCategory] = useState("purchase");
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries()) as unknown as CreateExpenseData;

        try {
            const res = await createExpense(data);
            if (res.success) {
                toast("Расход записан", "success");
                playSound("expense_added");
                onSuccess();
            } else {
                toast(res.error || "Ошибка", "error");
                playSound("notification_error");
            }
        } catch {
            toast("Ошибка", "error");
            playSound("notification_error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ResponsiveModal
            isOpen={true}
            onClose={onClose}
            title="Новый расход"
        >
            <form onSubmit={handleSubmit} className="p-6 pt-2">
                <div className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Категория</label>
                        <PremiumSelect
                            name="category"
                            options={[
                                { id: "purchase", title: "Закупки" },
                                { id: "salary", title: "Зарплаты" },
                                { id: "rent", title: "Аренда" },
                                { id: "tax", title: "Налоги" },
                                { id: "other", title: "Прочее" }
                            ]}
                            value={category}
                            onChange={setCategory}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Сумма {currencySymbol}</label>
                        <Input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full h-12 px-6 rounded-[var(--radius)] bg-slate-50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Дата</label>
                        <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full h-12 px-6 rounded-[var(--radius)] bg-slate-50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Описание</label>
                        <textarea name="description" rows={3} placeholder="За что платеж..." className="w-full p-6 rounded-[var(--radius)] bg-slate-50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm resize-none" />
                    </div>

                    <div className="sticky bottom-0 z-10 p-6 pt-3 flex items-center justify-end gap-3 shrink-0 bg-white border-t border-slate-100 mt-auto">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="hidden md:flex h-11 px-8 text-slate-400 hover:text-slate-600 font-bold text-sm active:scale-95 transition-all text-center rounded-full sm:rounded-[var(--radius-inner)]"
                        >
                            Отмена
                        </Button>
                        <Button variant="btn-dark" type="submit" disabled={isLoading} className="h-11 w-full md:w-auto md:px-10 rounded-full sm:rounded-[var(--radius-inner)] font-bold shadow-sm shadow-slate-900/10 border-none transition-all active:scale-95">{isLoading ? "Запись..." : "Сохранить"}</Button>
                    </div>
                </div>
            </form>
        </ResponsiveModal>
    );
}
