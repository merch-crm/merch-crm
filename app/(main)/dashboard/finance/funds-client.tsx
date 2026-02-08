"use client";

import {
    Activity,
    Users,
    TrendingUp,
    ShieldCheck,
    Megaphone,
    Layers,
    PieChart,
    LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBranding } from "@/components/branding-provider";

import { FundStats } from "./actions";

interface FundsClientProps {
    fundsData: FundStats;
}

export function FundsClient({ fundsData }: FundsClientProps) {
    const { currencySymbol } = useBranding();
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--crm-grid-gap)]">
                {fundsData.funds.map((fund, i) => {
                    const IconMap: Record<string, LucideIcon> = {
                        Activity,
                        Users,
                        TrendingUp,
                        ShieldCheck,
                        Megaphone
                    };
                    const Icon = IconMap[fund.icon] || Layers;

                    return (
                        <div key={i} className="crm-card p-10 bg-white flex flex-col justify-between hover:scale-[1.02] transition-all duration-500 border-none shadow-md group overflow-hidden relative h-full">
                            <div className="flex justify-between items-start mb-10">
                                <div className={cn(
                                    "h-14 w-14 rounded-[var(--radius-inner)] flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform duration-500",
                                    fund.color.replace('bg-', 'bg-') + "/10",
                                    fund.color.replace('bg-', 'text-')
                                )}>
                                    <Icon className="w-7 h-7" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">{fund.percentage}%</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">доля фонда</div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-3">{fund.name}</h4>
                                <div className="text-4xl font-black text-slate-900 leading-none">
                                    {fund.amount.toLocaleString()} <span className="text-base text-slate-400 font-bold ml-1">{currencySymbol}</span>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-50">
                                <div
                                    className={cn("h-full transition-all duration-1000", fund.color)}
                                    style={{ width: `${fund.percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="crm-card p-10 bg-white border-none shadow-lg relative overflow-hidden group !rounded-[32px]">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full -mr-48 -mt-48 blur-[80px] opacity-40" />

                <div className="relative flex items-center gap-8 mb-16">
                    <div className="h-16 w-16 rounded-[var(--radius-inner)] bg-slate-900 flex items-center justify-center text-white shadow-2xl shadow-slate-300 group-hover:scale-110 transition-transform duration-500">
                        <PieChart className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Распределение капитала</h3>
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1.5 opacity-80">Визуальный баланс всех фондов организации</p>
                    </div>
                </div>

                <div className="h-20 w-full flex rounded-[var(--radius-inner)] overflow-hidden shadow-inner bg-slate-50 border border-slate-200/50 p-1.5 mb-14">
                    {fundsData.funds.map((fund, i) => (
                        <div
                            key={i}
                            className={cn("h-full transition-all hover:opacity-90 relative group first:rounded-l-[14px] last:rounded-r-[14px]", fund.color)}
                            style={{ width: `${fund.percentage}%` }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 text-white text-[10px] font-black uppercase tracking-widest">
                                {fund.percentage}%
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 p-8 bg-slate-50/50 rounded-[var(--radius-inner)] border border-slate-100">
                    {fundsData.funds.map((fund, i) => (
                        <div key={i} className="flex items-center gap-4 group/item">
                            <div className={cn("w-4 h-4 rounded-full shadow-sm ring-4 ring-white transition-transform group-hover/item:scale-125", fund.color)} />
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{fund.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
