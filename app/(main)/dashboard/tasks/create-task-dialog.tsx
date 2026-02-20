"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Type,
    AlignLeft,
    User as UserIcon,
    Users,
    Calendar,
    Loader2,
    PlusCircle
} from "lucide-react";
import { createTask } from "./actions";
import { playSound } from "@/lib/sounds";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Select } from "@/components/ui/select";
import { IconInput } from "@/components/ui/icon-input";
import { SegmentedControl } from "@/components/ui/segmented-control";

import { User, Order } from "@/lib/types";

interface Department {
    id: string;
    name: string;
    color?: string | null;
}

interface CreateTaskDialogProps {
    users: User[];
    departments: Department[];
    orders: Order[];
}

export function CreateTaskDialog({ users, departments, orders }: CreateTaskDialogProps) {
    const [uiState, setUiState] = useState({
        isOpen: false,
        loading: false,
        error: null as string | null,
        assignmentType: "user" as "user" | "department"
    });

    const [formState, setFormState] = useState({
        taskType: "other",
        priority: "normal",
        orderId: "",
        assigneeUserId: "",
        assigneeDepartmentId: ""
    });

    const [, startTransition] = useTransition();
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setUiState(prev => ({ ...prev, loading: true, error: null }));

        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await createTask(formData);

            if (!res.success) {
                setUiState(prev => ({
                    ...prev,
                    error: res.error || "Не удалось создать задачу",
                    loading: false
                }));
                playSound("notification_error");
            } else {
                playSound("task_created");
                setUiState(prev => ({ ...prev, isOpen: false, loading: false }));
                // Reset form state optionally, but dialog close usually sufficient
                setFormState({
                    taskType: "other",
                    priority: "normal",
                    orderId: "",
                    assigneeUserId: "",
                    assigneeDepartmentId: ""
                });
                router.refresh();
            }
        });
    }

    const toggleAssignmentType = (type: "user" | "department") => {
        setUiState(prev => ({ ...prev, assignmentType: type }));
    };

    return (
        <>
            <button type="button"
                onClick={() => setUiState(prev => ({ ...prev, isOpen: true }))}
                className="w-11 h-11 sm:w-auto sm:px-6 sm:py-2.5 bg-primary text-white rounded-full sm:rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center shrink-0"
                title="Создать задачу"
            >
                <PlusCircle className="w-5 h-5" />
                <span className="hidden sm:inline ml-2">Создать задачу</span>
            </button>

            <ResponsiveModal
                isOpen={uiState.isOpen}
                onClose={() => setUiState(prev => ({ ...prev, isOpen: false }))}
                title="Новая задача"
                description="Заполните детали поручения"
            >
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Title */}
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700 pl-1">Что нужно сделать?</label>
                        <IconInput
                            name="title"
                            type="text"
                            required
                            startIcon={Type}
                            placeholder="Например: Закупить материалы для склада"
                            className="block w-full py-3 h-auto rounded-2xl border-slate-200 bg-slate-50/50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 border transition-all outline-none font-medium"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700 pl-1">Описание (необязательно)</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-3 top-4 w-4 h-4 text-slate-400" />
                            <textarea
                                name="description"
                                rows={3}
                                placeholder="Добавьте подробности или инструкции..."
                                className="block w-full pl-10 pr-4 py-3 rounded-2xl border-slate-200 bg-slate-50/50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 border transition-all outline-none font-medium resize-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Task Type */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 pl-1">Тип задачи</label>
                            <Select
                                name="type"
                                value={formState.taskType}
                                onChange={(val) => setFormState(prev => ({ ...prev, taskType: val }))}
                                placeholder="Выберите тип"
                                options={[
                                    { id: "design", title: "Дизайн" },
                                    { id: "production", title: "Производство" },
                                    { id: "acquisition", title: "Закупка" },
                                    { id: "delivery", title: "Доставка" },
                                    { id: "other", title: "Прочее" },
                                ]}
                                compact
                            />
                        </div>

                        {/* Priority */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 pl-1">Приоритет</label>
                            <Select
                                name="priority"
                                value={formState.priority}
                                onChange={(val) => setFormState(prev => ({ ...prev, priority: val }))}
                                placeholder="Выберите приоритет"
                                options={[
                                    { id: "low", title: "Низкий" },
                                    { id: "normal", title: "Обычный" },
                                    { id: "high", title: "Высокий" },
                                ]}
                                compact
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Related Order */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 pl-1">Связанный заказ</label>
                            <Select
                                name="orderId"
                                value={formState.orderId}
                                onChange={(val) => setFormState(prev => ({ ...prev, orderId: val }))}
                                placeholder="Без привязки"
                                options={[
                                    { id: "", title: "Без привязки" },
                                    ...(orders || []).map(o => ({
                                        id: o.id,
                                        title: `№${o.orderNumber}${o.client?.name ? ` - ${o.client.name}` : ""}`,
                                    })),
                                ]}
                                compact
                            />
                        </div>

                        {/* Due Date */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 pl-1">Срок выполнения</label>
                            <IconInput
                                name="dueDate"
                                type="date"
                                startIcon={Calendar}
                                className="block w-full py-3 h-auto rounded-2xl border-slate-200 bg-slate-50/50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 border transition-all outline-none font-bold"
                            />
                        </div>
                    </div>

                    {/* Assignment */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 pl-1">Кому назначить?</label>

                        {/* Toggle Buttons */}
                        <SegmentedControl
                            options={[
                                { value: "user", label: "Пользователю", icon: UserIcon },
                                { value: "department", label: "Отделу", icon: Users },
                            ]}
                            value={uiState.assignmentType}
                            onChange={(val) => toggleAssignmentType(val as "user" | "department")}
                        />

                        {/* Conditional Select */}
                        {uiState.assignmentType === "user" ? (
                            <Select
                                name="assignedToUserId"
                                value={formState.assigneeUserId}
                                onChange={(val) => setFormState(prev => ({ ...prev, assigneeUserId: val }))}
                                placeholder="Выберите сотрудника"
                                options={[
                                    { id: "", title: "Выберите сотрудника" },
                                    ...(users || []).map(u => ({
                                        id: u.id,
                                        title: u.name,
                                    })),
                                ]}
                                compact
                            />
                        ) : (
                            <Select
                                name="assignedToDepartmentId"
                                value={formState.assigneeDepartmentId}
                                onChange={(val) => setFormState(prev => ({ ...prev, assigneeDepartmentId: val }))}
                                placeholder="Выберите отдел"
                                options={[
                                    { id: "", title: "Выберите отдел" },
                                    ...(departments || []).map(d => ({
                                        id: d.id,
                                        title: d.name,
                                    })),
                                ]}
                                compact
                            />
                        )}
                    </div>

                    {uiState.error && (
                        <p className="text-sm font-bold text-rose-500 animate-in shake-in-1 duration-200">{uiState.error}</p>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={uiState.loading}
                            className="w-full py-4 btn-dark text-white rounded-[var(--radius-inner)] font-bold shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 border-none"
                        >
                            {uiState.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                            {uiState.loading ? "СОЗДАНИЕ..." : "СОЗДАТЬ ЗАДАЧУ"}
                        </button>
                    </div>
                </form>
            </ResponsiveModal>
        </>
    );
}
