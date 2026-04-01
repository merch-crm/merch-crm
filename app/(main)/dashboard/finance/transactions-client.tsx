"use client"; // audit-ignore

import { useState as useReactState, useEffect } from "react";
import { useIsClient } from "@/hooks/use-is-client";
import { useRouter } from "next/navigation";
import {
    CreditCard,
    ArrowDownRight,
    ArrowUpRight,
    Search,
    Plus,
    X,
    Layers,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useBranding } from "@/components/branding-provider";
import { useToast } from "@/components/ui/toast";
import { createExpense, CreateExpenseData } from "./actions";
import { playSound } from "@/lib/sounds";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useSearchParams } from "next/navigation";

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
    const [view, setView] = useReactState<'all' | 'payments' | 'expenses'>('all');
    const [searchQuery, setSearchQuery] = useReactState("");
    const [isAddingExpense, setIsAddingExpense] = useReactState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const isClient = useIsClient();

    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const rangeParam = searchParams.get("range") || "30d";

    const setRange = (range: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", range);
        params.delete("from");
        params.delete("to");
        router.push(`/dashboard/finance/transactions?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push("/dashboard/finance/transactions?range=30d");
    };


    // Map payments and expenses to a unified format
    const allTransactions = (useReactState<Transaction[]>(() => {
        return [
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
        ];
    }))[0];

    const sortedTransactions = (useIsClient() ? [...allTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : allTransactions);

    const filtered = sortedTransactions.filter(t => {
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
            {/* Unified Filter Tray */}
            <div className="crm-filter-tray w-full flex items-center p-1.5 gap-2 overflow-x-auto no-scrollbar">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Поиск..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="crm-filter-tray-search w-full pl-12 pr-10 focus:outline-none h-12 bg-transparent border-none"
                    />
                    {searchQuery && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 h-8 w-8"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                <div className="w-px h-6 bg-slate-200 shrink-0" />

                {/* Range Filters */}
                <div className="bg-slate-100 p-1 rounded-[14px] flex items-center gap-1 shrink-0">
                    {[
                        { id: 'today', label: 'Сегодня' },
                        { id: '7d', label: '7 дней' },
                        { id: '30d', label: '30 дней' },
                        { id: '365d', label: 'Год' }
                    ].map((r) => (
                        <button
                            key={r.id}
                            onClick={() => setRange(r.id)}
                            className={cn(
                                "px-3 py-1.5 rounded-[10px] text-[10px] font-black uppercase tracking-wider transition-all",
                                rangeParam === r.id && !fromParam
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>

                <div className="w-px h-6 bg-slate-200 shrink-0" />

                {/* Category Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-[14px] gap-1 relative shrink-0">
                    {[
                        { id: 'all', label: 'Все', icon: Layers },
                        { id: 'payments', label: 'Доходы', icon: ArrowUpRight, activeColor: 'bg-emerald-500', shadowColor: 'shadow-emerald-500/20' },
                        { id: 'expenses', label: 'Расходы', icon: ArrowDownRight, activeColor: 'bg-rose-500', shadowColor: 'shadow-rose-500/20' }
                    ].map((t) => {
                        const isActive = view === t.id;
                        const TabIcon = t.icon;
                        return (
                            <Button
                                key={t.id}
                                variant="ghost"
                                onClick={() => setView(t.id as "all" | "payments" | "expenses")}
                                className={cn("crm-filter-tab shrink-0 px-3 sm:px-6 h-10",
                                    isActive && "active"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeFinanceTab"
                                        className={cn("absolute inset-0 rounded-[10px] z-0",
                                            t.activeColor || "bg-primary shadow-primary/20",
                                            t.shadowColor
                                        )}
                                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                    />
                                )}
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    <TabIcon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors",
                                        isActive ? "text-white" : (t.id === 'payments' ? "text-emerald-500" : (t.id === 'expenses' ? "text-rose-500" : "text-slate-400"))
                                    )} />
                                    <span className="hidden sm:inline relative z-10">{t.label}</span>
                                </div>
                            </Button>
                        );
                    })}
                </div>

                <div className="flex-1" />

                {/* Add Button */}
                <div className="shrink-0">
                    <Button
                        type="button"
                        onClick={() => setIsAddingExpense(true)}
                        className="h-11 px-6 !bg-primary text-white gap-2 border-none rounded-2xl flex items-center justify-center"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Расход</span>
                    </Button>
                </div>
            </div>

            {/* Active External Filters (from URL) */}
            {(fromParam || toParam) && (
                <div className="flex items-center justify-between bg-primary/5 border border-primary/10 p-3 rounded-2xl animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary">
                        <Activity className="w-4 h-4" />
                        <span>
                            Фильтр по дате: {fromParam ? format(new Date(fromParam), "d MMMM yyyy", { locale: ru }) : '...'} 
                            {toParam && toParam !== fromParam ? ` — ${format(new Date(toParam), "d MMMM yyyy", { locale: ru })}` : ''}
                        </span>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="h-8 px-3 text-xs font-black text-primary hover:bg-primary/10 rounded-xl"
                    >
                        <X className="w-3 h-3 mr-1" /> Сбросить
                    </Button>
                </div>
            )}

            <div className="crm-card border-none bg-white overflow-hidden shadow-sm">
                <ResponsiveDataView<Transaction>
                    data={filtered}
                    getItemKey={(t) => t.id}
                    mobileGridClassName="flex flex-col divide-y divide-slate-100 md:hidden"
                    desktopClassName="hidden md:block"
                    renderTable={() => (
                        <div className="overflow-x-auto">
                            <table className="crm-table">
                                <thead className="crm-thead">
                                    <tr>
                                        <th className="crm-th">Дата</th>
                                        <th className="crm-th">Категория / Субъект</th>
                                        <th className="crm-th">Описание</th>
                                        <th className="crm-th crm-td-number">Сумма</th>
                                    </tr>
                                </thead>
                                <tbody className="crm-tbody">
                                    {filtered.map((t) => (
                                        <tr key={t.id} className="crm-tr">
                                            <td className="crm-td">
                                                <div className="text-sm font-bold text-slate-900">{isClient ? format(new Date(t.date), "dd.MM.yyyy", { locale: ru }) : "..."}</div>
                                                <div className="text-xs text-slate-400 font-bold mt-0.5">{isClient ? format(new Date(t.date), "HH:mm", { locale: ru }) : "..."}</div>
                                            </td>
                                            <td className="crm-td">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner",
                                                        t.type === 'payment' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                    )}>
                                                        {t.type === 'payment' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900">{t.category}</div>
                                                        {t.orderNumber && <div className="text-xs font-bold text-primary">Заказ #{t.orderNumber} • {t.clientName}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="crm-td">
                                                <div className="text-xs text-slate-500 font-medium line-clamp-1 max-w-xs">{t.description || "—"}</div>
                                            </td>
                                            <td className="crm-td crm-td-number">
                                                <div className={cn("text-lg font-bold",
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
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={cn("w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm transition-transform group-active:scale-90",
                                    t.type === 'payment' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                )}>
                                    {t.type === 'payment' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-sm font-black text-slate-900 truncate leading-tight">
                                            {t.category}
                                        </span>
                                        <span className={cn("text-sm font-black",
                                            t.type === 'payment' ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {t.type === 'payment' ? '+' : '-'}{Math.round(Number(t.amount)).toLocaleString()} {currencySymbol}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                            <span>{isClient ? format(new Date(t.date), "d MMM", { locale: ru }) : "..."}</span>
                                            <span>•</span>
                                            <span className="truncate max-w-[120px]">{t.description || "Без описания"}</span>
                                        </div>
                                        {t.orderNumber && (
                                            <span className="text-xs font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded-[4px]">
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
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}

function AddExpenseDialog({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const { currencySymbol } = useBranding();
    const [isLoading, setIsLoading] = useReactState(false);
    const [category, setCategory] = useReactState("purchase");
    const isClient = useIsClient();
    const { toast } = useToast();
    const [todayDate, setTodayDate] = useReactState("");

    useEffect(() => {
        const now = new Date(); // suppressHydrationWarning
        setTodayDate(now.toISOString().split('T')[0]);
    }, [setTodayDate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const amount = parseFloat(formData.get("amount") as string);

        if (!amount || amount <= 0) {
            toast("Сумма должна быть больше нуля","error");
            setIsLoading(false);
            return;
        }

        const data = Object.fromEntries(formData.entries()) as unknown as CreateExpenseData;

        try {
            const res = await createExpense(data);
            if (res.success) {
                toast("Расход записан","success");
                playSound("expense_added");
                onSuccess();
            } else {
                toast(res.error ||"Ошибка","error");
                playSound("notification_error");
            }
        } catch {
            toast("Ошибка","error");
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
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 ml-1">Категория</label>
                        <Select
                            name="category"
                            options={[
                                { id:"purchase", title:"Закупки" },
                                { id:"salary", title:"Зарплаты" },
                                { id:"rent", title:"Аренда" },
                                { id:"tax", title:"Налоги" },
                                { id:"other", title:"Прочее" }
                            ]}
                            value={category}
                            onChange={setCategory}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 ml-1">Сумма {currencySymbol}</label>
                        <Input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full h-12 px-6 rounded-[var(--radius)] bg-slate-50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 ml-1">Дата</label>
                        {isClient ? (
                            <Input name="date" type="date" required defaultValue={todayDate} className="w-full h-12 px-6 rounded-[var(--radius)] bg-slate-50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm" />
                        ) : (
                            <div className="w-full h-12 px-6 rounded-[var(--radius)] bg-slate-50 animate-pulse flex items-center">
                                <span className="text-xs text-slate-300 font-bold ml-1">Загрузка даты...</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 ml-1">Описание</label>
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
                        <SubmitButton variant="btn-dark" isLoading={isLoading} className="h-11 w-full md:w-auto md:px-10 rounded-full sm:rounded-[var(--radius-inner)] font-bold shadow-sm shadow-slate-900/10 border-none transition-all active:scale-95">Сохранить</SubmitButton>
                    </div>
                </div>
            </form>
        </ResponsiveModal>
    );
}
