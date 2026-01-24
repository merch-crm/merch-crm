import { getFinancialStats, getSalaryStats, getFundsStats, getPLReport } from "./actions";
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
    DollarSign,
    CreditCard,
    Wallet,
    Briefcase,
    Activity,
    ShieldCheck,
    Megaphone,
    Layers,
    PieChart,
    Trash2,
    Tags,
    Package,
    LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FinanceDateFilter } from "./finance-date-filter";
import { PromocodesClient, Promocode } from "./promocodes/promocodes-client";
import { TransactionsClient } from "./transactions-client";
import { ExpensesClient, Expense } from "./expenses-client";
import { getPromocodes, getFinanceTransactions } from "./actions";

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

    // Дополнительные данные для новых вкладок
    const promocodesRes = activeTab === 'promocodes' ? await getPromocodes() : { data: [] };
    const paymentsRes = activeTab === 'transactions' || activeTab === 'pl' ? await getFinanceTransactions('payment', fromDate, toDate) : { data: [] };
    const expensesRes = activeTab === 'transactions' || activeTab === 'expenses' || activeTab === 'pl' ? await getFinanceTransactions('expense', fromDate, toDate) : { data: [] };
    const plRes = activeTab === 'pl' ? await getPLReport(fromDate, toDate) : { data: null };

    if (salesError || salaryError || fundsError) {
        return <div className="p-10 text-center text-rose-500">{salesError || salaryError || fundsError || "Ошибка загрузки данных"}</div>;
    }

    if (!salesData || !salaryData || !fundsData) return null;

    const { summary, categories } = salesData;
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
            color: "text-primary",
            bgIcon: "bg-primary/10",
            bgCard: "bg-primary/5",
            trend: "+8.3%",
            trendLabel: "рост эффективности",
            trendColor: "text-primary",
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

    const categoryLabels: Record<string, { label: string, color: string }> = {
        print: { label: "Печать", color: "bg-primary" },
        embroidery: { label: "Вышивка", color: "bg-purple-500" },
        merch: { label: "Мерч", color: "bg-emerald-500" },
        other: { label: "Прочее", color: "bg-slate-500" }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="sm:flex sm:items-end sm:justify-between px-1">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 leading-none">Финансы</h1>
                    <p className="text-slate-400 text-sm font-medium mt-3">Управление активами и финансовая аналитика</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden">
                <div className="flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-[var(--radius-inner)] w-full lg:w-fit border border-slate-200/40 overflow-x-auto no-scrollbar shrink-0 lg:shrink">
                    <Link
                        href={`?${createQueryString({ tab: 'sales' })}`}
                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-[10px] text-xs font-medium transition-all ${activeTab === 'sales'
                            ? "bg-white text-primary shadow-md shadow-primary/20"
                            : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Продажи
                    </Link>
                    <Link
                        href={`?${createQueryString({ tab: 'salary' })}`}
                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-[10px] text-xs font-medium transition-all ${activeTab === 'salary'
                            ? "bg-white text-primary shadow-md shadow-primary/20"
                            : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            }`}
                    >
                        <Wallet className="w-4 h-4" />
                        Зарплата
                    </Link>
                    <Link
                        href={`?${createQueryString({ tab: 'funds' })}`}
                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-[10px] text-xs font-medium transition-all ${activeTab === 'funds'
                            ? "bg-white text-primary shadow-md shadow-primary/20"
                            : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            }`}
                    >
                        <Layers className="w-4 h-4" />
                        Фонды
                    </Link>
                    <Link
                        href={`?${createQueryString({ tab: 'promocodes' })}`}
                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-[10px] text-xs font-medium transition-all ${activeTab === 'promocodes'
                            ? "bg-white text-primary shadow-md shadow-primary/20"
                            : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            }`}
                    >
                        <Tags className="w-4 h-4" />
                        Промокоды
                    </Link>
                    <Link
                        href={`?${createQueryString({ tab: 'transactions' })}`}
                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-[10px] text-xs font-medium transition-all ${activeTab === 'transactions'
                            ? "bg-white text-primary shadow-md shadow-primary/20"
                            : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            }`}
                    >
                        <Activity className="w-4 h-4" />
                        Транзакции
                    </Link>
                    <Link
                        href={`?${createQueryString({ tab: 'expenses' })}`}
                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-[10px] text-xs font-medium transition-all ${activeTab === 'expenses'
                            ? "bg-white text-primary shadow-md shadow-primary/20"
                            : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            }`}
                    >
                        <CreditCard className="w-4 h-4" />
                        Расходы
                    </Link>
                    <Link
                        href={`?${createQueryString({ tab: 'pl' })}`}
                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-[10px] text-xs font-medium transition-all ${activeTab === 'pl'
                            ? "bg-white text-primary shadow-md shadow-primary/20"
                            : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            }`}
                    >
                        <PieChart className="w-4 h-4" />
                        P&L Отчет
                    </Link>
                </div>

                <div className="bg-white border border-slate-200/60 p-1.5 rounded-[var(--radius-inner)] shadow-sm shrink-0">
                    <FinanceDateFilter />
                </div>
            </div>

            <div>
                {activeTab === 'sales' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-[var(--crm-grid-gap)]">
                            {statsCards.map((card, i) => (
                                <div key={i} className="crm-card p-6 bg-white flex flex-col justify-between h-40 hover:-translate-y-1 transition-all duration-500 group border-none">
                                    <div className="flex justify-between items-start">
                                        <div className={`h-10 w-10 rounded-[var(--radius-inner)] flex items-center justify-center ${card.bgIcon} font-bold shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                            <card.icon className={cn("h-5 w-5", card.color)} />
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${card.trendColor.replace('text-', 'bg-')}/10 ${card.trendColor}`}>
                                            <card.trendIcon className="w-3 h-3" />
                                            <span className="text-xs font-medium">{card.trend}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs font-medium mb-2">{card.label}</p>
                                        <div className="text-2xl font-bold text-slate-900 leading-none">
                                            {card.value} <span className="text-sm text-slate-500 font-bold">{card.suffix}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--crm-grid-gap)]">
                            {categories.map((cat, i) => {
                                const config = categoryLabels[cat.name] || categoryLabels.other;
                                const percentage = totalRev > 0 ? (cat.revenue / totalRev) * 100 : 0;

                                return (
                                    <div key={i} className="crm-card p-6 bg-white flex flex-col justify-between hover:-translate-y-1 transition-all duration-500 group border-none">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`h-11 w-11 rounded-[var(--radius-inner)] flex items-center justify-center ${config.color.replace('bg-', 'bg-')}/10 font-bold shadow-inner transition-transform duration-500 group-hover:scale-110`}>
                                                <Package className={cn("h-5 w-5", config.color.replace('bg-', 'text-'))} />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-slate-900 leading-none mb-1">{Math.round(percentage)}%</div>
                                                <div className="text-xs font-medium text-slate-400 leading-none">доля выручки</div>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <p className="text-slate-400 text-xs font-medium mb-2">{config.label}</p>
                                            <div className="text-2xl font-bold text-slate-900 leading-none mb-2">
                                                {cat.revenue.toLocaleString()} <span className="text-sm text-slate-500 font-bold">₽</span>
                                            </div>
                                            <div className="text-xs text-slate-400 font-bold">{cat.count} {pluralize(cat.count, 'заказ', 'заказа', 'заказов')}</div>
                                        </div>

                                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${config.color} transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'salary' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="crm-card p-6 bg-white flex flex-col justify-between h-40 hover:-translate-y-1 transition-all duration-500 group border-none">
                                <div className="flex justify-between items-start">
                                    <div className="h-12 w-12 rounded-[var(--radius-inner)] bg-primary/5 flex items-center justify-center text-primary font-bold shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-emerald-600  tracking-normal bg-emerald-50 px-2.5 py-1 rounded-full">Авто-расчет</div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] font-bold  tracking-normal leading-none mb-2">Общий ФОТ (Фонд оплаты труда)</p>
                                    <div className="text-3xl font-bold text-slate-900 tracking-normal leading-none">
                                        {totalBudget.toLocaleString('ru-RU')} <span className="text-sm font-bold text-slate-400">₽ /мес.</span>
                                    </div>
                                </div>
                            </div>

                            <div className="crm-card p-6 bg-white flex flex-col justify-between h-40 hover:-translate-y-1 transition-all duration-500 group border-none">
                                <div className="flex justify-between items-start">
                                    <div className="h-12 w-12 rounded-[var(--radius-inner)] bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-slate-400  tracking-normal">активный штат</div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] font-bold  tracking-normal leading-none mb-2">Сотрудников в базе</p>
                                    <div className="text-3xl font-bold text-slate-900 tracking-normal leading-none">
                                        {employeePayments.length} <span className="text-sm font-bold text-slate-400  whitespace-nowrap">{pluralize(employeePayments.length, 'человек', 'человека', 'человек')}</span>
                                    </div>
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
                                    <div key={idx} className="crm-card border-none bg-white shadow-sm overflow-hidden">
                                        <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-[18px] bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
                                                    <Briefcase className="w-5 h-5" />
                                                </div>
                                                <h3 className="font-bold text-slate-900 text-sm">{deptName}</h3>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-medium text-slate-400 mb-1">ФОТ Отдела</div>
                                                <div className="text-xl font-bold text-slate-900">{deptTotal.toLocaleString()} ₽</div>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-white">
                                                    <tr>
                                                        <th className="px-8 py-5 text-xs font-medium text-slate-400 leading-none">Сотрудник</th>
                                                        <th className="px-8 py-5 text-xs font-medium text-slate-400 leading-none text-center">Роль / Должность</th>
                                                        <th className="px-8 py-5 text-xs font-medium text-slate-400 leading-none text-center">Окладная часть</th>
                                                        <th className="px-8 py-5 text-xs font-medium text-slate-400 leading-none text-center">Бонусы & KPI</th>
                                                        <th className="px-8 py-5 text-xs font-medium text-slate-400 leading-none text-right">К выплате</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {emps.map((emp) => (
                                                        <tr key={emp.id} className="group hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-8 py-6">
                                                                <div className="font-bold text-slate-900 mb-0.5 text-sm">{emp.name}</div>
                                                                <div className="text-xs text-primary font-semibold  tracking-wider">USR-{emp.id.split('-')[0]}</div>
                                                            </td>
                                                            <td className="px-8 py-6 text-center">
                                                                <span className="px-3 py-1.5 bg-slate-100 rounded-[10px] text-xs font-medium text-slate-500 border border-slate-200/50">
                                                                    {emp.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-6 text-center">
                                                                <span className="font-bold text-slate-900 text-sm">{emp.baseSalary.toLocaleString()} ₽</span>
                                                            </td>
                                                            <td className="px-8 py-6 text-center">
                                                                <div className="inline-flex flex-col items-center">
                                                                    <div className="font-bold text-emerald-600 text-sm">+{emp.bonus.toLocaleString()} ₽</div>
                                                                    <div className="text-xs font-medium text-slate-400">за {emp.ordersCount} {pluralize(emp.ordersCount, 'заказ', 'заказа', 'заказов')}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6 text-right">
                                                                <div className="font-bold text-slate-900 border-l border-slate-100 pl-6 inline-block text-lg">
                                                                    {emp.total.toLocaleString()} <span className="text-slate-400 text-xs font-medium">₽</span>
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
                )}

                {activeTab === 'promocodes' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 border-t border-slate-100 pt-8">
                        <PromocodesClient initialData={(promocodesRes.data as unknown as Promocode[]) || []} />
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 border-t border-slate-100 pt-8">
                        <TransactionsClient
                            initialPayments={(paymentsRes.data || []) as Parameters<typeof TransactionsClient>[0]['initialPayments']}
                            initialExpenses={(expensesRes.data || []) as Parameters<typeof TransactionsClient>[0]['initialExpenses']}
                        />
                    </div>
                )}

                {activeTab === 'expenses' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 border-t border-slate-100 pt-8">
                        <ExpensesClient initialData={(expensesRes.data as unknown as Expense[]) || []} />
                    </div>
                )}

                {activeTab === 'pl' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 border-t border-slate-100 pt-8 space-y-8">
                        {plRes.data && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="crm-card p-8 bg-slate-900 text-white border-none shadow-xl">
                                        <p className="text-slate-400 text-[10px] font-bold  tracking-normal mb-2">Выручка</p>
                                        <div className="text-4xl font-bold tracking-normal">{plRes.data.totalRevenue.toLocaleString()} ₽</div>
                                    </div>
                                    <div className="crm-card p-8 bg-white border border-slate-100 shadow-sm">
                                        <p className="text-slate-400 text-[10px] font-bold  tracking-normal mb-2">Себестоимость (COGS)</p>
                                        <div className="text-4xl font-bold text-rose-500 tracking-normal">-{plRes.data.totalCOGS.toLocaleString()} ₽</div>
                                        <div className="text-[10px] text-slate-400 mt-2">Расходы на производство</div>
                                    </div>
                                    <div className="crm-card p-8 bg-white border border-slate-100 shadow-sm">
                                        <p className="text-slate-400 text-[10px] font-bold  tracking-normal mb-2">Опер. расходы</p>
                                        <div className="text-4xl font-bold text-rose-600 tracking-normal">-{plRes.data.totalOverhead.toLocaleString()} ₽</div>
                                        <div className="text-[10px] text-slate-400 mt-2">Аренда, налоги и др.</div>
                                    </div>
                                    <div className="crm-card p-8 bg-emerald-600 text-white border-none shadow-xl">
                                        <p className="text-emerald-100 text-[10px] font-bold  tracking-normal mb-2">Чистая прибыль</p>
                                        <div className="text-4xl font-bold tracking-normal">{plRes.data.netProfit.toLocaleString()} ₽</div>
                                        <div className="mt-4 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full">Маржа: {plRes.data.margin.toFixed(1)}%</div>
                                    </div>
                                </div>

                                <div className="crm-card bg-white p-10 border-none shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 mb-8">Структура расходов</h3>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                                                <span className="text-sm font-bold text-slate-700  tracking-normal text-[10px]">Себестоимость закупки</span>
                                            </div>
                                            <span className="font-bold text-slate-900 ">{plRes.data.totalCOGS.toLocaleString()} ₽</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-rose-500"
                                                style={{ width: `${(plRes.data.totalCOGS / (plRes.data.totalCOGS + plRes.data.totalOverhead)) * 100}%` }}
                                            />
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-rose-400" />
                                                <span className="text-sm font-bold text-slate-700  tracking-normal text-[10px]">Косвенные расходы</span>
                                            </div>
                                            <span className="font-bold text-slate-900">{plRes.data.totalOverhead.toLocaleString()} ₽</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-rose-400"
                                                style={{ width: `${(plRes.data.totalOverhead / (plRes.data.totalCOGS + plRes.data.totalOverhead)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'funds' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {funds.map((fund, i) => {
                                const IconMap: Record<string, LucideIcon> = {
                                    Activity,
                                    Users,
                                    TrendingUp,
                                    ShieldCheck,
                                    Megaphone
                                };
                                const Icon = IconMap[fund.icon] || Layers;

                                return (
                                    <div key={i} className="crm-card p-8 bg-white flex flex-col justify-between hover:-translate-y-1 transition-all duration-500 border-none group overflow-hidden">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className={`h-12 w-12 rounded-[var(--radius-inner)] ${fund.color.replace('bg-', 'bg-')}/10 flex items-center justify-center ${fund.color.replace('bg-', 'text-')} font-bold shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-slate-900 tracking-normal leading-none mb-1">{fund.percentage}%</div>
                                                <div className="text-[10px] font-bold text-slate-400  tracking-normal">доля фонда</div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <h4 className="text-slate-400 text-[10px] font-bold  tracking-normal leading-none">{fund.name}</h4>
                                            <div className="text-3xl font-bold text-slate-900 tracking-normal leading-none">
                                                {fund.amount.toLocaleString()} <span className="text-sm text-slate-500 font-bold ">₽</span>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-50">
                                            <div
                                                className={`h-full ${fund.color} transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                                                style={{ width: `${fund.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="crm-card p-10 bg-white border-none shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-60" />

                            <div className="relative flex items-center gap-6 mb-12">
                                <div className="h-14 w-14 rounded-[var(--radius-inner)] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform duration-500">
                                    <PieChart className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-slate-900 tracking-normal ">Распределение капитала</h3>
                                    <p className="text-slate-400 text-[10px] font-bold  tracking-normal mt-1">Визуальный баланс всех фондов организации</p>
                                </div>
                            </div>

                            <div className="h-16 w-full flex rounded-[var(--radius-inner)] overflow-hidden shadow-inner bg-slate-50 border border-slate-100 p-1">
                                {funds.map((fund, i) => (
                                    <div
                                        key={i}
                                        className={`${fund.color} h-full transition-all hover:opacity-80 relative group first:rounded-l-[10px] last:rounded-r-[10px]`}
                                        style={{ width: `${fund.percentage}%` }}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 text-white text-[10px] font-bold  tracking-normal">
                                            {fund.percentage}%
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mt-12 bg-slate-50/50 p-6 rounded-[var(--radius-inner)] border border-slate-100/50">
                                {funds.map((fund, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${fund.color} shadow-sm ring-4 ring-white`} />
                                        <span className="text-[10px] font-bold text-slate-600  tracking-normal">{fund.name}</span>
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
