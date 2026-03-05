import { useState } from "react";
import type { ClientSummary as Client } from "@/lib/types";
import { ClientFilters } from "../actions";

export interface ClientUiState {
    showFilters: boolean;
    showHistory: boolean;
    showManagerSelect: boolean;
    showDeleteConfirm: boolean;
    isBulkUpdating: boolean;
    showExportDialog: boolean;
    searchHistory: string[];
}

export interface ClientTypeCounts {
    all: number;
    b2c: number;
    b2b: number;
}

export interface ActivityCounts {
    active: number;
    attention: number;
    atRisk: number;
    inactive: number;
    total: number;
}

export function useClientsState() {
    const [viewState, setViewState] = useState({
        data: null as { clients: Client[], total: number, totalPages: number, currentPage: number } | null,
        loading: true,
        mounted: false,
        now: 0
    });

    const [filters, setFilters] = useState<ClientFilters>(() => ({
        page: 1,
        limit: 50,
        search: "",
        sortBy: "alphabet",
        period: "all",
        orderCount: "any",
        region: "all",
        status: "all",
        showArchived: false,
        clientType: "all",
        managerId: "all",
        acquisitionSource: "all",
        activityStatus: "all",
        rfmSegment: "all",
    }));

    const [uiState, setUiState] = useState<ClientUiState>(() => ({
        showFilters: false,
        showHistory: false,
        showManagerSelect: false,
        showDeleteConfirm: false,
        isBulkUpdating: false,
        showExportDialog: false,
        searchHistory: []
    }));

    const [dialogs, setDialogs] = useState({
        selectedClientId: null as string | null,
        editingClient: null as Client | null,
        deletingClient: null as Client | null,
        idsToDelete: null as string[] | null
    });

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
    const [regions, setRegions] = useState<string[]>([]);
    const [sources, setSources] = useState<string[]>([]);

    const [typeCounts, setTypeCounts] = useState<ClientTypeCounts>({ all: 0, b2c: 0, b2b: 0 });
    const [activityCounts, setActivityCounts] = useState<ActivityCounts | null>(null);

    return {
        viewState, setViewState,
        filters, setFilters,
        uiState, setUiState,
        dialogs, setDialogs,
        selectedIds, setSelectedIds,
        managers, setManagers,
        regions, setRegions,
        sources, setSources,
        typeCounts, setTypeCounts,
        activityCounts, setActivityCounts,
    };
}
