import { Package, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { formatUnit } from "@/lib/utils";
import { StorageLocationItem } from "../../storage-locations-tab";

interface LocationItemsListProps {
    currentPage: number;
    itemsPerPage: number;
    localItems: StorageLocationItem[];
    setCurrentPage: (page: number) => void;
    onTransferClick: (item: StorageLocationItem) => void;
}

export function LocationItemsList({
    currentPage,
    itemsPerPage,
    localItems,
    setCurrentPage,
    onTransferClick
}: LocationItemsListProps) {
    const totalPages = Math.ceil((localItems?.length || 0) / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = localItems?.slice(startIndex, endIndex) || [];

    return (
        <div className="space-y-3">
            <div className="flex md:hidden items-center justify-between pb-1">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-300" /> Товары <span className="opacity-30">/</span> {localItems?.length || 0}
                </label>
            </div>

            <div className="space-y-2">
                {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 active:bg-white active:shadow-md transition-all group"
                        >
                            <div className="flex flex-col min-w-0 flex-1 mr-3">
                                <span className="text-xs font-bold text-slate-900 truncate">{item.name}</span>
                                {item.sku && <span className="text-xs text-slate-400 font-bold mt-0.5">SKU: {item.sku}</span>}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-[11px] font-bold text-primary tabular-nums">
                                    {item.quantity} {formatUnit(item.unit)}
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTransferClick(item);
                                    }}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 active:bg-primary active:text-white transition-all shadow-sm"
                                    aria-label={`Переместить ${item.name}`}
                                >
                                    <ArrowRightLeft className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                        <Package className="w-8 h-8 text-slate-200 mb-2" />
                        <p className="text-xs font-bold text-slate-400">Склад пуст</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={localItems?.length || 0}
                        pageSize={itemsPerPage}
                        onPageChange={setCurrentPage}
                        itemNames={['товар', 'товара', 'товаров']}
                        variant="light"
                    />
                </div>
            )}
        </div>
    );
}
