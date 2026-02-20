"use client";


import { Plus, User, Mail, Lock, Shield, Building, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { IconSelect } from "@/components/ui/icon-select";
import { IconInput } from "@/components/ui/icon-input";
import { cn } from "@/lib/utils";

import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useAddUser } from "./hooks/use-add-user";

export function AddUserDialog({ onSuccess }: { onSuccess?: () => void }) {
    const { state, updateState, handleRoleChange, handleSubmit } = useAddUser(onSuccess);


    const isMobile = useIsMobile();

    return (
        <>
            <Button
                onClick={() => updateState({ isOpen: true })}
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
                isOpen={state.isOpen}
                onClose={() => updateState({ isOpen: false })}
                title="Новый сотрудник"
                description="Создайте учетную запись для нового коллеги"
                className="items-start"
            >
                <div>
                    {state.error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-[var(--radius-outer)] border border-red-100">
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
                                placeholder="Иван Иванов"
                                className="crm-dialog-field"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 pl-1">Email (Логин)</label>
                            <IconInput
                                startIcon={Mail}
                                type="email"
                                name="email"
                                required
                                placeholder="ivan@crm.local"
                                className="crm-dialog-field"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 pl-1">Пароль</label>
                            <IconInput
                                startIcon={Lock}
                                type="password"
                                name="password"
                                required
                                placeholder="••••••••"
                                className="crm-dialog-field"
                            />
                        </div>

                        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
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

                        <div className="mt-6 pt-2 sticky bottom-0 bg-white border-t border-slate-100">
                            <Button
                                type="submit"
                                disabled={state.loading}
                                className="w-full justify-center rounded-[var(--radius-inner)] h-11 font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center gap-2"
                            >
                                {state.loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                {state.loading ? "Создание..." : "Создать сотрудника"}
                            </Button>
                        </div>
                    </form>
                </div>
            </ResponsiveModal>
        </>
    );
}
