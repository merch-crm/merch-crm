import { useState } from "react";
import type { ClientSummary as Client } from "@/lib/types";
import { ClientFilters } from "../actions";;

export interface ClientUiState {
    showFilters: boolean;
    showHistory: boolean;
    showManagerSelect: boolean;
    showDeleteConfirm: boolean;
    isBulkUpdating: boolean;
    searchHistory: string[];
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
        showArchived: false
    }));

    const [uiState, setUiState] = useState<ClientUiState>(() => ({
        showFilters: false,
        showHistory: false,
        showManagerSelect: false,
        showDeleteConfirm: false,
        isBulkUpdating: false,
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

    return {
        viewState, setViewState,
        filters, setFilters,
        uiState, setUiState,
        dialogs, setDialogs,
        selectedIds, setSelectedIds,
        managers, setManagers,
        regions, setRegions
    };
}
