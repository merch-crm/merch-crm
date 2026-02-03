"use client";

import {
    Activity,
    Users,
    Briefcase
} from "lucide-react";
import { pluralize } from "@/lib/pluralize";

interface SalaryClientProps {
    salaryData: {
        totalBudget: number;
        employeePayments: any[];
    };
}

export function SalaryClient({ salaryData }: SalaryClientProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--crm-grid-gap)]">
                <div className="crm-card p-8 bg-white flex flex-col justify-between h-44 hover:scale-[1.02] transition-all duration-500 group border-none shadow-sm">
                    <div className="flex justify-between items-start">
                        <div className="h-12 w-12 rounded-[20px] bg-primary/5 flex items-center justify-center text-primary font-bold shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-emerald-600 tracking-wider bg-emerald-50 px-3 py-1.5 rounded-full uppercase border border-emerald-100/50 shadow-sm">Авто-расчет</div>
                        </div>
                    </div>
                    <div className="mt-auto">
                        <p className="text-slate-400 text-[11px] font-bold tracking-widest uppercase leading-none mb-3">Общий Фонд Оплаты Труда (ФОТ)</p>
                        <div className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                            {salaryData.totalBudget.toLocaleString('ru-RU')} <span className="text-base font-bold text-slate-400 ml-1">₽ /мес.</span>
                        </div>
                    </div>
                </div>

                <div className="crm-card p-8 bg-white flex flex-col justify-between h-44 hover:scale-[1.02] transition-all duration-500 group border-none shadow-sm">
                    <div className="flex justify-between items-start">
                        <div className="h-12 w-12 rounded-[20px] bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <Users className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Активный штат</div>
                        </div>
                    </div>
                    <div className="mt-auto">
                        <p className="text-slate-400 text-[11px] font-bold tracking-widest uppercase leading-none mb-3">Сотрудников в базе</p>
                        <div className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                            {salaryData.employeePayments.length} <span className="text-base font-bold text-slate-400 ml-1 uppercase">{pluralize(salaryData.employeePayments.length, 'человек', 'человека', 'человек')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {Object.entries(
                    salaryData.employeePayments.reduce((acc, emp) => {
                        const dept = emp.department || "Общий";
                        if (!acc[dept]) acc[dept] = [];
                        acc[dept].push(emp);
                        return acc;
                    }, {} as Record<string, any[]>)
                ).map(([deptName, emps]: [string, any], idx) => {
                    const deptTotal = (emps as any[]).reduce((sum: number, e: any) => sum + e.total, 0);
                    return (
                        <div key={idx} className="crm-card border-none bg-white shadow-md overflow-hidden !rounded-[24px]">
                            <div className="px-8 py-7 bg-slate-50/70 border-b border-slate-200/60 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[20px] bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100 group-hover:scale-105 transition-all">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 text-lg leading-tight">{deptName}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Департамент</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">ФОТ Отдела</div>
                                    <div className="text-2xl font-black text-slate-900">{deptTotal.toLocaleString()} <span className="text-sm font-bold text-slate-400">₽</span></div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/50 border-b border-slate-100">
                                            <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Сотрудник</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Роль</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Оклад</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">KPI & Бонусы</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Итого</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {emps.map((emp: any) => (
                                            <tr key={emp.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="font-extrabold text-slate-900 mb-0.5 text-[15px]">{emp.name}</div>
                                                    <div className="text-[10px] text-primary font-black tracking-widest uppercase opacity-70">USR-{emp.id.split('-')[0]}</div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="px-3.5 py-1.5 bg-slate-100/70 rounded-full text-[11px] font-bold text-slate-600 border border-slate-200/50 whitespace-nowrap">
                                                        {emp.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="font-bold text-slate-900 text-sm">{emp.baseSalary.toLocaleString()} ₽</span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="inline-flex flex-col items-center">
                                                        <div className="font-black text-emerald-600 text-[15px]">+{emp.bonus.toLocaleString()} ₽</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">за {emp.ordersCount} заказов</div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="font-black text-slate-900 border-l border-slate-200/50 pl-6 inline-block text-[20px] leading-none">
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
    );
}
