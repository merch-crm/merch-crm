import { getAuditLogs } from "../actions/security.actions";
import { AuditClient, type AuditLog } from "./audit-client";
import { Activity } from "lucide-react";
import { getRoles } from "../actions/roles.actions";
import { getUsers } from "../actions/users.actions";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;
    const search = (searchParams.search as string) || "";
    const userId = (searchParams.userId as string) || undefined;
    const entityType = (searchParams.entityType as string) || undefined;
    const startDate = (searchParams.startDate as string) || undefined;
    const endDate = (searchParams.endDate as string) || undefined;

    const [auditResponse, rolesResponse, usersResponse] = await Promise.all([
        getAuditLogs(page, 25, search, userId, entityType, startDate, endDate),
        getRoles(),
        getUsers()
    ]);

    const logs = auditResponse.success ? auditResponse.data.logs : [];
    const pagination = auditResponse.success ? auditResponse.data.pagination : { total: 0, page: 1, limit: 25, totalPages: 1 };
    const _roles = rolesResponse.success ? rolesResponse.data : [];
    const users = usersResponse.success ? usersResponse.data : [];

    return (
        <div className="space-y-3 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center border border-primary/10 shrink-0">
                        <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-extrabold text-slate-900 truncate">Логи аудита</h1>
                        <p className="text-slate-500 text-xs font-medium mt-0.5">История всех изменений и действий в системе</p>
                    </div>
                </div>
            </div>

            <AuditClient 
                initialLogs={logs as unknown as AuditLog[]} 
                pagination={pagination}
                users={users as unknown as { id: string; name: string }[]}
            />
        </div>
    );
}
