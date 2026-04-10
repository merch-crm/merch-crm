"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientsSegmentTabs } from "./clients-segment-tabs";
import { ActivityStatusTabs } from "./activity-status-tabs";
import { AtRiskBanner } from "./at-risk-banner";
import { ClientFilterPanel } from "./client-filter-panel";

import { ClientFilters } from "../actions";
import { ClientUiState, ClientTypeCounts, ActivityCounts } from "../hooks/use-clients-state";

/** Справочные данные для панели фильтров */
export interface FilterReferenceData {
  regions: string[];
  managers: { id: string; name: string }[];
  sources: string[];
}

/** Обработчики событий */
export interface HeaderHandlers {
  onClientTypeChange: (type: "all" | "b2c" | "b2b") => void;
  onActivityStatusChange: (status: string) => void;
  onDismissAtRiskBanner: () => void;
  onExportClick: () => void;
  addToHistory: (query: string) => void;
}

interface ClientListHeaderProps {
  filters: ClientFilters;
  setFilters: React.Dispatch<React.SetStateAction<ClientFilters>>;
  typeCounts: ClientTypeCounts;
  activityCounts: ActivityCounts | null;
  showAtRiskBanner: boolean;
  uiState: ClientUiState;
  setUiState: React.Dispatch<React.SetStateAction<ClientUiState>>;
  referenceData: FilterReferenceData;
  handlers: HeaderHandlers;
}

export function ClientListHeader({
  filters,
  setFilters,
  typeCounts,
  activityCounts,
  showAtRiskBanner,
  uiState,
  setUiState,
  referenceData,
  handlers,
}: ClientListHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">
        <ClientsSegmentTabs value={filters.clientType as "all" | "b2c" | "b2b"} onChange={handlers.onClientTypeChange} counts={typeCounts} />

        <ActivityStatusTabs value={filters.activityStatus} onChange={handlers.onActivityStatusChange} counts={activityCounts || undefined} />
      </div>

      {showAtRiskBanner && filters.activityStatus === "all" && activityCounts && (activityCounts.atRisk > 0 || activityCounts.attention > 0) && (
        <AtRiskBanner atRiskCount={activityCounts.atRisk} attentionCount={activityCounts.attention} onDismiss={handlers.onDismissAtRiskBanner} />
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <ClientFilterPanel filters={filters} setFilters={setFilters} uiState={uiState} setUiState={setUiState} regions={referenceData.regions} managers={referenceData.managers} sources={referenceData.sources} onAddToHistory={handlers.addToHistory} activityCounts={activityCounts || undefined} />
        </div>
        <Button variant="outline" onClick={handlers.onExportClick} className="h-12 px-6 rounded-2xl bg-white border-2 border-slate-100 text-slate-600 hover:bg-slate-50 font-bold hidden sm:flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-500" />
          Экспорт
        </Button>
      </div>
    </div>
  );
}
