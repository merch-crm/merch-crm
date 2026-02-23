"use client";

import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Category } from "./types";
import { useAddAttributeType, transliterateToSlug } from "./hooks/use-add-attribute-type";

interface AddAttributeTypeDialogProps {
    categories: Category[];
    className?: string;
}


export function AddAttributeTypeDialog({ categories, className }: AddAttributeTypeDialogProps) {
    const {
        isOpen, setIsOpen,
        isLoading,
        label, setLabel,
        slug, setSlug,
        isSlugManuallyEdited, setIsSlugManuallyEdited,
        activeCategoryId, setActiveCategoryId,
        rootCategories,
        error, setError,
        handleOpen,
        handleCreate
    } = useAddAttributeType({ categories });

    const activeCategoryName = activeCategoryId === "uncategorized"
        ? "Без категории"
        : (categories.find(c => c.id === activeCategoryId)?.name || "Категория");

    return (
        <>
            <Button
                type="button"
                onClick={handleOpen}
                className={cn(
                    "h-10 w-10 sm:h-11 sm:w-auto btn-dark rounded-full sm:rounded-2xl p-0 sm:px-6 gap-2 font-bold inline-flex items-center justify-center border-none shadow-lg shadow-black/5",
                    className
                )}
            >
                <Plus className="w-5 h-5 text-white shrink-0" />
                <span className="hidden sm:inline">Новая характеристика</span>
            </Button>

            <ResponsiveModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Новая характеристика"
                description="Создание нового типа характеристики для товаров в каталоге"
                showVisualTitle={false}
                className="sm:max-w-[480px]"
            >
                <form
                    id="add-attribute-type-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleCreate();
                    }}
                    className="flex flex-col bg-white"
                >
                    <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center shadow-sm shrink-0 border border-primary/10">
                                <Plus className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 leading-tight">Характеристика</h2>
                                <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                                    Группа: <span className="text-primary font-bold">{activeCategoryName}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pb-6 pt-2 space-y-3 overflow-y-auto custom-scrollbar">
                        <div className="space-y-2 overflow-visible">
                            <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Раздел каталога товаров</label>

                            <Select
                                value={activeCategoryId}
                                onChange={setActiveCategoryId}
                                options={
                                    [
                                        ...rootCategories
                                            .filter(c => c.name.toLowerCase() !== "без категории")
                                            .map(c => ({ id: c.id, title: c.name })),
                                        { id: "uncategorized", title: "Без категории" }
                                    ]
                                }
                                placeholder="Выберите категорию"
                                showSearch={true}
                                className="w-full"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Название характеристики</label>
                                <Input
                                    value={label}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setLabel(val);
                                        setError(null);
                                        if (!isSlugManuallyEdited) {
                                            setSlug(transliterateToSlug(val));
                                        }
                                    }}
                                    placeholder="Напр. Цвет"
                                    className={cn(
                                        "h-12 rounded-[var(--radius-inner)] bg-slate-50 border-slate-200 font-bold text-sm text-slate-900 shadow-sm transition-all",
                                        error && "border-rose-500 bg-rose-50/10"
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Артикул</label>
                                <div className="relative">
                                    <Input
                                        value={slug}
                                        onChange={e => {
                                            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""));
                                            setIsSlugManuallyEdited(true);
                                            setError(null);
                                        }}
                                        placeholder="color"
                                        className={cn(
                                            "h-12 pr-10 rounded-[var(--radius-inner)] bg-slate-50 border-slate-200 font-mono text-sm font-bold text-primary shadow-sm transition-all",
                                            error && "border-rose-500 bg-rose-50/10"
                                        )}
                                    />
                                    {isSlugManuallyEdited && label && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setSlug(transliterateToSlug(label));
                                                setIsSlugManuallyEdited(false);
                                                setError(null);
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1 h-8 w-8"
                                            title="Сгенерировать автоматически"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                                {error && (
                                    <p className="text-[11px] font-bold text-rose-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {error}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-0 z-10 p-5 sm:p-6 pt-3 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-end lg:justify-between gap-3 shrink-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 lg:flex-none h-12 lg:px-8 text-slate-400 font-bold text-sm"
                        >
                            Отмена
                        </Button>
                        <SubmitButton
                            isLoading={isLoading}
                            disabled={isLoading || !label || !slug}
                            variant="btn-dark"
                            className="h-12 flex-1 lg:flex-none lg:w-auto lg:px-10 rounded-[var(--radius-inner)] font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm border-none"
                            text="Сохранить"
                            loadingText="Сохранение..."
                        />
                    </div>
                </form>
            </ResponsiveModal>

        </>
    );
}
