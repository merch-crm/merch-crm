"use client";

import { SystemStats } from "@/components/admin/system-stats";
import { Activity } from "lucide-react";

export default function MonitoringStatsPage() {
    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center border border-primary/10">
                    <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-normal">Мониторинг</h1>
                    <p className="text-slate-500 text-[11px] font-medium mt-0.5">Техническое состояние системы и нагрузка на ресурсы</p>
                </div>
            </div>

            <div className="crm-card">
                <SystemStats />
            </div>
        </div>
    );
}
