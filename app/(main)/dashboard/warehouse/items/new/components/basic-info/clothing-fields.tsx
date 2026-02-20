import { AttributeSelector } from "@/app/(main)/dashboard/warehouse/attribute-selector";
import { AttributeType, ItemFormData } from "@/app/(main)/dashboard/warehouse/types";

interface ClothingFieldsProps {
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
    compositionType?: AttributeType;
    remainingCustomTypes: AttributeType[];
}

export function ClothingFields({
    formData,
    updateFormData,
    compositionType,
    remainingCustomTypes
}: ClothingFieldsProps) {
    return (
        <div className="space-y-4">
            {/* Brand & Quality Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <AttributeSelector
                    type="brand"
                    value={formData.brandCode || ""}
                    required={true}
                    onChange={(name, code) => {
                        const currentAttrs = formData.attributes || {};
                        updateFormData({
                            brandCode: code,
                            attributes: { ...currentAttrs, "Бренд": name }
                        });
                    }}
                />

                <AttributeSelector
                    type="quality"
                    value={formData.qualityCode || ""}
                    required={true}
                    onChange={(name, code) => {
                        const currentAttrs = formData.attributes || {};
                        updateFormData({
                            qualityCode: code,
                            attributes: { ...currentAttrs, "Качество": name }
                        });
                    }}
                    onCodeChange={(code) => updateFormData({ qualityCode: code })}
                />
            </div>

            {/* Material & Size Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <AttributeSelector
                    type="material"
                    value={formData.materialCode || ""}
                    required={true}
                    onChange={(name, code) => {
                        const currentAttrs = formData.attributes || {};
                        updateFormData({
                            materialCode: code,
                            attributes: { ...currentAttrs, "Материал": name }
                        });
                    }}
                    allowCustom={true}
                />

                <AttributeSelector
                    type="size"
                    value={formData.sizeCode || ""}
                    required={true}
                    onChange={(name, code) => {
                        const currentAttrs = formData.attributes || {};
                        updateFormData({
                            sizeCode: code,
                            attributes: { ...currentAttrs, "Размер": name }
                        });
                    }}
                    onCodeChange={(code) => updateFormData({ sizeCode: code })}
                    allowCustom={true}
                />
            </div>

            {compositionType && (
                <div className="space-y-4">
                    <AttributeSelector
                        type={compositionType.slug}
                        label={compositionType.name}
                        value={formData.attributes?.[compositionType.slug] || ""}
                        onChange={(name, code) => {
                            const currentAttrs = formData.attributes || {};
                            updateFormData({
                                attributes: { ...currentAttrs, [compositionType.slug]: code }
                            });
                        }}
                    />
                </div>
            )}

            {/* Custom Attributes (Conditional) */}
            {remainingCustomTypes.length > 0 && (
                <div className="space-y-7 pt-3">
                    <div className="space-y-4">
                        {remainingCustomTypes.map((type: AttributeType) => (
                            <div key={type.id} className="space-y-4">
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
                </div>
            )}
        </div>
    );
}
