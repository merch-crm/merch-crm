import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createInventoryAttribute, getInventoryAttributes } from "./actions";
import { CLOTHING_COLORS, CLOTHING_MATERIALS, CLOTHING_SIZES, CLOTHING_QUALITIES } from "./category-utils";

interface AttributeSelectorProps {
    type: "color" | "material" | "size" | "quality";
    value: string;
    onChange: (value: string, code: string) => void;
    onCodeChange?: (code: string) => void;
    allowCustom?: boolean;
}

interface DbAttribute {
    id: string;
    type: string;
    name: string;
    value: string;
    meta: Record<string, any> | null;
}

export function AttributeSelector({ type, value, onChange, onCodeChange, allowCustom = true }: AttributeSelectorProps) {
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

    const baseOptions = type === "color" ? CLOTHING_COLORS
        : type === "material" ? CLOTHING_MATERIALS
            : type === "size" ? CLOTHING_SIZES
                : CLOTHING_QUALITIES;

    // Merge base options with DB attributes, ensuring uniqueness by name
    const allOptions = [...baseOptions];
    dbAttributes.forEach(dbAttr => {
        if (!allOptions.some(opt => opt.name === dbAttr.name)) {
            allOptions.push({
                name: dbAttr.name,
                code: dbAttr.value,
                ...(type === "color" ? { hex: dbAttr.meta?.hex || "#000000" } : {})
            });
        }
    });

    const handleCustomSubmit = async () => {
        if (!customName.trim()) return;

        setIsSaving(true);

        const code = customName.substring(0, 3).toUpperCase();
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
            onChange(customName, code);
            if (onCodeChange) onCodeChange(code);
            setShowCustom(false);
            setCustomName("");
            setCustomHex("#000000");
        }
    };

    if (type === "color") {
        return (
            <div className="space-y-4">
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">Цвет</label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {allOptions.map(c => (
                        <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                                onChange(c.name, c.code);
                                if (onCodeChange) onCodeChange(c.code);
                                setShowCustom(false);
                            }}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all shadow-sm",
                                value === c.name ? "bg-white border-indigo-400 ring-4 ring-indigo-500/10" : "bg-white/50 border-slate-100 hover:border-slate-200"
                            )}
                        >
                            <div className="w-6 h-6 rounded-full border border-slate-200 shadow-sm shrink-0" style={{ backgroundColor: 'hex' in c ? (c as { name: string; code: string; hex: string }).hex : undefined }} />
                            <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center">{c.name}</span>
                        </button>
                    ))}
                    {allowCustom && (
                        <button
                            type="button"
                            onClick={() => setShowCustom(true)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all border-dashed shadow-sm min-h-[70px]",
                                showCustom ? "bg-indigo-50 border-indigo-400 text-indigo-600" : "bg-white/30 border-slate-200 text-slate-400 hover:bg-white hover:border-slate-300"
                            )}
                        >
                            <Plus className="w-5 h-5" />
                            <span className="text-[10px] font-bold">Свой</span>
                        </button>
                    )}
                </div>

                {showCustom && (
                    <div className="p-6 bg-white rounded-3xl border border-indigo-100 shadow-xl space-y-5 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Создание нового цвета</span>
                            <button type="button" onClick={() => setShowCustom(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-100 shrink-0 shadow-inner">
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
                                    className="w-full h-14 px-5 text-sm font-bold rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                                />
                                <button
                                    type="button"
                                    onClick={handleCustomSubmit}
                                    disabled={isSaving || !customName.trim()}
                                    className="w-full h-11 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? "Сохранение..." : "Добавить и применить"}
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
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">Материал</label>
                <div className="flex flex-wrap gap-2">
                    {allOptions.map(m => (
                        <button
                            key={m.name}
                            type="button"
                            onClick={() => {
                                onChange(m.name, m.code);
                                setShowCustom(false);
                            }}
                            className={cn(
                                "h-10 px-6 rounded-xl text-sm font-bold transition-all border shadow-sm",
                                value === m.name ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-100" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
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
                                "h-10 px-4 rounded-xl border border-dashed transition-all flex items-center gap-1.5",
                                showCustom ? "bg-indigo-50 border-indigo-400 text-indigo-600" : "bg-white/30 border-slate-300 text-slate-400 hover:border-indigo-300 hover:text-indigo-500"
                            )}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold uppercase tracking-wider">Свой</span>
                        </button>
                    )}
                </div>

                {showCustom && (
                    <div className="w-full flex gap-2 animate-in fade-in slide-in-from-top-1 p-4 bg-white rounded-2xl border border-indigo-100">
                        <input
                            value={customName}
                            onChange={e => setCustomName(e.target.value)}
                            className="flex-1 h-10 px-4 rounded-xl border border-slate-200 text-sm font-bold placeholder:font-medium focus:border-indigo-500 outline-none"
                            placeholder="Введите название материала..."
                            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                        />
                        <button
                            type="button"
                            onClick={handleCustomSubmit}
                            disabled={isSaving || !customName.trim()}
                            className="h-10 px-4 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50"
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
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">Размер</label>
                <div className="flex flex-wrap gap-2">
                    {allOptions.map(s => (
                        <button
                            key={s.name}
                            type="button"
                            onClick={() => {
                                onChange(s.name, s.code);
                                if (onCodeChange) onCodeChange(s.code);
                            }}
                            className={cn(
                                "h-10 px-6 rounded-xl text-sm font-bold transition-all border shadow-sm",
                                value === s.name ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-100" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                            )}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Quality
    return (
        <div className="space-y-4">
            <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">Качество</label>
            <div className="flex gap-3">
                {allOptions.map(q => (
                    <button
                        key={q.name}
                        type="button"
                        onClick={() => {
                            onChange(q.name, q.code);
                            if (onCodeChange) onCodeChange(q.code);
                        }}
                        className={cn(
                            "flex-1 h-12 rounded-xl text-sm font-bold transition-all border shadow-sm",
                            value === q.name ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-100" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                        )}
                    >
                        {q.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
