"use client";

import { useEffect, useState, useCallback } from "react";
import { getAuditLogs, clearAuditLogs, getUsers } from "@/app/(main)/admin-panel/actions";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AuditLog, PAGE_SIZE } from "./audit-logs/utils";
import { AuditLogsFilters } from "./audit-logs/audit-logs-filters";
import { AuditLogsList } from "./audit-logs/audit-logs-list";
import { AuditLogDetails } from "@/lib/types";

export function AuditLogsTable({ isAdmin }: { isAdmin?: boolean }) {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const page = Number(searchParams.get("page")) || 1;
    const query = searchParams.get("search") || "";

    const [dataState, setDataState] = useState({
        logs: [] as AuditLog[],
        totalLogs: 0,
        allUsers: [] as Array<{ id: string, name: string }>
    });

    const [uiState, setUiState] = useState({
        loading: true,
        clearing: false,
        showConfirmDialog: false,
        searchTerm: query,
        selectedUserId: searchParams.get("userId") || "",
        selectedEntityType: searchParams.get("entityType") || "",
        startDate: searchParams.get("startDate") || "",
        endDate: searchParams.get("endDate") || ""
    });

    const fetchLogs = useCallback(async () => {
        setUiState(prev => ({ ...prev, loading: true }));
        try {
            const res = await getAuditLogs(
                page,
                PAGE_SIZE,
                query,
                uiState.selectedUserId || null,
                uiState.selectedEntityType || null,
                uiState.startDate || null,
                uiState.endDate || null
            );
            if (res.success && res.data) {
                setDataState(prev => ({
                    ...prev,
                    logs: (res.data as unknown as AuditLog[]).map(log => ({
                        ...log,
                        details: log.details as AuditLogDetails | null
                    })),
                    totalLogs: res.pagination?.total || 0
                }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUiState(prev => ({ ...prev, loading: false }));
        }
    }, [page, query, uiState.selectedUserId, uiState.selectedEntityType, uiState.startDate, uiState.endDate]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await getUsers(1, 100);
                if (res.success && res.data) {
                    setDataState(prev => ({ ...prev, allUsers: Array.isArray(res.data) ? res.data : [] }));
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
                toast("Не удалось загрузить список пользователей", "destructive");
            }
        };
        fetchUsers();
    }, [toast]);

    const handleClearLogs = async () => {
        setUiState(prev => ({ ...prev, clearing: true }));
        try {
            const res = await clearAuditLogs();
            if (res.success) {
                toast("Логи успешно очищены", "success");
                fetchLogs();
            } else {
                toast(res.error || "Ошибка при очистке логов", "destructive");
            }
        } catch (error) {
            console.error(error);
            toast("Произошла ошибка", "destructive");
        } finally {
            setUiState(prev => ({ ...prev, clearing: false, showConfirmDialog: false }));
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            params.set("page", "1");

            if (uiState.searchTerm !== query) {
                if (uiState.searchTerm) params.set("search", uiState.searchTerm);
                else params.delete("search");
            }

            if (uiState.selectedUserId) params.set("userId", uiState.selectedUserId);
            else params.delete("userId");

            if (uiState.selectedEntityType) params.set("entityType", uiState.selectedEntityType);
            else params.delete("entityType");

            if (uiState.startDate) params.set("startDate", uiState.startDate);
            else params.delete("startDate");

            if (uiState.endDate) params.set("endDate", uiState.endDate);
            else params.delete("endDate");

            replace(`${pathname}?${params.toString()}`);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [uiState.searchTerm, uiState.selectedUserId, uiState.selectedEntityType, uiState.startDate, uiState.endDate, pathname, replace, searchParams, query]);

    return (
        <div className="space-y-3">
            <AuditLogsFilters
                searchTerm={uiState.searchTerm}
                onSearchChange={(val) => setUiState(prev => ({ ...prev, searchTerm: val }))}
                selectedUserId={uiState.selectedUserId}
                onUserChange={(val) => setUiState(prev => ({ ...prev, selectedUserId: val }))}
                users={dataState.allUsers}
                selectedEntityType={uiState.selectedEntityType}
                onEntityTypeChange={(val) => setUiState(prev => ({ ...prev, selectedEntityType: val }))}
                startDate={uiState.startDate}
                onStartDateChange={(val) => setUiState(prev => ({ ...prev, startDate: val }))}
                endDate={uiState.endDate}
                onEndDateChange={(val) => setUiState(prev => ({ ...prev, endDate: val }))}
                onReset={() => {
                    setUiState(prev => ({
                        ...prev,
                        searchTerm: "",
                        selectedUserId: "",
                        selectedEntityType: "",
                        startDate: "",
                        endDate: ""
                    }));
                }}
                isAdmin={isAdmin}
                onClearLogs={() => setUiState(prev => ({ ...prev, showConfirmDialog: true }))}
                isClearing={uiState.clearing}
            />

            <ConfirmDialog
                isOpen={uiState.showConfirmDialog}
                onClose={() => setUiState(prev => ({ ...prev, showConfirmDialog: false }))}
                onConfirm={handleClearLogs}
                title="Очистка логов аудита"
                description="Вы уверены, что хотите очистить все логи аудита? Это действие необратимо."
                confirmText="Очистить"
                variant="destructive"
                isLoading={uiState.clearing}
            />

            <AuditLogsList
                logs={dataState.logs}
                loading={uiState.loading}
            />

            <Pagination
                totalItems={dataState.totalLogs}
                pageSize={PAGE_SIZE}
                currentPage={page}
                itemNames={['запись', 'записи', 'записей']}
            />
        </div>
    );
}
