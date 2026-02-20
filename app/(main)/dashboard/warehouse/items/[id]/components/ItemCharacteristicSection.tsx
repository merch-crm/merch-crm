import { useItemDetail } from "../context/ItemDetailContext";
import { ItemGeneralInfo } from "./ItemGeneralInfo";
import { LayoutGrid, Book } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ItemCharacteristicSection() {
    const {
        item,
        isEditing,
        tabletTab,
        allAttributes,
        attributeTypes,
        editData,
        setEditData,
        handleAttributeChange,
        handleRemoveAttribute,
        user,
        stocks,
        handleStartEdit
    } = useItemDetail();

    return (
        <div className={
            cn(
                "crm-card rounded-3xl p-4 sm:p-6 bg-card/50 h-full",
                "md:col-span-2 xl:col-span-8 xl:row-span-2",
                tabletTab === 'characteristic' ? "flex flex-col" : "hidden",
                "xl:flex xl:flex-col"
            )}>
            <div className="flex items-center justify-between gap-3 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center text-background transition-all shadow-sm">
                        <LayoutGrid className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Характеристика</h3>
                </div>

                {isEditing && (
                    <Link
                        href="/dashboard/warehouse?tab=characteristic"
                        target="_blank"
                        className="flex items-center gap-2 px-4 h-11 rounded-3xl text-[12px] font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all border border-transparent"
                    >
                        <Book className="w-4 h-4" />
                        Перейти в характеристики
                    </Link>
                )}
            </div>
            <ItemGeneralInfo
                item={item}
                isEditing={isEditing}
                allAttributes={allAttributes}
                attributeTypes={attributeTypes}
                editData={editData}
                onUpdateField={(field, value) => {
                    setEditData((prev) => ({ ...prev, [field]: value }))
                }}
                onUpdateAttribute={handleAttributeChange}
                onRemoveAttribute={handleRemoveAttribute}
                user={user}
                totalStock={stocks.reduce((acc, s) => acc + s.quantity, 0)}
                onEdit={handleStartEdit}
            />
        </div>
    );
}
