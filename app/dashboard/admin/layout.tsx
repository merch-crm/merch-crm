import AdminTabs from "./admin-tabs";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-10">
            <div className="space-y-2">
                <h1 className="text-[32px] font-black text-[#0f172a] tracking-tight leading-tight">Панель управления</h1>
                <p className="text-[#64748b] text-lg font-normal leading-relaxed">
                    Управление сотрудниками, их ролями и мониторинг системы
                </p>
            </div>

            <AdminTabs />

            <div className="mt-6">
                {children}
            </div>
        </div>
    );
}
