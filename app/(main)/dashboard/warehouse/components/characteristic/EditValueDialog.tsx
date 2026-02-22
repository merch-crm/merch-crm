"use client";
import { type Dispatch, type SetStateAction } from "react";
import { Plus, Check, Trash2, Loader2, Pencil, AlertCircle } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "@/components/ui/color-picker";
import { AttributeType } from "../../types";
import { transliterateToSku, type ValueFormState, type DeleteDialogState } from "../../hooks/use-warehouse-characteristic";

interface EditValueDialogProps {
    valueForm: ValueFormState;
    setValueForm: Dispatch<SetStateAction<ValueFormState>>;
    attributeTypes: AttributeType[];
    setDeleteDialog: Dispatch<SetStateAction<DeleteDialogState>>;
    handleValueSave: () => void;
}

export function EditValueDialog({
    valueForm,
    setValueForm,
    attributeTypes,
    setDeleteDialog,
    handleValueSave
}: EditValueDialogProps) {
    return (
        <ResponsiveModal
            isOpen={valueForm.isOpen}
            onClose={() => setValueForm((prev: ValueFormState) => ({ ...prev, isOpen: false }))}
            hideClose
            className="w-full sm:max-w-md flex flex-col p-0 overflow-visible rounded-[var(--radius-outer)] bg-white border-none shadow-2xl"
        >
            <div className="flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center shrink-0">
                            {valueForm.editingAttribute ? <Pencil className="w-6 h-6 text-primary" /> : <Plus className="w-6 h-6 text-primary" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                {valueForm.editingAttribute ? "Изменить значение" : "Новое значение"}
                            </h2>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                                Раздел: <span className="text-primary font-bold">{attributeTypes.find(t => t.slug === valueForm.targetTypeSlug)?.name}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-6 pb-4 bg-slate-50/30 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Название</label>
                            <Input
                                value={valueForm.name}
                                onChange={e => {
                                    const val = e.target.value;
                                    setValueForm((prev: ValueFormState) => ({
                                        ...prev,
                                        name: val,
                                        code: prev.isCodeManuallyEdited ? prev.code : transliterateToSku(val)
                                    }));
                                }}
                                placeholder="Напр: Синий"
                                className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-900 shadow-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Код (SKU)</label>
                            <Input
                                value={valueForm.code}
                                onChange={e => {
                                    const val = e.target.value.toUpperCase();
                                    setValueForm((prev: ValueFormState) => ({ ...prev, code: val, isCodeManuallyEdited: true }));
                                }}
                                placeholder="BLU"
                                className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-mono transition-all placeholder:text-slate-300 font-bold text-sm text-slate-900 shadow-sm"
                            />
                        </div>
                    </div>

                    {valueForm.targetTypeSlug === "color" && (
                        <div className="space-y-1.5 pt-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Цвет (HEX)</label>
                            <ColorPicker
                                color={valueForm.colorHex}
                                onChange={val => setValueForm((prev: ValueFormState) => ({ ...prev, colorHex: val }))}
                            />
                        </div>
                    )}

                    {valueForm.error && (
                        <div className="flex items-center gap-2 p-3 rounded-[var(--radius-inner)] bg-rose-50 text-rose-600 border border-rose-100 animate-in shake duration-500 mt-4">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <p className="text-xs font-bold leading-tight">{valueForm.error}</p>
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 z-10 p-5 pt-3 flex flex-row items-center justify-between gap-3 shrink-0 bg-white border-t border-slate-100 sm:rounded-b-[var(--radius-outer)]">
                    {valueForm.editingAttribute ? (
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteDialog((prev: DeleteDialogState) => ({ ...prev, attribute: valueForm.editingAttribute }))}
                            className="h-11 px-4 font-bold text-sm flex items-center gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-[var(--radius-inner)]"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Удалить</span>
                        </Button>
                    ) : (
                        <div />
                    )}
                    <div className="flex items-center gap-3 ml-auto">
                        <Button
                            variant="ghost"
                            onClick={() => setValueForm((prev: ValueFormState) => ({ ...prev, isOpen: false }))}
                            className="h-11 px-4 text-slate-400 hover:text-slate-600 font-bold text-sm"
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleValueSave}
                            disabled={valueForm.isSaving || !valueForm.name.trim() || !valueForm.code.trim()}
                            variant="btn-dark"
                            className="h-11 px-6 rounded-[var(--radius-inner)] text-sm font-bold flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                        >
                            {valueForm.isSaving ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4 stroke-[3] text-white" />
                            )}
                            Сохранить
                        </Button>
                    </div>
                </div>
            </div>
        </ResponsiveModal>
    );
}
