"use client";

import { useState, useEffect } from "react";
import { Building, Loader2, Shield, Trash2, Plus, Key, Save } from "lucide-react";
import { useDepartmentSettings } from "./hooks/use-department-settings";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DEPARTMENT_COLORS, getDepartmentColorHex } from "@/lib/constants";
import { IconInput } from "@/components/ui/icon-input";

interface DepartmentSettingsDialogProps {
    department: { id: string; name: string; description: string | null; color: string | null } | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}



export function DepartmentSettingsDialog({ department, isOpen, onClose, onSuccess }: DepartmentSettingsDialogProps) {
    const { state, updateState, handleAddRole, handleRemoveRole, handleGeneralSubmit } = useDepartmentSettings(department, isOpen, onClose, onSuccess);

    if (!department) return null;

    const availableRoles = state.allRoles.filter(
        role => role.departmentId !== department.id
    );

    const colorStyle = DEPARTMENT_COLORS.find(c => c.value === state.selectedColor) || DEPARTMENT_COLORS[0];

    const FormContent = (
        <div className="space-y-4">
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700 ml-1">Название подразделения</label>
                    <IconInput
                        startIcon={Building}
                        type="text"
                        name="name"
                        defaultValue={department.name}
                        required
                        className="block w-full rounded-xl border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-3 transition-all font-bold h-12"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700 ml-1">Описание деятельности</label>
                    <Textarea
                        name="description"
                        defaultValue={department.description || ""}
                        rows={3}
                        placeholder="Опишите, чем занимается этот отдел..."
                        className="block w-full rounded-xl border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-3 transition-all resize-none leading-relaxed"
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 ml-1">Визуальный идентификатор (Цвет)</label>
                    <div className="flex flex-wrap gap-3">
                        {DEPARTMENT_COLORS.map((color) => (
                            <Button
                                key={color.value}
                                type="button"
                                variant="ghost"
                                onClick={() => updateState({ selectedColor: color.value })}
                                className={cn(
                                    "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center p-0 hover:scale-110",
                                    state.selectedColor === color.value ? `border-white ring-2 ring-offset-2 ${color.ring} shadow-lg scale-110` : 'border-transparent opacity-60 hover:opacity-100'
                                )}
                                style={{ backgroundColor: getDepartmentColorHex(color.value) }}
                                title={color.name}
                            >
                                <input type="radio" name="color" value={color.value} checked={state.selectedColor === color.value} className="hidden" readOnly />
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
                <Button
                    type="submit"
                    disabled={state.loading}
                    className="w-full h-12 rounded-xl font-bold text-white shadow-xl transition-all active:scale-[0.98]"
                >
                    {state.loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                    {state.loading ? "Сохранение..." : <><Save className="w-5 h-5 mr-2" /> Сохранить изменения</>}
                </Button>
            </div>
        </div>
    );

    const RolesContent = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {/* Current Roles */}
            <div className="flex flex-col bg-slate-50 rounded-xl border border-slate-200 p-5 min-h-[300px] md:h-[450px]">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 ${colorStyle.bg} ${colorStyle.text} rounded-xl`}>
                            <Shield className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-700">Текущие роли</h4>
                    </div>
                    <span className={`${colorStyle.bg} ${colorStyle.text} text-xs font-bold px-2.5 py-1 rounded-full border ${colorStyle.border}`}>
                        {state.departmentRoles.length}
                    </span>
                </div>
                <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar flex-1">
                    {state.rolesLoading ? (
                        <div className="h-full py-10 flex flex-col items-center justify-center text-slate-300 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-xs font-bold">Загрузка...</span>
                        </div>
                    ) : state.departmentRoles.length === 0 ? (
                        <div className="h-full py-10 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 mb-3">
                                <Shield className="w-6 h-6 text-slate-200" />
                            </div>
                            <p className="text-slate-400 text-xs font-bold">Роли еще не назначены</p>
                        </div>
                    ) : (
                        state.departmentRoles.map(role => (
                            <div key={role.id} className="flex items-center justify-between p-4 bg-white border border-slate-200/60 rounded-xl group hover:border-primary/40 hover:shadow-md transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 flex-shrink-0 bg-slate-50 rounded-xl group-hover:bg-primary/5 transition-colors flex items-center justify-center">
                                        <Key className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold text-slate-700 block leading-tight">{role.name}</span>
                                        <span className="text-xs text-slate-400 font-bold">Активная роль</span>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveRole(role.id)}
                                    disabled={!!state.actionLoading}
                                    className="p-2.5 h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border-none"
                                    title="Удалить из отдела"
                                >
                                    {state.actionLoading === role.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Available Roles */}
            <div className="flex flex-col border border-slate-200 rounded-xl p-5 min-h-[300px] md:h-[450px]">
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-1.5 bg-slate-100 text-slate-500 rounded-xl">
                        <Plus className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-700">Доступные роли</h4>
                </div>
                <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar flex-1">
                    {state.rolesLoading ? (
                        <div className="h-full py-10 flex flex-col items-center justify-center text-slate-300 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-xs font-bold">Загрузка...</span>
                        </div>
                    ) : availableRoles.length === 0 ? (
                        <div className="h-full py-10 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 mb-3">
                                <Plus className="w-6 h-6 text-slate-200" />
                            </div>
                            <p className="text-slate-400 text-xs font-bold">Все роли распределены</p>
                        </div>
                    ) : (
                        availableRoles.map(role => (
                            <div key={role.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-200 rounded-xl group hover:border-primary/40 hover:bg-white transition-all">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-bold text-slate-700">{role.name}</span>
                                    <div className="flex items-center gap-1.5">
                                        <Building className="w-3 h-3 text-slate-300" />
                                        <span className="text-xs text-slate-400 font-bold">
                                            {role.department ? role.department.name : "Без отдела"}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleAddRole(role.id)}
                                    disabled={!!state.actionLoading}
                                    className="p-2.5 h-10 w-10 bg-white text-slate-400 hover:text-primary border border-slate-200 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/10 active:scale-90"
                                    title="Добавить в отдел"
                                >
                                    {state.actionLoading === role.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title={department.name}
            description="Параметры и управление отделом"
            className="max-w-3xl"
        >
            <Tabs value={state.activeTab} onValueChange={(val) => updateState({ activeTab: val })} className="w-full">
                <div className="px-0 pt-2 pb-1">
                    <TabsList className="bg-[#f1f5f9] border-none rounded-full p-1 w-full sm:w-auto inline-flex h-auto shadow-none">
                        <TabsTrigger
                            value="general"
                            className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold rounded-full transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]"
                        >
                            Основное
                        </TabsTrigger>
                        <TabsTrigger
                            value="roles"
                            className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold rounded-full transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]"
                        >
                            Роли отдела
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="pt-4 min-h-[400px]">
                    {state.error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                            {state.error}
                        </div>
                    )}

                    <TabsContent value="general">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleGeneralSubmit(new FormData(e.currentTarget));
                            }}
                        >
                            {FormContent}
                        </form>
                    </TabsContent>

                    <TabsContent value="roles">
                        {RolesContent}
                    </TabsContent>
                </div>
            </Tabs>

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
        </ResponsiveModal>
    );
}


