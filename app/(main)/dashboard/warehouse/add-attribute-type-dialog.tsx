"use client";

import { useState, useEffect } from "react";
import { Plus, X, Lock, RefreshCw, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { PremiumSelect } from "@/components/ui/premium-select";
import { useToast } from "@/components/ui/toast";
import { useRouter, useSearchParams } from "next/navigation";
import { playSound } from "@/lib/sounds";
import { createInventoryAttributeType } from "./actions";
import { cn } from "@/lib/utils";
import { Category } from "./types";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

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
    className?: string;
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



export function AddAttributeTypeDialog({ categories, className }: AddAttributeTypeDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [label, setLabel] = useState("");
    const [slug, setSlug] = useState("");
    const [isSystem, setIsSystem] = useState(false);

    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

    // Search animation states
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
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
                className={cn(
                    "h-10 w-10 sm:h-11 sm:w-auto btn-dark rounded-full sm:rounded-[18px] p-0 sm:px-6 gap-2 font-bold inline-flex items-center justify-center border-none shadow-lg shadow-black/5",
                    className
                )}
            >
                <Plus className="w-5 h-5 text-white shrink-0" />
                <span className="hidden sm:inline">Новая характеристика</span>
            </Button>

            <ResponsiveModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Новая характеристика" showVisualTitle={false}>
                <div className="flex flex-col h-full overflow-hidden">
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

                    <div className="px-6 pb-20 pt-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="space-y-1.5 overflow-visible">
                            <label className="text-sm font-bold text-slate-700 ml-1">Раздел каталога товаров</label>

                            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
                                <LayoutGroup id="attr-category-search">
                                    <motion.div
                                        layout
                                        className={cn(
                                            "flex flex-row items-center min-w-0 w-full",
                                            (isSearchExpanded && isMobile) ? "gap-0" : "gap-2"
                                        )}
                                        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                                    >
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            {(!isSearchExpanded || !isMobile) && (
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.95, x: -20 }}
                                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                                    transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                                                    className="w-full"
                                                >
                                                    <PremiumSelect
                                                        value={activeCategoryId}
                                                        onChange={setActiveCategoryId}
                                                        options={
                                                            [
                                                                ...rootCategories
                                                                    .filter(c => c.name.toLowerCase() !== "без категории")
                                                                    .map(c => ({ id: c.id, title: c.name })),
                                                                { id: "uncategorized", title: "Без категории" }
                                                            ].filter(opt =>
                                                                opt.title.toLowerCase().includes(searchQuery.toLowerCase())
                                                            )
                                                        }
                                                        placeholder="Выберите категорию"
                                                        // Hide built-in search as we have external one now
                                                        showSearch={false}
                                                        className="w-full"
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <motion.div
                                            layout
                                            className={cn(
                                                "relative min-w-0 h-11 transition-all duration-500",
                                                (isSearchExpanded && isMobile) ? "w-full" : "w-11 shrink-0"
                                            )}
                                            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                                        >
                                            <div
                                                className={cn(
                                                    "absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center z-10 cursor-pointer transition-colors duration-300",
                                                    isSearchExpanded && "text-primary"
                                                )}
                                                onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
                                            >
                                                <Search className={cn("w-4 h-4 transition-colors duration-300", isSearchExpanded ? "text-primary" : "text-slate-400")} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder={isSearchExpanded ? "Поиск категории..." : ""}
                                                value={searchQuery}
                                                onFocus={() => setIsSearchExpanded(true)}
                                                onBlur={() => {
                                                    if (!searchQuery) {
                                                        setTimeout(() => setIsSearchExpanded(false), 200);
                                                    }
                                                }}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className={cn(
                                                    "w-full h-full focus:outline-none min-w-0 transition-all duration-300 rounded-[var(--radius-inner)] border border-slate-200 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 shadow-sm font-bold text-sm",
                                                    (isSearchExpanded || !isMobile) ? "pl-11 pr-10 bg-white" : "pl-11 pr-0 bg-transparent border-none shadow-none cursor-pointer",
                                                    (isSearchExpanded && isMobile) && "bg-white pl-11 pr-4"
                                                )}
                                            />
                                            {searchQuery && (
                                                <button
                                                    onClick={() => {
                                                        setSearchQuery("");
                                                        setIsSearchExpanded(false);
                                                    }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors duration-300"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                </LayoutGroup>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Название</label>
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
                                    className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-900 shadow-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Системный SLUG</label>
                                <input
                                    value={slug}
                                    onChange={e => {
                                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"));
                                        setIsSlugManuallyEdited(true);
                                    }}
                                    placeholder="color"
                                    className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-mono placeholder:text-slate-300 text-sm font-bold text-primary shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 shadow-sm">
                            <Switch
                                checked={isSystem}
                                onChange={setIsSystem}
                                label="Глобальная характеристика"
                                description="Будет видна во всех категориях товаров"
                            />
                        </div>
                    </div>

                    <div className="sticky bottom-0 z-10 p-5 sm:p-6 pt-3 bg-white/95 backdrop-blur-md border-t border-slate-100 mt-auto flex items-center sm:justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex h-11 sm:w-auto sm:px-8 text-slate-400 hover:text-slate-600 font-bold text-sm active:scale-95 transition-all text-center rounded-[var(--radius-inner)] sm:bg-transparent"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={isLoading || !label || !slug}
                            className="h-11 w-full sm:w-auto sm:px-10 btn-dark rounded-[var(--radius-inner)] font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm"
                        >
                            {isLoading ? (
                                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            ) : (
                                <Check className="w-4 h-4 stroke-[3] text-white" />
                            )}
                            Сохранить
                        </button>
                    </div>
                </div>
            </ResponsiveModal>
        </>
    );
}
