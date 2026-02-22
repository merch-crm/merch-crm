import { LayoutGrid, Tag, Ruler, CheckCircle2, Shirt, Scale, Box, Package, ExternalLink } from "lucide-react";
import { formatUnit } from "@/lib/utils";
import { ItemFormData, InventoryAttribute } from "@/app/(main)/dashboard/warehouse/types";

interface AttributesSectionProps {
    formData: ItemFormData;
    dynamicAttributes: InventoryAttribute[];
    selectedColorName?: string;
    selectedColorHex?: string;
    getAttrName: (type: string, code?: string) => string | null | undefined;
}

export function AttributesSection({
    formData,
    selectedColorName,
    selectedColorHex,
    getAttrName
}: AttributesSectionProps) {
    const predefinedAttributesKeys = [
        "Бренд", "Цвет", "Размер", "Качество", "Материал",
        "width", "height", "depth", "packagingType",
        "supplierName", "supplierLink", "minBatch", "weight", "features"
    ];

    const hasCustomAttributes = formData.attributes && Object.keys(formData.attributes).some(k => !predefinedAttributesKeys.includes(k));

    return (
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 sm:p-6 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
                        <LayoutGrid className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 ">Характеристики</h3>
                        <p className="text-xs font-bold text-slate-700">Атрибуты позиции</p>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3">
                    {[
                        { label: "Бренд", value: getAttrName("brand", formData.brandCode), icon: Tag },
                        { label: "Цвет", value: selectedColorName, icon: () => <div className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: selectedColorHex }} /> },
                        { label: "Размер", value: getAttrName("size", formData.sizeCode), icon: Ruler },
                        { label: "Качество", value: getAttrName("quality", formData.qualityCode), icon: CheckCircle2 },
                        { label: "Материал", value: getAttrName("material", formData.materialCode), icon: Shirt },
                        { label: "Ед. изм.", value: formatUnit(formData.unit), icon: Scale },
                        // Packaging specific
                        {
                            label: "Габариты",
                            value: (formData.width && formData.height && formData.depth)
                                ? `${formData.depth}x${formData.width}x${formData.height}`
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
                            <div key={idx} className="flex flex-col p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all group">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs font-black text-slate-700">{item.label}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 tracking-tight">{item.value}</span>
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
                {hasCustomAttributes && (
                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(formData.attributes || {})
                                .filter(([k]) => !predefinedAttributesKeys.includes(k))
                                .map(([key, val]) => (
                                    <div key={key} className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/50 flex items-center gap-3 shadow-sm group hover:border-slate-300 transition-all">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-900 transition-colors" />
                                        <span className="text-[11px] font-bold text-slate-700 tracking-tight">{key}:</span>
                                        <span className="text-sm font-bold text-slate-900">{String(val)}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
