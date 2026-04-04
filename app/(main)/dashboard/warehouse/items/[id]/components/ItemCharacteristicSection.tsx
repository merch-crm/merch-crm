import { useItemDetail } from "../context/ItemDetailContext";
import { ItemGeneralInfo } from "./ItemGeneralInfo";
import { ItemImagePreview } from "./ItemImagePreview";
import { Book } from "lucide-react";
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
            cn("bg-white border border-slate-100/60 rounded-[28px] p-8 flex flex-col shadow-sm",
                tabletTab === 'characteristic' ? "flex" : "hidden", "xl:flex",
                className
            )}>

            <div className="flex flex-col xl:flex-row gap-3 min-h-[400px]">
                {/* IMAGE SECTION - Visible on all screens but styled differently */}
                <div className="w-full xl:w-[42%] xl:min-w-[320px] shrink-0 xl:border-r border-slate-100/60 flex flex-col relative h-[350px] xl:h-auto pr-0 xl:pr-8">
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

                    <div className="xl:hidden">
                        <div className="flex flex-col gap-2 justify-between md:contents h-full">
                            <div className="md:hidden xl:flex flex flex-col flex-1 bg-slate-50/50 rounded-2xl p-6 justify-between overflow-hidden h-full border border-slate-100/80">
                                <div className="mb-1 sm:mb-4 pb-1 sm:pb-4 border-b border-slate-100">
                                    <h3 className="text-[12px] font-bold text-slate-400 mb-1">Артикул</h3>
                                    <p className="text-[16px] font-black text-slate-900 leading-tight break-all cursor-text select-all" onDoubleClick={handleStartEdit}>
                                        {item.sku || "—"}
                                    </p>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 sm:gap-3">
                                    <div className="space-y-1 sm:space-y-3">
                                        <div>
                                            <h2 className="text-[12px] font-bold text-slate-400 mb-1 leading-none">Резерв и остаток</h2>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-5xl md:text-6xl font-black text-slate-900 leading-none cursor-pointer " onDoubleClick={handleStartEdit}>{currentQuantity}</span>
                                                <span className="text-sm font-black text-slate-400">{displayUnit}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <div className={cn("inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border shrink-0",
                                                currentQuantity === 0 ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                    (currentQuantity <= (item.criticalStockThreshold ?? 0) ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")
                                            )}>
                                                {currentQuantity === 0 ? "Нет" :
                                                    (currentQuantity <= (item.criticalStockThreshold ?? 0) ? "Критично" : "В наличии")}
                                            </div>
                                            <div className="px-3 py-1.5 rounded-full text-xs font-bold border bg-amber-50/50 text-amber-600 border-amber-100 shrink-0">
                                                Резерв: {reservedQuantity}
                                            </div>
                                        </div>

                                        {item.printDesign && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <h2 className="text-[12px] font-bold text-slate-400 mb-1 leading-none">Дизайн</h2>
                                                <Link
                                                    href={`/dashboard/design/prints/${item.printDesignId}`}
                                                    className="inline-flex items-center text-sm font-bold text-primary hover:underline"
                                                >
                                                    {item.printDesign.name}
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: CONTENT */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center justify-between gap-3 mb-8">
                    <div className="flex items-center gap-3">
                        <h3 className="text-[17px] font-black text-slate-900">Характеристики</h3>
                    </div>

                    {isEditing && (
                        <Link
                            href="/dashboard/warehouse?tab=characteristic"
                            target="_blank"
                            className="flex items-center gap-1.5 text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors"
                        >
                            <Book className="w-3.5 h-3.5" />
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
                        <div className="mt-2">
                            <hr className="my-6 border-slate-100" />
                            <h4 className="text-xs font-bold text-slate-400 mb-3">
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
    );
}
