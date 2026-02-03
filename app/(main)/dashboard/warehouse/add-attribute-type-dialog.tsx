"use client";

import { useState } from "react";
import { Plus, Lock, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PremiumSelect } from "@/components/ui/premium-select";
import { useToast } from "@/components/ui/toast";
import { useRouter, useSearchParams } from "next/navigation";
import { playSound } from "@/lib/sounds";
import { createInventoryAttributeType } from "./actions";
import { cn } from "@/lib/utils";
import { Category } from "./types";

const RUSSIAN_TO_LATIN_MAP: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '_'
};

const transliterateToSlug = (text: string) => {
    return text.toLowerCase().split('').map(char => RUSSIAN_TO_LATIN_MAP[char] || char).join('').replace(/[^a-z0-9_]/g, '');
};

interface AddAttributeTypeDialogProps {
    categories: Category[];
}

function Switch({
    checked,
    onChange,
    disabled,
    label,
    icon: Icon,
    description
}: {
    checked: boolean,
    onChange: (val: boolean) => void,
    disabled?: boolean,
    label?: string,
    icon?: React.ComponentType<{ className?: string }>,
    description?: string
}) {
    return (
        <div className={cn(
            "flex items-center justify-between group",
            disabled && "opacity-50"
        )}>
            <div className="flex flex-col gap-0.5">
                {label && (
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-900">{label}</span>
                        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />}
                    </div>
                )}
                {description && <span className="text-[10px] text-slate-500 font-bold">{description}</span>}
            </div>
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-sm",
                    checked ? "bg-primary" : "bg-slate-200",
                    disabled && "cursor-not-allowed"
                )}
            >
                <span
                    className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    );
}



export function AddAttributeTypeDialog({ categories }: AddAttributeTypeDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [label, setLabel] = useState("");
    const [slug, setSlug] = useState("");
    const [isSystem, setIsSystem] = useState(false);
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    const rootCategories = categories.filter(c => !c.parentId);
    const catParam = searchParams.get("cat");
    const [activeCategoryId, setActiveCategoryId] = useState<string>(catParam || (rootCategories.length > 0 ? rootCategories[0].id : "uncategorized"));

    const handleOpen = () => {
        setLabel("");
        setSlug("");
        setIsSystem(false);
        setIsSlugManuallyEdited(false);
        const currentCat = searchParams.get("cat");
        if (currentCat) {
            setActiveCategoryId(currentCat);
        } else if (rootCategories.length > 0) {
            setActiveCategoryId(rootCategories[0].id);
        }
        setIsOpen(true);
    };

    const handleCreate = async () => {
        if (!label.trim() || !slug.trim()) return;
        setIsLoading(true);
        try {
            const catIdToSave = activeCategoryId === "uncategorized" ? undefined : activeCategoryId;
            const res = await createInventoryAttributeType(label, slug, catIdToSave, isSystem);
            if (res.success) {
                toast("Новый раздел создан", "success");
                playSound("notification_success");
                setIsOpen(false);
                router.refresh();
            } else {
                toast(res.error || "Ошибка создания", "error");
                playSound("notification_error");
            }
        } catch {
            toast("Ошибка создания", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const activeCategoryName = activeCategoryId === "uncategorized"
        ? "Без категории"
        : (categories.find(c => c.id === activeCategoryId)?.name || "Категория");

    return (
        <>
            <Button
                onClick={handleOpen}
                className="h-11 btn-dark rounded-[var(--radius-inner)] px-6 gap-2 font-bold inline-flex items-center justify-center text-sm border-none"
            >
                <Plus className="w-5 h-5" />
                Новая характеристика
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl p-0 rounded-[var(--radius-outer)] border-none shadow-2xl overflow-visible bg-white">
                    <DialogTitle className="sr-only">Новая характеристика</DialogTitle>
                    <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                        <div className="flex items-center gap-4">
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

                    <div className="px-6 py-5 space-y-6">
                        <div className="space-y-1.5 overflow-visible">
                            <label className="text-sm font-bold text-slate-500 ml-1">Раздел каталога товаров</label>
                            <PremiumSelect
                                value={activeCategoryId}
                                onChange={setActiveCategoryId}
                                options={[
                                    ...rootCategories
                                        .filter(c => c.name.toLowerCase() !== "без категории")
                                        .map(c => ({ id: c.id, title: c.name })),
                                    { id: "uncategorized", title: "Без категории" }
                                ]}
                                placeholder="Выберите категорию"
                                showSearch
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-500 ml-1">Название заголовок</label>
                                <input
                                    value={label}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setLabel(val);
                                        if (!isSlugManuallyEdited) {
                                            setSlug(transliterateToSlug(val));
                                        }
                                    }}
                                    placeholder="Напр. Цвет"
                                    className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-white border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 font-bold text-xs text-slate-900 shadow-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-500 ml-1">Системный SLUG</label>
                                <input
                                    value={slug}
                                    onChange={e => {
                                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"));
                                        setIsSlugManuallyEdited(true);
                                    }}
                                    placeholder="color"
                                    className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-slate-50/30 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-mono placeholder:text-slate-300 text-[10px] font-bold text-primary shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50/50 rounded-[var(--radius-inner)] border border-slate-200 shadow-sm">
                            <Switch
                                checked={isSystem}
                                onChange={setIsSystem}
                                label="Глобальная характеристика"
                                description="Будет видна во всех категориях товаров"
                                icon={Lock}
                            />
                        </div>
                    </div>

                    <div className="p-6 pt-2 flex gap-3 bg-white rounded-b-[var(--radius-outer)]">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex-1 h-11 rounded-[var(--radius-inner)] text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all active:scale-95"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={isLoading || !label || !slug}
                            className="flex-[1.8] h-11 btn-dark rounded-[var(--radius-inner)] font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4 stroke-[3]" />
                            )}
                            Создать раздел
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
