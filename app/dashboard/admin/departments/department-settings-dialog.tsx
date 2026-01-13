"use client";

import { useState, useEffect } from "react";
import { X, Building, Loader2, Shield, Trash2, Plus, Key, Save } from "lucide-react";
import { updateDepartment, getRolesByDepartment, getRoles, updateRoleDepartment } from "../actions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Role {
    id: string;
    name: string;
    isSystem: boolean;
    departmentId: string | null;
    department?: {
        name: string;
    } | null;
}

interface DepartmentSettingsDialogProps {
    department: { id: string; name: string; description: string | null; color: string | null } | null;
    isOpen: boolean;
    onClose: () => void;
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

export function DepartmentSettingsDialog({ department, isOpen, onClose, onSuccess }: DepartmentSettingsDialogProps) {
    const [activeTab, setActiveTab] = useState("general");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState(department?.color || "indigo");

    // Roles Tab State
    const [departmentRoles, setDepartmentRoles] = useState<Role[]>([]);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (department?.color) {
            setSelectedColor(department.color);
        }
    }, [department]);

    useEffect(() => {
        if (isOpen && department && activeTab === "roles") {
            fetchRoles();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, department, activeTab]);

    const fetchRoles = async () => {
        if (!department) return;
        setRolesLoading(true);
        try {
            const [deptRolesRes, allRolesRes] = await Promise.all([
                getRolesByDepartment(department.id),
                getRoles()
            ]);

            if (deptRolesRes.data) setDepartmentRoles(deptRolesRes.data as Role[]);
            if (allRolesRes.data) setAllRoles(allRolesRes.data as Role[]);
        } catch (err) {
            console.error("Error fetching roles:", err);
            setError("Ошибка при загрузке ролей");
        } finally {
            setRolesLoading(false);
        }
    };

    const handleAddRole = async (roleId: string) => {
        if (!department) return;
        setActionLoading(roleId);
        const res = await updateRoleDepartment(roleId, department.id);
        if (res.error) {
            setError(res.error);
        } else {
            fetchRoles();
            onSuccess(); // Update counts in table
        }
        setActionLoading(null);
    };

    const handleRemoveRole = async (roleId: string) => {
        setActionLoading(roleId);
        const res = await updateRoleDepartment(roleId, null);
        if (res.error) {
            setError(res.error);
        } else {
            fetchRoles();
            onSuccess(); // Update counts in table
        }
        setActionLoading(null);
    };

    async function handleGeneralSubmit(formData: FormData) {
        if (!department) return;
        setLoading(true);
        setError(null);

        const res = await updateDepartment(department.id, formData);
        setLoading(false);
        if (res?.error) {
            setError(res.error);
        } else {
            onSuccess();
            // Don't close, just show success? Or maybe close. 
            // User said "menu", let's keep it open or close on explicit "Save"
            onClose();
        }
    }

    if (!isOpen || !department) return null;

    const availableRoles = allRoles.filter(
        role => role.departmentId !== department.id
    );

    const colorStyle = COLORS.find(c => c.value === selectedColor) || COLORS[0];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

                <div className="relative transform overflow-hidden rounded-2xl bg-white p-0 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-slate-200">
                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 border-b border-slate-100 relative">
                        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-full">
                            <X className="h-6 w-6" />
                        </button>

                        <div className="flex items-center gap-5">
                            <div className={`h-16 w-16 rounded-2xl ${colorStyle.bg} ${colorStyle.text} flex items-center justify-center border ${colorStyle.border} shadow-sm shrink-0`}>
                                <Building className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{department.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded-md ${colorStyle.badge} ${colorStyle.badgeText} text-[10px] font-black uppercase tracking-widest`}>
                                        Настройки отдела
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="px-8 pt-6 pb-2">
                            <TabsList className="bg-[#f1f5f9] border-none rounded-full p-1 w-full sm:w-auto inline-flex h-auto shadow-none">
                                <TabsTrigger
                                    value="general"
                                    className="px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full transition-all data-[state=active]:bg-white data-[state=active]:text-[#4f46e5] data-[state=active]:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]"
                                >
                                    Основное
                                </TabsTrigger>
                                <TabsTrigger
                                    value="roles"
                                    className="px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full transition-all data-[state=active]:bg-white data-[state=active]:text-[#4f46e5] data-[state=active]:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]"
                                >
                                    Роли отдела
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="px-8 pb-8 pt-6 min-h-[400px]">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                    {error}
                                </div>
                            )}

                            <TabsContent value="general">
                                <form action={handleGeneralSubmit} className="space-y-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Название подразделения</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                name="name"
                                                defaultValue={department.name}
                                                required
                                                className="block w-full pl-10 rounded-xl border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-3 border transition-all font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Описание деятельности</label>
                                        <textarea
                                            name="description"
                                            defaultValue={department.description || ""}
                                            rows={3}
                                            placeholder="Опишите, чем занимается этот отдел..."
                                            className="block w-full rounded-xl border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-3 border transition-all resize-none leading-relaxed"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Визуальный идентификатор (Цвет)</label>
                                        <div className="flex flex-wrap gap-3">
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

                                    <div className="pt-6 border-t border-slate-50">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full inline-flex justify-center items-center gap-2 rounded-xl border border-transparent bg-indigo-600 py-4 px-4 text-sm font-black text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.98]"
                                        >
                                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                            {loading ? "СОХРАНЕНИЕ..." : <><Save className="w-5 h-5" /> СОХРАНИТЬ ИЗМЕНЕНИЯ</>}
                                        </button>
                                    </div>
                                </form>
                            </TabsContent>

                            <TabsContent value="roles">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                                    {/* Current Roles */}
                                    <div className="flex flex-col bg-slate-50/50 rounded-2xl border border-slate-100 p-5 h-[450px]">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 ${colorStyle.bg} ${colorStyle.text} rounded-lg`}>
                                                    <Shield className="w-4 h-4" />
                                                </div>
                                                <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Текущие роли</h4>
                                            </div>
                                            <span className={`${colorStyle.bg} ${colorStyle.text} text-[10px] font-black px-2.5 py-1 rounded-full border ${colorStyle.border}`}>
                                                {departmentRoles.length}
                                            </span>
                                        </div>
                                        <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar flex-1">
                                            {rolesLoading ? (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                                                    <Loader2 className="w-8 h-8 animate-spin" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Загрузка...</span>
                                                </div>
                                            ) : departmentRoles.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center text-center">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-3">
                                                        <Shield className="w-6 h-6 text-slate-200" />
                                                    </div>
                                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Роли еще не назначены</p>
                                                </div>
                                            ) : (
                                                departmentRoles.map(role => (
                                                    <div key={role.id} className="flex items-center justify-between p-4 bg-white border border-slate-200/60 rounded-xl group hover:border-indigo-400 hover:shadow-md transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 flex-shrink-0 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors flex items-center justify-center">
                                                                <Key className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                                                            </div>
                                                            <div>
                                                                <span className="text-sm font-black text-slate-700 block leading-tight">{role.name}</span>
                                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Активная роль</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveRole(role.id)}
                                                            disabled={!!actionLoading}
                                                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Удалить из отдела"
                                                        >
                                                            {actionLoading === role.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Available Roles */}
                                    <div className="flex flex-col border border-slate-200 rounded-2xl p-5 h-[450px]">
                                        <div className="flex items-center gap-2 mb-5">
                                            <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                            <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Доступные роли</h4>
                                        </div>
                                        <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar flex-1">
                                            {rolesLoading ? (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                                                    <Loader2 className="w-8 h-8 animate-spin" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Загрузка...</span>
                                                </div>
                                            ) : availableRoles.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center text-center">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-3">
                                                        <Plus className="w-6 h-6 text-slate-200" />
                                                    </div>
                                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Все роли распределены</p>
                                                </div>
                                            ) : (
                                                availableRoles.map(role => (
                                                    <div key={role.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl group hover:border-indigo-300 hover:bg-white transition-all">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-sm font-black text-slate-700">{role.name}</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <Building className="w-3 h-3 text-slate-300" />
                                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                                                    {role.department ? role.department.name : "Без отдела"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleAddRole(role.id)}
                                                            disabled={!!actionLoading}
                                                            className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 border border-slate-200 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/10 active:scale-90"
                                                            title="Добавить в отдел"
                                                        >
                                                            {actionLoading === role.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Plus className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
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
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
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
