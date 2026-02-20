"use client";

import { Dispatch, SetStateAction } from "react";
import { cn } from "@/lib/utils";
import { ItemStockAlerts } from "./ItemStockAlerts";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";
import { ItemActionButtons } from "./ItemActionButtons";

interface ItemTabletViewProps {
    item: InventoryItem;
    setShowLabelDialog: (show: boolean) => void;
    handleDownload: () => void;
    setShowArchiveReason: (show: boolean) => void;
    handleStartEdit: (e?: React.MouseEvent | React.KeyboardEvent) => void;
    displayUnit: string;
    reservedQuantity: number;
    isEditing: boolean;
    editData: InventoryItem;
    setEditData: Dispatch<SetStateAction<InventoryItem>>;
}

export function ItemTabletView({
    item,
    setShowLabelDialog,
    handleDownload,
    setShowArchiveReason,
    handleStartEdit,
    displayUnit,
    reservedQuantity,
    isEditing,
    editData,
    setEditData
}: ItemTabletViewProps) {

    return (
        <div className="grid grid-cols-1 md:col-start-2 md:flex md:flex-col gap-3 xl:contents">
            {/* Actions Grid (Tablet Only - Restored) */}
            <div className="hidden md:grid xl:hidden grid-cols-3 gap-3">
                <ItemActionButtons
                    item={item}
                    setShowLabelDialog={setShowLabelDialog}
                    handleDownload={handleDownload}
                    setShowArchiveReason={setShowArchiveReason}
                />
            </div>

            {/* TABLET ONLY SKU + Alerts block */}
            <div className="hidden md:flex xl:hidden flex-col gap-3">
                {/* SKU & Stock block */}
                <div className="flex flex-col crm-card rounded-3xl p-6 justify-between overflow-hidden bg-card/50">
                    <div className="flex items-start justify-between mb-4 gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[11px] font-bold text-muted-foreground mb-1 leading-none">Артикул / SKU</h3>
                            <p className="text-[14px] font-black text-foreground leading-tight break-all cursor-text select-all" onDoubleClick={handleStartEdit}>{item.sku || "—"}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <h2 className="text-xs font-bold text-muted-foreground mb-1 leading-none">Остаток</h2>
                            <div className="flex items-baseline gap-1 justify-end">
                                <span className="text-5xl font-black text-foreground leading-none cursor-pointer" onDoubleClick={handleStartEdit}>{item.quantity}</span>
                                <span className="text-[12px] font-black text-muted-foreground">{displayUnit}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-border">
                        <div className={cn(
                            "inline-flex items-center px-3 py-1.5 rounded-2xl text-xs font-bold border shrink-0",
                            item.quantity === 0 ? "bg-rose-50 text-rose-600 border-rose-100" :
                                (item.quantity <= (item.criticalStockThreshold ?? 0) ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")
                        )}>
                            {item.quantity === 0 ? "Нет" :
                                (item.quantity <= (item.criticalStockThreshold ?? 0) ? "Критично" : "В наличии")}
                        </div>
                        <div className="px-3 py-1.5 rounded-2xl text-xs font-bold border border-amber-100 bg-amber-50/50 text-amber-600 shrink-0">
                            Резерв: {reservedQuantity} {displayUnit}
                        </div>
                    </div>
                </div>

                {/* Stock Alerts component */}
                <ItemStockAlerts
                    item={item}
                    isEditing={isEditing}
                    editData={editData}
                    setEditData={setEditData}
                    handleStartEdit={handleStartEdit}
                    className={
                        cn(
                            "crm-card rounded-3xl p-6 relative group/alerts overflow-hidden bg-card/50"
                        )
                    }
                />
            </div>


        </div>
    );
}
