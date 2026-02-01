"use client";

import { useState, useEffect } from "react";
import { Plus, X, User, Mail, Lock, Shield, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createUser, getRoles, getDepartments } from "../actions";

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

    useEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalStyle;
            };
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

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                size="lg"
                className="rounded-[var(--radius-outer)] shadow-xl shadow-primary/20 font-bold"
            >
                <Plus className="mr-2 h-5 w-5" />
                Пригласить сотрудника
            </Button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" data-dialog-open="true">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />

                <div className="relative transform overflow-hidden rounded-[var(--radius-outer)] bg-white p-6 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="mb-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10 shadow-sm">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 leading-tight">Новый сотрудник</h3>
                            <p className="text-[11px] font-bold text-slate-500 mt-0.5">Создайте учетную запись для нового коллеги</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-[var(--radius-outer)] border border-red-100">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-500 pl-1">ФИО сотрудника</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="Иван Иванов"
                                    className="block w-full pl-10 rounded-[var(--radius-inner)] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 border transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-500 pl-1">Email (Логин)</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="ivan@crm.local"
                                    className="block w-full pl-10 rounded-[var(--radius-inner)] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 border transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-500 pl-1">Пароль</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="••••••••"
                                    className="block w-full pl-10 rounded-[var(--radius-inner)] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 border transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-500 pl-1">Роль в системе</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        name="roleId"
                                        required
                                        value={selectedRoleId}
                                        onChange={(e) => handleRoleChange(e.target.value)}
                                        className="block w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-inner)] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 border transition-all appearance-none outline-none"
                                    >
                                        <option value="" disabled>Выберите роль</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-500 pl-1">Отдел</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        name="departmentId"
                                        value={selectedDeptId}
                                        onChange={(e) => setSelectedDeptId(e.target.value)}
                                        className="block w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-inner)] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 border transition-all appearance-none outline-none"
                                    >
                                        <option value="">Выберите отдел</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                    <input type="hidden" name="department" value={departments.find(d => d.id === selectedDeptId)?.name || ""} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex justify-center rounded-[var(--radius-inner)] border border-transparent bg-primary h-11 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90 focus:outline-none focus:outline-none disabled:opacity-50 transition-all active:scale-[0.98] items-center"
                            >
                                {loading ? "Создание..." : "Создать сотрудника"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
