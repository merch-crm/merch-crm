import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Plus, Palette, Check, RefreshCcw, Settings2, ArrowRight } from "lucide-react";
import { PremiumSelect } from "@/components/ui/premium-select";
import { ColorPicker } from "@/components/ui/color-picker";
import { cn } from "@/lib/utils";
import { createInventoryAttribute, getInventoryAttributes } from "./actions";
import { CLOTHING_COLORS, CLOTHING_QUALITIES, CLOTHING_SIZES } from "./category-utils";
import { motion } from "framer-motion";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface AttributeSelectorProps {
    type: string;
    value: string;
    onChange: (value: string, code: string) => void;
    onCodeChange?: (code: string) => void;
    allowCustom?: boolean;
    label?: string;
    description?: string;
    required?: boolean;
}

interface DbAttribute {
    id: string;
    type: string;
    name: string;
    value: string;
    meta: Record<string, unknown> | null;
}

export function AttributeSelector({ type, value, onChange, onCodeChange, allowCustom = true, label, required }: AttributeSelectorProps) {
    const router = useRouter();
    const [showCustom, setShowCustom] = useState(false);
    const [customName, setCustomName] = useState("");
    const [customHex, setCustomHex] = useState("#000000");
    const [isSaving, setIsSaving] = useState(false);

    const [dbAttributes, setDbAttributes] = useState<DbAttribute[]>([]);

    useEffect(() => {
        const fetchAttrs = async () => {
            const res = await getInventoryAttributes();
            if (res.data) {
                setDbAttributes((res.data as DbAttribute[]).filter(a => a.type === type));
            }
        };
        fetchAttrs();
    }, [type]);

    // For materials and sizes - use ONLY database data
    // For colors - merge static with DB (colors have hex values)
    // For brands - DB only (already implemented)
    // For quality - use static array to maintain order
    const baseOptions = type === "color" ? CLOTHING_COLORS
        : type === "quality" ? CLOTHING_QUALITIES
            : [];

    const sizeOrder = ["kids", "s", "s-m", "m", "l", "xl"]; // Updated size order
    const sortSizes = (options: { name: string; code: string }[]) => {
        return [...options].sort((a, b) => {
            const indexA = sizeOrder.indexOf(a.name.toLowerCase());
            const indexB = sizeOrder.indexOf(b.name.toLowerCase());
            if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    };

    let allOptions: { name: string; code: string; hex?: string }[] = [];

    if (type === "size") {
        // Merge static sizes with DB ones and sort
        allOptions = [...CLOTHING_SIZES];
        dbAttributes.forEach(dbAttr => {
            if (!allOptions.some(opt => opt.name.toLowerCase() === dbAttr.name.toLowerCase())) {
                allOptions.push({
                    name: dbAttr.name,
                    code: dbAttr.value
                });
            }
        });
        allOptions = sortSizes(allOptions);
    } else if (!["quality", "color"].includes(type)) {
        // Use only database attributes for these types (brand, material, custom...)
        allOptions = dbAttributes.map(dbAttr => ({
            name: dbAttr.name,
            code: dbAttr.value
        }));
    } else if (type === "quality") {
        // Merge static qualities with DB ones
        allOptions = [...CLOTHING_QUALITIES];
        dbAttributes.forEach(dbAttr => {
            if (!allOptions.some(opt => opt.name.toLowerCase() === dbAttr.name.toLowerCase())) {
                allOptions.push({
                    name: dbAttr.name,
                    code: dbAttr.value
                });
            }
        });
    } else if (type === "color") {
        // For colors, merge static with DB
        allOptions = [...baseOptions];
        dbAttributes.forEach(dbAttr => {
            if (!allOptions.some(opt => opt.name === dbAttr.name)) {
                allOptions.push({
                    name: dbAttr.name,
                    code: dbAttr.value,
                    hex: (dbAttr.meta as { hex?: string })?.hex || "#000000"
                });
            }
        });
    }

    const filteredOptions = allOptions;

    const transliterate = (text: string) => {
        const map: Record<string, string> = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
            'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
            'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
            'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return text.split('').map(char => {
            const lowChar = char.toLowerCase();
            const res = map[lowChar] || lowChar;
            return char === char.toUpperCase() ? res.toUpperCase() : res;
        }).join('');
    };

    const handleCustomSubmit = async () => {
        if (!customName.trim()) return;

        setIsSaving(true);

        const code = transliterate(customName.substring(0, 3).toUpperCase());
        const meta = type === "color" ? { hex: customHex } : undefined;

        // Save to database
        const result = await createInventoryAttribute(
            type,
            customName,
            code,
            meta
        );

        setIsSaving(false);

        if (result.success) {
            // Refresh the attributes list
            const res = await getInventoryAttributes();
            if (res.data) {
                setDbAttributes((res.data as DbAttribute[]).filter(a => a.type === type));
            }

            onChange(customName, code);
            if (onCodeChange) onCodeChange(code);
            setShowCustom(false);
            setCustomName("");
            setCustomHex("#000000");
        }
    };

    if (type === "color") {
        return (
            <div className={cn("space-y-2 w-full relative", showCustom && "z-50")}>
                <div className="mb-2 flex items-start justify-between">
                    <div>
                        <h4 className="text-base font-bold text-slate-900">
                            Цвет изделия {required && <span className="text-rose-500 ml-1">*</span>}
                        </h4>
                    </div>

                </div>
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-7 gap-2">
                    {filteredOptions.map(c => (
                        <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                                onChange(c.name, c.code);
                                if (onCodeChange) onCodeChange(c.code);
                                setShowCustom(false);
                            }}
                            className={cn(
                                "group relative h-[94px] flex flex-col items-center justify-center gap-1 rounded-[var(--radius)] border transition-all duration-300 shadow-sm",
                                value === c.code
                                    ? "bg-white border-slate-900 shadow-md z-10"
                                    : "bg-white border-slate-200 hover:border-slate-400 hover:shadow-md"
                            )}
                        >
                            <div
                                className="w-11 h-11 rounded-full border border-black/5 shadow-inner shrink-0 transition-all duration-300 group-hover:shadow-md"
                                style={{ backgroundColor: 'hex' in c ? (c as { name: string; code: string; hex: string }).hex : undefined }}
                            />
                            <span className={cn(
                                "text-[10px] font-bold truncate w-full px-2 text-center transition-colors duration-300",
                                value === c.code ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900"
                            )}>{c.name}</span>
                        </button>
                    ))}
                    {allowCustom && (
                        <button
                            type="button"
                            onClick={() => setShowCustom(true)}
                            className={cn(
                                "group h-[94px] flex flex-col items-center justify-center gap-1 rounded-[var(--radius)] border border-dashed transition-all duration-300 shadow-sm hover:shadow-md",
                                showCustom
                                    ? "bg-slate-50 border-slate-300 text-slate-900 shadow-md"
                                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            <span className="text-[10px] font-bold">Добавить</span>
                        </button>
                    )}
                </div>

                <ResponsiveModal
                    isOpen={showCustom}
                    onClose={() => setShowCustom(false)}
                    hideClose={false}
                    className="w-full sm:max-w-md flex flex-col p-0 overflow-visible rounded-[var(--radius-outer)] bg-white border-none shadow-2xl"
                >
                    <div className="flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center shrink-0">
                                    <Palette className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">Новый цвет</h2>
                                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">Добавление оттенка в палитру</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-6 pb-5 bg-slate-50/30 overflow-y-auto custom-scrollbar space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Название цвета</label>
                                <input
                                    type="text"
                                    placeholder="Напр: Полночный синий"
                                    className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-900 shadow-sm"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Выбор цвета</label>
                                <div className="p-4 bg-white border border-slate-200 rounded-[var(--radius-inner)] shadow-sm">
                                    <ColorPicker
                                        color={customHex}
                                        onChange={setCustomHex}
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    window.open("/dashboard/warehouse/characteristics", "_blank");
                                }}
                                className="flex items-center justify-between p-4 w-full bg-slate-900/[0.03] hover:bg-primary/5 border border-slate-200/60 hover:border-primary/20 rounded-[var(--radius-inner)] transition-all group/link mt-3 cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover/link:text-primary transition-colors">
                                        <Settings2 className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[13px] font-bold text-slate-900 leading-tight">Справочник</div>
                                        <div className="text-[10px] font-bold text-slate-400 tracking-tight">Полный список характеристик</div>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-primary group-hover/link:translate-x-1 transition-all" />
                            </button>
                        </div>

                        <div className="sticky bottom-0 z-10 p-5 border-t border-slate-200 bg-white/95 backdrop-blur-md flex items-center sm:justify-end shrink-0 sm:rounded-b-[var(--radius-outer)] gap-3">
                            <button
                                onClick={() => setShowCustom(false)}
                                className="hidden lg:flex h-11 sm:w-auto sm:px-8 text-slate-400 hover:text-slate-600 font-bold text-sm active:scale-95 transition-all text-center items-center justify-center rounded-[var(--radius-inner)]"
                            >
                                Отмена
                            </button>

                            <button
                                onClick={handleCustomSubmit}
                                disabled={isSaving || !customName.trim()}
                                className="h-11 w-full sm:w-auto sm:px-8 btn-dark rounded-[var(--radius-inner)] text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                            >
                                {isSaving && (
                                    <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                                )}
                                Сохранить
                            </button>
                        </div>
                    </div>
                </ResponsiveModal>
            </div>
        );
    }


    if (type === "brand" || type === "quality" || !["color"].includes(type)) {
        const displayLabel = label || (
            type === "brand" ? "Бренд" :
                type === "material" ? "Материал" :
                    type === "size" ? "Размер" :
                        type === "quality" ? "Качество ткани" :
                            type
        );

        const addLabel = type === "brand" ? "Создать бренд" :
            type === "material" ? "Создать материал" :
                type === "size" ? "Создать размер" :
                    type === "quality" ? "Создать качество" :
                        label ? `Создать ${label.toLowerCase()}` : "Создать опцию";

        const placeholder = type === "brand" ? "Выберите бренд..." :
            type === "material" ? "Выберите материал..." :
                type === "size" ? "Выберите размер..." :
                    type === "quality" ? "Выберите качество..." :
                        `Выберите ${displayLabel.toLowerCase()}...`;

        return (
            <div className={cn("space-y-2 relative w-full", showCustom && "z-50")}>
                <div className="mb-2 flex items-baseline justify-between gap-4 overflow-hidden">
                    <div className="min-w-0">
                        <h4 className="text-base font-bold text-slate-900 truncate">
                            {displayLabel} {required && <span className="text-rose-500 ml-1">*</span>}
                        </h4>
                    </div>
                    {allowCustom && (
                        <button
                            type="button"
                            onClick={() => setShowCustom(true)}
                            className="flex items-center py-1 text-slate-400 hover:text-slate-900 transition-all active:scale-95 group/add shrink-0"
                        >
                            <span className="text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">{addLabel}</span>
                        </button>
                    )}
                </div>

                <PremiumSelect
                    options={allOptions.map(opt => ({
                        id: opt.code,
                        title: opt.name
                    }))}
                    value={value || ""}
                    onChange={(code) => {
                        const opt = allOptions.find(o => o.code === code);
                        if (opt) {
                            onChange(opt.name, opt.code);
                            if (onCodeChange) onCodeChange(opt.code);
                        }
                    }}
                    placeholder={placeholder}
                    autoLayout={true}
                    showSearch={type === "brand"}
                />

                <ResponsiveModal
                    isOpen={showCustom}
                    onClose={() => setShowCustom(false)}
                    hideClose={false}
                    className="w-full sm:max-w-md flex flex-col p-0 overflow-visible rounded-[var(--radius-outer)] bg-white border-none shadow-2xl"
                >
                    <div className="flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center shrink-0">
                                    <Plus className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                        {type === "brand" ? "Новый бренд" :
                                            type === "material" ? "Новый материал" :
                                                type === "size" ? "Новый размер" :
                                                    type === "quality" ? "Новое качество" :
                                                        displayLabel.toLowerCase() === "состав" ? "Новый состав" :
                                                            "Новая опция"}
                                    </h2>
                                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                                        Раздел: <span className="text-primary font-bold">{displayLabel}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-6 pb-5 bg-slate-50/30 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Название</label>
                                    <input
                                        type="text"
                                        placeholder="Напр: Muse Wear"
                                        className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-900 shadow-sm"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Код (SKU)</label>
                                    <div className="h-11 px-4 rounded-[var(--radius-inner)] bg-slate-100/50 border border-slate-200 flex items-center text-slate-400 font-mono text-sm font-bold shadow-inner">
                                        {transliterate(customName.substring(0, 3).toUpperCase()) || "---"}
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold mt-4 ml-1 italic opacity-60">Короткий код для артикула генерируется автоматически на основе названия</p>

                            <button
                                type="button"
                                onClick={() => {
                                    window.open("/dashboard/warehouse/characteristics", "_blank");
                                }}
                                className="flex items-center justify-between p-4 w-full bg-slate-900/[0.03] hover:bg-primary/5 border border-slate-200/60 hover:border-primary/20 rounded-[var(--radius-inner)] transition-all group/link mt-3 cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover/link:text-primary transition-colors">
                                        <Settings2 className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[13px] font-bold text-slate-900 leading-tight">Справочник</div>
                                        <div className="text-[10px] font-bold text-slate-400 tracking-tight">Полный список характеристик</div>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-primary group-hover/link:translate-x-1 transition-all" />
                            </button>
                        </div>

                        <div className="sticky bottom-0 z-10 p-5 border-t border-slate-200 bg-white/95 backdrop-blur-md flex items-center sm:justify-end shrink-0 sm:rounded-b-[var(--radius-outer)] gap-3">
                            <button
                                onClick={() => setShowCustom(false)}
                                className="hidden lg:flex h-11 sm:w-auto sm:px-8 text-slate-400 hover:text-slate-600 font-bold text-sm active:scale-95 transition-all text-center items-center justify-center rounded-[var(--radius-inner)]"
                            >
                                Отмена
                            </button>

                            <button
                                onClick={handleCustomSubmit}
                                disabled={isSaving || !customName.trim()}
                                className="h-11 w-full sm:w-auto sm:px-8 btn-dark rounded-[var(--radius-inner)] text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                            >
                                {isSaving && (
                                    <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                                )}
                                Сохранить
                            </button>
                        </div>
                    </div>
                </ResponsiveModal>
            </div>
        );
    }
}
