"use client";

import { useState, useEffect } from "react";
import { Plus, Palette, Settings2, ArrowRight } from "lucide-react";
import { Select } from "@/components/ui/select";
import { ColorPicker } from "@/components/ui/color-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInventoryAttribute, getInventoryAttributes } from "./attribute-actions";;
import { CLOTHING_COLORS, CLOTHING_QUALITIES, CLOTHING_SIZES } from "./category-utils";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useToast } from "@/components/ui/toast";

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

export function AttributeSelector({ type, value, onChange, onCodeChange, allowCustom = true, label, required }: AttributeSelectorProps) {
    const [showCustom, setShowCustom] = useState(false);
    const [customName, setCustomName] = useState("");
    const [customHex, setCustomHex] = useState("#000000");
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const [dbAttributes, setDbAttributes] = useState<DbAttribute[]>([]);

    useEffect(() => {
        const fetchAttrs = async () => {
            const res = await getInventoryAttributes();
            if (res.success && res.data) {
                setDbAttributes((res.data as unknown as DbAttribute[]).filter(a => a.type === type));
            }
        };
        fetchAttrs();
    }, [type]);

    const baseOptions = type === "color" ? CLOTHING_COLORS
        : type === "quality" ? CLOTHING_QUALITIES
            : [];

    const sizeOrder = ["kids", "s", "s-m", "m", "l", "xl"];
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
        allOptions = [...CLOTHING_SIZES];
        dbAttributes.forEach(dbAttr => {
            if (!allOptions.some(opt => opt.name.toLowerCase() === dbAttr.name.toLowerCase())) {
                allOptions.push({ name: dbAttr.name, code: dbAttr.value });
            }
        });
        allOptions = sortSizes(allOptions);
    } else if (!["quality", "color"].includes(type)) {
        allOptions = dbAttributes.map(dbAttr => ({ name: dbAttr.name, code: dbAttr.value }));
    } else if (type === "quality") {
        allOptions = [...CLOTHING_QUALITIES];
        dbAttributes.forEach(dbAttr => {
            if (!allOptions.some(opt => opt.name.toLowerCase() === dbAttr.name.toLowerCase())) {
                allOptions.push({ name: dbAttr.name, code: dbAttr.value });
            }
        });
    } else if (type === "color") {
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

    const CharacteristicsLink = () => (
        <Button
            type="button"
            variant="ghost"
            className="p-4 border border-slate-200/60 bg-slate-900/[0.03] hover:bg-primary/5 hover:border-primary/20 hover:bg-transparent shadow-none w-full h-auto mt-3 rounded-[var(--radius-inner)] transition-all group/link cursor-pointer flex items-center justify-between"
            onClick={() => {
                const win = window.open("/dashboard/warehouse/characteristics", "_blank");
                if (!win) {
                    toast("Браузер заблокировал открытие справочника. Разрешите всплывающие окна.", "error");
                }
            }}
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover/link:text-primary transition-colors">
                    <Settings2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <div className="text-[13px] font-bold text-slate-900 leading-tight">Справочник</div>
                    <div className="text-xs font-bold text-slate-400 tracking-tight">Полный список характеристик</div>
                </div>
            </div>
            <ArrowRight className="w-4 h-4 text-primary group-hover/link:translate-x-1 transition-all" />
        </Button>
    );

    const ModalFooter = ({ onSave, isSaving, disabled }: { onSave: () => void, isSaving: boolean, disabled: boolean }) => (
        <div className="sticky bottom-0 z-10 p-5 border-t border-slate-200 bg-white/95 backdrop-blur-md flex items-center sm:justify-end shrink-0 sm:rounded-b-[var(--radius-outer)] gap-3">
            <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCustom(false)}
                className="flex h-11 sm:w-auto sm:px-8 text-slate-400 hover:text-slate-600 font-bold text-sm"
            >
                Отмена
            </Button>

            <Button
                type="button"
                onClick={onSave}
                disabled={isSaving || disabled}
                variant="btn-dark"
                className="h-11 w-full sm:w-auto sm:px-8 rounded-[var(--radius-inner)] text-sm font-bold flex items-center justify-center gap-2"
            >
                {isSaving && (
                    <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                )}
                Сохранить
            </Button>
        </div>
    );

    const handleCustomSubmit = async () => {
        if (!customName.trim()) return;
        setIsSaving(true);

        const code = transliterate(customName.substring(0, 3).toUpperCase());
        const meta = type === "color" ? { hex: customHex } : undefined;

        const result = await createInventoryAttribute({ type, name: customName, value: code, meta });
        setIsSaving(false);

        if (result.success) {
            const res = await getInventoryAttributes();
            if (res.success && res.data) {
                setDbAttributes((res.data as unknown as DbAttribute[]).filter(a => a.type === type));
            }
            onChange(customName, code);
            if (onCodeChange) onCodeChange(code);
            setShowCustom(false);
            setCustomName("");
            setCustomHex("#000000");
        }
    };

    const CustomModal = () => {
        const displayLabel = label || (
            type === "brand" ? "Бренд" :
                type === "material" ? "Материал" :
                    type === "size" ? "Размер" :
                        type === "quality" ? "Качество ткани" : type
        );

        const title = type === "color" ? "Новый цвет" :
            type === "brand" ? "Новый бренд" :
                type === "material" ? "Новый материал" :
                    type === "size" ? "Новый размер" :
                        type === "quality" ? "Новое качество" :
                            displayLabel.toLowerCase() === "состав" ? "Новый состав" : "Новая опция";

        const subtitle = type === "color" ? "Добавление оттенка в палитру" : `Раздел: ${displayLabel}`;
        const Icon = type === "color" ? Palette : Plus;

        return (
            <ResponsiveModal
                isOpen={showCustom}
                onClose={() => setShowCustom(false)}
                className="w-full sm:max-w-md flex flex-col p-0 overflow-visible rounded-[var(--radius-outer)] bg-white border-none shadow-2xl"
                showVisualTitle={false}
            >
                <div className="flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center shrink-0">
                                <Icon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h2>
                                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                                    {subtitle}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-6 pb-5 bg-slate-50/30 overflow-y-auto custom-scrollbar space-y-4">
                        <div className={cn("grid gap-4", type !== "color" && "grid-cols-2")}>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Название</label>
                                <Input
                                    type="text"
                                    placeholder={type === "color" ? "Напр: Полночный синий" : "Напр: Muse Wear"}
                                    className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-900 shadow-sm"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                                    autoFocus
                                />
                            </div>

                            {type !== "color" ? (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Код (SKU)</label>
                                    <div className="h-11 px-4 rounded-[var(--radius-inner)] bg-slate-100/50 border border-slate-200 flex items-center text-slate-400 font-mono text-sm font-bold shadow-inner">
                                        {transliterate(customName.substring(0, 3).toUpperCase()) || "---"}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Выбор цвета</label>
                                    <div className="p-4 bg-white border border-slate-200 rounded-[var(--radius-inner)] shadow-sm">
                                        <ColorPicker color={customHex} onChange={setCustomHex} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {type !== "color" && (
                            <p className="text-xs text-slate-400 font-bold mt-4 ml-1 italic opacity-60">
                                Короткий код для артикула генерируется автоматически на основе названия
                            </p>
                        )}

                        <CharacteristicsLink />
                    </div>

                    <ModalFooter onSave={handleCustomSubmit} isSaving={isSaving} disabled={!customName.trim()} />
                </div>
            </ResponsiveModal>
        );
    };

    if (type === "color") {
        return (
            <div className={cn("space-y-2 w-full relative", showCustom && "z-50")}>
                <div className="mb-2 flex items-start justify-between">
                    <h4 className="text-base font-bold text-slate-900">
                        Цвет изделия {required && <span className="text-rose-500 ml-1">*</span>}
                    </h4>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-7 gap-2">
                    {allOptions.map(c => (
                        <Button
                            key={c.name}
                            type="button"
                            onClick={() => {
                                onChange(c.name, c.code);
                                if (onCodeChange) onCodeChange(c.code);
                            }}
                            className={cn(
                                "group relative h-[94px] flex flex-col items-center justify-center gap-1 rounded-[var(--radius)] border transition-all duration-300 shadow-sm p-0 w-auto",
                                value === c.code ? "bg-white border-slate-900 shadow-md z-10" : "bg-white border-slate-200 hover:border-slate-400 hover:shadow-md"
                            )}
                        >
                            <div
                                className="w-11 h-11 rounded-full border border-black/5 shadow-inner shrink-0 transition-all duration-300 group-hover:shadow-md"
                                style={{ backgroundColor: c.hex }}
                            />
                            <span className={cn(
                                "text-xs font-bold truncate w-full px-2 text-center transition-colors duration-300",
                                value === c.code ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900"
                            )}>{c.name}</span>
                        </Button>
                    ))}
                    {allowCustom && (
                        <Button
                            type="button"
                            onClick={() => setShowCustom(true)}
                            className="group h-[94px] flex flex-col items-center justify-center gap-1 rounded-[var(--radius)] border border-dashed border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md p-0 w-auto"
                        >
                            <span className="text-xs font-bold">Добавить</span>
                        </Button>
                    )}
                </div>
                <CustomModal />
            </div>
        );
    }

    const displayLabel = label || (
        type === "brand" ? "Бренд" :
            type === "material" ? "Материал" :
                type === "size" ? "Размер" :
                    type === "quality" ? "Качество ткани" : type
    );

    const addLabel = type === "brand" ? "Создать бренд" :
        type === "material" ? "Создать материал" :
            type === "size" ? "Создать размер" :
                type === "quality" ? "Создать качество" :
                    label ? `Создать ${label.toLowerCase()}` : "Создать опцию";

    const placeholder = type === "brand" ? "Выберите бренд..." :
        type === "material" ? "Выберите материал..." :
            type === "size" ? "Выберите размер..." :
                type === "quality" ? "Выберите качество..." : `Выберите ${displayLabel.toLowerCase()}...`;

    return (
        <div className={cn("space-y-2 relative w-full", showCustom && "z-50")}>
            <div className="mb-2 flex items-baseline justify-between gap-3 overflow-hidden">
                <h4 className="text-base font-bold text-slate-900 truncate">
                    {displayLabel} {required && <span className="text-rose-500 ml-1">*</span>}
                </h4>
                {allowCustom && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCustom(true)}
                        className="flex items-center py-1 text-slate-400 hover:text-slate-900 transition-all shrink-0 h-auto"
                    >
                        <span className="text-xs font-bold whitespace-nowrap">{addLabel}</span>
                    </Button>
                )}
            </div>

            <Select
                options={allOptions.map(opt => ({ id: opt.code, title: opt.name }))}
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
            <CustomModal />
        </div>
    );
}
