import React from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface MaintenanceModeCardProps {
    maintenanceMode: boolean;
    onToggleMaintenance: (checked: boolean) => void;
    isTogglingMaintenance: boolean;
}

export function MaintenanceModeCard({
    maintenanceMode,
    onToggleMaintenance,
    isTogglingMaintenance,
}: MaintenanceModeCardProps) {
    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-[32px] border">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-[#5d00ff] rounded-[18px]">
                            <Shield size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-slate-900">
                                Режим обслуживания
                            </CardTitle>
                            <p className="text-xs text-slate-400 font-bold mt-0.5">
                                Ограничение доступа к системе
                            </p>
                        </div>
                    </div>
                    <div
                        className={cn(
                            "px-4 py-1.5 rounded-full text-[11px] font-bold",
                            maintenanceMode
                                ? "bg-rose-50 text-rose-600"
                                : "bg-emerald-50 text-emerald-600"
                        )}
                    >
                        {maintenanceMode ? "Активен" : "Выключен"}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-2 pb-6">
                <div className="flex items-center justify-between gap-4 bg-slate-50/50 p-6 rounded-[18px] border border-slate-200/50">
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[320px]">
                            При активации доступ к CRM будет разрешен только
                            администраторам.
                        </p>
                    </div>
                    <Switch
                        checked={maintenanceMode}
                        onCheckedChange={onToggleMaintenance}
                        disabled={isTogglingMaintenance}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
