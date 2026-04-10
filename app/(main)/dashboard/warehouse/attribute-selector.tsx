"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Settings2, ArrowRight,
  Tag, Hash, Shapes, Palette, Box, Layers, Maximize,
  Globe, Droplets, Package, Component, Waves, Wrench, Paperclip, Scale
} from "lucide-react";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createInventoryAttribute, getInventoryAttributes, getInventoryAttributeTypes } from "./attribute-actions";
import { useToast } from "@/components/ui/toast";
import { AttributeType } from "./types";
import { type IconType } from "@/components/ui/stat-card";

// Simple promise cache to deduplicate concurrent requests when rendering multiple selectors
let _sharedAttributesPromise: Promise<{ success: boolean; data?: unknown }> | null = null;
let _sharedAttributeTypesPromise: Promise<{ success: boolean; data?: unknown }> | null = null;

async function fetchAttributesDeduplicated() {
  if (!_sharedAttributesPromise) {
    _sharedAttributesPromise = getInventoryAttributes().finally(() => {
      setTimeout(() => { _sharedAttributesPromise = null; }, 2000);
    });
  }
  return _sharedAttributesPromise;
}

async function fetchAttributeTypesDeduplicated() {
  if (!_sharedAttributeTypesPromise) {
    _sharedAttributeTypesPromise = getInventoryAttributeTypes().finally(() => {
      setTimeout(() => { _sharedAttributeTypesPromise = null; }, 2000);
    });
  }
  return _sharedAttributeTypesPromise;
}
import { AttributeCustomModal } from "./attribute-custom-modal";
import { transliterateToSku } from "@/app/(main)/dashboard/warehouse/utils/characteristic-helpers";


const DATA_TYPE_ICONS: Record<string, IconType> = {
  text: Shapes, unit: Paperclip, color: Palette, dimensions: Box, quantity: Hash,
  composition: Component, material: Layers, size: Maximize, brand: Tag,
  country: Globe, density: Waves, weight: Scale, volume: Droplets,
  package: Package, consumable: Wrench,
};

const _DATA_TYPE_GRADIENTS: Record<string, string> = {
  text: "from-slate-400 to-slate-500 shadow-slate-500/20",
  unit: "from-sky-400 to-blue-500 shadow-sky-500/20",
  color: "from-rose-400 to-red-500 shadow-rose-500/20",
  dimensions: "from-violet-500 to-purple-600 shadow-violet-500/20",
  quantity: "from-indigo-500 to-blue-600 shadow-indigo-500/20",
  composition: "from-cyan-400 to-blue-500 shadow-cyan-500/20",
  material: "from-emerald-500 to-teal-500 shadow-emerald-500/20",
  size: "from-blue-500 to-indigo-600 shadow-blue-500/20",
  brand: "from-amber-400 to-orange-500 shadow-amber-500/20",
  country: "from-blue-400 to-indigo-500 shadow-blue-500/20",
  density: "from-teal-400 to-emerald-500 shadow-teal-500/20",
  weight: "from-orange-400 to-rose-500 shadow-orange-500/20",
  volume: "from-cyan-400 to-sky-500 shadow-cyan-500/20",
  package: "from-violet-400 to-purple-500 shadow-violet-500/20",
  consumable: "from-amber-500 to-orange-600 shadow-amber-500/20",
};




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
  initialAttributeType?: AttributeType;
  headerAction?: React.ReactNode;
}

interface DbAttribute {
  id: string;
  type: string;
  name: string;
  value: string;
  meta: Record<string, unknown> | null;
  categoryId?: string | null;
}



const UNIT_DISPLAY_NAMES: Record<string, string> = {
  "PCS": "шт", "PAR": "пар", "SET": "компл", "PKG": "уп", "ROL": "рул", "L": "л", "M": "м", "MM": "мм", "CM": "см", "G": "г", "KG": "кг", "ML": "мл"
};

