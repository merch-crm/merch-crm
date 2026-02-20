"use client";

import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MonitoringData, StatsData } from "../types";
import { MonitoringStats } from "../monitoring/monitoring-stats";
import { ActiveUsersList } from "../monitoring/active-users-list";
import { MaintenanceControls } from "../monitoring/maintenance-controls";
import { ActivityGraph } from "../monitoring/activity-graph";

interface MonitoringTabProps {
    stats: StatsData | null;
    monitoringData: MonitoringData | null;
    loading: boolean;
    error: string | null;
    lastUpdated: Date;
    onRefresh: (force?: boolean) => void;
    onClearRam: () => void;
    isClearingRam: boolean;
    onRestartRequest: () => void;
    isRestartingAction: boolean;
}

export function MonitoringTab({
    stats,
    monitoringData,
    loading,
    error,
    lastUpdated,
    onRefresh,
    onClearRam,
    isClearingRam,
    onRestartRequest,
    isRestartingAction,
}: MonitoringTabProps) {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between px-1">
                <div className="text-slate-400 text-xs font-bold">
                    Живой поток данных
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right mr-2 hidden sm:block">
                        <p className="text-xs text-slate-400 font-bold leading-none">
                            Обновлено
                        </p>
                        <p className="text-xs text-slate-600 font-medium">
                            {lastUpdated.toLocaleTimeString()}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onRefresh(true)}
                        disabled={loading}
                        className="bg-white border-slate-200 text-slate-600 hover:text-[#5d00ff] hover:bg-indigo-50/30 rounded-[18px] h-10 w-10"
                    >
                        <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-[18px] border border-red-100 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-sm font-bold">Ошибка обновления: {error}</p>
                </div>
            )}

            {/* Main Metrics & Storage */}
            <MonitoringStats stats={stats} monitoringData={monitoringData} />

            {/* Active Users */}
            <ActiveUsersList monitoringData={monitoringData} />

            {/* Maintenance Controls */}
            <div className="mt-6">
                <h5 className="text-xs font-bold text-slate-400 mb-4 px-1">
                    Инструменты обслуживания
                </h5>
                <MaintenanceControls
                    onClearRam={onClearRam}
                    isClearingRam={isClearingRam}
                    onRestartRequest={onRestartRequest}
                    isRestartingAction={isRestartingAction}
                />
            </div>

            {/* Activity Graph */}
            <div className="mt-6">
                <ActivityGraph monitoringData={monitoringData} />
            </div>
        </div>
    );
}
