"use client";

import { useState } from "react";
import { CreditCard, Plus, Search, Calendar, Tag, FileText, Trash2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createExpense } from "./actions";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Expense {
    id: string;
    amount: string;
    category: string;
    description: string | null;
    date: string;
    createdAt: string;
}

export function ExpensesClient({ initialData }: { initialData: Expense[] }) {
    const [expenses, setExpenses] = useState(initialData || []);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

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
        salary: "bg-indigo-50 text-indigo-600 border-indigo-100",
        purchase: "bg-amber-50 text-amber-600 border-amber-100",
        tax: "bg-rose-50 text-rose-600 border-rose-100",
        other: "bg-slate-50 text-slate-600 border-slate-100"
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Расходы</h2>
                    <p className="text-slate-500 font-medium mt-1">Учет операционных затрат и закупок</p>
                </div>

                <Button
                    onClick={() => setIsAdding(true)}
                    className="h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-[14px] px-6 gap-2 font-black shadow-xl shadow-rose-100 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Добавить расход
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Поиск по описанию или категории..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-14 pr-6 rounded-[14px] bg-slate-50 border border-transparent focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 outline-none font-medium text-slate-900 transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Дата</th>
                            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Категория</th>
                            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Описание</th>
                            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Сумма</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredExpenses.length > 0 ? filteredExpenses.map((expense) => (
                            <tr key={expense.id} className="group hover:bg-slate-50/30 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-rose-500 group-hover:bg-rose-50 transition-colors">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="font-bold text-slate-900 text-sm">
                                            {format(new Date(expense.date), "d MMM yyyy", { locale: ru })}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={cn(
                                        "px-3 py-1.5 rounded-[10px] text-[10px] font-black uppercase tracking-wider border",
                                        categoryColors[expense.category] || categoryColors.other
                                    )}>
                                        {categoryLabels[expense.category] || expense.category}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-sm font-medium text-slate-600">
                                        {expense.description || "Без описания"}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="text-lg font-black text-rose-600 leading-none">
                                        -{Number(expense.amount).toLocaleString()} <span className="text-[10px] font-black text-slate-400 ml-1">₽</span>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <FileText className="w-12 h-12 text-slate-200 mb-4" />
                                        <p className="text-slate-400 font-medium">Расходов не найдено</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
                toast("Расход добавлен", "success");
                onSuccess(res.data as any);
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
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -mr-16 -mt-16" />

                <h2 className="text-2xl font-black text-slate-900 mb-8 relative">Новый расход</h2>

                <div className="space-y-6 relative">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Дата</label>
                        <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full h-14 px-6 rounded-[14px] bg-slate-50 border-none focus:ring-2 focus:ring-rose-500 outline-none font-bold text-sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Категория</label>
                            <select name="category" className="w-full h-14 px-6 rounded-[14px] bg-slate-50 border-none focus:ring-2 focus:ring-rose-500 outline-none font-bold text-sm">
                                <option value="purchase">Закупки</option>
                                <option value="rent">Аренда</option>
                                <option value="salary">Зарплата</option>
                                <option value="tax">Налоги</option>
                                <option value="other">Прочее</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Сумма ₽</label>
                            <input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full h-14 px-6 rounded-[14px] bg-slate-50 border-none focus:ring-2 focus:ring-rose-500 outline-none font-black text-lg" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Описание</label>
                        <textarea name="description" placeholder="На что потрачены деньги..." className="w-full h-32 p-6 rounded-[14px] bg-slate-50 border-none focus:ring-2 focus:ring-rose-500 outline-none font-medium text-sm resize-none" />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="h-14 flex-1 rounded-[14px] font-black">Отмена</Button>
                        <Button type="submit" disabled={isLoading} className="h-14 flex-1 bg-rose-600 text-white rounded-[14px] font-black shadow-xl shadow-rose-100">{isLoading ? "Добавление..." : "Добавить"}</Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

function revalidateData() {
    // In a real app we might use router.refresh() or specialized hooks
}
