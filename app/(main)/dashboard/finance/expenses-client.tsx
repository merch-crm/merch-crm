"use client";

import { useState } from "react";
import { Plus, Search, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumSelect } from "@/components/ui/premium-select";
import { useToast } from "@/components/ui/toast";
import { createExpense, CreateExpenseData } from "./actions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { playSound } from "@/lib/sounds";
import { useBranding } from "@/components/branding-provider";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

export interface Expense {
    id: string;
    amount: string;
    category: string;
    description: string | null;
    date: string;
    createdAt: string | Date;
}

export function ExpensesClient({ initialData }: { initialData: Expense[] }) {
    const { currencySymbol } = useBranding();
    const [expenses, setExpenses] = useState(initialData || []);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const filteredExpenses = expenses.filter(e =>
    (e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const categoryLabels: Record<string, string> = {
        rent: "Аренда",
        salary: "Зарплата",
        purchase: "Закупки",
        tax: "Налоги",
        other: "Прочее"
    };

    const categoryColors: Record<string, string> = {
        rent: "bg-blue-50 text-blue-600 border-blue-100",
        salary: "bg-primary/5 text-primary border-primary/20",
        purchase: "bg-amber-50 text-amber-600 border-amber-100",
        tax: "bg-rose-50 text-rose-600 border-rose-100",
        other: "bg-slate-50 text-slate-600 border-slate-200"
    };

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-5">
                <Button
                    onClick={() => setIsAdding(true)}
                    className="h-11 w-11 sm:h-11 sm:w-auto bg-rose-600 hover:bg-rose-700 text-white rounded-full sm:rounded-2xl sm:px-6 gap-2 font-bold shadow-xl shadow-rose-100 transition-all active:scale-95 border-none shrink-0 p-0 sm:p-auto"
                    title="Добавить расход"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Добавить расход</span>
                </Button>
            </div>

            <div className="crm-card !p-6 flex-1 flex min-h-0 gap-4 px-8 pb-8 pt-4 items-center shadow-sm">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Поиск по описанию или категории..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-14 pr-6 rounded-[var(--radius)] bg-slate-50 border border-transparent focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 outline-none font-medium text-slate-900 transition-all"
                    />
                </div>
            </div>

            <div className="crm-card !p-0 border-slate-200/60 shadow-sm overflow-hidden">
                <ResponsiveDataView
                    data={filteredExpenses}
                    mobileGridClassName="flex flex-col divide-y divide-slate-100 md:hidden"
                    desktopClassName="hidden md:block"
                    renderTable={() => (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400  tracking-normal">Дата</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 tracking-wider">Категория</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400  tracking-normal">Описание</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400  tracking-normal text-right">Сумма</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="group hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-rose-500 group-hover:bg-rose-50 transition-colors">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div className="font-bold text-slate-900 text-sm">
                                                    {format(new Date(expense.date), "d MMM yyyy", { locale: ru })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-md text-[10px] font-bold tracking-wider",
                                                categoryColors[expense.category] || categoryColors.other
                                            )}>
                                                {categoryLabels[expense.category]}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-medium text-slate-600">
                                                {expense.description || "Без описания"}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="text-lg font-bold text-rose-600 leading-none">
                                                -{Number(expense.amount).toLocaleString()} <span className="text-[10px] font-bold text-slate-400 ml-1">{currencySymbol}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    renderCard={(expense) => (
                        <div key={expense.id} className="p-4 flex flex-col gap-2 border-b border-slate-100 last:border-none active:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border",
                                        categoryColors[expense.category] || categoryColors.other
                                    )}>
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">
                                            {categoryLabels[expense.category] || "Прочее"}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold">
                                            {format(new Date(expense.date), "d MMM yyyy", { locale: ru })}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-rose-600">
                                        -{Number(expense.amount).toLocaleString()} {currencySymbol}
                                    </div>
                                </div>
                            </div>
                            {expense.description && (
                                <div className="text-xs text-slate-500 font-medium bg-slate-50 p-2 rounded-lg mt-1">
                                    {expense.description}
                                </div>
                            )}
                        </div>
                    )}
                />

                {filteredExpenses.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="flex flex-col items-center">
                            <FileText className="w-12 h-12 text-slate-200 mb-4" />
                            <p className="text-slate-400 font-medium">Расходов не найдено</p>
                        </div>
                    </div>
                )}
            </div>

            {isAdding && (
                <AddExpenseDialog
                    onClose={() => setIsAdding(false)}
                    onSuccess={(newExpense) => {
                        setExpenses([newExpense, ...expenses]);
                        setIsAdding(false);
                        revalidateData();
                    }}
                />
            )}
        </div>
    );
}

function AddExpenseDialog({ onClose, onSuccess }: { onClose: () => void, onSuccess: (e: Expense) => void }) {
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
                toast("Расход добавлен", "success");
                playSound("expense_added");
                onSuccess(res.data as Expense);
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
            <form onSubmit={handleSubmit} className="p-4 space-y-6">
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Дата</label>
                    <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full h-12 px-6 rounded-[var(--radius)] bg-slate-50 border-none focus:ring-2 focus:ring-rose-500 outline-none font-bold text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Категория</label>
                        <PremiumSelect
                            name="category"
                            options={[
                                { id: "purchase", title: "Закупки" },
                                { id: "rent", title: "Аренда" },
                                { id: "salary", title: "Зарплата" },
                                { id: "tax", title: "Налоги" },
                                { id: "other", title: "Прочее" }
                            ]}
                            value={category}
                            onChange={setCategory}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Сумма {currencySymbol}</label>
                        <Input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full h-12 px-6 rounded-[var(--radius)] bg-slate-50 border-none focus:ring-2 focus:ring-rose-500 outline-none font-bold text-lg" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Описание</label>
                    <textarea name="description" placeholder="На что потрачены деньги..." className="w-full h-32 p-6 rounded-[var(--radius)] bg-slate-50 border-none focus:ring-2 focus:ring-rose-500 outline-none font-medium text-sm resize-none" />
                </div>

                <div className="flex gap-4 pt-4 mt-auto">
                    <Button type="button" variant="outline" onClick={onClose} className="hidden md:inline-flex h-11 flex-1 rounded-[var(--radius)] font-bold">Отмена</Button>
                    <Button type="submit" disabled={isLoading} className="h-11 flex-1 w-full bg-rose-600 text-white rounded-[var(--radius)] font-bold shadow-xl shadow-rose-100">{isLoading ? "Добавление..." : "Добавить"}</Button>
                </div>
            </form>
        </ResponsiveModal>
    );
}

function revalidateData() {
    window.location.reload();
}
