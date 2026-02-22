import { getSystemStats, getBackupsList } from "./actions/system.actions";
import { getMonitoringStats, getSecurityStats } from "./actions/security.actions";;
import { AdminOverviewClient } from "./admin-overview-client";
import { Suspense } from "react";

export default async function AdminPage() {
    return (
        <Suspense fallback={<AdminDashboardSkeleton />}>
            <AdminOverview />
        </Suspense>
    );
}

async function AdminOverview() {
    // Parallelize all data fetching
    const [statsRes, monitoringRes, securityRes, backupsRes] = await Promise.all([
        getSystemStats(),
        getMonitoringStats(),
        getSecurityStats(),
        getBackupsList()
    ]);

    return (
        <AdminOverviewClient
            stats={statsRes.success ? statsRes.data : undefined}
            monitoring={monitoringRes.success ? (monitoringRes.data as never) : undefined}
            security={securityRes.success ? securityRes.data : undefined}
            backups={backupsRes.success ? backupsRes.data : []}
        />
    );
}

function AdminDashboardSkeleton() {
    return (
        <div className="space-y-3 animate-pulse">
            <div className="flex justify-between items-end">
                <div className="space-y-3">
                    <div className="h-10 w-64 bg-slate-200 rounded-xl" />
                    <div className="h-4 w-96 bg-slate-100 rounded-lg" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-8 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-64 bg-white rounded-[2rem] border border-slate-200" />
                        <div className="h-64 bg-white rounded-[2rem] border border-slate-200" />
                    </div>
                    <div className="h-[400px] bg-white rounded-[2rem] border border-slate-200" />
                </div>
                <div className="lg:col-span-4 space-y-3">
                    <div className="h-[300px] bg-slate-200 rounded-[2rem]" />
                    <div className="h-full bg-white rounded-[2rem] border border-slate-200" />
                </div>
            </div>
        </div>
    );
}
