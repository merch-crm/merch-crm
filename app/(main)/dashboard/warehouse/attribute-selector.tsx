"use client";

import { useState, useEffect, useMemo } from "react";
import { Settings2, ArrowRight } from "lucide-react";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createInventoryAttribute, getInventoryAttributes, getInventoryAttributeTypes } from "./attribute-actions";
import { useToast } from "@/components/ui/toast";
import { AttributeType } from "./types";
import { AttributeCustomModal } from "./attribute-custom-modal";
import { transliterateToSku } from "@/app/(main)/dashboard/warehouse/utils/characteristic-helpers";

interface AttributeSelectorProps {
    type: string;
    value: string;
    onChange: (value: string, code: string) => void;
    onCodeChange?: (code: string) => void;
    allowCustom?: boolean;
    label?: string;
    description?: string;
    required?: boolean;
    categoryId?: string;
}

interface DbAttribute {
    id: string;
    type: string;
    name: string;
    value: string;
    meta: Record<string, unknown> | null;
}



const UNIT_DISPLAY_NAMES: Record<string, string> = {
    "PCS": "шт",
    "PAR": "пар",
    "SET": "компл",
    "PKG": "уп",
    "ROL": "рул",
    "L": "л",
    "M": "м",
    "MM": "мм",
    "CM": "см",
    "G": "г",
    "KG": "кг",
    "ML": "мл"
};

