import { Package, Hash, Ruler, Wrench, Printer, Shirt, Scissors } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UnitSelect } from "@/components/ui/unit-select";
import { Select } from "@/components/ui/select";
import { AttributeSelector } from "@/app/(main)/dashboard/warehouse/attribute-selector";
import { AttributeType, ItemFormData } from "@/app/(main)/dashboard/warehouse/types";

interface MeasurementUnit {
    id: string;
    name: string;
}

interface NonClothingFieldsProps {
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
    isPackaging: boolean;
    isConsumables: boolean;
    measurementUnits: MeasurementUnit[];
    remainingCustomTypes: AttributeType[];
}

export function NonClothingFields({
    formData,
    updateFormData,
    isPackaging,
    isConsumables,
    measurementUnits,
    remainingCustomTypes
}: NonClothingFieldsProps) {
    return (
        <div className="space-y-3">
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1 leading-none">
                    <Package className="w-3.5 h-3.5 inline mr-2 -mt-0.5" />
                    Название позиции <span className="text-rose-500">*</span>
                </label>
                <Input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => updateFormData({ itemName: e.target.value })}
                    placeholder="Например: Коробка картонная 40x40"
                    className="w-full h-12 px-5 rounded-[var(--radius)] border border-slate-200 bg-white text-slate-900 font-bold text-base focus-visible:border-slate-900 focus-visible:ring-4 focus-visible:ring-slate-900/5 transition-all shadow-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 ml-1 leading-none">
                        <Hash className="w-3.5 h-3.5 inline mr-2 -mt-0.5" />
                        Артикул (SKU) <span className="text-rose-500">*</span>
                    </label>
                    <Input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => updateFormData({ sku: e.target.value.toUpperCase() })}
                        placeholder="SKU-123"
                        className="w-full h-11 px-5 rounded-[var(--radius)] border border-slate-200 bg-white text-slate-900 font-bold text-sm focus-visible:border-slate-900 transition-all font-mono shadow-none"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 ml-1 leading-none">
                        <Ruler className="w-3.5 h-3.5 inline mr-2 -mt-0.5" />
                        Единица измерения <span className="text-rose-500">*</span>
                    </label>
                    <UnitSelect
                        name="unit"
                        value={isPackaging ? "шт." : (formData.unit || "шт.")}
                        onChange={(val) => updateFormData({ unit: val })}
                        options={measurementUnits.map(u => ({ id: u.id, name: u.name.toUpperCase() }))}
                        disabled={isPackaging}
                    />
                </div>
            </div>

            {/* Custom Attributes for non-clothing */}
            {remainingCustomTypes.length > 0 && (
                <div className="space-y-3 pt-4">
                    {remainingCustomTypes.map((type: AttributeType) => (
                        <div key={type.id} className="space-y-3">
                            <div className="h-px bg-slate-100" />
                            <AttributeSelector
                                type={type.slug}
                                label={type.name}
                                value={formData.attributes?.[type.slug] || ""}
                                onChange={(name, code) => {
                                    const currentAttrs = formData.attributes || {};
                                    updateFormData({
                                        attributes: { ...currentAttrs, [type.slug]: code }
                                    });
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Additional Info (Department/Packing) */}
            {(isPackaging || isConsumables) && (
                <div className="mt-8 p-6 bg-slate-50 rounded-[var(--radius)] border border-slate-200 space-y-2">
                    <div className="mb-2">
                        <h4 className="text-base font-bold text-slate-900">Дополнительно</h4>
                        <p className="text-xs font-bold text-slate-700 opacity-60 mt-1">Параметры и размеры</p>
                    </div>

                    {isPackaging && (
                        <div className="grid grid-cols-3 gap-3">
                            {['width', 'height', 'depth'].map(dim => (
                                <div key={dim} className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 px-1">
                                        {dim === 'width' ? 'Ширина' : dim === 'height' ? 'Высота' : 'Глубина'}
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={(formData[dim as keyof ItemFormData] as string) || ""}
                                            onChange={(e) => updateFormData({ [dim]: e.target.value })}
                                            className="w-full h-11 px-4 pr-10 rounded-[var(--radius)] border border-slate-200 bg-white text-sm font-bold focus-visible:border-amber-500 transition-all shadow-none"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300 pointer-events-none">СМ</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isConsumables && (
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <Wrench className="w-3.5 h-3.5" />
                                Область применения
                            </label>
                            <Select
                                options={[
                                    { id: "printing", title: "Печатный цех", icon: <Printer className="w-4 h-4 opacity-50" /> },
                                    { id: "embroidery", title: "Вышивальный цех", icon: <Shirt className="w-4 h-4 opacity-50" /> },
                                    { id: "sewing", title: "Швейный цех", icon: <Scissors className="w-4 h-4 opacity-50" /> },
                                ]}
                                value={formData.department || ""}
                                onChange={(val) => updateFormData({ department: val })}
                                placeholder="Выберите отдел..."
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
