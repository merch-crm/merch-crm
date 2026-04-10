import { useState } from "react";
import { useSearchParams } from "next/navigation";
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

export interface ClientsData {
  clients: Client[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface ClientViewState {
  data: ClientsData | null;
  loading: boolean;
  mounted: boolean;
  now: number;
}

export interface ActivityCounts {
  active: number;
  attention: number;
  atRisk: number;
  inactive: number;
  total: number;
}

export interface ClientsInitialData {
  clients: Client[];
  total: number;
  totalPages: number;
  currentPage: number;
  managers: { id: string; name: string }[];
  regions: string[];
  sources: string[];
  typeCounts: ClientTypeCounts;
  activityCounts: ActivityCounts;
  clientsData: ClientsData;
}

export function useClientsState(initialData?: ClientsInitialData) {
  const searchParams = useSearchParams();

  const [viewState, setViewState] = useState<ClientViewState>({
    data: initialData?.clientsData || null,
    loading: !initialData,
    mounted: false,
    now: 0
  });

  const [filters, setFilters] = useState<ClientFilters>(() => ({
    page: Number(searchParams.get("page")) || 1,
    limit: 10,
    search: searchParams.get("search") || "",
    sortBy: "alphabet",
    period: "all",
    orderCount: "any",
    region: "all",
    status: "all",
    showArchived: false,
    clientType: (searchParams.get("type") as "all" | "b2c" | "b2b") || "all",
    managerId: "all",
    acquisitionSource: "all",
    activityStatus: (searchParams.get("activityStatus") as ClientFilters['activityStatus']) || "all",
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
  const [managers, setManagers] = useState<{ id: string; name: string }[]>(initialData?.managers || []);
  const [regions, setRegions] = useState<string[]>(initialData?.regions || []);
  const [sources, setSources] = useState<string[]>(initialData?.sources || []);

  const [typeCounts, setTypeCounts] = useState<ClientTypeCounts>(initialData?.typeCounts || { all: 0, b2c: 0, b2b: 0 });
  const [activityCounts, setActivityCounts] = useState<ActivityCounts | null>(initialData?.activityCounts || null);

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

