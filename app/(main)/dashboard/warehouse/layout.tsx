"use client";

import { usePathname, useRouter } from"next/navigation";
import Link from"next/link";
import { Plus, Eraser } from"lucide-react";
import { cn } from"@/lib/utils";
import { ReactNode, useEffect } from"react";
import { AddCategoryDialog } from"./add-category-dialog";
import { AddStorageLocationDialog } from"./add-storage-location-dialog";
import { AddAttributeTypeDialog } from"./add-attribute-type-dialog";
import { QRScanner } from"@/components/ui/qr-scanner";
import { Button, buttonVariants } from"@/components/ui/button";
import { ConfirmDialog } from"@/components/ui/confirm-dialog";
import { useToast } from"@/components/ui/toast";
import { findItemBySKU } from"./warehouse-stats-actions";
import { clearInventoryHistory } from"./history-actions";

import { playSound } from"@/lib/sounds";
import { useWarehouseLayout } from"./hooks/useWarehouseLayout";

import { WAREHOUSE_TABS, WAREHOUSE_TAB_INFO, WarehouseNavigationTabs } from"./components/WarehouseNavigationTabs";


export default function WarehouseLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();

    let activeTab ="overview";
    if (pathname.includes("/overview")) activeTab ="overview";
    else if (pathname.includes("/categories")) activeTab ="categories";
    else if (pathname.includes("/storage")) activeTab ="storage";
    else if (pathname.includes("/characteristics")) activeTab ="characteristics";
    else if (pathname.includes("/history")) activeTab ="history";
    else if (pathname.includes("/archive")) activeTab ="archive";

    const { state, actions } = useWarehouseLayout(activeTab);
    const { categories, users, session, history, isScannerOpen, isClearHistoryOpen, isClearingHistory } = state;
    const { setIsScannerOpen, setIsClearHistoryOpen, setIsClearingHistory, loadDialogData } = actions;

    const isRootPage = WAREHOUSE_TABS.some(tab => pathname === tab.href);
    const currentInfo = WAREHOUSE_TAB_INFO[pathname];

    // Update document title immediately on client-side navigation
    useEffect(() => {
        if (currentInfo?.title) {
            document.title = `Склад | ${currentInfo.title}`;
        }
    }, [pathname, currentInfo]);

    const renderActions = () => {
        switch (activeTab) {
            case"categories":
                return (
                    <>
                        <AddCategoryDialog className="h-10 w-10 sm:h-11 sm:w-auto p-0 sm:px-6 rounded-full sm:rounded-2xl shadow-lg shadow-primary/20" buttonText="Категория" />
                        <Link
                            href="/dashboard/warehouse/items/new"
                            className={cn(
                                buttonVariants({ variant:"default" }),"h-10 w-10 sm:h-11 sm:w-auto p-0 sm:px-6 rounded-full sm:rounded-2xl border-none shadow-lg shadow-primary/20 transition-all active:scale-95"
                            )}
                        >
                            <Plus className="w-5 h-5 text-white" />
                            <span className="hidden sm:inline">Добавить позицию</span>
                        </Link>
                    </>
                );
            case"storage":
                return (
                    <div
                        className="flex items-center gap-2 w-auto"
                        onMouseEnter={() => loadDialogData('storage')}
                        onTouchStart={() => loadDialogData('storage')}
                        onClick={() => loadDialogData('storage')}
                    >
                        <AddStorageLocationDialog
                            users={users}
                            className="h-10 w-10 sm:h-11 sm:w-auto p-0 sm:px-6 bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 border-none"
                        />
                    </div>
                );
            case"characteristics":
                return (
                    <div className="flex items-center gap-2 w-auto">
                        <AddAttributeTypeDialog categories={categories} className="h-10 w-10 sm:h-11 sm:w-auto p-0 sm:px-6" />
                    </div>
                );
            case"history":
                return (
                    <div
                        className="flex items-center gap-2 w-auto"
                        onMouseEnter={() => loadDialogData('history')}
                        onTouchStart={() => loadDialogData('history')}
                        onClick={() => loadDialogData('history')}
                    >
                        {session?.roleName ==="Администратор" && (
                            <Button
                                data-testid="clear-history-btn"
                                variant="destructive"
                                onClick={() => setIsClearHistoryOpen(true)}
                                disabled={history.length === 0}
                                className="h-10 w-10 sm:h-11 sm:w-auto p-0 sm:px-6 rounded-full sm:rounded-2xl gap-2 font-bold flex items-center justify-center shadow-lg shadow-rose-500/20 transition-all active:scale-95"
                            >
                                <Eraser className="w-5 h-5 shrink-0 text-white" />
                                <span className="hidden sm:inline">Очистить</span>
                            </Button>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col gap-3 animate-in fade-in duration-700">
            {isRootPage && (
                <>
                    {/* Header */}
                    <div className="flex flex-row items-center justify-between gap-3 px-0 min-h-[40px] sm:min-h-[44px]">
                        <div className="flex flex-col gap-1 min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                                {currentInfo.title}
                            </h1>
                            <p className="text-slate-500 text-[12px] sm:text-[13px] font-medium sm:mt-1.5 mt-0 line-clamp-2" suppressHydrationWarning>
                                {currentInfo?.description}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {renderActions()}
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <WarehouseNavigationTabs activeTab={activeTab} />
                </>
            )}

            <div className="relative">
                {children}
            </div>

            <QRScanner
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onResult={async (sku) => {
                    toast(`Поиск SKU: ${sku}...`,"info");
                    const foundId = await findItemBySKU(sku);
                    if (foundId) {
                        toast("Товар найден, переходим...","success");
                        playSound("scan_success");
                        router.push(`/dashboard/warehouse/items/${foundId}`);
                    } else {
                        toast(`Товар с SKU «${sku}» не найден`,"error");
                        playSound("scan_error");
                    }
                }}
            />

            <ConfirmDialog
                isOpen={isClearHistoryOpen}
                onClose={() => setIsClearHistoryOpen(false)}
                onConfirm={async () => {
                    setIsClearingHistory(true);
                    try {
                        const res = await clearInventoryHistory();
                        if (res.success) {
                            toast("История очищена","success");
                            playSound("notification_success");
                            setIsClearHistoryOpen(false);
                            router.refresh();
                        } else {
                            toast(res.error ||"Ошибка при очистке","error");
                            playSound("notification_error");
                        }
                    } finally {
                        setIsClearingHistory(false);
                    }
                }}
                isLoading={isClearingHistory}
                title="Очистка всей истории"
                description="Вы собираетесь полностью удалить все записи из журнала истории склада. Это действие необратимо и будет зафиксировано в системном логе."
                confirmText="Очистить всё"
                variant="destructive"
            />
        </div>
    );
}
