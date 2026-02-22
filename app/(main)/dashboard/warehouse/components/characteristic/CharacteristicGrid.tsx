"use client";
import { Book } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
                        <div className="col-span-full">
                            <EmptyState
                                icon={Book}
                                title="Нет характеристик"
                                description={activeCategoryId === "uncategorized"
                                    ? "Все характеристики распределены по категориям."
                                    : `В категории «${activeCategoryName}» пока нет созданных типов характеристик.`}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
