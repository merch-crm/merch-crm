import { AddClientDialog } from "./add-client-dialog";
import { ClientsTable } from "./clients-list";
import { getClientStats } from "./actions";
import {
    Users,
    UserPlus,
    CheckCircle,
    Star,
    CreditCard,
    BarChart3,
    ChevronRight,
    Home,
    TrendingUp,
    TrendingDown
} from "lucide-react";
import { Card } from "@/components/ui/card";

import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export default async function ClientsPage() {
    const session = await getSession();
    const userWithRole = session ? await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true }
    }) : null;

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
        },
        {
            name: "Новых за месяц",
            value: stats.newThisMonth,
            icon: UserPlus,
            iconColor: "text-emerald-500",
            trend: "+8%",
            isPositive: true,
        },
        {
            name: "Средний чек",
            value: `${stats.avgCheck} ₽`,
            icon: CreditCard,
            iconColor: "text-slate-400",
            trend: "-2%",
            isPositive: false,
        },
        {
            name: "Общая выручка",
            value: `${stats.totalRevenue} ₽`,
            icon: BarChart3,
            iconColor: "text-blue-500",
            trend: "+18%",
            isPositive: true,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-slate-500 gap-2">
                <Home className="w-4 h-4 cursor-pointer hover:text-slate-800" />
                <ChevronRight className="w-4 h-4" />
                <span className="font-medium text-slate-800">Клиенты</span>
            </nav>

            <div className="flex flex-col gap-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Управление клиентами</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            Управляйте клиентской базой и отслеживайте взаимодействия
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <AddClientDialog />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((item) => (
                        <Card key={item.name} className="p-4 border border-slate-100 shadow-sm rounded-xl bg-white flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center bg-slate-50`}>
                                    <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                                </div>
                                <div className={`flex items-center text-[10px] font-bold ${item.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {item.isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                                    {item.trend}
                                </div>
                            </div>
                            <div className="mt-2">
                                <p className="text-2xl font-black text-slate-900 leading-none">{item.value}</p>
                                <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-tight">{item.name}</p>
                            </div>
                        </Card>
                    ))}
                </div>

                <ClientsTable userPermissions={userWithRole?.role?.permissions as any} userRoleName={userWithRole?.role?.name} />
            </div>
        </div>
    );
}
