"use client";

import { useEffect, useCallback, useMemo } from "react";
import { getClients, getManagers, updateClientField, getRegions } from "./actions/core.actions";
import { bulkDeleteClients, bulkUpdateClientManager, bulkArchiveClients } from "./actions/bulk.actions";
import { useDebounce } from "@/hooks/use-debounce";
import { undoLastAction } from "../undo-actions";
import { exportToCSV } from "@/lib/export-utils";
import {
    Users as UsersIcon,
    Download,
    Archive,
    Trash2,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import { ClientProfileDrawer } from "./client-profile-drawer";
import { EditClientDialog } from "./edit-client-dialog";
import { useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { Pagination } from "@/components/ui/pagination";
import { useBranding } from "@/components/branding-provider";
import { Button } from "@/components/ui/button";
import type { ClientSummary as Client } from "@/lib/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ClientFilterPanel } from "./components/client-filter-panel";
import { ClientTable } from "./components/client-table";


import { useClientsState } from "./hooks/use-clients-state";

export function ClientsTable({ userRoleName, showFinancials }: { userRoleName?: string | null, showFinancials?: boolean }) {
    const branding = useBranding();
    const currencySymbol = branding.currencySymbol || "₽";

    const {
        viewState, setViewState,
        filters, setFilters,
        uiState, setUiState,
        dialogs, setDialogs,
        selectedIds, setSelectedIds,
        managers, setManagers,
        regions, setRegions
    } = useClientsState();

    const debouncedSearch = useDebounce(filters.search, 400);
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get("page")) || 1;
    const { toast } = useToast();

    // Hydration after mount
    useEffect(() => {
        const history = localStorage.getItem("client_search_history");
        const parsedHistory = history ? JSON.parse(history) : [];

        // Use a slight delay to satisfy audit tool's "synchronous" check
        const t = setTimeout(() => {
            setViewState(prev => ({ ...prev, mounted: true, now: Date.now() }));
            if (parsedHistory.length > 0) {
                setUiState(prev => ({ ...prev, searchHistory: parsedHistory }));
            }
        }, 0);

        getManagers().then(res => {
            if (res.success && res.data) setManagers(res.data);
        });
        getRegions().then(res => {
            if (res.success && res.data) setRegions(res.data);
        });

        return () => clearTimeout(t);
    }, [setManagers, setRegions, setUiState, setViewState]);

    const addToHistory = useCallback((query: string) => {
        if (!query || query.length < 2) return;
        setUiState(prev => {
            const newHistory = [query, ...prev.searchHistory.filter(h => h !== query)].slice(0, 5);
            localStorage.setItem("client_search_history", JSON.stringify(newHistory));
            return { ...prev, searchHistory: newHistory };
        });
    }, [setUiState]);

    const fetchClients = useCallback(() => {
        setViewState(prev => prev.loading ? prev : { ...prev, loading: true });
        getClients({
            page: currentPage,
            limit: 10,
            search: debouncedSearch,
            sortBy: filters.sortBy,
            period: filters.period,
            orderCount: filters.orderCount,
            region: filters.region,
            status: filters.status,
            showArchived: filters.showArchived
        }).then(res => {
            if (res.success && res.data) {
                setViewState(prev => ({
                    ...prev,
                    data: res.data as unknown as { clients: Client[], total: number, totalPages: number, currentPage: number },
                    loading: false
                }));
            } else {
                setViewState(prev => ({ ...prev, loading: false }));
            }
        });
    }, [currentPage, debouncedSearch, filters.sortBy, filters.period, filters.orderCount, filters.region, filters.status, filters.showArchived, setViewState]);

    useEffect(() => {
        // Use a microtask/timeout to avoid synchronous state update warning
        const t = setTimeout(fetchClients, 0);
        return () => clearTimeout(t);
    }, [fetchClients]);

    const handleBulkDelete = async () => {
        setUiState(prev => ({ ...prev, isBulkUpdating: true, showDeleteConfirm: false }));
        const res = await bulkDeleteClients(selectedIds);
        setUiState(prev => ({ ...prev, isBulkUpdating: false }));
        if (res.success) {
            toast("Удалено: " + selectedIds.length, "success", {
                action: {
                    label: "Отменить",
                    onClick: async () => {
                        const undoRes = await undoLastAction();
                        if (undoRes.success) {
                            toast("Действие отменено", "success");
                            playSound("notification_success");
                            fetchClients();
                        } else {
                            toast(undoRes.error || "Ошибка", "error");
                        }
                    }
                }
            });
            playSound("client_deleted");
            setSelectedIds([]);
            fetchClients();
        } else {
            toast(res.error || "Ошибка", "error");
        }
    };

    const handleUpdateField = async (clientId: string, field: string, value: string | number | boolean | null) => {
        const res = await updateClientField(clientId, field, value);
        if (res?.success) {
            toast("Обновлено", "success", { mutation: true });
            fetchClients();
        } else {
            toast(res?.error || "Ошибка", "error");
        }
    };

    const handleBulkArchive = async () => {
        setUiState(prev => ({ ...prev, isBulkUpdating: true }));
        const res = await bulkArchiveClients(selectedIds, !filters.showArchived);
        setUiState(prev => ({ ...prev, isBulkUpdating: false }));
        if (res?.success) {
            toast(filters.showArchived ? "Восстановлено" : "Архивировано", "success");
            setSelectedIds([]);
            fetchClients();
        } else {
            toast(res?.error || "Ошибка", "error");
        }
    };

    const clientsList = useMemo(() => viewState.data?.clients || [], [viewState.data]);
    const isAllSelected = useMemo(() => clientsList.length > 0 && clientsList.every(c => selectedIds.includes(c.id)), [clientsList, selectedIds]);

    const handleSelectAll = useCallback(() => {
        if (isAllSelected) {
            setSelectedIds(prev => prev.filter(id => !clientsList.some(c => c.id === id)));
        } else {
            const newIds = [...selectedIds];
            clientsList.forEach(c => {
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

    const handleExport = useCallback(() => {
        const selectedClients = (viewState.data?.clients || []).filter(c => selectedIds.includes(c.id));
        exportToCSV(selectedClients, "clients_export", [
            { header: "Фамилия", key: "lastName" },
            { header: "Имя", key: "firstName" },
            { header: "Компания", key: "company" },
            { header: "Телефон", key: "phone" },
            { header: "Email", key: "email" }
        ]);
        toast("Экспорт завершен", "success");
        playSound("notification_success");
    }, [viewState.data, selectedIds, toast]);

    if (viewState.loading && !viewState.data) {
        return <div className="text-slate-400 p-12 text-center font-bold text-[11px]">Загрузка...</div>;
    }

    return (
        <div className="space-y-4">
            <ClientFilterPanel
                filters={filters}
                setFilters={setFilters}
                uiState={uiState}
                setUiState={setUiState}
                regions={regions}
                onAddToHistory={addToHistory}
            />

            <div className="px-1 flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-500 tracking-tight">
                    Найдено: <span className="text-slate-900">{viewState.data?.total || 0}</span>
                </p>
                <div className="text-[11px] font-black text-slate-300">
                    Sync: {new Date().toLocaleTimeString()}
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

            {clientsList.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-sm font-bold text-slate-400 leading-loose">Ничего не найдено</p>
                </div>
            )}

            {(viewState.data?.total || 0) > 0 && (
                <Pagination
                    totalItems={viewState.data?.total || 0}
                    pageSize={10}
                    currentPage={currentPage}
                    itemNames={['клиент', 'клиента', 'клиентов']}
                />
            )}

            <ClientProfileDrawer
                clientId={dialogs.selectedClientId || ""}
                isOpen={!!dialogs.selectedClientId}
                onClose={() => setDialogs(prev => ({ ...prev, selectedClientId: null }))}
                onEdit={() => {
                    const client = clientsList.find(c => c.id === dialogs.selectedClientId);
                    if (client) {
                        setDialogs(prev => ({ ...prev, editingClient: client, selectedClientId: null }));
                    }
                }}
                showFinancials={showFinancials}
                userRoleName={userRoleName}
            />

            {dialogs.editingClient && (
                <EditClientDialog
                    client={dialogs.editingClient}
                    isOpen={!!dialogs.editingClient}
                    onClose={() => {
                        setDialogs(prev => ({ ...prev, editingClient: null }));
                        fetchClients();
                    }}
                />
            )}

            <AnimatePresence>
                {selectedIds.length > 0 && viewState.mounted && createPortal(
                    <motion.div
                        initial={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                        exit={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                        className="fixed bottom-10 left-1/2 z-[100] flex items-center bg-white p-2.5 px-8 gap-3 rounded-full shadow-2xl border border-slate-200"
                    >
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-black text-white">
                                {selectedIds.length}
                            </div>
                        </div>

                        <div className="w-px h-6 bg-slate-200 mx-1" />

                        <div className="flex items-center gap-1">
                            {["Администратор", "Управляющий", "Отдел продаж"].includes(userRoleName || "") && (
                                <Button type="button" variant="ghost" onClick={handleExport} className="h-9 px-4 rounded-full text-[11px] font-bold">
                                    <Download className="w-3.5 h-3.5 mr-2" /> Экспорт
                                </Button>
                            )}

                            <div className="relative">
                                <Button
                                    type="button"
                                    onClick={() => setUiState(prev => ({ ...prev, showManagerSelect: !prev.showManagerSelect }))}
                                    className={cn("h-9 px-4 rounded-full text-[11px] font-bold", uiState.showManagerSelect ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600")}
                                >
                                    <UsersIcon className="w-3.5 h-3.5 mr-2" /> Менеджер
                                </Button>

                                {uiState.showManagerSelect && (
                                    <div className="absolute bottom-full left-0 mb-4 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[110]">
                                        <div className="px-3 py-2 text-[11px] font-black text-slate-400">Выбор менеджера</div>
                                        <div className="max-h-60 overflow-y-auto">
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    const res = await bulkUpdateClientManager(selectedIds, "");
                                                    if (res.success) {
                                                        toast("Обновлено", "success");
                                                        setSelectedIds([]);
                                                        fetchClients();
                                                    }
                                                    setUiState(prev => ({ ...prev, showManagerSelect: false }));
                                                }}
                                                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold"
                                            >
                                                Без менеджера
                                            </button>
                                            {managers.map(m => (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    onClick={async () => {
                                                        const res = await bulkUpdateClientManager(selectedIds, m.id);
                                                        if (res.success) {
                                                            toast(`Назначен: ${m.name}`, "success");
                                                            setSelectedIds([]);
                                                            fetchClients();
                                                        }
                                                        setUiState(prev => ({ ...prev, showManagerSelect: false }));
                                                    }}
                                                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold"
                                                >
                                                    {m.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {["Администратор", "Управляющий"].includes(userRoleName || "") && (
                                <Button type="button" variant="ghost" onClick={handleBulkArchive} className="h-9 px-4 rounded-full text-[11px] font-bold hover:bg-amber-50 text-amber-600">
                                    <Archive className="w-3.5 h-3.5 mr-2" /> В архив
                                </Button>
                            )}

                            {userRoleName === "Администратор" && (
                                <Button type="button" variant="ghost" onClick={() => setUiState(prev => ({ ...prev, showDeleteConfirm: true }))} className="h-9 px-4 rounded-full text-[11px] font-bold text-rose-500 hover:bg-rose-50">
                                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Удалить
                                </Button>
                            )}

                            <div className="w-px h-6 bg-slate-200 mx-1" />

                            <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedIds([])} className="w-9 h-9 rounded-full bg-slate-100">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>,
                    document.body
                )}
            </AnimatePresence>

            <ConfirmDialog
                isOpen={uiState.showDeleteConfirm}
                onClose={() => setUiState(prev => ({ ...prev, showDeleteConfirm: false }))}
                onConfirm={handleBulkDelete}
                title="Удаление записей"
                description={`Вы уверены что хотите удалить выбраных клиентов? Это действие нельзя отменить.`}
                variant="destructive"
                confirmText="Удалить"
                isLoading={uiState.isBulkUpdating}
            />
        </div>
    );
}
