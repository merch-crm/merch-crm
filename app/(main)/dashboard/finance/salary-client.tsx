"use client";

import {
    Activity,
    Users,
    Briefcase,
    TrendingUp,
    Percent,
    Wallet,
    Info
} from "lucide-react";
import { pluralize } from "@/lib/pluralize";
import { SalaryStats } from "./actions";
import { useBranding } from "@/components/branding-provider";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import { motion } from "framer-motion";

interface SalaryClientProps {
    salaryData: SalaryStats;
}

export function SalaryClient({ salaryData }: SalaryClientProps) {
    const { currencySymbol } = useBranding();

    const deptsData = Object.entries(
        salaryData.employeePayments.reduce((acc, emp) => {
            const dept = emp.department || "Общий";
            if (!acc[dept]) acc[dept] = 0;
            acc[dept] += emp.total;
            return acc;
        }, {} as Record<string, number>)
    ).map(([name, total]) => ({ name, total }));

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="crm-card p-6 bg-white flex flex-col justify-between h-44 hover:shadow-lg transition-all duration-500 group border-none relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                        <Wallet className="w-32 h-32 rotate-12" />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-bold shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50 uppercase tracking-wider">Авто-расчет</div>
                        </div>
                    </div>
                    <div className="mt-auto relative z-10">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-3 opacity-70">Общий Фонд (ФОТ)</p>
                        <div className="text-4xl font-black text-slate-900 leading-none">
                            {salaryData.totalBudget.toLocaleString('ru-RU')} <span className="text-base font-bold text-slate-400 ml-1">{currencySymbol} <span className="text-[10px] opacity-60">/мес</span></span>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="crm-card p-6 bg-white flex flex-col justify-between h-44 hover:shadow-lg transition-all duration-500 group border-none relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                        <Users className="w-32 h-32 -rotate-12" />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <Users className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Активный штат</div>
                        </div>
                    </div>
                    <div className="mt-auto relative z-10">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-3 opacity-70">Сотрудников в базе</p>
                        <div className="text-4xl font-black text-slate-900 leading-none">
                            {salaryData.employeePayments.length} <span className="text-base font-bold text-slate-400 ml-1 uppercase">{pluralize(salaryData.employeePayments.length, 'человек', 'человека', 'человек')}</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="crm-card p-6 bg-violet-600 flex flex-col justify-between h-44 hover:shadow-xl transition-all duration-500 group border-none relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <div className="flex justify-between items-start relative z-10">
                        <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black text-white/80 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 uppercase tracking-wider">KPI Активен</div>
                        </div>
                    </div>
                    <div className="mt-auto relative z-10 text-white">
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest leading-none mb-3 opacity-70">Средняя выплата</p>
                        <div className="text-4xl font-black leading-none">
                            {Math.round(salaryData.totalBudget / (salaryData.employeePayments.length || 1)).toLocaleString('ru-RU')} <span className="text-base font-bold text-white/50 ml-1">{currencySymbol}</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Department Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-1 crm-card p-6 bg-white border-none shadow-sm h-full flex flex-col"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 leading-none">Распределение</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1.5">ФОТ по департаментам</p>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                            <Briefcase className="w-5 h-5" />
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptsData} layout="vertical" margin={{ left: -20, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    content={({ active, payload }: any) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white/90 backdrop-blur-md p-3 border border-slate-200 rounded-xl shadow-xl">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{payload[0].payload.name}</p>
                                                    <p className="text-sm font-black text-slate-900">{payload[0].value.toLocaleString()} {currencySymbol}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={24}>
                                    {deptsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 crm-card p-6 bg-white border-none shadow-sm"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 leading-none">Логика расчета</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1.5">Принципы формирования выплат</p>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Info className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-colors group">
                                <div className="h-10 w-10 shrink-0 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                    <span className="font-black text-xs">01</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900">Окладная часть</h4>
                                    <p className="text-[11px] font-bold text-slate-500 mt-1">Фиксированная ставка за полный рабочий месяц согласно штатному расписанию.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors group">
                                <div className="h-10 w-10 shrink-0 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900">KPI (Заказы)</h4>
                                    <p className="text-[11px] font-bold text-slate-500 mt-1">Премия в размере <span className="text-emerald-600 font-black">300 {currencySymbol}</span> за каждый успешно завершенный заказ.</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 rounded-3xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors group">
                                <div className="h-10 w-10 shrink-0 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                    <Percent className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900">Удержания</h4>
                                    <p className="text-[11px] font-bold text-slate-500 mt-1">Штрафы за брак или нарушение сроков вычитаются из бонусной части.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 rounded-3xl bg-amber-50 border border-amber-100 hover:border-amber-200 transition-colors group">
                                <div className="h-10 w-10 shrink-0 rounded-2xl bg-white flex items-center justify-center text-amber-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900">Выплаты</h4>
                                    <p className="text-[11px] font-bold text-slate-500 mt-1">Осуществляются 5-го и 20-го числа каждого месяца согласно ТК.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Employee List by Department */}
            <div className="space-y-4">
                {Object.entries(
                    salaryData.employeePayments.reduce((acc, emp) => {
                        const dept = emp.department || "Общий";
                        if (!acc[dept]) acc[dept] = [];
                        acc[dept].push(emp);
                        return acc;
                    }, {} as Record<string, SalaryStats['employeePayments']>)
                ).map(([deptName, emps], idx) => {
                    const deptTotal = emps.reduce((sum, e) => sum + e.total, 0);
                    return (
                        <motion.div 
                            key={deptName} 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                            className="crm-card border-none bg-white shadow-md overflow-hidden !rounded-[32px]"
                        >
                            <div className="px-8 py-7 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 text-lg leading-tight tracking-tight">{deptName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Департамент</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="text-[10px] font-black text-primary uppercase tracking-wider">{emps.length} {pluralize(emps.length, 'сотрудник', 'сотрудника', 'сотрудников')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-60">Месячный ФОТ</div>
                                    <div className="text-2xl font-black text-slate-900 leading-none">{deptTotal.toLocaleString('ru-RU')} <span className="text-sm font-bold text-slate-400">{currencySymbol}</span></div>
                                </div>
                            </div>
                            <ResponsiveDataView<SalaryStats['employeePayments'][number]>
                                data={emps}
                                getItemKey={(emp) => emp.id}
                                mobileGridClassName="flex flex-col divide-y divide-slate-100 md:hidden"
                                desktopClassName="hidden md:block"
                                renderTable={() => (
                                    <div className="overflow-x-auto">
                                        <table className="crm-table w-full">
                                            <thead className="bg-white">
                                                <tr>
                                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Сотрудник</th>
                                                    <th className="px-4 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Роль</th>
                                                    <th className="px-4 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Оклад</th>
                                                    <th className="px-4 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">KPI & Бонусы</th>
                                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">К выплате</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {emps.map((emp) => (
                                                    <tr key={emp.id} className="group hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase group-hover:scale-105 transition-transform">
                                                                    {emp.name.split(' ').map(n => n[0]).join('')}
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-slate-900 text-[14px] leading-tight">{emp.name}</div>
                                                                    <div className="text-[10px] text-primary font-black uppercase tracking-wider mt-0.5 opacity-60">ID-{emp.id.split('-')[0]}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-5 text-center">
                                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                                                                {emp.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-5 text-center font-bold text-slate-900 text-sm whitespace-nowrap">
                                                            {emp.baseSalary.toLocaleString('ru-RU')} {currencySymbol}
                                                        </td>
                                                        <td className="px-4 py-5 text-center">
                                                            <div className="inline-flex flex-col items-center">
                                                                <div className="font-black text-emerald-600 text-[14px]">+{emp.bonus.toLocaleString('ru-RU')} {currencySymbol}</div>
                                                                <div className="text-[10px] font-bold text-slate-400 leading-none mt-1 uppercase tracking-tighter">за {emp.ordersCount} заказов</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            <div className="font-black text-slate-900 text-[18px] leading-none group-hover:scale-105 transition-transform origin-right">
                                                                {emp.total.toLocaleString('ru-RU')} <span className="text-slate-400 text-xs font-bold ml-1">{currencySymbol}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                renderCard={(emp) => (
                                    <div key={emp.id} className="p-6 flex flex-col gap-4 active:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm uppercase">
                                                    {emp.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 text-[15px]">{emp.name}</div>
                                                    <div className="text-[10px] text-primary font-black uppercase mt-0.5 opacity-60">ID-{emp.id.split('-')[0]}</div>
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 uppercase tracking-wider">
                                                {emp.role}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Оклад</span>
                                                <span className="font-bold text-slate-900 text-sm">{emp.baseSalary.toLocaleString('ru-RU')} {currencySymbol}</span>
                                            </div>
                                            <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">KPI</span>
                                                <span className="font-black text-emerald-600 text-sm">+{emp.bonus.toLocaleString('ru-RU')} {currencySymbol}</span>
                                                <span className="text-[10px] font-bold text-slate-400 mt-1 block uppercase">({emp.ordersCount} заказов)</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">К выплате</span>
                                            <div className="font-black text-slate-900 text-2xl">
                                                {emp.total.toLocaleString('ru-RU')} <span className="text-xs text-slate-400 font-bold">{currencySymbol}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
