"use client";

import { SystemStats } from "@/components/admin/system-stats";

export default function MonitoringStatsPage() {
    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-normal">Мониторинг</h1>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mt-1">Техническое состояние системы и нагрузка на ресурсы</p>
            </div>

            <div className="bg-white rounded-[24px] p-8 shadow-crm-lg border border-slate-100">
                <SystemStats />
            </div>
        </div>
    );
}
