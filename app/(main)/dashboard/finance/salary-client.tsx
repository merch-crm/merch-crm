"use client";

import {
    Activity,
    Users,
    Briefcase
} from "lucide-react";
import { pluralize } from "@/lib/pluralize";
import { SalaryStats } from "./actions";
import { useBranding } from "@/components/branding-provider";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";

interface SalaryClientProps {
    salaryData: SalaryStats;
}

export function SalaryClient({ salaryData }: SalaryClientProps) {
    const { currencySymbol } = useBranding();
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
                            {salaryData.totalBudget.toLocaleString('ru-RU')} <span className="text-base font-bold text-slate-400 ml-1">{currencySymbol} /мес.</span>
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
                    }, {} as Record<string, SalaryStats['employeePayments']>)
                ).map(([deptName, emps]) => {
                    const deptTotal = emps.reduce((sum, e) => sum + e.total, 0);
                    return (
                        <div key={deptName} className="crm-card border-none bg-white shadow-md overflow-hidden !rounded-3xl">
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
                                    <div className="text-2xl font-black text-slate-900">{deptTotal.toLocaleString()} <span className="text-sm font-bold text-slate-400">{currencySymbol}</span></div>
                                </div>
                            </div>
                            <ResponsiveDataView
                                data={emps}
                                mobileGridClassName="flex flex-col divide-y divide-slate-100 md:hidden"
                                desktopClassName="hidden md:block"
                                renderTable={() => (
                                    <div className="overflow-x-auto">
                                        <table className="crm-table">
                                            <thead className="crm-thead">
                                                <tr>
                                                    <th className="crm-th">Сотрудник</th>
                                                    <th className="crm-th text-center">Роль</th>
                                                    <th className="crm-th text-center">Оклад</th>
                                                    <th className="crm-th text-center">KPI & Бонусы</th>
                                                    <th className="crm-th crm-td-number">Итого</th>
                                                </tr>
                                            </thead>
                                            <tbody className="crm-tbody">
                                                {emps.map((emp) => (
                                                    <tr key={emp.id} className="crm-tr">
                                                        <td className="crm-td">
                                                            <div className="font-extrabold text-slate-900 mb-0.5 text-[15px]">{emp.name}</div>
                                                            <div className="text-[10px] text-primary font-black tracking-widest uppercase opacity-70">USR-{emp.id.split('-')[0]}</div>
                                                        </td>
                                                        <td className="crm-td text-center">
                                                            <span className="px-3.5 py-1.5 bg-slate-100/70 rounded-full text-[11px] font-bold text-slate-600 border border-slate-200/50 whitespace-nowrap">
                                                                {emp.role}
                                                            </span>
                                                        </td>
                                                        <td className="crm-td text-center">
                                                            <span className="font-bold text-slate-900 text-sm">{emp.baseSalary.toLocaleString()} {currencySymbol}</span>
                                                        </td>
                                                        <td className="crm-td text-center">
                                                            <div className="inline-flex flex-col items-center">
                                                                <div className="font-black text-emerald-600 text-[15px]">+{emp.bonus.toLocaleString()} {currencySymbol}</div>
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">за {emp.ordersCount} заказов</div>
                                                            </div>
                                                        </td>
                                                        <td className="crm-td crm-td-number">
                                                            <div className="font-black text-slate-900 border-l border-slate-200/50 pl-6 inline-block text-[20px] leading-none">
                                                                {emp.total.toLocaleString()} <span className="text-slate-400 text-xs font-bold">{currencySymbol}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                renderCard={(emp) => (
                                    <div key={emp.id} className="p-4 flex flex-col gap-3 active:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-extrabold text-slate-900 text-[15px]">{emp.name}</div>
                                                <div className="text-[10px] text-primary font-black tracking-widest uppercase opacity-70">USR-{emp.id.split('-')[0]}</div>
                                            </div>
                                            <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600 border border-slate-200">
                                                {emp.role}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="flex flex-col">
                                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Оклад</span>
                                                <span className="font-bold text-slate-900 text-sm">{emp.baseSalary.toLocaleString()} {currencySymbol}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">KPI</span>
                                                <span className="font-black text-emerald-600 text-sm">+{emp.bonus.toLocaleString()} {currencySymbol}</span>
                                                <span className="text-[9px] font-bold text-slate-400 tracking-tighter mt-0.5 whitespace-nowrap">({emp.ordersCount} заказов)</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Итого</span>
                                            <div className="font-black text-slate-900 text-xl">
                                                {emp.total.toLocaleString()} <span className="text-xs text-slate-400 font-bold">{currencySymbol}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
