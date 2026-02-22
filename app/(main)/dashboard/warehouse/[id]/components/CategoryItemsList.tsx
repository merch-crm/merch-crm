"use client";

import { Package, Building2, TrendingDown, TrendingUp, Clock, Layers, Zap, Tag, PlusSquare, Trash2, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ItemThumbnail } from "./ItemThumbnail";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { cn, formatUnit } from "@/lib/utils";
import { InventoryItem } from "../../types";
import { StorageLocation } from "../../storage-locations-tab";
import { useRouter } from "next/navigation";

interface CategoryItemsListProps {
    items: InventoryItem[];
    selectedIds: string[];
    toggleSelectAll: () => void;
    toggleSelectItem: (id: string) => void;
    canSeeCost: boolean;
    currencySymbol: string;
    storageLocations: StorageLocation[];
    handlePrintLabel: (item: InventoryItem) => void;
    handleOpenAdjust: (item: InventoryItem) => void;
    setIdsToDelete: (ids: string[]) => void;
}

export function CategoryItemsList({
    items,
    selectedIds,
    toggleSelectAll,
    toggleSelectItem,
    canSeeCost,
    currencySymbol,
    storageLocations,
    handlePrintLabel,
    handleOpenAdjust,
    setIdsToDelete
}: CategoryItemsListProps) {
    const router = useRouter();

    return (
        <div className="space-y-3">
            <ResponsiveDataView
                data={items || []}
                renderTable={() => (
                    <div className="table-container">
                        <table className="crm-table">
                            <thead className="crm-thead">
                                <tr>
                                    <th className="crm-th crm-td-selection">
                                        <Checkbox
                                            checked={(items?.length || 0) > 0 && (items || []).every(i => selectedIds.includes(i.id))}
                                            onChange={toggleSelectAll}
                                            className="mx-auto"
                                        />
                                    </th>
                                    <th className="crm-th">
                                        <div className="crm-th-content">
                                            <Package className="w-3.5 h-3.5" />
                                            <span>ТОВАР</span>
                                        </div>
                                    </th>
                                    <th className="crm-th">
                                        <div className="crm-th-content">
                                            <Building2 className="w-3.5 h-3.5" />
                                            <span>СКЛАД</span>
                                        </div>
                                    </th>
                                    {canSeeCost && (
                                        <th className="crm-th crm-td-number">
                                            <div className="crm-th-content justify-end">
                                                <TrendingDown className="w-3.5 h-3.5" />
                                                <span>СЕБЕСТ.</span>
                                            </div>
                                        </th>
                                    )}
                                    {canSeeCost && (
                                        <th className="crm-th crm-td-number">
                                            <div className="crm-th-content justify-end">
                                                <TrendingUp className="w-3.5 h-3.5" />
                                                <span>ЦЕНА</span>
                                            </div>
                                        </th>
                                    )}
                                    <th className="crm-th w-32 crm-td-number text-center">
                                        <div className="crm-th-content justify-center">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>РЕЗЕРВ</span>
                                        </div>
                                    </th>
                                    <th className="crm-th w-32 crm-td-number text-center">
                                        <div className="crm-th-content justify-center">
                                            <Layers className="w-3.5 h-3.5" />
                                            <span>ОСТАТОК</span>
                                        </div>
                                    </th>
                                    <th className="crm-th crm-td-actions">
                                        <div className="crm-th-content justify-end">
                                            <Zap className="w-3.5 h-3.5" />
                                            <span>ДЕЙСТВИЯ</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="crm-tbody">
                                {(items || []).map((item) => {
                                    const isSelected = selectedIds.includes(item.id);
                                    const available = item.quantity - (item.reservedQuantity || 0);
                                    const isCritical = available <= (item.criticalStockThreshold || 0);
                                    const isLowStock = !isCritical && available <= (item.lowStockThreshold || 10);

                                    return (
                                        <tr
                                            key={item.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => router.push(`/dashboard/warehouse/items/${item.id}`)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    router.push(`/dashboard/warehouse/items/${item.id}`);
                                                }
                                            }}
                                            className={cn(
                                                "crm-tr-clickable",
                                                isSelected && "crm-tr-selected"
                                            )}
                                        >
                                            <td className="crm-td crm-td-selection" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectItem(item.id)}
                                                    className="mx-auto"
                                                />
                                            </td>
                                            <td className="crm-td">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-slate-100 overflow-hidden border border-slate-200 shrink-0 relative">
                                                        <ItemThumbnail item={item} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900 leading-tight transition-colors">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-xs font-mono font-bold text-slate-400 mt-1 bg-slate-50 inline-block px-1.5 py-0.5 rounded-[4px]">
                                                            {item.sku || "N/A"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="crm-td">
                                                <div className="flex flex-col gap-1 text-[11px] text-slate-500 font-medium">
                                                    {item.stocks?.filter(s => s.quantity > 0).map((s) => {
                                                        const locName = storageLocations.find(l => l.id === s.storageLocationId)?.name || "N/A";
                                                        return (
                                                            <div key={s.storageLocationId} className="flex items-center gap-2 whitespace-nowrap">
                                                                <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                                                                <span>{locName}</span>
                                                                <span className="text-slate-400">({s.quantity})</span>
                                                            </div>
                                                        );
                                                    }) || (
                                                            <div className="flex items-center gap-2 whitespace-nowrap">
                                                                <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                                                                <span>—</span>
                                                            </div>
                                                        )}
                                                </div>
                                            </td>
                                            {canSeeCost && (
                                                <td className="crm-td crm-td-number">
                                                    <span className="text-[11px] font-medium text-slate-400">
                                                        {item.costPrice ? `${Number(item.costPrice).toLocaleString()} ${currencySymbol}` : "—"}
                                                    </span>
                                                </td>
                                            )}
                                            {canSeeCost && (
                                                <td className="crm-td crm-td-number">
                                                    <span className="text-sm font-bold text-slate-900">
                                                        {item.sellingPrice ? `${Number(item.sellingPrice).toLocaleString()} ${currencySymbol}` : "—"}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="crm-td crm-td-number text-center">
                                                <span className={cn(
                                                    "text-sm font-bold tabular-nums",
                                                    (item.reservedQuantity || 0) > 0 ? "text-amber-500" : "text-slate-300"
                                                )}>
                                                    {item.reservedQuantity || 0}
                                                </span>
                                            </td>
                                            <td className="crm-td crm-td-number text-center">
                                                <div className="flex flex-col items-center gap-1.5 translate-x-2">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold transition-all border shadow-sm shrink-0 whitespace-nowrap",
                                                        isCritical ? "bg-rose-50 border-rose-100 text-rose-600 ring-2 ring-rose-500/5" :
                                                            isLowStock ? "bg-amber-50 border-amber-100 text-amber-600 ring-2 ring-amber-500/5" :
                                                                "bg-emerald-50 border-emerald-100 text-emerald-600"
                                                    )}>
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full shrink-0",
                                                            isCritical ? "bg-rose-500 animate-pulse" :
                                                                isLowStock ? "bg-amber-500" :
                                                                    "bg-emerald-500"
                                                        )} />
                                                        <span className="tabular-nums">{available} {formatUnit(item.unit)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="crm-td crm-td-actions" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1 transition-all">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handlePrintLabel(item)}
                                                        className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-primary border border-slate-200"
                                                        title="Печать"
                                                        aria-label="Печать этикетки"
                                                    >
                                                        <Tag className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenAdjust(item)}
                                                        className="w-8 h-8 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 border border-primary/10"
                                                        title="Запас"
                                                        aria-label="Корректировка остатка"
                                                    >
                                                        <PlusSquare className="w-5 h-5" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setIdsToDelete([item.id]);
                                                        }}
                                                        className="w-8 h-8 rounded-xl bg-rose-50 text-rose-400 hover:text-rose-600 border border-rose-100"
                                                        title="Удалить"
                                                        aria-label="Удалить товар"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.push(`/dashboard/warehouse/items/${item.id}`)}
                                                        className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 border border-slate-200"
                                                        title="Открыть карточку"
                                                        aria-label="Открыть карточку товара"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                renderCard={(item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const available = item.quantity - (item.reservedQuantity || 0);
                    const isCritical = available <= (item.criticalStockThreshold || 0);
                    const isLowStock = !isCritical && available <= (item.lowStockThreshold || 10);
                    const mainStock = item.stocks?.find(s => s.quantity > 0) || item.stocks?.[0];
                    const locationName = mainStock ? storageLocations.find(l => l.id === mainStock.storageLocationId)?.name : null;

                    return (
                        <div key={item.id}>
                            <div
                                role="button"
                                tabIndex={0}
                                className={cn(
                                    "group relative flex flex-col gap-3 p-4 transition-all duration-300 cursor-pointer active:scale-[0.98] rounded-3xl border border-slate-200/60 shadow-sm",
                                    isSelected ? "bg-primary/[0.03] border-primary/20 ring-4 ring-primary/5" : "bg-white hover:shadow-md"
                                )}
                                onClick={() => router.push(`/dashboard/warehouse/items/${item.id}`)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        router.push(`/dashboard/warehouse/items/${item.id}`);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={(e) => e.stopPropagation()} className="shrink-0">
                                        <Checkbox
                                            checked={isSelected}
                                            onChange={() => toggleSelectItem(item.id)}
                                        />
                                    </div>
                                    <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-slate-100 overflow-hidden border border-slate-200 shrink-0 relative">
                                        <ItemThumbnail item={item} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-black text-slate-900 truncate leading-tight mb-0.5">
                                            {item.name}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                            <span className="bg-slate-50 px-1.5 py-0.5 rounded-[4px] font-mono">{item.sku || "N/A"}</span>
                                            <span className="text-slate-200">•</span>
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded-full tracking-tighter text-xs font-black",
                                                isCritical ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                                    isLowStock ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                        "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                            )}>
                                                {available} {formatUnit(item.unit)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {canSeeCost && (
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        <div className="flex items-center gap-1.5 min-w-0 max-w-[60%]">
                                            {locationName ? (
                                                <>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                                    <span className="text-xs font-bold text-slate-500 truncate">
                                                        {locationName}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-xs font-medium text-slate-400">Цена</span>
                                            )}
                                        </div>
                                        <div className="text-sm font-black text-slate-900">
                                            {item.sellingPrice ? `${Number(item.sellingPrice).toLocaleString()} ${currencySymbol}` : "—"}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }}
            />
        </div>
    );
}
