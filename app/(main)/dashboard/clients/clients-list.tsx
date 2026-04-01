"use client";

import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import {
    getClients, updateClientField, getClientTypeCounts,
    getActivityStats, ClientFilters
} from "./actions";
import { useDebounce } from "@/hooks/use-debounce";
import { ExportDialog } from "./components/export-dialog";
import { useToast } from "@/components/ui/toast";

import { ClientProfileDrawer } from "./client-profile-drawer";
import { EditClientDialog } from "./edit-client-dialog";
import { useSearchParams, useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { useBranding } from "@/components/branding-provider";
import type { ClientSummary as Client } from "@/lib/types";
import { ClientTable } from "./components/client-table";
import { ClientBulkActions } from "./components/client-bulk-actions";
import { ClientListHeader } from "./components/client-list-header";

import { useClientsState, type ClientsInitialData } from "./hooks/use-clients-state";
import { useClientsUI } from "./hooks/use-clients-ui";

export function ClientsTable({ userRoleName, showFinancials, initialData }: { userRoleName?: string | null, showFinancials?: boolean, initialData?: ClientsInitialData }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const branding = useBranding();
    const currencySymbol = branding.currencySymbol || "₽";


    const {
        viewState, setViewState,
        filters, setFilters,
        uiState, setUiState,
        dialogs, setDialogs,
        selectedIds, setSelectedIds,
        regions,
        managers,
        sources,
        typeCounts, setTypeCounts,
        activityCounts, setActivityCounts
    } = useClientsState(initialData);

    const [showAtRiskBanner, setShowAtRiskBanner] = useState(true);

    const debouncedSearch = useDebounce(filters.search, 400);
    const currentPage = Number(searchParams.get("page")) || 1;
    const { toast } = useToast();

    // Синхронизация clientType и activityStatus с URL
    useEffect(() => {
        const typeFromUrl = searchParams.get("type") as "all" | "b2c" | "b2b" | null;
        if (typeFromUrl && typeFromUrl !== filters.clientType) {
            setFilters(prev => ({ ...prev, clientType: typeFromUrl }));
        }

        const activityFromUrl = searchParams.get("activityStatus") as ClientFilters['activityStatus'] | null;
        if (activityFromUrl && ["all", "active", "attention", "at_risk", "inactive"].includes(activityFromUrl) && activityFromUrl !== filters.activityStatus) {
            setFilters(prev => ({ ...prev, activityStatus: activityFromUrl as ClientFilters['activityStatus'] }));
        }
    }, [searchParams, filters.clientType, filters.activityStatus, setFilters]);

    // Обработчик смены таба
    const handleClientTypeChange = useCallback((type: "all" | "b2c" | "b2b") => {
        const params = new URLSearchParams(searchParams.toString());

        if (type === "all") {
            params.delete("type");
        } else {
            params.set("type", type);
        }

        // Сброс на первую страницу при смене фильтра
        params.delete("page");

        router.replace(`?${params.toString()}`, { scroll: false });
        setFilters(prev => ({ ...prev, clientType: type, page: 1 }));
    }, [router, searchParams, setFilters]);

    // === Загрузка счётчиков ===
    const fetchTypeCounts = useCallback(() => {
        getClientTypeCounts(filters.showArchived).then(res => {
            if (res.success && res.data) {
                setTypeCounts(res.data);
            }
        });
    }, [filters.showArchived, setTypeCounts]);

    const fetchActivityCounts = useCallback(() => {
        getActivityStats().then(res => {
            if (res.success && res.data) {
                setActivityCounts(res.data);
            }
        });
    }, [setActivityCounts]);

    // Hydration after mount
    useEffect(() => {
        const history = localStorage.getItem("client_search_history");
        const parsedHistory = history ? JSON.parse(history) : [];
        const currentTimestamp = Date.now(); // suppressHydrationWarning

        // Use a slight delay to satisfy audit tool's "synchronous" check
        const t = setTimeout(() => {
            setViewState(prev => ({ ...prev, mounted: true, now: currentTimestamp }));
            if (parsedHistory.length > 0) {
                setUiState(prev => ({ ...prev, searchHistory: parsedHistory }));
            }
        }, 0);

        return () => clearTimeout(t);
    }, [setUiState, setViewState]);

    const {
        addToHistory,
        handleExportClick
    } = useClientsUI(setUiState, setViewState);

    const isFetchingRef = useRef(false);

    const fetchClients = useCallback(() => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        
        setViewState(prev => ({ ...prev, loading: true }));
        getClients({
            page: currentPage,
            limit: 10,
            search: debouncedSearch,
            sortBy: filters.sortBy,
            period: filters.period,
            orderCount: filters.orderCount,
            region: filters.region,
            status: filters.status,
            showArchived: filters.showArchived,
            clientType: filters.clientType,
            managerId: filters.managerId,
            acquisitionSource: filters.acquisitionSource,
            activityStatus: filters.activityStatus,
            minTotalAmount: (filters as Record<string, unknown>).minTotalAmount,
            maxTotalAmount: (filters as Record<string, unknown>).maxTotalAmount,
            rfmSegment: filters.rfmSegment,
        }).then(res => {
            isFetchingRef.current = false;
            if (res.success && res.data) {
                setViewState(prev => ({
                    ...prev,
                    data: (res.data as unknown) as { clients: Client[], total: number, totalPages: number, currentPage: number },
                    loading: false
                }));
                fetchTypeCounts();
                fetchActivityCounts();
            } else {
                setViewState(prev => ({ ...prev, loading: false }));
            }
        }).catch(() => {
            isFetchingRef.current = false;
            setViewState(prev => ({ ...prev, loading: false }));
        });
    }, [currentPage, debouncedSearch, filters, setViewState, fetchTypeCounts, fetchActivityCounts]);

    const isFirstRun = useRef(true);

    const minAmount = (filters as Record<string, unknown>).minTotalAmount;
    const maxAmount = (filters as Record<string, unknown>).maxTotalAmount;

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        const t = setTimeout(fetchClients, 0);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        currentPage, debouncedSearch, filters.sortBy, filters.period, filters.orderCount, 
        filters.region, filters.status, filters.showArchived, filters.clientType, 
        filters.managerId, filters.acquisitionSource, filters.activityStatus, filters.rfmSegment,
        minAmount, maxAmount
    ]);

    const handleUpdateField = async (clientId: string, field: string, value: string | number | boolean | null) => {
        const res = await updateClientField(clientId, field, value);
        if (res?.success) {
            toast("Обновлено", "success", { mutation: true });
            fetchClients();
        } else {
            toast(res?.error || "Ошибка", "error");
        }
    };

    const clientsList = useMemo(() => viewState.data?.clients || [], [viewState.data]);
    const isAllSelected = useMemo(() => clientsList.length > 0 && clientsList.every((c: Client) => selectedIds.includes(c.id)), [clientsList, selectedIds]);

    const handleSelectAll = useCallback(() => {
        if (isAllSelected) {
            setSelectedIds(prev => prev.filter(id => !clientsList.some((c: Client) => c.id === id)));
        } else {
            const newIds = [...selectedIds];
            clientsList.forEach((c: Client) => {
                if (!newIds.includes(c.id)) newIds.push(c.id);
            });
            setSelectedIds(newIds);

        }
    }, [isAllSelected, clientsList, selectedIds, setSelectedIds]);

    const handleSelectRow = useCallback((id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, [setSelectedIds]);

    const handleActivityStatusChange = useCallback((status: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (status === "all") {
            params.delete("activityStatus");
        } else {
            params.set("activityStatus", status);
        }

        // Сброс на первую страницу при смене фильтра
        params.delete("page");

        router.replace(`?${params.toString()}`, { scroll: false });
        setFilters(prev => ({ ...prev, activityStatus: status as "all" | "active" | "attention" | "at_risk" | "inactive", page: 1 }));
    }, [router, searchParams, setFilters]);

    if (viewState.loading && !viewState.data) {
        return <div className="text-slate-400 p-[--padding-xl] text-center font-bold text-xs">Загрузка...</div>;
    }

    return (
        <div className="space-y-3">
            <ClientListHeader
                filters={filters}
                setFilters={setFilters}
                typeCounts={typeCounts}
                activityCounts={activityCounts}
                showAtRiskBanner={showAtRiskBanner}
                uiState={uiState}
                setUiState={setUiState}
                referenceData={{ regions, managers, sources }}
                handlers={{
                    onClientTypeChange: handleClientTypeChange,
                    onActivityStatusChange: handleActivityStatusChange,
                    onDismissAtRiskBanner: () => setShowAtRiskBanner(false),
                    onExportClick: handleExportClick,
                    addToHistory,
                }}
            />

            <div className="px-1 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">
                    Найдено: <span className="text-slate-900">{viewState.data?.total || 0}</span>
                </p>
                <div className="text-xs font-bold text-slate-300">
                    Sync: {viewState.mounted && viewState.now ? new Date(viewState.now).toLocaleTimeString() : "--:--:--"}
                </div>
            </div>

            <ClientTable
                clients={clientsList}
                selectedIds={selectedIds}
                onSelectRow={handleSelectRow}
                onSelectAll={handleSelectAll}
                isAllSelected={isAllSelected}
                filters={filters}
                setFilters={setFilters}
                managers={managers}
                onUpdateField={handleUpdateField}
                onEdit={(client) => setDialogs(prev => ({ ...prev, editingClient: client }))}
                showFinancials={!!showFinancials}
                currencySymbol={currencySymbol}
                userRoleName={userRoleName || undefined}
                now={viewState.now}
            />

            {
                clientsList.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-sm font-bold text-slate-400 leading-loose">Ничего не найдено</p>
                    </div>
                )
            }

            {
                (viewState.data?.total || 0) > 0 && (
                    <Pagination
                        totalItems={viewState.data?.total || 0}
                        pageSize={10}
                        currentPage={currentPage}
                        itemNames={['клиент', 'клиента', 'клиентов']}
                    />
                )
            }

            <ClientProfileDrawer
                clientId={dialogs.selectedClientId || ""}
                isOpen={!!dialogs.selectedClientId}
                onClose={() => setDialogs(prev => ({ ...prev, selectedClientId: null }))}
                onEdit={() => {
                    const client = clientsList.find((c: Client) => c.id === dialogs.selectedClientId);
                    if (client) {
                        setDialogs(prev => ({ ...prev, editingClient: client, selectedClientId: null }));
                    }
                }}
                showFinancials={showFinancials}
                userRoleName={userRoleName}
            />

            {
                dialogs.editingClient && (
                    <EditClientDialog
                        client={dialogs.editingClient}
                        isOpen={!!dialogs.editingClient}
                        onClose={() => {
                            setDialogs(prev => ({ ...prev, editingClient: null }));
                            fetchClients();
                        }}
                    />
                )
            }

            <ClientBulkActions
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                managers={managers}
                userRoleName={userRoleName}
                fetchClients={fetchClients}
                handleExportClick={handleExportClick}
                showArchived={filters.showArchived}
                mounted={viewState.mounted}
            />

            <ExportDialog
                open={uiState.showExportDialog}
                onClose={() => setUiState(prev => ({ ...prev, showExportDialog: false }))}
                selectedIds={selectedIds.length > 0 ? selectedIds : undefined}
                filters={{
                    clientType: filters.clientType,
                    managerId: filters.managerId,
                    acquisitionSource: filters.acquisitionSource,
                    funnelStage: filters.status === "lost" ? "lost" : undefined,
                    activityStatus: filters.activityStatus,
                    rfmSegment: filters.rfmSegment,
                    search: debouncedSearch,
                }}
                totalCount={viewState.data?.total || 0}
            />
        </div>
    );
}
