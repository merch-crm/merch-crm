import { LayoutGrid, Tag, Ruler, CheckCircle2, Shirt, Scale, Box, Package, ExternalLink } from "lucide-react";
import { ItemFormData, InventoryAttribute, AttributeType } from "@/app/(main)/dashboard/warehouse/types";

interface AttributesSectionProps {
    formData: ItemFormData;
    dynamicAttributes: InventoryAttribute[];
    attributeTypes: AttributeType[];
    selectedColorName?: string;
    selectedColorHex?: string;
    getAttrName: (type: string, code?: string) => string | null | undefined;
}

export function AttributesSection({
    formData,
    dynamicAttributes,
    attributeTypes,
    selectedColorName,
    selectedColorHex,
    getAttrName
}: AttributesSectionProps) {
    return (
        <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
            <div className="px-8 py-8 sm:py-8 flex items-center justify-between border-b border-slate-100/60">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[14px] bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10">
                        <LayoutGrid className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight">Характеристики</h3>
                        <p className="text-xs font-bold text-slate-500 mt-0.5">Атрибуты позиции</p>
                    </div>
                </div>
            </div>

            <div className="p-8 sm:p-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                        { label: "Бренд", value: getAttrName("brand", formData.brandCode), icon: Tag },
                        { label: "Цвет", value: selectedColorName, icon: () => <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: selectedColorHex }} /> },
                        { label: "Размер", value: getAttrName("size", formData.sizeCode), icon: Ruler },
                        { label: "Качество", value: getAttrName("quality", formData.qualityCode), icon: CheckCircle2 },
                        { label: "Материал", value: getAttrName("material", formData.materialCode), icon: Shirt },
                        // Packaging specific
                        {
                            label: "Габариты",
                            value: (formData.width && formData.height && formData.depth)
                                ? `${formData.depth}×${formData.width}×${formData.height}`
                                : null,
                            icon: Box
                        },
                        {
                            label: "Вес (1 шт)",
                            value: formData.weight ? `${formData.weight} гр` : null,
                            icon: Scale
                        },
                        {
                            label: "Тип упаковки",
                            value: formData.packagingType ? (formData.packagingType === "transport" ? "Транспортная" : "Индивидуальная") : null,
                            icon: Package
                        }
                    ].filter(i => i.value).map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div key={idx} className="flex flex-col p-5 rounded-[24px] bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors">
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[11px] font-black text-slate-400">{item.label}</span>
                                </div>
                                <span className="text-base font-black text-slate-900 leading-tight">{item.value}</span>
                            </div>
                        )
                    })}
                </div>

                {/* Packaging - Logistics & Features */}
                {(formData.supplierName || (formData.features && formData.features.length > 0)) && (
                    <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.supplierName && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-slate-400 leading-none">Логистика</h4>
                                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500">Поставщик:</span>
                                        <span className="text-sm font-bold text-slate-900">{formData.supplierName}</span>
                                    </div>
                                    {formData.minBatch && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500">Мин. партия:</span>
                                            <span className="text-sm font-bold text-slate-900">{formData.minBatch} шт</span>
                                        </div>
                                    )}
                                    {formData.supplierLink && (
                                        <div className="pt-2">
                                            <a
                                                href={formData.supplierLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Страница товара
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {formData.features && formData.features.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-slate-400 leading-none">Особенности</h4>
                                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                                    {formData.features.includes("glued_valve") && (
                                        <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">Клеевой клапан</span>
                                    )}
                                    {formData.features.includes("tear_tape") && (
                                        <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">Отрывная лента</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Custom Extra Attributes if any */}
                {(() => {
                    const predefinedKeys = ["brand", "color", "size", "quality", "material", "width", "height", "depth", "weight", "packagingType", "supplierName", "supplierLink", "minBatch", "features"];

                    const filteredItems = Object.entries(formData.attributes || {})
                        .map(([key, value]) => {
                            if (!value || typeof value !== 'string') return null;
                            if (predefinedKeys.includes(key.toLowerCase())) return null;
                            if (/^[a-f0-9-]{36}$/.test(key) || /^[a-f0-9-]{36}$/.test(value)) return null;

                            const type = attributeTypes?.find(t => t.slug === key);
                            if (!type) return null;

                            const attr = dynamicAttributes?.find(a => a.type === key && a.value === value);
                            let displayValue = attr?.name || value;

                            // Страна всегда с большой буквы
                            const isCountry = type.slug === 'country' || type.name.toLowerCase().includes('страна');
                            if (isCountry && displayValue) {
                                displayValue = displayValue.charAt(0).toUpperCase() + displayValue.slice(1);
                            }

                            return {
                                label: type.name,
                                displayValue,
                                slug: key,
                                showInName: type.showInName !== false
                            };
                        })
                        .filter((chip): chip is NonNullable<typeof chip> => {
                            if (!chip) return false;
                            if (!chip.showInName) return false;
                            const lowerSlug = chip.slug.toLowerCase();
                            if (lowerSlug.endsWith('code')) return false;
                            if (["thumbnailsettings"].includes(lowerSlug)) return false;
                            return true;
                        });

                    if (filteredItems.length === 0) return null;

                    return (
                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <div className="flex flex-wrap gap-3">
                                {filteredItems.map((chip) => (
                                    <div key={chip.slug} className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/50 flex items-center gap-3 shadow-sm group hover:border-slate-300 transition-all">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-900 transition-colors" />
                                        <span className="text-[11px] font-bold text-slate-700">{chip.label}:</span>
                                        <span className="text-sm font-bold text-slate-900">{chip.displayValue}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}
