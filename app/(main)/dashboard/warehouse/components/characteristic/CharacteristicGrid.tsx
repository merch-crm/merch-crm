"use client";
import { Book } from "lucide-react";
import { InventoryAttribute as Attribute, AttributeType } from "../../types";
import { CharacteristicCard } from "./CharacteristicCard";

interface CharacteristicGridProps {
    filteredTypes: AttributeType[];
    attributes: Attribute[];
    activeCategoryId: string;
    activeCategoryName: string;
    openEditType: (type: AttributeType) => void;
    openEditValue: (attr: Attribute) => void;
    openAddValue: (slug: string) => void;
}

export function CharacteristicGrid({
    filteredTypes,
    attributes,
    activeCategoryId,
    activeCategoryName,
    openEditType,
    openEditValue,
    openAddValue
}: CharacteristicGridProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[var(--crm-grid-gap)]">
                    {filteredTypes.map(type => (
                        <CharacteristicCard
                            key={type.id}
                            type={type}
                            attributes={attributes}
                            openEditType={openEditType}
                            openEditValue={openEditValue}
                            openAddValue={openAddValue}
                        />
                    ))}
                    {filteredTypes.length === 0 && (
                        <div className="col-span-full py-16 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <Book className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">Нет характеристик</h3>
                            <p className="text-slate-500">
                                {activeCategoryId === "uncategorized"
                                    ? "Все характеристики распределены по категориям"
                                    : `В категории «${activeCategoryName}» пока нет созданных типов характеристик`}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
