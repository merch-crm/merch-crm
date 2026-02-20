"use client";


import { User, Mail, Lock, Shield, Building, Save, Loader2, Eye, EyeOff } from "lucide-react";

import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";

import { IconSelect } from "@/components/ui/icon-select";
import { IconInput } from "@/components/ui/icon-input";
import { useEditUser } from "./hooks/use-edit-user";

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
    const { state, updateState, handleRoleChange, handleSubmit } = useEditUser(user, isOpen, onClose, onSuccess);

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
                {state.error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-[18px] border border-red-100">
                        {state.error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 pb-5">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700 pl-1">ФИО сотрудника</label>
                        <IconInput
                            startIcon={User}
                            type="text"
                            name="name"
                            required
                            defaultValue={user.name}
                            placeholder="Иван Иванов"
                            className="block w-full rounded-[18px] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 transition-all placeholder:text-slate-300 h-11"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700 pl-1">Email (Логин)</label>
                        <IconInput
                            startIcon={Mail}
                            type="email"
                            name="email"
                            required
                            defaultValue={user.email}
                            placeholder="ivan@crm.local"
                            className="block w-full rounded-[18px] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 transition-all placeholder:text-slate-300 h-11"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700 pl-1">Новый пароль (оставьте пустым, если не хотите менять)</label>
                        <div className="relative">
                            <IconInput
                                startIcon={Lock}
                                type={state.showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                className="block w-full pr-10 rounded-[18px] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 transition-all placeholder:text-slate-300 h-11"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => updateState({ showPassword: !state.showPassword })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-primary transition-colors h-auto w-auto hover:bg-transparent"
                            >
                                {state.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 pl-1">Роль в системе</label>
                            <IconSelect
                                startIcon={Shield}
                                name="roleId"
                                value={state.selectedRoleId}
                                options={state.roles.map(role => ({ id: role.id, title: role.name }))}
                                placeholder="Выбрать роль"
                                className="h-11"
                                onChange={(val) => handleRoleChange(val)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 pl-1">Отдел</label>
                            <IconSelect
                                startIcon={Building}
                                name="departmentId"
                                value={state.selectedDeptId}
                                options={[
                                    { id: "", title: "Все отделы" },
                                    ...state.departments.map(dept => ({ id: dept.id, title: dept.name }))
                                ]}
                                placeholder="Выбрать отдел"
                                className="h-11"
                                onChange={(val) => updateState({ selectedDeptId: val })}
                            />
                            <input type="hidden" name="department" value={state.departments.find(d => d.id === state.selectedDeptId)?.name || ""} />
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3 sticky bottom-0 bg-white pt-2 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 px-4 h-11 text-sm font-bold text-slate-700 bg-slate-100 rounded-[18px] hover:bg-slate-200 transition-all active:scale-[0.98]"
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            disabled={state.loading}
                            className="flex-[2] inline-flex items-center justify-center gap-2 rounded-[var(--radius-inner)] h-11 px-4 font-bold text-white shadow-lg transition-all active:scale-[0.98]"
                        >
                            {state.loading ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-1" />
                            ) : (
                                <Save className="w-5 h-5 mr-1" />
                            )}
                            {state.loading ? "Сохранение..." : "Сохранить изменения"}
                        </Button>
                    </div>
                </form>
            </div>
        </ResponsiveModal>
    );
}
