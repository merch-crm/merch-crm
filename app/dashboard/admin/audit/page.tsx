import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AuditLogsTable } from "./audit-logs-table";

export default async function AdminAuditPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const userData = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    });

    const isAdmin = userData?.role?.name === "Администратор";

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-white rounded-xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m11 3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Доступ ограничен</h2>
                <p className="text-slate-500 mt-2">Просмотр логов аудита доступен только администраторам системы.</p>
            </div>
        );
    }

    return <AuditLogsTable isAdmin={isAdmin} />;
}
