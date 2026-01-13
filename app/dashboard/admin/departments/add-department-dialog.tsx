"use client";

import { useState, useEffect } from "react";
import { Plus, X, Building, Loader2, Palette, Shield, Check } from "lucide-react";
import { createDepartment, getRoles } from "../actions";

interface AddDepartmentDialogProps {
    onSuccess: () => void;
}

const COLORS = [
    { name: "Синий", value: "indigo", bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100", ring: "ring-indigo-500", badge: "bg-indigo-100", badgeText: "text-indigo-700" },
    { name: "Фиолетовый", value: "purple", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", ring: "ring-purple-500", badge: "bg-purple-100", badgeText: "text-purple-700" },
    { name: "Розовый", value: "rose", bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", ring: "ring-rose-500", badge: "bg-rose-100", badgeText: "text-rose-700" },
    { name: "Оранжевый", value: "orange", bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100", ring: "ring-orange-500", badge: "bg-orange-100", badgeText: "text-orange-700" },
    { name: "Янтарный", value: "amber", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", ring: "ring-amber-500", badge: "bg-amber-100", badgeText: "text-amber-700" },
    { name: "Зеленый", value: "emerald", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", ring: "ring-emerald-500", badge: "bg-emerald-100", badgeText: "text-emerald-700" },
    { name: "Голубой", value: "sky", bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-100", ring: "ring-sky-500", badge: "bg-sky-100", badgeText: "text-sky-700" },
    { name: "Серый", value: "slate", bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100", ring: "ring-slate-500", badge: "bg-slate-100", badgeText: "text-slate-700" },
];

export function AddDepartmentDialog({ onSuccess }: AddDepartmentDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchingRoles, setFetchingRoles] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState("indigo");
    const [roles, setRoles] = useState<any[]>([]);
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setFetchingRoles(true);
            getRoles().then(res => {
                if (res.data) {
                    // Only roles without a department or from other departments (user can move them)
                    setRoles(res.data);
                }
                setFetchingRoles(false);
            });
        }
    }, [isOpen]);

    const toggleRole = (roleId: string) => {
        setSelectedRoleIds(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        );
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const res = await createDepartment(formData, selectedRoleIds);
        setLoading(false);
        if (res?.error) {
            setError(res.error);
        } else {
            setIsOpen(false);
            setSelectedRoleIds([]);
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

    const colorStyle = COLORS.find(c => c.value === selectedColor) || COLORS[0];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />

                <div className="relative transform overflow-hidden rounded-2xl bg-white p-8 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl border border-slate-200">
                    <div className="absolute top-0 right-0 pt-6 pr-6">
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-full">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="mb-8 text-center">
                        <div className={`h-16 w-16 rounded-2xl ${colorStyle.bg} ${colorStyle.text} flex items-center justify-center mx-auto mb-4 border ${colorStyle.border} shadow-sm`}>
                            <Building className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Новый отдел</h3>
                        <p className="text-slate-500 mt-1 font-medium">Создайте новое подразделение компании</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-6">
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

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Цветовая метка</label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setSelectedColor(color.value)}
                                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === color.value ? `border-white ring-2 ring-offset-2 ${color.ring} shadow-lg scale-110` : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'}`}
                                        style={{ backgroundColor: getColorHex(color.value) }}
                                        title={color.name}
                                    >
                                        <input type="radio" name="color" value={color.value} checked={selectedColor === color.value} className="hidden" readOnly />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Роли в этом отделе</label>
                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                                    Выбрано: {selectedRoleIds.length}
                                </span>
                            </div>
                            <div className="max-h-[160px] overflow-y-auto pr-2 custom-scrollbar border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                                {fetchingRoles ? (
                                    <div className="py-4 text-center text-slate-400 text-[11px] font-bold uppercase animate-pulse">Загрузка ролей...</div>
                                ) : roles.length === 0 ? (
                                    <div className="py-4 text-center text-slate-400 text-xs italic">Нет созданных ролей</div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-1">
                                        {roles.map(role => {
                                            const isSelected = selectedRoleIds.includes(role.id);
                                            return (
                                                <button
                                                    key={role.id}
                                                    type="button"
                                                    onClick={() => toggleRole(role.id)}
                                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${isSelected ? 'bg-white shadow-md border-indigo-200 ring-4 ring-indigo-500/5' : 'hover:bg-white/80 border-transparent hover:border-slate-200'}`}
                                                >
                                                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-200 text-transparent group-hover:border-slate-300'}`}>
                                                        <Check className="w-4 h-4 stroke-[3px]" />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-black ${isSelected ? 'text-indigo-600' : 'text-slate-600'}`}>{role.name}</p>
                                                        {role.department?.name && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <Building className="w-3 h-3 text-slate-300" />
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">В отделе: {role.department.name}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex justify-center items-center gap-2 rounded-lg border border-transparent bg-indigo-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all active:scale-[0.98]"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                {loading ? "Создание..." : "Создать отдел"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}

function getColorHex(color: string) {
    const map: Record<string, string> = {
        indigo: "#6366f1",
        purple: "#a855f7",
        rose: "#f43f5e",
        orange: "#f97316",
        amber: "#f59e0b",
        emerald: "#10b981",
        sky: "#0ea5e9",
        slate: "#64748b"
    };
    return map[color] || map.indigo;
}
