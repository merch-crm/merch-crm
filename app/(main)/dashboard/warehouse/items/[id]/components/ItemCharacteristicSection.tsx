import { useItemDetail } from "../context/ItemDetailContext";
import { ItemGeneralInfo } from "./ItemGeneralInfo";
import { ItemImagePreview } from "./ItemImagePreview";
import { Book, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ItemCharacteristicSection({ className }: { className?: string }) {
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
        stocksQuantity,
        displayUnit,
        reservedQuantity,
        handleStartEdit,
        thumbSettings,
        baseScale,
        handleMainMouseDown,
        setAspectRatio,
        openGallery,
        updateThumb
    } = useItemDetail();

    const currentQuantity = stocksQuantity > 0 || item.quantity === 0 ? stocksQuantity : item.quantity;

    return (
        <div className={
            cn("crm-card rounded-[32px] p-4 sm:p-6 bg-card flex flex-col",
                tabletTab === 'characteristic' ? "flex" : "hidden", "xl:flex",
                className
            )}>

            <div className="flex flex-col xl:flex-row gap-3">
                {/* IMAGE SECTION - Visible on all screens but styled differently */}
                <div className="w-full xl:w-[40%] xl:min-w-[280px] shrink-0 space-y-3">
                    <ItemImagePreview
                        item={item}
                        isEditing={isEditing}
                        thumbSettings={thumbSettings}
                        baseScale={baseScale}
                        handleMainMouseDown={handleMainMouseDown}
                        setAspectRatio={setAspectRatio}
                        updateThumb={updateThumb}
                        openGallery={openGallery}
                    />

                    {/* MOBILE/TABLET SPECIFIC INFO (SKU, Stock) */}
                    <div className="xl:hidden">
                        <div className="flex flex-col gap-2 justify-between md:contents h-full">
                            <div className="md:hidden xl:flex flex flex-col flex-1 crm-card rounded-3xl p-4 sm:p-6 justify-between overflow-hidden h-full">
                                <div className="mb-1 sm:mb-4 pb-1 sm:pb-4 border-b border-border">
                                    <h3 className="text-[11px] font-bold text-muted-foreground mb-0.5">Артикул:</h3>
                                    <p className="text-[14px] sm:text-[16px] font-black text-foreground leading-tight break-all cursor-text select-all" onDoubleClick={handleStartEdit}>
                                        {item.sku || "—"}
                                    </p>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 sm:gap-3">
                                    <div className="space-y-1 sm:space-y-3">
                                        <div>
                                            <h2 className="text-[11px] sm:text-xs font-bold text-muted-foreground mb-0.5 leading-none">Резерв и остаток</h2>
                                            <div className="flex items-baseline gap-1 sm:gap-1.5">
                                                <span className="text-5xl sm:text-5xl md:text-6xl font-black text-foreground leading-none cursor-pointer" onDoubleClick={handleStartEdit}>{currentQuantity}</span>
                                                <span className="text-[11px] sm:text-sm font-black text-muted-foreground">{displayUnit}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1 sm:gap-2">
                                            <div className={cn("inline-flex items-center px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-3xl text-xs sm:text-xs font-bold border shrink-0",
                                                currentQuantity === 0 ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                    (currentQuantity <= (item.criticalStockThreshold ?? 0) ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")
                                            )}>
                                                {currentQuantity === 0 ? "Нет" :
                                                    (currentQuantity <= (item.criticalStockThreshold ?? 0) ? "Критично" : "В наличии")}
                                            </div>
                                            <div className="px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-3xl text-xs sm:text-xs font-bold border bg-amber-50/50 text-amber-600 border-amber-100 shrink-0">
                                                Резерв: {reservedQuantity}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: CONTENT */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-foreground flex items-center justify-center text-background transition-all shadow-sm">
                                <LayoutGrid className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">Характеристики</h3>
                        </div>

                        {isEditing && (
                            <Link
                                href="/dashboard/warehouse?tab=characteristic"
                                target="_blank"
                                className="flex items-center gap-2 px-4 h-11 rounded-3xl text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all border border-transparent"
                            >
                                <Book className="w-4 h-4" />
                                Перейти в характеристики
                            </Link>
                        )}
                    </div>

                    <div className="flex-1 min-h-0">
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

                        {/* DESCRIPTION BLOCK */}
                        {(item.description || isEditing) && (
                            <div className="mt-4 pt-4">
                                <h4 className="text-[11px] font-black tracking-wider text-slate-400 mb-3">
                                    Описание
                                </h4>
                                {isEditing ? (
                                    <textarea
                                        value={editData.description || ""}
                                        onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Введите описание товара..."
                                        className="w-full min-h-[100px] p-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 text-[13px] text-slate-600 resize-none font-medium placeholder:text-slate-300"
                                    />
                                ) : (
                                    <p className="text-[13px] leading-relaxed text-slate-500 font-medium whitespace-pre-wrap">
                                        {item.description || "Описание отсутствует"}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
