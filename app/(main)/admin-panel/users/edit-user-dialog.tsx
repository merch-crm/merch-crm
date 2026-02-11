"use client";

import { useState, useEffect } from "react";
import { User, Mail, Lock, Shield, Building, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { updateUser, getRoles, getDepartments } from "../actions";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface EditUserDialogProps {
    user: {
        id: string;
        name: string;
        email: string;
        roleId: string | null;
        departmentId: string | null;
    } | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditUserDialog({ user, isOpen, onClose, onSuccess }: EditUserDialogProps) {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<{ id: string, name: string, departmentId: string | null }[]>([]);
    const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState(user?.roleId || "");
    const [selectedDeptId, setSelectedDeptId] = useState(user?.departmentId || "");

    useEffect(() => {
        if (isOpen && user) {
            getRoles().then(res => {
                if (res.data) setRoles(res.data as { id: string, name: string, departmentId: string | null }[]);
            });
            getDepartments().then(res => {
                if (res.data) setDepartments(res.data as { id: string, name: string }[]);
            });
        }
    }, [isOpen, user]);

    useEffect(() => {
        if (user) {
            setSelectedRoleId(user.roleId || "");
            setSelectedDeptId(user.departmentId || "");
        }
    }, [user]);

    const handleRoleChange = (roleId: string) => {
        setSelectedRoleId(roleId);
        const role = roles.find(r => r.id === roleId);
        if (role && role.departmentId) {
            setSelectedDeptId(role.departmentId);
        }
    };

    async function handleSubmit(formData: FormData) {
        if (!user) return;
        setLoading(true);
        setError(null);
        const res = await updateUser(user.id, formData);
        setLoading(false);
        if (res?.error) {
            setError(res.error);
        } else {
            onSuccess();
        }
    }

    if (!user) return null;

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title="Редактирование"
            description={`Измените данные сотрудника ${user.name}`}
            className="items-start"
        >
            <div>
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-[18px] border border-red-100">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-5 pb-5">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700 pl-1">ФИО сотрудника</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                name="name"
                                required
                                defaultValue={user.name}
                                placeholder="Иван Иванов"
                                className="block w-full pl-10 rounded-[18px] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 border transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700 pl-1">Email (Логин)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                name="email"
                                required
                                defaultValue={user.email}
                                placeholder="ivan@crm.local"
                                className="block w-full pl-10 rounded-[18px] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 border transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700 pl-1">Новый пароль (оставьте пустым, если не хотите менять)</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                className="block w-full pl-10 pr-10 rounded-[18px] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 border transition-all placeholder:text-slate-300"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 pl-1">Роль в системе</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    name="roleId"
                                    required
                                    value={selectedRoleId}
                                    onChange={(e) => handleRoleChange(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-2.5 rounded-[18px] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 border transition-all appearance-none outline-none"
                                >
                                    <option value="" disabled>Выберите роль</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 pl-1">Отдел</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    name="departmentId"
                                    value={selectedDeptId}
                                    onChange={(e) => setSelectedDeptId(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-2.5 rounded-[18px] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 border transition-all appearance-none outline-none"
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

                    <div className="mt-6 flex gap-3 sticky bottom-0 bg-white pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 h-11 text-sm font-bold text-slate-700 bg-slate-100 rounded-[18px] hover:bg-slate-200 transition-all active:scale-[0.98]"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] inline-flex items-center justify-center gap-2 rounded-[var(--radius-inner)] border border-transparent btn-dark h-11 px-4 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {loading ? "Сохранение..." : "Сохранить изменения"}
                        </button>
                    </div>
                </form>
            </div>
        </ResponsiveModal>
    );
}
