import Link from "next/link";
import { Plus, Users, UserPlus, CreditCard, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { ClientsTable } from "./clients-list";
import { getClientStats } from "./actions";


import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export default async function ClientsPage() {
    const session = await getSession();
    const user = session ? await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true, department: true }
    }) : null;

    const showFinancials =
        user?.role?.name === "Администратор" ||
        ["Руководство", "Отдел продаж"].includes(user?.department?.name || "");

    const statsRes = await getClientStats();
    const stats = statsRes.data || {
        totalClients: 0,
        newThisMonth: 0,
        avgCheck: 0,
        totalRevenue: 0
    };

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
            value: `${stats.avgCheck} ₽`,
            icon: CreditCard,
            iconColor: "text-slate-400",
            trend: "-2%",
            isPositive: false,
            visible: showFinancials
        },
        {
            name: "Общая выручка",
            value: `${stats.totalRevenue} ₽`,
            icon: BarChart3,
            iconColor: "text-blue-500",
            trend: "+18%",
            isPositive: true,
            visible: showFinancials
        },
    ].filter(card => card.visible);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4">
                <div className="sm:flex sm:items-end sm:justify-between px-1">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 leading-none">Клиенты</h1>
                        <p className="text-slate-500 text-[13px] font-medium mt-3">
                            База контрагентов и история взаимодействий
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link
                            href="/dashboard/clients/new"
                            className="h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-[18px] px-6 gap-2 font-bold shadow-xl shadow-slate-200 transition-all active:scale-95 inline-flex items-center"
                        >
                            <Plus className="w-5 h-5" />
                            Добавить клиента
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${statCards.length} gap-[var(--crm-grid-gap)]`}>
                    {statCards.map((item) => (
                        <div key={item.name} className="crm-card p-6 bg-white flex flex-col justify-between h-36 transition-all duration-500 group border-none">
                            <div className="flex justify-between items-start">
                                <div className={`h-10 w-10 rounded-[var(--radius-inner)] flex items-center justify-center bg-slate-50 shadow-inner transition-transform duration-500`}>
                                    <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                                </div>
                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${item.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
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

                <ClientsTable userRoleName={user?.role?.name} showFinancials={showFinancials} />
            </div>
        </div>
    );
}
