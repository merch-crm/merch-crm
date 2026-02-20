"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SecurityData, SystemError } from "../types";
import { MaintenanceModeCard } from "../security/maintenance-mode-card";
import { FailedLoginsCard } from "../security/failed-logins-card";
import { SystemErrorsCard } from "../security/system-errors-card";
import { ErrorDetailsDialog } from "../security/error-details-dialog";

interface SecurityTabProps {
    securityData: SecurityData | null;
    onRefresh: (force?: boolean) => void;
    onToggleMaintenance: (checked: boolean) => void;
    isTogglingMaintenance: boolean;
    onClearFailedLogins: () => void;
    isClearingLogins: boolean;
    onClearSecurityErrors: () => void;
    isClearingErrors: boolean;
}

export function SecurityTab({
    securityData,
    onRefresh,
    onToggleMaintenance,
    isTogglingMaintenance,
    onClearFailedLogins,
    isClearingLogins,
    onClearSecurityErrors,
    isClearingErrors,
}: SecurityTabProps) {
    const [selectedError, setSelectedError] = useState<SystemError | null>(null);

    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300 px-1">
            <div className="space-y-4">
                {/* Security Section Header */}
                <div className="px-1 flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-bold text-slate-800">
                            Безопасность
                        </h4>
                        <p className="text-xs font-bold text-slate-400">
                            Режим обслуживания и фильтрация входа
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onRefresh(true)}
                        className="bg-white border-slate-200 text-slate-400 hover:text-[#5d00ff] hover:bg-indigo-50/50 rounded-[18px] h-9 w-9"
                        title="Обновить данные"
                    >
                        <RefreshCw size={16} />
                    </Button>
                </div>

                <div className="flex flex-col gap-4 pb-4">
                    {/* Maintenance Mode */}
                    <MaintenanceModeCard
                        maintenanceMode={securityData?.maintenanceMode || false}
                        onToggleMaintenance={onToggleMaintenance}
                        isTogglingMaintenance={isTogglingMaintenance}
                    />

                    {/* Failed Logins Table */}
                    <FailedLoginsCard
                        failedLogins={securityData?.failedLogins || []}
                        onClearFailedLogins={onClearFailedLogins}
                        isClearingLogins={isClearingLogins}
                    />
                </div>
            </div>

            {/* System Errors Table */}
            <SystemErrorsCard
                systemErrors={securityData?.systemErrors || []}
                onClearSecurityErrors={onClearSecurityErrors}
                isClearingErrors={isClearingErrors}
                onViewDetails={setSelectedError}
            />

            {/* Error Details Dialog */}
            <ErrorDetailsDialog
                error={selectedError}
                onClose={() => setSelectedError(null)}
            />
        </div>
    );
}
