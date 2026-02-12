"use client";

import { useState, useEffect } from "react";
import { Plus, User, Mail, Lock, Shield, Building, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumSelect } from "@/components/ui/premium-select";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createUser, getRoles, getDepartments } from "../actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

export function AddUserDialog({ onSuccess }: { onSuccess?: () => void }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<{ id: string, name: string, departmentId: string | null }[]>([]);
    const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [selectedDeptId, setSelectedDeptId] = useState("");

    useEffect(() => {
        if (isOpen) {
            getRoles().then(res => {
                if (res.data) setRoles(res.data);
            });
            getDepartments().then(res => {
                if (res.data) setDepartments(res.data);
            });
        }
    }, [isOpen]);

    const handleRoleChange = (roleId: string) => {
        setSelectedRoleId(roleId);
        const role = roles.find(r => r.id === roleId);
        if (role && role.departmentId) {
            setSelectedDeptId(role.departmentId);
        }
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const res = await createUser(formData);
        setLoading(false);
        if (res?.error) {
            setError(res.error);
        } else {
            setIsOpen(false);
            if (onSuccess) {
                onSuccess();
            } else {
                router.refresh();
            }
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
                title="Пригласить сотрудника"
            >
                <Plus className={cn("h-5 w-5", !isMobile && "mr-2")} />
                <span className="hidden sm:inline">Пригласить сотрудника</span>
            </Button>

            <ResponsiveModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Новый сотрудник"
                description="Создайте учетную запись для нового коллеги"
                className="items-start"
            >
                <div>
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-[var(--radius-outer)] border border-red-100">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-5 pb-5">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 pl-1">ФИО сотрудника</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                                <Input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="Иван Иванов"
                                    className="block w-full pl-10 rounded-[var(--radius-inner)] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 transition-all placeholder:text-slate-300 h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 pl-1">Email (Логин)</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                                <Input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="ivan@crm.local"
                                    className="block w-full pl-10 rounded-[var(--radius-inner)] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 transition-all placeholder:text-slate-300 h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 pl-1">Пароль</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                                <Input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="••••••••"
                                    className="block w-full pl-10 rounded-[var(--radius-inner)] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 transition-all placeholder:text-slate-300 h-11"
                                />
                            </div>
                        </div>

                        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 pl-1">Роль в системе</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                                    <PremiumSelect
                                        name="roleId"
                                        value={selectedRoleId}
                                        options={roles.map(role => ({ id: role.id, title: role.name }))}
                                        placeholder="Выбрать роль"
                                        className="pl-10 h-11"
                                        onChange={(val) => handleRoleChange(val)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 pl-1">Отдел</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                                    <PremiumSelect
                                        name="departmentId"
                                        value={selectedDeptId}
                                        options={[
                                            { id: "", title: "Все отделы" },
                                            ...departments.map(dept => ({ id: dept.id, title: dept.name }))
                                        ]}
                                        placeholder="Выбрать отдел"
                                        className="pl-10 h-11"
                                        onChange={(val) => setSelectedDeptId(val)}
                                    />
                                    <input type="hidden" name="department" value={departments.find(d => d.id === selectedDeptId)?.name || ""} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-2 sticky bottom-0 bg-white border-t border-slate-100">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full justify-center rounded-[var(--radius-inner)] h-11 font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                {loading ? "Создание..." : "Создать сотрудника"}
                            </Button>
                        </div>
                    </form>
                </div>
            </ResponsiveModal>
        </>
    );
}
