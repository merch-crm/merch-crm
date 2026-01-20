"use client";

import { useState } from "react";
import {
    CreditCard,
    ArrowDownRight,
    ArrowUpRight,
    Search,
    Plus,
    Calendar,
    Filter,
    User,
    ShoppingBag,
    Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createExpense } from "./actions";

interface Transaction {
    id: string;
    type: 'payment' | 'expense';
    amount: string;
    category: string;
    description: string | null;
    date: string;
    orderNumber?: string;
    clientName?: string;
    method?: string;
}

export function TransactionsClient({
    initialPayments,
    initialExpenses
}: {
    initialPayments: any[],
    initialExpenses: any[]
}) {
    const [view, setView] = useState<'all' | 'payments' | 'expenses'>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const { toast } = useToast();

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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 bg-slate-100/50 p-1.5 rounded-2xl w-fit border border-slate-200/50">
                    <button onClick={() => setView('all')} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", view === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Все</button>
                    <button onClick={() => setView('payments')} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", view === 'payments' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Доходы</button>
                    <button onClick={() => setView('expenses')} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", view === 'expenses' ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Расходы</button>
                </div>

                <Button
                    onClick={() => setIsAddingExpense(true)}
                    className="h-12 bg-slate-900 hover:bg-black text-white rounded-[14px] px-6 gap-2 font-black transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Добавить расход
                </Button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Поиск транзакций..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Дата</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Категория / Субъект</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Описание</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Сумма</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((t) => (
                                <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-bold text-slate-900">{new Date(t.date).toLocaleDateString()}</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter mt-0.5">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
                                                t.type === 'payment' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                            )}>
                                                {t.type === 'payment' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{t.category}</div>
                                                {t.orderNumber && <div className="text-[10px] font-bold text-indigo-600">Заказ #{t.orderNumber} • {t.clientName}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-xs text-slate-500 font-medium line-clamp-1 max-w-xs">{t.description || "—"}</div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className={cn(
                                            "text-lg font-black tracking-tight",
                                            t.type === 'payment' ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {t.type === 'payment' ? '+' : '-'}{Number(t.amount).toLocaleString()} ₽
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

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
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await createExpense(data);
            if (res.success) {
                toast("Расход записан", "success");
                onSuccess();
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
            <form onSubmit={handleSubmit} className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95">
                <h2 className="text-2xl font-black text-slate-900 mb-8">Новый расход</h2>

                <div className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Категория</label>
                        <select name="category" required className="w-full h-14 px-6 rounded-[14px] bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm">
                            <option value="purchase">Закупки</option>
                            <option value="salary">Зарплаты</option>
                            <option value="rent">Аренда</option>
                            <option value="tax">Налоги</option>
                            <option value="other">Прочее</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Сумма ₽</label>
                        <input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full h-14 px-6 rounded-[14px] bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Дата</label>
                        <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full h-14 px-6 rounded-[14px] bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Описание</label>
                        <textarea name="description" rows={3} placeholder="За что платеж..." className="w-full p-6 rounded-[14px] bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm resize-none" />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="h-14 flex-1 rounded-[14px] font-black">Отмена</Button>
                        <Button type="submit" disabled={isLoading} className="h-14 flex-1 bg-slate-900 text-white rounded-[14px] font-black shadow-xl shadow-slate-200">{isLoading ? "Запись..." : "Сохранить"}</Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
