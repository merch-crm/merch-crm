"use client";

import { useEffect, useState } from "react";
import { X, Building, Loader2, Palette } from "lucide-react";
import { updateDepartment } from "../actions";

interface EditDepartmentDialogProps {
    department: { id: string; name: string; description: string | null; color: string | null } | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditDepartmentDialog({ department, isOpen, onClose, onSuccess }: EditDepartmentDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const colors = ["indigo", "rose", "emerald", "amber", "purple", "blue", "slate"];

    async function handleSubmit(formData: FormData) {
        if (!department) return;
        setLoading(true);
        setError(null);

        const res = await updateDepartment(department.id, formData);
        setLoading(false);
        if (res?.error) {
            setError(res.error);
        } else {
            onSuccess();
            onClose();
        }
    }

    if (!isOpen || !department) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

                <div className="relative transform overflow-hidden rounded-xl bg-white p-8 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
                    <div className="absolute top-0 right-0 pt-6 pr-6">
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="mb-8 text-center border-b border-slate-100 pb-6">
                        <div className="h-14 w-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-inner">
                            <Building className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Редактировать отдел</h3>
                        <p className="text-slate-500 mt-1">Измените информацию о подразделении</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Название отдела</label>
                            <input
                                type="text"
                                name="name"
                                defaultValue={department.name}
                                required
                                className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 border transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Описание</label>
                            <textarea
                                name="description"
                                defaultValue={department.description || ""}
                                rows={3}
                                className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5 border transition-all resize-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Цветовая метка</label>
                            <div className="flex flex-wrap gap-2">
                                {colors.map((c) => (
                                    <label key={c} className="cursor-pointer">
                                        <input
                                            type="radio"
                                            name="color"
                                            value={c}
                                            defaultChecked={department.color === c}
                                            className="sr-only peer"
                                        />
                                        <div className={`
                                            w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center
                                            ${c === "indigo" ? "bg-indigo-500 border-indigo-200" : ""}
                                            ${c === "rose" ? "bg-rose-500 border-rose-200" : ""}
                                            ${c === "emerald" ? "bg-emerald-500 border-emerald-200" : ""}
                                            ${c === "amber" ? "bg-amber-500 border-amber-200" : ""}
                                            ${c === "purple" ? "bg-purple-500 border-purple-200" : ""}
                                            ${c === "blue" ? "bg-blue-500 border-blue-200" : ""}
                                            ${c === "slate" ? "bg-slate-500 border-slate-200" : ""}
                                            peer-checked:scale-125 peer-checked:shadow-lg peer-checked:border-white
                                        `} />
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 inline-flex justify-center items-center rounded-lg border border-slate-200 bg-white py-3 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] inline-flex justify-center items-center gap-2 rounded-lg border border-transparent bg-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                {loading ? "Сохранение..." : "Сохранить изменения"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
