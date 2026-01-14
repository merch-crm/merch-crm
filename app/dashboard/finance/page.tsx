import { getFinancialStats, getSalaryStats, getFundsStats } from "./actions";
export const dynamic = "force-dynamic";
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
    BarChart3,
    Wallet,
    Briefcase,
    Activity,
    ShieldCheck,
    Megaphone,
    Layers,
    PieChart,
    Trash2,
    Tags,
    Package
} from "lucide-react";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { ru } from "date-fns/locale";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FinanceDateFilter } from "./finance-date-filter";

export default async function FinancePage({
    searchParams: searchParamsPromise,
}: {
    searchParams: Promise<{ from?: string; to?: string; tab?: string; range?: string }>;
}) {
    const searchParams = await searchParamsPromise;
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

    const range = searchParams.range || "all";
    const fromParam = searchParams.from;
    const toParam = searchParams.to;
    const activeTab = searchParams.tab || "sales";

    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    const now = new Date();

    if (fromParam && toParam) {
        fromDate = startOfDay(new Date(fromParam));
        toDate = endOfDay(new Date(toParam));
    } else if (range === "today") {
        fromDate = startOfDay(now);
        toDate = endOfDay(now);
    } else if (range === "7d") {
        fromDate = startOfDay(subDays(now, 6));
        toDate = endOfDay(now);
    } else if (range === "30d") {
        fromDate = startOfDay(subDays(now, 29));
        toDate = endOfDay(now);
    } else if (range === "365d") {
        fromDate = startOfDay(subDays(now, 364));
        toDate = endOfDay(now);
    }

    const { data: salesData, error: salesError } = await getFinancialStats(fromDate, toDate);
    const { data: salaryData, error: salaryError } = await getSalaryStats(fromDate, toDate);
    const { data: fundsData, error: fundsError } = await getFundsStats(fromDate, toDate);

    if (salesError || salaryError || fundsError) {
        return <div className="p-10 text-center text-rose-500">{salesError || salaryError || fundsError || "Ошибка загрузки данных"}</div>;
    }

    if (!salesData || !salaryData || !fundsData) return null;

    const { summary, chartData, categories, recentTransactions } = salesData;
    const { totalBudget, employeePayments } = salaryData;
    const { funds } = fundsData;

    const totalRev = Number(summary.totalRevenue || 0);
    const orderCnt = Number(summary.orderCount || 0);
    const avgCheck = Number(summary.avgOrderValue || 0);
    const netProfit = Number(summary.netProfit || 0);
    const avgCost = Number(summary.averageCost || 0);
    const writeOffs = Number(summary.writeOffs || 0);

    const statsCards = [
        {
            label: "Общая выручка",
            value: totalRev.toLocaleString('ru-RU'),
            suffix: "₽",
            icon: DollarSign,
            color: "text-emerald-600",
            bgIcon: "bg-emerald-100",
            bgCard: "bg-emerald-50",
            trend: "+12.5%",
            trendLabel: "к прошл. периоду",
            trendColor: "text-emerald-600",
            trendIcon: ArrowUpRight
        },
        {
            label: "Чистая прибыль",
            value: netProfit.toLocaleString('ru-RU'),
            suffix: "₽",
            icon: TrendingUp,
            color: "text-indigo-600",
            bgIcon: "bg-indigo-100",
            bgCard: "bg-indigo-50",
            trend: "+8.3%",
            trendLabel: "рост эффективности",
            trendColor: "text-indigo-600",
            trendIcon: ArrowUpRight
        },
        {
            label: "Средний чек",
            value: Math.round(avgCheck).toLocaleString('ru-RU'),
            suffix: "₽",
            icon: CreditCard,
            color: "text-amber-600",
            bgIcon: "bg-amber-100",
            bgCard: "bg-amber-50",
            trend: "-2.1%",
            trendLabel: "отклонение",
            trendColor: "text-rose-500",
            trendIcon: ArrowDownRight
        },
        {
            label: "Количество заказов",
            value: orderCnt,
            suffix: "шт.",
            icon: ShoppingBag,
            color: "text-blue-600",
            bgIcon: "bg-blue-100",
            bgCard: "bg-blue-50",
            trend: "+5.2%",
            trendLabel: "рост активности",
            trendColor: "text-blue-600",
            trendIcon: ArrowUpRight
        },
        {
            label: "Средняя с/с изделия",
            value: Math.round(avgCost).toLocaleString('ru-RU'),
            suffix: "₽",
            icon: Tags,
            color: "text-violet-600",
            bgIcon: "bg-violet-100",
            bgCard: "bg-violet-50",
            trend: "~0%",
            trendLabel: "стабильно",
            trendColor: "text-slate-500",
            trendIcon: Activity
        },
        {
            label: "Списания",
            value: Math.round(writeOffs).toLocaleString('ru-RU'),
            suffix: "₽",
            icon: Trash2,
            color: "text-rose-600",
            bgIcon: "bg-rose-100",
            bgCard: "bg-rose-50",
            trend: "+1.2%",
            trendLabel: "в пределах нормы",
            trendColor: "text-rose-500",
            trendIcon: ArrowUpRight
        }
    ];

    // Функция для безопасного создания query string
    const createQueryString = (params: Record<string, string | undefined>) => {
        const newParams = new URLSearchParams();
        Object.entries({ ...searchParams, ...params }).forEach(([key, value]) => {
            if (value) newParams.set(key, value);
        });
        return newParams.toString();
    };

    const statusConfig: Record<string, { label: string, color: string }> = {
        new: { label: "Новый", color: "bg-blue-50 text-blue-600" },
        design: { label: "Дизайн", color: "bg-purple-50 text-purple-600" },
        production: { label: "Производство", color: "bg-amber-50 text-amber-600" },
        done: { label: "Готов", color: "bg-emerald-50 text-emerald-600" },
        shipped: { label: "Отправлен", color: "bg-slate-50 text-slate-600" },
    };

    const categoryLabels: Record<string, { label: string, color: string }> = {
        print: { label: "Печать", color: "bg-indigo-500" },
        embroidery: { label: "Вышивка", color: "bg-purple-500" },
        merch: { label: "Мерч", color: "bg-emerald-500" },
        other: { label: "Прочее", color: "bg-slate-500" }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Финансы</h1>
                <p className="text-slate-500 font-medium mt-1">Управление доходами и расходами компании</p>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl w-fit">
                    <Link
                        href={`?${createQueryString({ tab: 'sales' })}`}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'sales'
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Продажи
                    </Link>
                    <Link
                        href={`?${createQueryString({ tab: 'salary' })}`}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'salary'
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <Wallet className="w-4 h-4" />
                        Зарплата
                    </Link>
                    <Link
                        href={`?${createQueryString({ tab: 'products' })}`}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'products'
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <Package className="w-4 h-4" />
                        Изделия
                    </Link>
                    <Link
                        href={`?${createQueryString({ tab: 'funds' })}`}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'funds'
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <Layers className="w-4 h-4" />
                        Фонды
                    </Link>
                </div>

                <FinanceDateFilter />
            </div>

            <div>
                {activeTab === 'sales' ? (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                            {statsCards.map((card, i) => (
                                <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                                    <div className={`absolute top-0 right-0 w-24 h-24 ${card.bgCard} rounded-bl-[3rem] -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
                                    <div className="relative">
                                        <div className={`w-10 h-10 rounded-xl ${card.bgIcon} flex items-center justify-center ${card.color} mb-4 font-bold shadow-inner`}>
                                            <card.icon className="w-5 h-5" />
                                        </div>
                                        <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-2 truncate" title={card.label}>{card.label}</div>
                                        <div className="text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                                            {card.value} <span className="text-sm text-slate-500">{card.suffix}</span>
                                        </div>
                                        <div className={`flex items-center gap-1 mt-3 ${card.trendColor} font-bold text-xs`}>
                                            <card.trendIcon className="w-3 h-3" />
                                            <span>{card.trend}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : activeTab === 'salary' ? (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[5rem] -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-6 font-bold shadow-inner">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <div className="text-slate-400 text-sm font-black uppercase tracking-widest leading-none mb-2">Общий ФОТ</div>
                                    <div className="text-4xl font-black text-slate-900 tracking-tight">
                                        {totalBudget.toLocaleString('ru-RU')} <span className="text-lg font-bold text-slate-400 whitespace-nowrap">₽ / мес</span>
                                    </div>
                                    <p className="mt-4 text-sm text-slate-500 font-medium">Расчет за выбранный период на основе окладов и бонусов</p>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[5rem] -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6 font-bold shadow-inner">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div className="text-slate-400 text-sm font-black uppercase tracking-widest leading-none mb-2">Всего сотрудников</div>
                                    <div className="text-4xl font-black text-slate-900 tracking-tight">
                                        {employeePayments.length} <span className="text-lg font-bold text-slate-400">чел.</span>
                                    </div>
                                    <p className="mt-4 text-sm text-slate-500 font-medium text-emerald-600 font-bold">Все выплаты рассчитаны автоматически</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {Object.entries(
                                employeePayments.reduce((acc, emp) => {
                                    const dept = emp.department || "Общий";
                                    if (!acc[dept]) acc[dept] = [];
                                    acc[dept].push(emp);
                                    return acc;
                                }, {} as Record<string, typeof employeePayments>)
                            ).map(([deptName, emps], idx) => {
                                const deptTotal = emps.reduce((sum, e) => sum + e.total, 0);
                                return (
                                    <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-8 py-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                                    <Briefcase className="w-4 h-4" />
                                                </div>
                                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">{deptName}</h3>
                                            </div>
                                            <div className="text-sm font-black text-slate-500 uppercase tracking-widest">
                                                Итого: <span className="text-slate-900">{deptTotal.toLocaleString()} ₽</span>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-white">
                                                    <tr>
                                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Сотрудник</th>
                                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-center">Роль</th>
                                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-center">Оклад</th>
                                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-center">Бонусы</th>
                                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-right">Итого</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {emps.map((emp) => (
                                                        <tr key={emp.id} className="group hover:bg-slate-50/30 transition-colors">
                                                            <td className="px-8 py-5">
                                                                <div className="font-bold text-slate-900">{emp.name}</div>
                                                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">ID: {emp.id.split('-')[0]}</div>
                                                            </td>
                                                            <td className="px-8 py-5 text-center">
                                                                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-tight text-slate-500">
                                                                    {emp.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-5 text-center font-bold text-slate-600 text-sm">
                                                                {emp.baseSalary.toLocaleString()} ₽
                                                            </td>
                                                            <td className="px-8 py-5 text-center">
                                                                <div className="inline-flex flex-col items-center">
                                                                    <span className="font-black text-emerald-600 text-sm">+{emp.bonus.toLocaleString()} ₽</span>
                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">за {emp.ordersCount} зак.</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5 text-right">
                                                                <div className="font-black text-slate-900 border-l border-slate-100 pl-4 inline-block">
                                                                    {emp.total.toLocaleString()} <span className="text-slate-400 text-xs font-bold">₽</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : activeTab === 'products' ? (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {categories.map((cat, i) => {
                                const config = categoryLabels[cat.name] || categoryLabels.other;
                                const percentage = totalRev > 0 ? (cat.revenue / totalRev) * 100 : 0;

                                return (
                                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                                        <div className={`absolute top-0 right-0 w-32 h-32 ${config.color.replace('bg-', 'bg-')}/10 rounded-bl-[5rem] -mr-16 -mt-16 transition-transform group-hover:scale-110`} />
                                        <div className="relative">
                                            <div className={`w-12 h-12 rounded-2xl ${config.color.replace('bg-', 'bg-')}/20 flex items-center justify-center ${config.color.replace('bg-', 'text-')} mb-6 font-bold shadow-inner`}>
                                                <Package className="w-6 h-6" />
                                            </div>
                                            <div className="text-slate-400 text-sm font-black uppercase tracking-widest leading-none mb-2">{config.label}</div>
                                            <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">
                                                {cat.count}
                                            </div>
                                            <div className="text-xs text-slate-500 font-bold mb-4">заказов</div>

                                            <div className="space-y-2 pt-4 border-t border-slate-100">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-slate-500">Выручка</span>
                                                    <span className="text-sm font-black text-slate-900">
                                                        {cat.revenue.toLocaleString()} ₽
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-slate-500">Доля</span>
                                                    <span className="text-sm font-black text-slate-900">{Math.round(percentage)}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-3">
                                                    <div
                                                        className={`h-full ${config.color} transition-all duration-1000`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {funds.map((fund, i) => {
                                const IconMap: Record<string, any> = {
                                    Activity,
                                    Users,
                                    TrendingUp,
                                    ShieldCheck,
                                    Megaphone
                                };
                                const Icon = IconMap[fund.icon] || Layers;

                                return (
                                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group transition-all hover:border-slate-300">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`w-12 h-12 rounded-2xl ${fund.color.replace('bg-', 'bg-')}/10 flex items-center justify-center ${fund.color.replace('bg-', 'text-')} font-bold shadow-inner`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-slate-900">{fund.percentage}%</span>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">доля</div>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-slate-500 text-xs font-black uppercase tracking-widest">{fund.name}</h4>
                                            <div className="text-3xl font-black text-slate-900 tracking-tight">
                                                {fund.amount.toLocaleString()} <span className="text-lg">₽</span>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100">
                                            <div
                                                className={`h-full ${fund.color} transition-all duration-1000`}
                                                style={{ width: `${fund.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl">
                                    <PieChart className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Распределение капитала</h3>
                                    <p className="text-slate-500 font-medium">Визуальный баланс всех фондов организации</p>
                                </div>
                            </div>

                            <div className="h-12 w-full flex rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                                {funds.map((fund, i) => (
                                    <div
                                        key={i}
                                        className={`${fund.color} h-full transition-all hover:opacity-80 relative group`}
                                        style={{ width: `${fund.percentage}%` }}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 text-white text-[10px] font-black">
                                            {fund.percentage}%
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-10">
                                {funds.map((fund, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${fund.color}`} />
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{fund.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