export function AttributeSelector({
  type,
  value,
  onChange,
  onCodeChange,
  allowCustom = true,
  label,
  required,
  categoryId,
  initialAttributeType,
  headerAction
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
  const [attributeTypes, setAttributeTypes] = useState<AttributeType[]>(initialAttributeType ? [initialAttributeType] : []);

  const resolvedTypeSlug = useMemo(() => {
    if (initialAttributeType) return initialAttributeType.slug;
    return type;
  }, [type, initialAttributeType]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [attrRes, typeRes] = await Promise.all([
          fetchAttributesDeduplicated(),
          fetchAttributeTypesDeduplicated()
        ]);

        if (!isMounted) return;

        if (typeRes.success && typeRes.data) {
          const newData = typeRes.data as unknown as AttributeType[];
          // Only update if actually different to prevent loops
          setAttributeTypes(prev => {
            if (JSON.stringify(prev) === JSON.stringify(newData)) return prev;
            return newData;
          });
        }

        if (attrRes.success && attrRes.data) {
          const allFetchedAttrs = attrRes.data as unknown as DbAttribute[];
          const filtered = allFetchedAttrs.filter(a =>
            (a.type === resolvedTypeSlug || a.type === type) &&
            (a.categoryId === (categoryId || null) || a.categoryId === null)
          );
          setDbAttributes(prev => {
            if (JSON.stringify(prev) === JSON.stringify(filtered)) return prev;
            return filtered;
          });
        }
      } catch (error) {
        console.error("Error fetching attributes:", error);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [resolvedTypeSlug, categoryId, type]);

  const currentAttributeType = attributeTypes.find(t => t.slug === resolvedTypeSlug);
  const isColorType = currentAttributeType?.dataType === "color" || currentAttributeType?.hasColor || type === "color";
  const isDimensions = currentAttributeType?.dataType === "dimensions";
  const isWeight = currentAttributeType?.dataType === "weight";
  const isVolume = currentAttributeType?.dataType === "volume";
  const isDensity = currentAttributeType?.dataType === "density";
  const isComposition = currentAttributeType?.dataType === "composition";

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
    allOptions = dbAttributes.map(dbAttr => ({
      name: (dbAttr.meta as { fullName?: string })?.fullName || dbAttr.name,
      code: dbAttr.value
    }));
    allOptions = sortSizes(allOptions);
  } else if (isColorType) {
    allOptions = dbAttributes.map(dbAttr => ({
      name: (dbAttr.meta as { fullName?: string })?.fullName || dbAttr.name,
      code: dbAttr.value,
      hex: (dbAttr.meta as { hex?: string })?.hex || "#000000"
    }));
  } else {
    allOptions = dbAttributes.map(dbAttr => {
      const baseName = (dbAttr.meta as { fullName?: string })?.fullName || dbAttr.name;
      const name = isDensity && !baseName.includes("г/м²") ? `${baseName} г/м²` : baseName;
      return {
        name,
        code: dbAttr.value
      };
    });
  }

  const CharacteristicsLink = () => (
    <Button type="button" variant="ghost" className="p-4 border border-slate-200/60 bg-slate-900/[0.03] hover:bg-primary/5 hover:border-primary/20 hover:bg-transparent shadow-none w-full h-auto mt-3 rounded-[var(--radius-inner)] transition-all group/link cursor-pointer flex items-center justify-between" onClick={() => {
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
          <div className="text-xs font-bold text-slate-900 leading-tight">Справочник</div>
          <div className="text-xs font-bold text-slate-400">Полный список характеристик</div>
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
        .join(",");
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
        setDbAttributes((res.data as unknown as DbAttribute[]).filter(a => a.type === resolvedTypeSlug));
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4 text-slate-500" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">
              {label || "Цвет изделия"} {required && <span className="text-rose-500 ml-1">*</span>}
            </h4>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {allowCustom && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowCustom(true)}
                className="h-auto p-0 px-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <span className="text-xs font-bold mr-1">+</span>
                <span className="text-xs font-bold">Добавить</span>
              </Button>
            )}
            {headerAction}
          </div>
        </div>
        <Select options={allOptions.map(c => ({
            id: c.code,
            title: c.name || c.code,
            icon: (
              <div
                className="w-4 h-4 rounded-[4px] border border-black/10 shadow-inner shrink-0"
                style={{ backgroundColor: c.hex || "#000000" }}
              />
            ),
          }))}
          value={value || ""}
          onChange={(code) => {
            if (!code) {
              onChange("", "");
              if (onCodeChange) onCodeChange("");
              return;
            }
            const opt = allOptions.find(o => o.code === code);
            if (opt) {
              onChange(opt.name, opt.code);
              if (onCodeChange) onCodeChange(opt.code);
            }
          }}
          placeholder="Выберите цвет..."
          autoLayout={false}
          showSearch={allOptions.length > 8}
          clearable={true}
          className="h-11 rounded-xl border-slate-200 bg-white shadow-none"
        />
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

  const _addLabel = "+ Добавить";

  const placeholder = type === "brand" ? "Выберите бренд..." :
    type === "material" ? "Выберите материал..." :
      type === "size" ? "Выберите размер..." :
        type === "quality" ? "Выберите качество..." : `Выберите ${displayLabel.toLowerCase()}...`;


  return (
    <div className={cn("space-y-2 relative w-full", showCustom && "z-50")}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {(() => {
            const dataType = currentAttributeType?.dataType || type;
            const Icon = DATA_TYPE_ICONS[dataType] || DATA_TYPE_ICONS.text;

            return (
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-slate-500" />
              </div>
            );
          })()}
          <h4 className="text-xs font-bold text-slate-800 truncate">
            {displayLabel} {required && <span className="text-rose-500 ml-1">*</span>}
          </h4>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {allowCustom && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowCustom(true)}
              className="h-auto p-0 px-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <span className="text-xs font-bold mr-1">+</span>
              <span className="text-xs font-bold">Добавить</span>
            </Button>
          )}
          {headerAction}
        </div>
      </div>

      <Select options={Array.from(new Map(allOptions.map(opt => [
          opt.code,
          { id: opt.code, title: opt.name || String(opt.code) }
        ])).values())}
        value={value || ""}
        onChange={(code) => {
          if (!code) {
            onChange("", "");
            if (onCodeChange) onCodeChange("");
            return;
          }
          const opt = allOptions.find(o => o.code === code);
          if (opt) {
            onChange(opt.name, opt.code);
            if (onCodeChange) onCodeChange(opt.code);
          }
        }}
        placeholder={placeholder}
        autoLayout={true}
        gridColumns={type === "size" ? 3 : undefined}
        showSearch={type === "brand"}
        clearable={true}
        className="h-11 rounded-xl border-slate-200 bg-white shadow-none"
      />
      <AttributeCustomModal {...sharedModalProps} />
    </div>
  );
}

