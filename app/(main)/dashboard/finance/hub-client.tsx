"use client";

import { useBranding } from"@/components/branding-provider";
import { FinancialStats } from"./types";
import { 
 TrendingUp, 
 DollarSign, 
 Percent, 
 ArrowUpRight, 
 ArrowDownRight,
 ArrowRight,
 Activity,
 CreditCard,
 Wallet 
} from"lucide-react";
import { cn } from"@/lib/utils";
import { 
 AreaChart, 
 Area, 
 XAxis, 
 YAxis, 
 CartesianGrid, 
 Tooltip, 
 ResponsiveContainer 
} from"recharts";
import Link from"next/link";
import { useRouter } from"next/navigation";
import { motion } from"framer-motion";

interface HubClientProps {
 stats: FinancialStats;
 plReport: {
 totalRevenue: number;
 totalCOGS: number;
 grossProfit: number;
 totalOverhead: number;
 netProfit: number;
 margin: number;
 };
}

export function HubClient({ stats, plReport }: HubClientProps) {
 const { currencySymbol } = useBranding();
 const router = useRouter();

 const overviewCards = [
 {
 label:"Выручка (30д)",
 value: plReport.totalRevenue.toLocaleString('ru-RU'),
 suffix: currencySymbol,
 icon: DollarSign,
 color:"text-emerald-500",
 bg:"bg-emerald-50",
 trend:"+12%",
 isPositive: true
 },
 {
 label:"Чистая прибыль",
 value: plReport.netProfit.toLocaleString('ru-RU'),
 suffix: currencySymbol,
 icon: TrendingUp,
 color:"text-primary",
 bg:"bg-primary/5",
 trend:"+8%",
 isPositive: true
 },
 {
 label:"Маржинальность",
 value: plReport.margin.toFixed(1),
 suffix:"%",
 icon: Percent,
 color:"text-blue-500",
 bg:"bg-blue-50",
 trend:"+2%",
 isPositive: true
 }
 ];

 const quickLinks = [
 { name:"Продажи", href:"/dashboard/finance/sales", icon: Activity, color:"text-emerald-500", desc:"Детальная статистика" },
 { name:"P&L Отчет", href:"/dashboard/finance/pl", icon: TrendingUp, color:"text-primary", desc:"Прибыли и убытки" },
 { name:"Зарплаты", href:"/dashboard/finance/salary", icon: Wallet, color:"text-amber-500", desc:"Расчет выплат" },
 { name:"Расходы", href:"/dashboard/finance/expenses", icon: CreditCard, color:"text-rose-500", desc:"Операционка" },
 ];

 return (
 <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
 {/* 1. Summary Cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 {overviewCards.map((card, i) => (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.1 }}
 key={i} 
 className="crm-card !p-6 bg-white border-none shadow-sm hover:shadow-md transition-all group"
 >
 <div className="flex justify-between items-start mb-4">
 <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 duration-500", card.bg)}>
 <card.icon className={cn("w-6 h-6", card.color)} />
 </div>
 <div className={cn("flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full", 
 card.isPositive ?"bg-emerald-50 text-emerald-600" :"bg-rose-50 text-rose-600"
 )}>
 {card.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
 {card.trend}
 </div>
 </div>
 <div>
 <p className="text-slate-400 text-sm font-bold mb-1">{card.label}</p>
 <div className="text-3xl font-black text-slate-900 ">
 {card.value} <span className="text-lg text-slate-300 font-bold ml-1">{card.suffix}</span>
 </div>
 </div>
 </motion.div>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
 {/* 2. Revenue Chart Card */}
 <motion.div 
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.3 }}
 className="lg:col-span-2 crm-card !p-8 bg-white border-none shadow-xl rounded-[32px] overflow-hidden relative"
 >
 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-primary to-blue-400" />
 <div className="flex justify-between items-center mb-8">
 <div>
 <h3 className="text-2xl font-black text-slate-900 leading-tight">Динамика выручки</h3>
 <p className="text-slate-400 text-sm font-bold mt-1">Тренды за последние 30 дней</p>
 </div>
 <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 hidden sm:block">
 <span className="text-xs font-black text-slate-500 px-3">Real-time data</span>
 </div>
 </div>
 
 <div className="h-[300px] w-full mt-4">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} style={{ cursor: 'pointer' }} onClick={(data) => {
 if (data && data.activeLabel) {
 router.push(`/dashboard/finance/transactions?from=${data.activeLabel}&to=${data.activeLabel}`);
 }
 }}
 >
 <defs>
 <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
 <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
 <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} tickFormatter={(str) => {
 const date = new Date(str);
 return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
 }}
 />
 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
 />
 <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} formatter={(value: number) => [value.toLocaleString() + ' ' + currencySymbol,"Выручка"]}
 />
 <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" animationDuration={2000} />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </motion.div>

 {/* 3. Quick Actions & Quick Stats */}
 <div className="flex flex-col gap-3">
 <motion.div 
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.4 }}
 className="crm-card !p-6 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden"
 >
 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-10 -mt-10 blur-3xl" />
 <h4 className="text-lg font-black mb-4 relative z-10">Быстрый доступ</h4>
 <div className="grid grid-cols-1 gap-2 relative z-10">
 {quickLinks.map((link, i) => (
 <Link key={i} href={link.href} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
 <div className="flex items-center gap-3">
 <div className={cn("p-2 rounded-xl bg-white/10", link.color)}>
 <link.icon className="w-4 h-4" />
 </div>
 <div>
 <div className="text-sm font-bold">{link.name}</div>
 <div className="text-xs text-slate-400 font-bold">{link.desc}</div>
 </div>
 </div>
 <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
 </Link>
 ))}
 </div>
 </motion.div>

 <motion.div 
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.5 }}
 className="crm-card !p-6 bg-white border-none shadow-lg flex-1"
 >
 <h4 className="text-sm font-black text-slate-400 mb-6">Топ категорий</h4>
 <div className="space-y-3">
 {stats.categories.slice(0, 3).map((cat, i) => {
 const total = stats.categories.reduce((acc, c) => acc + c.revenue, 0);
 const pct = (cat.revenue / total) * 100;
 return (
 <div key={i}>
 <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
 <span>{cat.name}</span>
 <span>{Math.round(pct)}%</span>
 </div>
 <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width: `${pct}%` }}
 transition={{ duration: 1, delay: 0.7 + (i * 0.1) }}
 className="h-full bg-primary rounded-full shadow-sm"
 />
 </div>
 </div>
 );
 })}
 </div>
 </motion.div>
 </div>
 </div>
 </div>
 );
}
