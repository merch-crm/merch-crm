import { getFinancialStats } from "./actions";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import {
    TrendingUp,
    Users,
    ShoppingBag,
    ArrowUpRight,
    ArrowDownRight,
    Calendar as CalendarIcon,
    DollarSign,
    CreditCard,
    BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { redirect } from "next/navigation";

export default async function FinancePage({
    searchParams,
}: {
    searchParams: { from?: string; to?: string };
}) {
    const session = await getSession();
    if (!session) redirect("/login");

    // Проверка доступа
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { department: true, role: true }
    });

    const isAllowed =
        user?.role?.name === "Администратор" ||
        ["Руководство", "Отдел продаж"].includes(user?.department?.name || "");

    if (!isAllowed) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-900">Доступ ограничен</h2>
                    <p className="text-slate-500 mt-2">У вас нет прав для просмотра финансовой аналитики.</p>
                </div>
            </div>
        );
    }

    const fromDate = searchParams.from ? new Date(searchParams.from) : undefined;
    const toDate = searchParams.to ? new Date(searchParams.to) : undefined;

    const { data, error } = await getFinancialStats(fromDate, toDate);

    if (error || !data) {
        return <div className="p-10 text-center text-rose-500">{error || "Ошибка загрузки данных"}</div>;
    }

    const { summary, chartData } = data;
    const totalRev = Number(summary.totalRevenue || 0);
    const orderCnt = Number(summary.orderCount || 0);
    const avgCheck = Number(summary.avgOrderValue || 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Финансовый анализ</h1>
                    <p className="text-slate-500 font-medium mt-1">Мониторинг выручки и эффективности продаж</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="px-4 py-2 text-sm font-bold text-slate-600 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                        {fromDate ? format(fromDate, "d MMM", { locale: ru }) : "За всё время"}
                        {toDate && ` — ${format(toDate, "d MMM", { locale: ru })}`}
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[5rem] -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6 font-bold shadow-inner">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="text-slate-400 text-sm font-black uppercase tracking-widest leading-none mb-2">Общая выручка</div>
                        <div className="text-4xl font-black text-slate-900 tracking-tight">
                            {totalRev.toLocaleString('ru-RU')} <span className="text-lg">₽</span>
                        </div>
                        <div className="flex items-center gap-1 mt-4 text-emerald-600 font-bold text-sm">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>+12.5%</span>
                            <span className="text-slate-400 font-medium ml-1">к прошл. периоду</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6 font-bold shadow-inner">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div className="text-slate-400 text-sm font-black uppercase tracking-widest leading-none mb-2">Всего заказов</div>
                        <div className="text-4xl font-black text-slate-900 tracking-tight">
                            {orderCnt} <span className="text-lg font-bold">шт.</span>
                        </div>
                        <div className="flex items-center gap-1 mt-4 text-blue-600 font-bold text-sm">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>+5.2%</span>
                            <span className="text-slate-400 font-medium ml-1">рост активности</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[5rem] -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-6 font-bold shadow-inner">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div className="text-slate-400 text-sm font-black uppercase tracking-widest leading-none mb-2">Средний чек</div>
                        <div className="text-4xl font-black text-slate-900 tracking-tight">
                            {Math.round(avgCheck).toLocaleString('ru-RU')} <span className="text-lg">₽</span>
                        </div>
                        <div className="flex items-center gap-1 mt-4 text-rose-500 font-bold text-sm">
                            <ArrowDownRight className="w-4 h-4" />
                            <span>-2.1%</span>
                            <span className="text-slate-400 font-medium ml-1">отклонение</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic Chart Area */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">Динамика выручки</h3>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-500" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Выручка</span>
                        </div>
                    </div>
                </div>

                {/* Simple Bar Visualization */}
                <div className="h-[300px] flex items-end justify-between gap-2 md:gap-4 px-2">
                    {chartData.length > 0 ? (
                        chartData.map((d, i) => {
                            const maxRev = Math.max(...chartData.map(cd => cd.revenue));
                            const height = maxRev > 0 ? (d.revenue / maxRev) * 100 : 0;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center group relative">
                                    {/* Tooltip */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 whitespace-nowrap shadow-xl">
                                        {d.revenue.toLocaleString()} ₽
                                    </div>
                                    <div
                                        style={{ height: `${Math.max(height, 2)}%` }}
                                        className="w-full bg-indigo-500/10 group-hover:bg-indigo-500 rounded-t-xl transition-all duration-500 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                                    </div>
                                    <div className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate w-full text-center">
                                        {d.date}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                            <TrendingUp className="w-12 h-12 opacity-10" />
                            <p className="font-bold">Нет данных за выбранный период</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
