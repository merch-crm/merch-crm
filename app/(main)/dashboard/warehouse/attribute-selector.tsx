import { useState, useEffect } from "react";
import { Plus, X, Search, Check } from "lucide-react";
import { PremiumSelect } from "@/components/ui/premium-select";
import { cn } from "@/lib/utils";
import { createInventoryAttribute, getInventoryAttributes } from "./actions";
import { CLOTHING_COLORS, CLOTHING_QUALITIES, CLOTHING_SIZES } from "./category-utils";
import { QualityDropdown } from "./quality-dropdown";
import { motion, AnimatePresence } from "framer-motion";

interface AttributeSelectorProps {
    type: string;
    value: string;
    onChange: (value: string, code: string) => void;
    onCodeChange?: (code: string) => void;
    allowCustom?: boolean;
    label?: string;
}

interface DbAttribute {
    id: string;
    type: string;
    name: string;
    value: string;
    meta: Record<string, unknown> | null;
}

export function AttributeSelector({ type, value, onChange, onCodeChange, allowCustom = true, label }: AttributeSelectorProps) {
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
            <div className="space-y-4 w-full relative">
                <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-semibold text-slate-900">Цвет изделия</label>
                    {value && <span className="text-[10px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-[var(--radius-inner)]">{value}</span>}
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
                                "group relative h-[94px] flex flex-col items-center justify-center gap-1 rounded-[var(--radius-inner)] border transition-all duration-300",
                                value === c.code
                                    ? "bg-white border-slate-900 shadow-xl shadow-slate-200 z-10"
                                    : "bg-white border-slate-200 hover:border-slate-900 hover:shadow-lg hover:shadow-slate-200/60"
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
                                "group h-[94px] flex flex-col items-center justify-center gap-1 rounded-[var(--radius-inner)] border border-dashed transition-all duration-300",
                                showCustom
                                    ? "bg-slate-100 border-slate-300 text-slate-900"
                                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            <Plus className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity" />
                            <span className="text-[10px] font-bold">Добавить</span>
                        </button>
                    )}
                </div>

                {showCustom && (
                    <div className="absolute -inset-3 z-[100] bg-white shadow-2xl rounded-[22px] border border-slate-200/60 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 h-fit">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 leading-none">Создание цвета</span>
                            <button type="button" onClick={() => setShowCustom(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative w-12 h-12 rounded-[var(--radius)] overflow-hidden border-2 border-slate-200 shrink-0 shadow-inner">
                                <input
                                    type="color"
                                    className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                                    value={customHex}
                                    onChange={(e) => setCustomHex(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 space-y-3">
                                <input
                                    type="text"
                                    placeholder="Название цвета..."
                                    className="w-full h-12 px-5 text-sm font-bold rounded-[var(--radius)] border border-slate-200 focus:border-slate-900 outline-none transition-all"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                                />
                                <button
                                    type="button"
                                    onClick={handleCustomSubmit}
                                    disabled={isSaving || !customName.trim()}
                                    className="w-full h-12 bg-slate-900 text-white rounded-[var(--radius)] text-xs font-bold hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? "..." : "Добавить"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
            <div className="space-y-4 relative">
                <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-semibold text-slate-900">{displayLabel}</label>
                    {allowCustom && (
                        <button
                            type="button"
                            onClick={() => setShowCustom(true)}
                            className="text-xs font-bold text-slate-400 flex items-center gap-1.5 hover:text-slate-600 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            {addLabel}
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

                {showCustom && (
                    <div className="absolute -inset-3 z-[100] bg-white shadow-2xl rounded-[22px] border border-slate-200/60 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 h-fit">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 leading-none">
                                {type === "brand" ? "Создание бренда" :
                                    type === "material" ? "Создание материала" :
                                        type === "size" ? "Создание размера" :
                                            type === "quality" ? "Создание качества" :
                                                displayLabel.toLowerCase() === "состав" ? "Создание состава" :
                                                    `Создание опции: ${displayLabel}`}
                            </span>
                            <button type="button" onClick={() => setShowCustom(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Название..."
                                className="w-full h-12 px-5 text-sm font-bold rounded-[var(--radius)] border border-slate-200 focus:border-slate-900 outline-none transition-all"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={handleCustomSubmit}
                                disabled={isSaving || !customName.trim()}
                                className="w-full h-12 bg-slate-900 text-white rounded-[var(--radius)] text-xs font-bold hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? "..." : "Добавить"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
