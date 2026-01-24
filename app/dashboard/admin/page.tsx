import {
    getSystemStats,
    getMonitoringStats,
    getSecurityStats,
    getBackupsList
} from "./actions";
import { AdminOverviewClient } from "@/app/dashboard/admin/admin-overview-client";

export default async function AdminPage() {
    // Fetch multiple sets of data for a comprehensive overview
    const [statsRes, monitoringRes, securityRes, backupsRes] = await Promise.all([
        getSystemStats(),
        getMonitoringStats(),
        getSecurityStats(),
        getBackupsList()
    ]);

    return (
        <AdminOverviewClient
            stats={statsRes.data}
            monitoring={monitoringRes}
            security={securityRes}
            backups={backupsRes.data}
        />
    );
}
