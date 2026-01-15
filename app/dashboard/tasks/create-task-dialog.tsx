"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    X,
    Type,
    AlignLeft,
    User,
    Users,
    Calendar,
    Flag,
    Loader2,
    PlusCircle
} from "lucide-react";
import { createTask } from "./actions";

interface User {
    id: string;
    name: string;
}

interface Department {
    id: string;
    name: string;
    color?: string | null;
}

interface CreateTaskDialogProps {
    users: User[];
    departments: Department[];
}

export function CreateTaskDialog({ users, departments }: CreateTaskDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [assignmentType, setAssignmentType] = useState<"user" | "department">("user");
    const [, startTransition] = useTransition();
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        startTransition(async () => {
            const res = await createTask(formData);

            if (res.error) {
                setError(res.error);
                setLoading(false);
            } else {
                setIsOpen(false);
                setLoading(false);
                router.refresh();
            }
        });
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                <PlusCircle className="w-5 h-5" />
                Создать задачу
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setIsOpen(false)}
            />

            <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 border border-slate-100">
                {/* Header */}
                <div className="px-8 pt-8 pb-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Новая задача</h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Заполните детали поручения</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                    >
                        <X className="w-6 h-6 text-slate-300 group-hover:text-slate-600" />
                    </button>
                </div>

                <form action={handleSubmit} className="p-8 pt-0 space-y-6">
                    {/* Title */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Что нужно сделать?</label>
                        <div className="relative">
                            <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                name="title"
                                type="text"
                                required
                                placeholder="Например: Закупить материалы для склада"
                                className="block w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 border transition-all outline-none font-medium"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Описание (необязательно)</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-3 top-4 w-4 h-4 text-slate-400" />
                            <textarea
                                name="description"
                                rows={3}
                                placeholder="Добавьте подробности или инструкции..."
                                className="block w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 border transition-all outline-none font-medium resize-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Priority */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Приоритет</label>
                            <div className="relative">
                                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    name="priority"
                                    defaultValue="normal"
                                    className="block w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 border transition-all appearance-none outline-none font-bold"
                                >
                                    <option value="low">Низкий</option>
                                    <option value="normal">Обычный</option>
                                    <option value="high">Высокий</option>
                                </select>
                            </div>
                        </div>

                        {/* Due Date */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Срок выполнения</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    name="dueDate"
                                    type="date"
                                    className="block w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 border transition-all outline-none font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Assignment */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Кому назначить?</label>

                        {/* Toggle Buttons */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setAssignmentType("user")}
                                className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${assignmentType === "user"
                                        ? "bg-white text-indigo-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <User className="w-4 h-4" />
                                Пользователю
                            </button>
                            <button
                                type="button"
                                onClick={() => setAssignmentType("department")}
                                className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${assignmentType === "department"
                                        ? "bg-white text-indigo-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <Users className="w-4 h-4" />
                                Отделу
                            </button>
                        </div>

                        {/* Conditional Select */}
                        {assignmentType === "user" ? (
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    name="assignedToUserId"
                                    className="block w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 border transition-all appearance-none outline-none font-medium"
                                >
                                    <option value="">Выберите сотрудника</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    name="assignedToDepartmentId"
                                    className="block w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 border transition-all appearance-none outline-none font-medium"
                                >
                                    <option value="">Выберите отдел</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {error && (
                        <p className="text-sm font-bold text-rose-500 animate-in shake-in-1 duration-200">{error}</p>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                            {loading ? "СОЗДАНИЕ..." : "СОЗДАТЬ ЗАДАЧУ"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
