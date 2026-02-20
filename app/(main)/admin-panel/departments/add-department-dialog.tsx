"use client";

import { useState, useEffect } from "react";
import { Plus, Building, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAddDepartment } from "./hooks/use-add-department";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { DEPARTMENT_COLORS, getDepartmentColorHex } from "@/lib/constants";
import { IconInput } from "@/components/ui/icon-input";

interface AddDepartmentDialogProps {
    onSuccess: () => void;
}



export function AddDepartmentDialog({ onSuccess }: AddDepartmentDialogProps) {
    const { state, updateState, toggleRole, handleSubmit } = useAddDepartment(onSuccess);

    const isMobile = useIsMobile();

    return (
        <>
            <Button
                type="button"
                onClick={() => updateState({ isOpen: true })}
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
                isOpen={state.isOpen}
                onClose={() => updateState({ isOpen: false })}
                title="Новый отдел"
                description="Создайте новое подразделение компании"
                className="max-w-xl"
            >
                <div className="pb-2">
                    {state.error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-bold rounded-[var(--radius-outer)] border border-red-100">
                            {state.error}
                        </div>
                    )}

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit(new FormData(e.currentTarget));
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 ml-1">Название отдела</label>
                            <IconInput
                                startIcon={Building}
                                type="text"
                                name="name"
                                required
                                placeholder="Например: Цех печати"
                                className="crm-dialog-field"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 ml-1">Описание</label>
                            <Textarea
                                name="description"
                                rows={isMobile ? 3 : 2}
                                placeholder="Чем занимается этот отдел..."
                                className="crm-dialog-textarea h-auto min-h-[80px]"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 ml-1">Цветовая метка</label>
                            <div className={`flex flex-wrap ${isMobile ? 'grid grid-cols-4' : ''} gap-2`}>
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

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-slate-700 ml-1">Роли в этом отделе</label>
                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                    Выбрано: {state.selectedRoleIds.length}
                                </span>
                            </div>
                            <div className={`${isMobile ? 'max-h-[300px]' : 'max-h-[160px]'} overflow-y-auto pr-2 custom-scrollbar border border-slate-200 rounded-[var(--radius-inner)] p-2 bg-slate-50/50`}>
                                {state.fetchingRoles ? (
                                    <div className="py-4 text-center text-slate-400 text-xs font-bold  animate-pulse">Загрузка ролей...</div>
                                ) : state.roles.length === 0 ? (
                                    <div className="py-4 text-center text-slate-400 text-xs">Нет созданных ролей</div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-1">
                                        {state.roles.map(role => {
                                            const isSelected = state.selectedRoleIds.includes(role.id);
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
                                                                <p className="text-xs text-slate-400 font-bold">В отделе: {role.department.name}</p>
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
                                disabled={state.loading}
                                className="w-full h-12 rounded-[var(--radius-inner)] font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                            >
                                {state.loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                                {state.loading ? "Создание..." : "Создать отдел"}
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


