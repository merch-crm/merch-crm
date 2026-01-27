import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createInventoryAttribute, getInventoryAttributes } from "./actions";
import { CLOTHING_COLORS, CLOTHING_QUALITIES, CLOTHING_SIZES } from "./category-utils";
import { QualityDropdown } from "./quality-dropdown";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
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
        // Use static array for quality to maintain Base -> Premium order
        allOptions = [...CLOTHING_QUALITIES];
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

    const filteredOptions = allOptions.filter(opt =>
        opt.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <div className="space-y-4 w-full">
                <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-semibold text-slate-900">Цвет изделия</label>
                    {value && <span className="text-[10px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-[var(--radius)]">{value}</span>}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
                                "group relative aspect-square flex flex-col items-center justify-center gap-1.5 rounded-[var(--radius)] border transition-all duration-300",
                                value === c.code
                                    ? "bg-white border-slate-900 shadow-xl shadow-slate-200 scale-[1.02] z-10"
                                    : "bg-white border-slate-100 hover:border-slate-900 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60"
                            )}
                        >
                            <div
                                className="w-10 h-10 rounded-full border border-black/5 shadow-inner shrink-0 transition-all duration-300 group-hover:scale-125 group-hover:shadow-md"
                                style={{ backgroundColor: 'hex' in c ? (c as { name: string; code: string; hex: string }).hex : undefined }}
                            />
                            <span className={cn(
                                "text-xs font-medium truncate w-full px-2 text-center transition-colors duration-300",
                                value === c.code ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900"
                            )}>{c.name}</span>
                        </button>
                    ))}
                    {allowCustom && (
                        <button
                            type="button"
                            onClick={() => setShowCustom(true)}
                            className={cn(
                                "group aspect-square flex flex-col items-center justify-center gap-1.5 rounded-[var(--radius)] border border-dashed transition-all duration-300",
                                showCustom
                                    ? "bg-slate-100 border-slate-300 text-slate-900"
                                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            <Plus className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <span className="text-xs font-medium">Добавить</span>
                        </button>
                    )}
                </div>

                {showCustom && (
                    <div className="p-6 bg-white rounded-[var(--radius)] border border-slate-200 shadow-crm-xl space-y-5 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 leading-none">Новый цвет</span>
                            <button type="button" onClick={() => setShowCustom(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative w-14 h-14 rounded-[var(--radius)] overflow-hidden border-2 border-slate-100 shrink-0 shadow-inner">
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
                                    className="w-full h-11 bg-slate-900 text-white rounded-[var(--radius)] text-xs font-bold hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
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

    if (type === "material") {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-semibold text-slate-900">Материал</label>
                </div>
                <div className="flex flex-wrap gap-2">
                    {filteredOptions.map(m => (
                        <button
                            key={m.name}
                            type="button"
                            onClick={() => {
                                onChange(m.name, m.code);
                                setShowCustom(false);
                            }}
                            className={cn(
                                "h-10 px-5 rounded-[var(--radius)] text-xs font-medium transition-all border",
                                value === m.code
                                    ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]"
                                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-slate-50/50"
                            )}
                        >
                            {m.name}
                        </button>
                    ))}
                    {allowCustom && (
                        <button
                            type="button"
                            onClick={() => setShowCustom(true)}
                            className={cn(
                                "h-10 px-5 rounded-[var(--radius)] border border-dashed transition-all flex items-center gap-2",
                                showCustom
                                    ? "bg-slate-100 border-slate-300 text-slate-900"
                                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Добавить</span>
                        </button>
                    )}
                </div>

                {showCustom && (
                    <div className="w-full flex gap-2 animate-in fade-in slide-in-from-top-1 p-4 bg-white rounded-[var(--radius)] border border-slate-200">
                        <input
                            value={customName}
                            onChange={e => setCustomName(e.target.value)}
                            className="flex-1 h-10 px-4 rounded-[var(--radius)] border border-slate-200 text-sm font-bold placeholder:font-medium focus:border-slate-900 outline-none"
                            placeholder="Название материала..."
                            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                        />
                        <button
                            type="button"
                            onClick={handleCustomSubmit}
                            disabled={isSaving || !customName.trim()}
                            className="h-10 px-4 bg-slate-900 text-white rounded-[var(--radius)] text-xs font-bold hover:bg-black disabled:opacity-50"
                        >
                            {isSaving ? "..." : "OK"}
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (type === "size") {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-semibold text-slate-900">Размер</label>
                </div>
                <div
                    className="flex flex-wrap gap-2"
                >
                    {filteredOptions.map(s => (
                        <button
                            key={s.name}
                            type="button"
                            onClick={() => {
                                onChange(s.name, s.code);
                                if (onCodeChange) onCodeChange(s.code);
                            }}
                            className={cn(
                                "h-10 flex-1 min-w-max px-3 flex items-center justify-center rounded-[var(--radius)] text-xs font-bold transition-all border",
                                value === s.code
                                    ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200"
                                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-slate-50/50"
                            )}
                        >
                            {s.name}
                        </button>
                    ))}
                    {allowCustom && (
                        <button
                            type="button"
                            onClick={() => setShowCustom(true)}
                            className={cn(
                                "h-10 flex-1 min-w-max px-3 rounded-[var(--radius)] border border-dashed transition-all flex items-center justify-center gap-2",
                                showCustom
                                    ? "bg-slate-100 border-slate-300 text-slate-900"
                                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium leading-none">Добавить</span>
                        </button>
                    )}
                </div>

                {showCustom && (
                    <div className="w-full flex gap-2 animate-in fade-in slide-in-from-top-1 p-4 bg-white rounded-[var(--radius)] border border-slate-200">
                        <input
                            value={customName}
                            onChange={e => setCustomName(e.target.value)}
                            className="flex-1 h-10 px-4 rounded-[var(--radius)] border border-slate-200 text-sm font-bold placeholder:font-medium focus:border-slate-900 outline-none"
                            placeholder="Название размера..."
                            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                        />
                        <button
                            type="button"
                            onClick={handleCustomSubmit}
                            disabled={isSaving || !customName.trim()}
                            className="h-10 px-4 bg-slate-900 text-white rounded-[var(--radius)] text-xs font-bold hover:bg-black disabled:opacity-50"
                        >
                            {isSaving ? "..." : "OK"}
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (type === "brand" || !["color", "material", "size", "quality"].includes(type)) {
        const selectedOption = allOptions.find(opt => opt.code === value);
        const displayLabel = label || (type === "brand" ? "Бренд" : type);
        const addLabel = type === "brand" ? "Создать бренд" : "Создать опцию";

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-semibold text-slate-900">{displayLabel}</label>
                    <button
                        type="button"
                        onClick={() => setShowCustom(true)}
                        className="text-xs font-bold text-slate-900 flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {addLabel}
                    </button>
                </div>

                <div className="relative group">
                    {selectedOption ? (
                        <div className="w-full h-12 px-5 rounded-[var(--radius)] border border-slate-900 bg-slate-900 flex items-center justify-between shadow-lg shadow-slate-200 transition-all">
                            <span className="text-sm font-bold text-white whitespace-nowrap">
                                {selectedOption.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange("", "");
                                    if (onCodeChange) onCodeChange("");
                                    setSearchQuery("");
                                }}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <input
                                type="text"
                                placeholder={`Поиск...`}
                                value={searchQuery}
                                onFocus={() => setIsFocused(true)}
                                // Delay blur to allow click event on options to fire
                                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 px-5 rounded-[var(--radius)] border border-slate-100 bg-slate-50 text-sm font-medium placeholder:text-slate-300 focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all"
                            />
                            {(isFocused || searchQuery.length > 0) && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[var(--radius)] border border-slate-200 shadow-crm-xl z-[100] max-h-[220px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                                    {filteredOptions.length > 0 ? (
                                        filteredOptions.map(b => (
                                            <button
                                                key={b.name}
                                                type="button"
                                                onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                                                onClick={() => {
                                                    onChange(b.name, b.code);
                                                    if (onCodeChange) onCodeChange(b.code);
                                                    setSearchQuery("");
                                                    setIsFocused(false);
                                                }}
                                                className="w-full px-5 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-none transition-colors"
                                            >
                                                <span className="text-xs font-medium text-slate-600 leading-none block">
                                                    {b.name}
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-5 py-4 text-center">
                                            <p className="text-xs font-medium text-slate-400">Ничего не найдено</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {
                    showCustom && (
                        <div className="p-6 bg-white rounded-[var(--radius)] border border-slate-200 shadow-crm-xl space-y-5 animate-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 leading-none">{displayLabel}: Новая запись</span>
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
                                    className="w-full h-11 bg-slate-900 text-white rounded-[var(--radius)] text-xs font-bold hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? "..." : "Добавить"}
                                </button>
                            </div>
                        </div>
                    )
                }
            </div >
        );
    }

    // Quality - Custom Dark Dropdown
    if (type === "quality") {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-semibold text-slate-900">Качество ткани</label>
                </div>

                <QualityDropdown
                    value={value}
                    onChange={(name, code) => {
                        onChange(name, code);
                        if (onCodeChange) onCodeChange(code);
                    }}
                />

                <p className="px-1 text-[10px] font-medium text-slate-300">
                    {value === "PRM"
                        ? "✨ Выбрана повышенная плотность ткани"
                        : "Стандартная плотность ткани"}
                </p>
            </div>
        );
    }
}
