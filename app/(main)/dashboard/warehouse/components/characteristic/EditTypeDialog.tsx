"use client";
import { type Dispatch, type SetStateAction } from "react";
import { Plus, Settings, Trash2, Loader2, Tag, Hash } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Session } from "@/lib/auth";
import { InventoryAttribute as Attribute, AttributeType } from "../../types";
import { type TypeFormState, type DeleteDialogState, getColorHex } from "../../hooks/use-warehouse-characteristic";
import { SwitchRow } from "@/components/ui/switch-row";
import { cn } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
}

interface EditTypeDialogProps {
    typeForm: TypeFormState;
    setTypeForm: Dispatch<SetStateAction<TypeFormState>>;
    rootCategories: Category[];
    user: Session | null | undefined;
    editingTypeLatest: AttributeType | null | undefined;
    editingTypeValues: Attribute[];
    openAddValue: (slug: string) => void;
    openEditValue: (attr: Attribute) => void;
    setDeleteDialog: Dispatch<SetStateAction<DeleteDialogState>>;
    handleTypeUpdate: () => void;
}

export function EditTypeDialog({
    typeForm,
    setTypeForm,
    rootCategories,
    user,
    editingTypeLatest,
    editingTypeValues,
    openAddValue,
    openEditValue,
    setDeleteDialog,
    handleTypeUpdate
}: EditTypeDialogProps) {
    return (
        <ResponsiveModal
            isOpen={!!typeForm.editingType}
            onClose={() => setTypeForm((prev: TypeFormState) => ({ ...prev, editingType: null }))}
            hideClose
            title="Настройка раздела"
            showVisualTitle={false}
            className="w-full md:max-w-2xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-[var(--radius-outer)] bg-white border-none shadow-2xl"
        >
            <div className="flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-indigo-50 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100/50">
                            <Settings className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">Настройка раздела</h2>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">Управление характеристиками и их значениями</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="px-6 pt-2 pb-4 space-y-3 bg-slate-50/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Название раздела</label>
                                <Input
                                    value={typeForm.name}
                                    onChange={e => setTypeForm((prev: TypeFormState) => ({ ...prev, name: e.target.value, error: null }))}
                                    className={cn(
                                        "w-full h-12 px-4 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm text-slate-900 shadow-sm",
                                        typeForm.error && "border-rose-500 bg-rose-50/10"
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Категория</label>
                                <Select
                                    value={typeForm.categoryId}
                                    onChange={val => setTypeForm((prev: TypeFormState) => ({ ...prev, categoryId: val, error: null }))}
                                    options={[
                                        ...rootCategories
                                            .filter(c => c.name.toLowerCase() !== "без категории")
                                            .map(c => ({ id: c.id, title: c.name })),
                                        { id: "uncategorized", title: "Без категории" }
                                    ]}
                                    placeholder="Выберите категорию"
                                />
                                {typeForm.error && (
                                    <p className="text-[11px] font-bold text-rose-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {typeForm.error}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <SwitchRow
                                icon={Hash}
                                title="В артикул"
                                description=""
                                checked={typeForm.showInSku}
                                onCheckedChange={(val: boolean) => setTypeForm((prev: TypeFormState) => ({ ...prev, showInSku: val }))}
                                variant="success"
                            />
                            <SwitchRow
                                icon={Tag}
                                title="В название"
                                description=""
                                checked={typeForm.showInName}
                                onCheckedChange={(val: boolean) => setTypeForm((prev: TypeFormState) => ({ ...prev, showInName: val }))}
                                variant="success"
                            />
                        </div>
                    </div>

                    <div className="px-6 pb-8 bg-white pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Значения ({editingTypeValues.length})</label>
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => editingTypeLatest && openAddValue(editingTypeLatest.slug)}
                                className="sm:w-auto sm:px-3 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95 shrink-0 mr-1"
                            >
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                <span className="whitespace-nowrap hidden sm:inline">Добавить</span>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                            {editingTypeValues.map(attr => (
                                <div role="button" tabIndex={0}
                                    key={attr.id}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                    onClick={() => openEditValue(attr)}
                                    className="flex flex-row md:flex-col items-center md:justify-center gap-3 p-2.5 md:p-4 bg-slate-50 rounded-[16px] md:rounded-[20px] cursor-pointer hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 border border-transparent hover:border-slate-100 group"
                                >
                                    {editingTypeLatest?.slug === "color" && (
                                        <div className={cn(
                                            "w-8 h-8 md:w-9 md:h-9 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.1)] flex-shrink-0",
                                            ((attr.meta as { hex?: string })?.hex?.toLowerCase() === '#ffffff') && "shadow-[inset_0_0_0_1px_#e2e8f0,0_4px_10px_rgba(0,0,0,0.05)]"
                                        )} style={{ backgroundColor: getColorHex(attr.meta) }} />
                                    )}
                                    {editingTypeLatest && (editingTypeLatest.slug === "size" || editingTypeLatest.slug === "material") && (
                                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-900 border border-slate-200 flex-shrink-0">
                                            {attr.value.substring(0, 3)}
                                        </div>
                                    )}
                                    {editingTypeLatest && !["color", "size", "material"].includes(editingTypeLatest.slug) && (
                                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-primary font-bold text-xs flex-shrink-0 border border-primary/10">
                                            {attr.value.substring(0, 1)}
                                        </div>
                                    )}

                                    <div className="flex flex-col md:items-center gap-0.5 md:gap-1 min-w-0 flex-1 md:flex-none">
                                        <div className="font-bold text-xs text-slate-700 md:text-center leading-tight truncate w-full">{attr.name}</div>
                                        <div className="text-[11px] md:text-xs font-bold text-slate-400 md:bg-white md:px-1.5 md:py-0.5 md:rounded-md md:border md:border-slate-200 tabular-nums">{attr.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {editingTypeValues.length === 0 && (
                            <div className="col-span-full text-center py-10 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[var(--radius-inner)]">
                                <p className="text-xs font-bold text-slate-400 mb-2">Список значений пуст</p>
                                <Button
                                    variant="link"
                                    onClick={() => editingTypeLatest && openAddValue(editingTypeLatest.slug)}
                                    className="text-primary text-xs font-bold h-auto p-0"
                                >
                                    Добавить первое значение
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="sticky bottom-0 z-10 p-4 sm:p-6 border-t border-slate-200 bg-white/95 backdrop-blur-md flex items-center shrink-0 sm:rounded-b-[var(--radius-outer)] gap-3 mt-auto">
                    {editingTypeLatest && (
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteDialog((prev: DeleteDialogState) => ({ ...prev, type: editingTypeLatest }))}
                            disabled={editingTypeLatest.isSystem && user?.roleName !== "Администратор"}
                            className="h-12 px-6 font-bold text-sm flex items-center gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-[var(--radius-inner)] transition-all disabled:opacity-30 disabled:grayscale shrink-0"
                        >
                            <Trash2 className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline whitespace-nowrap">Удалить раздел</span>
                            <span className="sm:hidden whitespace-nowrap">Удалить</span>
                        </Button>
                    )}

                    <div className="flex items-center gap-3 ml-auto">
                        <Button
                            variant="ghost"
                            onClick={() => setTypeForm((prev: TypeFormState) => ({ ...prev, editingType: null }))}
                            className="hidden md:flex h-12 px-8 text-slate-400 hover:text-slate-600 font-bold text-sm border-none bg-transparent hover:bg-slate-50"
                        >
                            Отмена
                        </Button>

                        <Button
                            onClick={handleTypeUpdate}
                            disabled={typeForm.isLoading}
                            variant="btn-dark"
                            className="px-10 h-12 rounded-[var(--radius-inner)] text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                        >
                            {typeForm.isLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : null}
                            Сохранить
                        </Button>
                    </div>
                </div>
            </div>
        </ResponsiveModal>
    );
}
