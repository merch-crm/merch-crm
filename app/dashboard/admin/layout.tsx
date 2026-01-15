import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import AdminTabs from "./admin-tabs";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    let isAdmin = false;
    if (session) {
        const userData = await db.query.users.findFirst({
            where: eq(users.id, session.id),
            with: { role: true }
        });
        isAdmin = userData?.role?.name === "Администратор";
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-10">
            <div className="space-y-2">
                <h1 className="text-[32px] font-black text-[#0f172a] tracking-tight leading-tight">Панель управления</h1>
                <p className="text-[#64748b] text-lg font-normal leading-relaxed">
                    Управление сотрудниками, их ролями и мониторинг системы
                </p>
            </div>

            <AdminTabs isAdmin={isAdmin} />

            <div className="mt-6">
                {children}
            </div>
        </div>
    );
}