export function AttributeSelector({
    type,
    value,
    onChange,
    onCodeChange,
    allowCustom = true,
    label,
    required,
    categoryId
}: AttributeSelectorProps) {
    const [showCustom, setShowCustom] = useState(false);
    const [customForm, setCustomForm] = useState({
        name: "",
        hex: "#000000",
        l: "",
        w: "",
        h: "",
        u: "MM" as "MM" | "CM" | "M",
        weightUnit: "G" as "G" | "KG",
        volumeUnit: "ML" as "ML" | "L",
        quantityUnit: "PCS" as string,
        composition: [{ name: "", percent: "" }] as { name: string; percent: string }[],
        fullName: "",
        shortName: "",
        code: "",
        isCodeManuallyEdited: false,
        measureValue: "",
        measureUnit: ""
    });
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const [dbAttributes, setDbAttributes] = useState<DbAttribute[]>([]);
    const [attributeTypes, setAttributeTypes] = useState<AttributeType[]>([]);

    const resolvedTypeSlug = useMemo(() => {
        if (!categoryId) return type;
        const specificType = attributeTypes.find(t =>
            t.categoryId === categoryId &&
            (t.slug === type || (type === 'color' && t.dataType === 'color'))
        );
        return specificType ? specificType.slug : type;
    }, [type, categoryId, attributeTypes]);

    useEffect(() => {
        const fetchData = async () => {
            const [attrRes, typeRes] = await Promise.all([
                getInventoryAttributes(),
                getInventoryAttributeTypes()
            ]);

            if (typeRes.success && typeRes.data) {
                setAttributeTypes(typeRes.data as unknown as AttributeType[]);
            }

            if (attrRes.success && attrRes.data) {
                const allFetchedAttrs = attrRes.data as unknown as DbAttribute[];
                setDbAttributes(allFetchedAttrs.filter(a => a.type === resolvedTypeSlug));
            }
        };
        fetchData();
    }, [resolvedTypeSlug]);

    const currentAttributeType = attributeTypes.find(t => t.slug === resolvedTypeSlug);
    const isColorType = currentAttributeType?.dataType === "color" || currentAttributeType?.hasColor || type === "color";
    const isDimensions = currentAttributeType?.dataType === "dimensions";
    const isWeight = currentAttributeType?.dataType === "weight";
    const isVolume = currentAttributeType?.dataType === "volume";
    const isDensity = currentAttributeType?.dataType === "density";
    const isComposition = currentAttributeType?.dataType === "composition";
    const isQuantity = currentAttributeType?.dataType === "quantity";

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
        allOptions = dbAttributes.map(dbAttr => ({ name: dbAttr.name, code: dbAttr.value }));
        allOptions = sortSizes(allOptions);
    } else if (isColorType) {
        allOptions = dbAttributes.map(dbAttr => ({
            name: dbAttr.name,
            code: dbAttr.value,
            hex: (dbAttr.meta as { hex?: string })?.hex || "#000000"
        }));
    } else {
        allOptions = dbAttributes.map(dbAttr => ({ name: dbAttr.name, code: dbAttr.value }));
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
                    <div className="text-xs font-bold text-slate-400 ">Полный список характеристик</div>
                </div>
            </div>
            <ArrowRight className="w-4 h-4 text-primary group-hover/link:translate-x-1 transition-all" />
        </Button>
    );


    const handleCustomSubmit = async () => {
        let code = "";
        let finalName = "";
        let meta: Record<string, unknown> | undefined = undefined;

        if (isDimensions) {
            code = `${customForm.l}${customForm.w}${customForm.h}${customForm.u}`;
            finalName = `${customForm.l}×${customForm.w}×${customForm.h} ${UNIT_DISPLAY_NAMES[customForm.u] || customForm.u}`;
            meta = {
                length: customForm.l,
                width: customForm.w,
                height: customForm.h,
                dimensionUnit: customForm.u
            };
        } else if (isWeight) {
            code = `${customForm.name}${customForm.weightUnit}`;
            finalName = `${customForm.name} ${UNIT_DISPLAY_NAMES[customForm.weightUnit] || customForm.weightUnit}`;
            meta = { weight: customForm.name, unit: customForm.weightUnit };
        } else if (isVolume) {
            code = `${customForm.name}${customForm.volumeUnit}`;
            finalName = `${customForm.name} ${UNIT_DISPLAY_NAMES[customForm.volumeUnit] || customForm.volumeUnit}`;
            meta = { volume: customForm.name, unit: customForm.volumeUnit };
        } else if (isDensity) {
            code = `${customForm.name}GSM`;
            finalName = `${customForm.name} г/м²`;
            meta = { density: customForm.name };
        } else if (isQuantity) {
            code = `${customForm.name}${customForm.quantityUnit}`;
            finalName = `${customForm.name} ${UNIT_DISPLAY_NAMES[customForm.quantityUnit] || customForm.quantityUnit}`;
            meta = { quantity: customForm.name, unit: customForm.quantityUnit };
        } else if (isComposition) {
            const sum = customForm.composition.reduce((acc, curr) => acc + (parseInt(curr.percent) || 0), 0);
            if (sum !== 100) {
                toast("Сумма должна быть равна 100%", "error");
                setIsSaving(false);
                return;
            }
            finalName = customForm.composition
                .filter(c => c.name && c.percent)
                .map(c => `${c.name} ${c.percent}%`)
                .join(", ");
            code = customForm.composition
                .filter(c => c.name && c.percent)
                .map(c => `${transliterateToSku(c.name.substring(0, 2)).toUpperCase()}${c.percent}`)
                .join("");
            meta = { items: customForm.composition };
        } else {
            code = customForm.isCodeManuallyEdited ? customForm.code : transliterateToSku(customForm.name).toUpperCase();
            finalName = customForm.name;
            if (isColorType) meta = { hex: customForm.hex };
            meta = {
                ...meta,
                fullName: customForm.fullName,
                shortName: customForm.shortName,
                measureValue: (currentAttributeType?.hasUnits || currentAttributeType?.hasComposition) ? customForm.measureValue : undefined,
                measureUnit: currentAttributeType?.hasUnits ? customForm.measureUnit : undefined
            };
        }

        const result = await createInventoryAttribute({ type: resolvedTypeSlug, name: finalName, value: code, meta });
        setIsSaving(false);

        if (result.success) {
            const res = await getInventoryAttributes();
            if (res.success && res.data) {
                setDbAttributes((res.data as unknown as DbAttribute[]).filter(a => a.type === type));
            }
            onChange(finalName, code);
            if (onCodeChange) onCodeChange(code);
            setShowCustom(false);
            setCustomForm({
                name: "",
                hex: "#000000",
                l: "",
                w: "",
                h: "",
                u: "MM",
                weightUnit: "G",
                volumeUnit: "ML",
                quantityUnit: "PCS",
                composition: [{ name: "", percent: "" }],
                fullName: "",
                shortName: "",
                code: "",
                isCodeManuallyEdited: false,
                measureValue: "",
                measureUnit: ""
            });
        }
    };

    const sharedModalProps = {
        isOpen: showCustom,
        onClose: () => setShowCustom(false),
        type,
        label,
        customForm,
        setCustomForm,
        isSaving,
        onSave: handleCustomSubmit,
        currentAttributeType,
        transliterate: transliterateToSku,
        CharacteristicsLink,
    };

    if (isColorType) {
        return (
            <div className={cn("space-y-2 w-full relative", showCustom && "z-50")}>
                <div className="mb-2 flex items-start justify-between">
                    <h4 className="text-base font-bold text-slate-900">
                        {label || "Цвет изделия"} {required && <span className="text-rose-500 ml-1">*</span>}
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
                        <button
                            type="button"
                            onClick={() => setShowCustom(true)}
                            className="group h-[94px] flex flex-col items-center justify-center gap-1.5 rounded-[14px] border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400 hover:border-slate-300 hover:text-slate-600 hover:bg-slate-100/50 transition-all shadow-none p-0 w-auto cursor-pointer"
                        >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-400 shadow-sm transition-all group-hover:scale-105 group-hover:text-slate-600 group-hover:border-slate-300">
                                <span className="text-lg leading-none mb-0.5">+</span>
                            </div>
                            <span className="text-[11px] font-bold">Добавить</span>
                        </button>
                    )}
                </div>
                <AttributeCustomModal {...sharedModalProps} />
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
            <AttributeCustomModal {...sharedModalProps} />
        </div>
    );
}

