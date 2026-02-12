"use client";

import { useState, useEffect } from "react";
import { Plus, Building, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createDepartment, getRoles } from "../actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface Role {
    id: string;
    name: string;
    department?: {
        name: string;
    } | null;
}

interface AddDepartmentDialogProps {
    onSuccess: () => void;
}

const COLORS = [
    { name: "Синий", value: "indigo", bg: "bg-primary/5", text: "text-primary", border: "border-primary/20", ring: "ring-primary", badge: "bg-primary/10", badgeText: "text-primary" },
    { name: "Фиолетовый", value: "purple", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", ring: "ring-purple-500", badge: "bg-purple-100", badgeText: "text-purple-700" },
    { name: "Розовый", value: "rose", bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", ring: "ring-rose-500", badge: "bg-rose-100", badgeText: "text-rose-700" },
    { name: "Оранжевый", value: "orange", bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100", ring: "ring-orange-500", badge: "bg-orange-100", badgeText: "text-orange-700" },
    { name: "Янтарный", value: "amber", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", ring: "ring-amber-500", badge: "bg-amber-100", badgeText: "text-amber-700" },
    { name: "Зеленый", value: "emerald", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", ring: "ring-emerald-500", badge: "bg-emerald-100", badgeText: "text-emerald-700" },
    { name: "Голубой", value: "sky", bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-100", ring: "ring-sky-500", badge: "bg-sky-100", badgeText: "text-sky-700" },
    { name: "Серый", value: "slate", bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", ring: "ring-slate-500", badge: "bg-slate-100", badgeText: "text-slate-700" },
];

export function AddDepartmentDialog({ onSuccess }: AddDepartmentDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchingRoles, setFetchingRoles] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState("indigo");
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

    useEffect(() => {
        let mounted = true;
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFetchingRoles(true);
            getRoles().then(res => {
                if (mounted) {
                    if (res.data) {
                        setRoles(res.data as Role[]);
                    }
                    setFetchingRoles(false);
                }
            });
        }
        return () => { mounted = false; };
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

    const isMobile = useIsMobile();

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                size={isMobile ? "default" : "lg"}
                className={cn(
                    "rounded-full sm:rounded-[18px] shadow-xl shadow-primary/20 font-bold justify-center",
                    isMobile ? "w-11 h-11 p-0" : ""
                )}
                title="Добавить отдел"
            >
                <Plus className={cn("h-5 w-5", !isMobile && "mr-2")} />
                <span className="hidden sm:inline">Добавить отдел</span>
            </Button>

            <ResponsiveModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Новый отдел"
                description="Создайте новое подразделение компании"
                className="max-w-xl"
            >
                <div className="pb-2">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-bold rounded-[var(--radius-outer)] border border-red-100">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 ml-1">Название отдела</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                                <Input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="Например: Цех печати"
                                    className="block w-full pl-10 rounded-[var(--radius-inner)] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 transition-all placeholder:text-slate-300 h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 ml-1">Описание</label>
                            <Textarea
                                name="description"
                                rows={isMobile ? 3 : 2}
                                placeholder="Чем занимается этот отдел..."
                                className="block w-full rounded-[var(--radius-inner)] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 transition-all placeholder:text-slate-300 resize-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 ml-1">Цветовая метка</label>
                            <div className={`flex flex-wrap ${isMobile ? 'grid grid-cols-4' : ''} gap-2`}>
                                {COLORS.map((color) => (
                                    <Button
                                        key={color.value}
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setSelectedColor(color.value)}
                                        className={cn(
                                            "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center p-0 hover:scale-110",
                                            selectedColor === color.value ? `border-white ring-2 ring-offset-2 ${color.ring} shadow-lg scale-110` : 'border-transparent opacity-60 hover:opacity-100'
                                        )}
                                        style={{ backgroundColor: getColorHex(color.value) }}
                                        title={color.name}
                                    >
                                        <input type="radio" name="color" value={color.value} checked={selectedColor === color.value} className="hidden" readOnly />
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-slate-700 ml-1">Роли в этом отделе</label>
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                    Выбрано: {selectedRoleIds.length}
                                </span>
                            </div>
                            <div className={`${isMobile ? 'max-h-[300px]' : 'max-h-[160px]'} overflow-y-auto pr-2 custom-scrollbar border border-slate-200 rounded-[var(--radius-inner)] p-2 bg-slate-50/50`}>
                                {fetchingRoles ? (
                                    <div className="py-4 text-center text-slate-400 text-[11px] font-bold  animate-pulse">Загрузка ролей...</div>
                                ) : roles.length === 0 ? (
                                    <div className="py-4 text-center text-slate-400 text-xs">Нет созданных ролей</div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-1">
                                        {roles.map(role => {
                                            const isSelected = selectedRoleIds.includes(role.id);
                                            return (
                                                <Button
                                                    key={role.id}
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => toggleRole(role.id)}
                                                    className={cn(
                                                        "flex items-center justify-start gap-4 p-6 rounded-[var(--radius-inner)] transition-all text-left group h-auto border-none",
                                                        isSelected ? 'bg-white shadow-md border-primary/20 ring-4 ring-primary/5 hover:bg-white' : 'hover:bg-white/80 border-transparent hover:border-slate-200'
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-[18px] border flex items-center justify-center transition-all shrink-0",
                                                        isSelected ? 'bg-primary border-primary text-white shadow-lg shadow-primary/10' : 'bg-white border-slate-200 text-transparent group-hover:border-slate-300'
                                                    )}>
                                                        <Check className="w-4 h-4 stroke-[3px]" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn("text-sm font-bold truncate", isSelected ? 'text-primary' : 'text-slate-600')}>{role.name}</p>
                                                        {role.department?.name && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <Building className="w-3 h-3 text-slate-300" />
                                                                <p className="text-[10px] text-slate-400 font-bold tracking-normal">В отделе: {role.department.name}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-200">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-[var(--radius-inner)] font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                                {loading ? "Создание..." : "Создать отдел"}
                            </Button>
                        </div>
                    </form>
                </div>
            </ResponsiveModal>

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
        </>
    );
}

function getColorHex(color: string) {
    const map: Record<string, string> = {
        indigo: "#5d00ff",
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
