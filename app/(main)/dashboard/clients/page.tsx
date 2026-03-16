import Link from "next/link";
import { Plus, Users, UserPlus, CreditCard, BarChart3, TrendingUp, TrendingDown, Kanban, Target } from "lucide-react";
import { ClientsTable } from "./clients-list";
import { getClientStats, getClientsInitialData } from "./actions/core.actions";
import { getBrandingSettings } from "@/app/(main)/admin-panel/actions";
import { PageHeader } from "@/components/layout/page-header";


import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";

export default async function ClientsPage(props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams || {};
    const session = await getSession();
    const user = session ? await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true, department: true }
    }) : null;

    const showFinancials =
        user?.role?.name === "Администратор" ||
        ["Руководство", "Отдел продаж"].includes(user?.department?.name || "");

    const page = Number(searchParams.page) || 1;
    const search = typeof searchParams.search === "string" ? searchParams.search : undefined;
    const clientType = typeof searchParams.type === "string" ? searchParams.type : "all";
    const activityStatus = typeof searchParams.activityStatus === "string" ? searchParams.activityStatus : "all";

    const [statsRes, initialDataRes] = await Promise.all([
        getClientStats(),
        getClientsInitialData({
            page,
            limit: 10,
            search,
            clientType,
            activityStatus
        })
    ]);

    const stats = (statsRes.success && statsRes.data) ? statsRes.data : {
        totalClients: 0,
        newThisMonth: 0,
        avgCheck: 0,
        totalRevenue: 0
    };

    const initialData = initialDataRes.success && initialDataRes.data ? {
        ...initialDataRes.data,
        clientsData: {
            clients: initialDataRes.data.clients,
            total: initialDataRes.data.total,
            totalPages: initialDataRes.data.totalPages,
            currentPage: initialDataRes.data.currentPage
        }
    } : undefined;

    const branding = await getBrandingSettings();
    const currencySymbol = branding?.currencySymbol || "₽";

    const statCards = [
        {
            name: "Всего клиентов",
            value: stats.totalClients,
            icon: Users,
            iconColor: "text-blue-500",
            trend: "+12%",
            isPositive: true,
            visible: true
        },
        {
            name: "Новых за месяц",
            value: stats.newThisMonth,
            icon: UserPlus,
            iconColor: "text-emerald-500",
            trend: "+8%",
            isPositive: true,
            visible: true
        },
        {
            name: "Средний чек",
            value: `${stats.avgCheck.toLocaleString()} ${currencySymbol}`,
            icon: CreditCard,
            iconColor: "text-slate-400",
            trend: "-2%",
            isPositive: false,
            visible: showFinancials
        },
        {
            name: "Общая выручка",
            value: `${stats.totalRevenue.toLocaleString()} ${currencySymbol}`,
            icon: BarChart3,
            iconColor: "text-blue-500",
            trend: "+18%",
            isPositive: true,
            visible: showFinancials
        },
    ].filter(card => card.visible);

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3">
                <PageHeader
                    title="Клиенты"
                    description="База контрагентов и история взаимодействий"
                    className="px-1"
                    actions={
                        <div className="flex items-center gap-2">
                            <Link
                                href="/dashboard/clients/funnel"
                                className="h-11 w-11 sm:h-12 sm:w-auto bg-white hover:bg-slate-50 text-slate-600 border-2 border-slate-200 rounded-full sm:rounded-2xl sm:px-4 gap-2 font-bold transition-all active:scale-95 inline-flex items-center justify-center p-0"
                                title="Воронка клиентов"
                            >
                                <Kanban className="w-5 h-5 text-indigo-500" />
                                <span className="hidden lg:inline text-xs font-bold">Воронка</span>
                            </Link>
                            <Link
                                href="/dashboard/analytics/rfm"
                                className="h-11 w-11 sm:h-12 sm:w-auto bg-white hover:bg-slate-50 text-slate-600 border-2 border-slate-200 rounded-full sm:rounded-2xl sm:px-4 gap-2 font-bold transition-all active:scale-95 inline-flex items-center justify-center p-0"
                                title="RFM Аналитика"
                            >
                                <Target className="w-5 h-5 text-purple-500" />
                                <span className="hidden lg:inline text-xs font-bold">RFM</span>
                            </Link>
                            <Link
                                href="/dashboard/clients/analytics"
                                className="h-11 w-11 sm:h-12 sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 rounded-full sm:rounded-2xl sm:px-4 gap-2 font-bold transition-all active:scale-95 inline-flex items-center justify-center p-0"
                                title="Аналитика"
                            >
                                <BarChart3 className="w-5 h-5 text-blue-500" />
                                <span className="hidden lg:inline text-xs font-bold">Аналитика</span>
                            </Link>
                            <Link
                                href="/dashboard/clients/new"
                                className="h-11 w-11 sm:h-12 sm:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-full sm:rounded-2xl sm:px-6 gap-2 font-bold shadow-xl shadow-slate-200 transition-all active:scale-95 inline-flex items-center justify-center p-0 sm:p-auto"
                                title="Добавить клиента"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="hidden sm:inline">Добавить клиента</span>
                            </Link>
                        </div>
                    }
                />

                {/* Stats Grid */}
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${statCards.length} gap-3`}>
                    {statCards.map((item) => (
                        <div key={item.name} className="crm-card p-6 bg-white flex flex-col justify-between h-36 transition-all duration-500 group border-none">
                            <div className="flex justify-between items-start">
                                <div className={`h-10 w-10 rounded-[var(--radius-inner)] flex items-center justify-center bg-slate-50 shadow-inner transition-transform duration-500`}>
                                    <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                                </div>
                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${item.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {item.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {item.trend}
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-500 text-[11px] font-semibold mb-2">{item.name}</p>
                                <p className="text-3xl font-bold text-slate-900 leading-none">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <ClientsTable userRoleName={user?.role?.name} showFinancials={showFinancials} initialData={initialData} />
            </div>
        </div>
    );
}
