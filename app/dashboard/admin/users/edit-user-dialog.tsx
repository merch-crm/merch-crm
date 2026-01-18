"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Lock, Shield, Building, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { updateUser, getRoles, getDepartments } from "../actions";

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

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

                <div className="relative transform overflow-hidden rounded-lg bg-white p-8 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
                    <div className="absolute top-0 right-0 pt-6 pr-6">
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="mb-8 text-center">
                        <div className="h-14 w-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                            <User className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Редактирование профиля</h3>
                        <p className="text-slate-500 mt-1">Измените данные сотрудника {user.name}</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">ФИО сотрудника</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    defaultValue={user.name}
                                    placeholder="Иван Иванов"
                                    className="block w-full pl-10 rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2.5 border transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email (Логин)</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    defaultValue={user.email}
                                    placeholder="ivan@crm.local"
                                    className="block w-full pl-10 rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2.5 border transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Новый пароль (оставьте пустым, если не хотите менять)</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    className="block w-full pl-10 pr-10 rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2.5 border transition-all placeholder:text-slate-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Роль в системе</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        name="roleId"
                                        required
                                        value={selectedRoleId}
                                        onChange={(e) => handleRoleChange(e.target.value)}
                                        className="block w-full pl-10 pr-4 py-2.5 rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 border transition-all appearance-none outline-none"
                                    >
                                        <option value="" disabled>Выберите роль</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Отдел</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        name="departmentId"
                                        value={selectedDeptId}
                                        onChange={(e) => setSelectedDeptId(e.target.value)}
                                        className="block w-full pl-10 pr-4 py-2.5 rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 border transition-all appearance-none outline-none"
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

                        <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 text-sm font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 focus:outline-none focus:outline-none disabled:opacity-50 transition-all active:scale-[0.98]"
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
            </div>
        </div>
    );
}
