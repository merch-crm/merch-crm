"use client";

import { useBranding } from"@/components/branding-provider";
import { 
 PieChart, 
 Pie, 
 Cell, 
 ResponsiveContainer, 
 Tooltip as ReChartsTooltip, 
 Legend 
} from"recharts";
import { 
 TrendingUp, 
 DollarSign, 
 BarChart3, 
 Percent 
} from"lucide-react";
import { motion } from"framer-motion";

interface PLReport {
 totalRevenue: number;
 totalCOGS: number;
 grossProfit: number;
 totalOverhead: number;
 netProfit: number;
 margin: number;
}

interface PLClientProps {
 plReport: PLReport;
}

export function PLClient({ plReport }: PLClientProps) {
 const { currencySymbol } = useBranding();
 if (!plReport) return null;

 const expenseData = [
 { name: 'Себестоимость (COGS)', value: plReport.totalCOGS, color: '#f43f5e' }, // rose-500
 { name: 'Опер. расходы (OPEX)', value: plReport.totalOverhead, color: '#fb7185' }, // rose-400
 ].filter(d => d.value > 0);



 return (
 <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
 {/* 1. Metric Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
 {/* Revenue */}
 <div className="crm-card !bg-slate-900 text-white !border-none shadow-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none" />
 <div className="flex items-center gap-2 mb-4 relative z-10">
 <DollarSign className="w-4 h-4 text-emerald-400" />
 <p className="text-slate-400 text-xs font-black">Выручка</p>
 </div>
 <div className="text-4xl font-black relative z-10">
 {plReport.totalRevenue.toLocaleString('ru-RU')} 
 <span className="text-lg opacity-50 ml-1">{currencySymbol}</span>
 </div>
 </div>

 {/* COGS */}
 <div className="crm-card shadow-lg hover:border-rose-100 transition-all group overflow-hidden relative">
 <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -mr-12 -mt-12 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
 <p className="text-slate-400 text-xs font-black mb-4">Себестоимость</p>
 <div className="text-4xl font-black text-rose-500">
 -{plReport.totalCOGS.toLocaleString('ru-RU')} 
 <span className="text-lg opacity-50 ml-1">{currencySymbol}</span>
 </div>
 <div className="text-xs font-bold text-rose-400 mt-4 flex items-center gap-1">
 <BarChart3 className="w-3 h-3" /> Затраты на товар
 </div>
 </div>

 {/* OPEX */}
 <div className="crm-card shadow-lg hover:border-rose-200 transition-all group overflow-hidden relative">
 <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -mr-12 -mt-12 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
 <p className="text-slate-400 text-xs font-black mb-4">Опер. расходы</p>
 <div className="text-4xl font-black text-rose-600">
 -{plReport.totalOverhead.toLocaleString('ru-RU')} 
 <span className="text-lg opacity-50 ml-1">{currencySymbol}</span>
 </div>
 <div className="text-xs font-bold text-rose-500 mt-4 flex items-center gap-1">
 <TrendingUp className="w-3 h-3" /> Аренда, налоги и др.
 </div>
 </div>

 {/* Net Profit */}
 <div className="crm-card !bg-emerald-600 text-white !border-none shadow-2xl relative overflow-hidden group">
 <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mb-16 blur-3xl pointer-events-none" />
 <p className="text-emerald-100/70 text-xs font-black mb-4 relative z-10">Чистая прибыль</p>
 <div className="text-4xl font-black relative z-10">
 {plReport.netProfit.toLocaleString('ru-RU')} 
 <span className="text-lg opacity-60 ml-1">{currencySymbol}</span>
 </div>
 <div className="mt-6 flex items-center gap-2 relative z-10">
 <div className="text-xs font-black bg-white/20 px-4 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md">
 <Percent className="w-3 h-3" /> Маржа: {plReport.margin.toFixed(1)}%
 </div>
 </div>
 </div>
 </div>

 {/* 2. Charts & Details */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
 {/* Expense Structure Chart */}
 <div className="crm-card !p-8 bg-white border-none shadow-xl !rounded-[32px] lg:col-span-1 flex flex-col items-center">
 <h3 className="text-xl font-black text-slate-900 mb-2 w-full">Структура расходов</h3>
 <p className="text-slate-400 text-xs font-bold mb-8 w-full">Соотношение затрат</p>
 
 <div className="h-[280px] w-full relative">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={expenseData}
 cx="50%"
 cy="50%"
 innerRadius={60}
 outerRadius={90}
 paddingAngle={5}
 dataKey="value"
 animationDuration={1500}
 >
 {expenseData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <ReChartsTooltip 
 contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
 formatter={(val: number) => [`${val.toLocaleString()} ${currencySymbol}`,"Сумма"]}
 />
 <Legend verticalAlign="bottom" height={36}/>
 </PieChart>
 </ResponsiveContainer>
 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
 <span className="text-xs font-bold text-slate-400">Всего</span>
 <span className="text-2xl font-black text-slate-900">
 {(plReport.totalCOGS + plReport.totalOverhead).toLocaleString()}
 </span>
 </div>
 </div>
 </div>

 {/* detailed breakdown */}
 <div className="crm-card !p-8 bg-white border-none shadow-xl !rounded-[32px] lg:col-span-2">
 <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-50">
 <div>
 <h3 className="text-2xl font-black text-slate-900 leading-tight">Детализация</h3>
 <p className="text-slate-400 text-sm font-bold mt-1">Основные статьи прибылей и убытков</p>
 </div>
 <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
 <BarChart3 className="w-6 h-6" />
 </div>
 </div>

 <div className="space-y-3">
 {/* Revenue Item */}
 <div className="group cursor-default">
 <div className="flex justify-between items-center mb-3">
 <span className="text-sm font-black text-slate-700 flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-emerald-500" />
 Валовая Выручка
 </span>
 <span className="text-lg font-black text-slate-900">
 {plReport.totalRevenue.toLocaleString()} {currencySymbol}
 </span>
 </div>
 <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
 <motion.div initial={{width:0}} animate={{width:"100%"}} transition={{duration:1}} className="h-full bg-emerald-500" />
 </div>
 </div>

 {/* COGS Item */}
 <div className="group cursor-default">
 <div className="flex justify-between items-center mb-3">
 <span className="text-sm font-black text-slate-700 flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-rose-500" />
 Себестоимость реализованного (COGS)
 </span>
 <span className="text-lg font-black text-rose-500">
 -{plReport.totalCOGS.toLocaleString()} {currencySymbol}
 </span>
 </div>
 <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
 <motion.div 
 initial={{width:0}} 
 animate={{width: `${(plReport.totalCOGS / plReport.totalRevenue) * 100 || 0}%`}} 
 transition={{duration:1, delay: 0.2}} 
 className="h-full bg-rose-500" 
 />
 </div>
 <p className="text-xs font-bold text-slate-400 mt-2">Доля от выручки: {((plReport.totalCOGS / plReport.totalRevenue) * 100 || 0).toFixed(1)}%</p>
 </div>

 {/* OPEX Item */}
 <div className="group cursor-default">
 <div className="flex justify-between items-center mb-3">
 <span className="text-sm font-black text-slate-700 flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-rose-400" />
 Операционные расходы (OPEX)
 </span>
 <span className="text-lg font-black text-rose-400">
 -{plReport.totalOverhead.toLocaleString()} {currencySymbol}
 </span>
 </div>
 <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
 <motion.div 
 initial={{width:0}} 
 animate={{width: `${(plReport.totalOverhead / plReport.totalRevenue) * 100 || 0}%`}} 
 transition={{duration:1, delay: 0.4}} 
 className="h-full bg-rose-400" 
 />
 </div>
 <p className="text-xs font-bold text-slate-400 mt-2">Доля от выручки: {((plReport.totalOverhead / plReport.totalRevenue) * 100 || 0).toFixed(1)}%</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
