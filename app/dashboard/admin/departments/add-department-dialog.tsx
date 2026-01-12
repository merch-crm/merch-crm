"use client";

import { useState } from "react";
import { Plus, X, Building, Loader2, Palette } from "lucide-react";
import { createDepartment } from "../actions";

interface AddDepartmentDialogProps {
    onSuccess: () => void;
}

const COLORS = [
    { name: "Синий", value: "indigo" },
    { name: "Фиолетовый", value: "purple" },
    { name: "Розовый", value: "rose" },
    { name: "Оранжевый", value: "orange" },
    { name: "Янтарный", value: "amber" },
    { name: "Зеленый", value: "emerald" },
    { name: "Голубой", value: "sky" },
    { name: "Серый", value: "slate" },
];

export function AddDepartmentDialog({ onSuccess }: AddDepartmentDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState("indigo");

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const res = await createDepartment(formData);
        setLoading(false);
        if (res?.error) {
            setError(res.error);
        } else {
            setIsOpen(false);
            onSuccess();
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
            >
                <Plus className="mr-2 h-5 w-5" />
                Добавить отдел
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />

                <div className="relative transform overflow-hidden rounded-lg bg-white p-8 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
                    <div className="absolute top-0 right-0 pt-6 pr-6">
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="mb-8 text-center">
                        <div className={`h-14 w-14 rounded-full bg-${selectedColor}-50 text-${selectedColor}-600 flex items-center justify-center mx-auto mb-4`}>
                            <Building className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Новый отдел</h3>
                        <p className="text-slate-500 mt-1">Создайте новое подразделение компании</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Название отдела</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="Например: Цех печати"
                                    className="block w-full pl-10 rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 border transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Описание</label>
                            <textarea
                                name="description"
                                rows={2}
                                placeholder="Чем занимается этот отдел..."
                                className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 border transition-all placeholder:text-slate-300 resize-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Цветовая метка</label>
                            <div className="grid grid-cols-4 gap-2 pt-1">
                                {COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setSelectedColor(color.value)}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${selectedColor === color.value ? `border-${color.value}-500 bg-${color.value}-50` : 'border-transparent hover:bg-slate-50'}`}
                                    >
                                        <input type="radio" name="color" value={color.value} checked={selectedColor === color.value} className="hidden" readOnly />
                                        <div className={`w-4 h-4 rounded-full bg-${color.value}-500 shadow-sm`} />
                                        <span className="text-[10px] font-bold text-slate-600">{color.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex justify-center items-center gap-2 rounded-lg border border-transparent bg-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all active:scale-[0.98]"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                {loading ? "Создание..." : "Создать отдел"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
