"use client";

import {
 TrendingUp,
 CreditCard,
 ShoppingBag,
 Tags,
 Activity,
 Trash2,
 DollarSign,
 ArrowUpRight,
 ArrowDownRight,
 Package,
 BarChart3
} from"lucide-react";
import { useRouter } from"next/navigation";
import { cn } from"@/lib/utils";
import { pluralize } from"@/lib/pluralize";
import { useBranding } from"@/components/branding-provider";
import { FinancialStats } from"./actions";
import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer
} from"recharts";
import { motion } from"framer-motion";

interface SalesClientProps {
 salesData: FinancialStats;
}

export function SalesClient({ salesData }: SalesClientProps) {
 const { currencySymbol } = useBranding();
 const router = useRouter();

 const statsCards = [
 {
 label:"Общая выручка",
 value: Number(salesData.summary.totalRevenue || 0).toLocaleString('ru-RU'),
 suffix: currencySymbol,
 icon: DollarSign,
 color:"text-emerald-600",
 bgIcon:"bg-emerald-50",
 trend:"+12.5%",
 trendIcon: ArrowUpRight,
 trendColor:"text-emerald-600",
 gradient:"from-emerald-500/10 to-transparent"
 },
 {
 label:"Чистая прибыль",
 value: Number(salesData.summary.netProfit || 0).toLocaleString('ru-RU'),
 suffix: currencySymbol,
 icon: TrendingUp,
 color:"text-primary",
 bgIcon:"bg-primary/5",
 trend:"+8.3%",
 trendIcon: ArrowUpRight,
 trendColor:"text-primary",
 gradient:"from-primary/10 to-transparent"
 },
 {
 label:"Средний чек",
 value: Math.round(Number(salesData.summary.avgOrderValue || 0)).toLocaleString('ru-RU'),
 suffix: currencySymbol,
 icon: CreditCard,
 color:"text-amber-600",
 bgIcon:"bg-amber-50",
 trend:"-2.1%",
 trendIcon: ArrowDownRight,
 trendColor:"text-rose-500",
 gradient:"from-amber-500/10 to-transparent"
 },
 {
 label:"Заказов всего",
 value: Number(salesData.summary.orderCount || 0),
 suffix:"шт.",
 icon: ShoppingBag,
 color:"text-blue-600",
 bgIcon:"bg-blue-50",
 trend:"+5.2%",
 trendIcon: ArrowUpRight,
 trendColor:"text-blue-600",
 gradient:"from-blue-500/10 to-transparent"
 },
 {
 label:"Себестоимость (ср)",
 value: Math.round(Number(salesData.summary.averageCost || 0)).toLocaleString('ru-RU'),
 suffix: currencySymbol,
 icon: Tags,
 color:"text-violet-600",
 bgIcon:"bg-violet-50",
 trend:"~0%",
 trendIcon: Activity,
 trendColor:"text-slate-500",
 gradient:"from-violet-500/10 to-transparent"
 },
 {
 label:"Списания/Брак",
 value: Math.round(Number(salesData.summary.writeOffs || 0)).toLocaleString('ru-RU'),
 suffix: currencySymbol,
 icon: Trash2,
 color:"text-rose-600",
 bgIcon:"bg-rose-50",
 trend:"+1.2%",
 trendIcon: ArrowUpRight,
 trendColor:"text-rose-500",
 gradient:"from-rose-500/10 to-transparent"
 }
 ];

 const categoryConfig: Record<string, { label: string, color: string, icon: React.ElementType }> = {
 print: { label:"Печать", color:"#6366f1", icon: Package },
 embroidery: { label:"Вышивка", color:"#a855f7", icon: Package },
 merch: { label:"Мерч", color:"#10b981", icon: Package },
 other: { label:"Прочее", color:"#64748b", icon: Package }
 };

 const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: { count: number } }[]; label?: string }) => {
 if (active && payload && payload.length) {
 return (
 <div className="bg-white/90 backdrop-blur-md p-4 border border-slate-200 rounded-2xl shadow-xl">
 <p className="text-xs font-black text-slate-400 mb-2">{label}</p>
 <div className="space-y-1">
 <p className="text-sm font-black text-slate-900">
 Выручка: <span className="text-primary">{payload[0].value?.toLocaleString()} {currencySymbol}</span>
 </p>
 <p className="text-xs font-bold text-slate-500">
 Заказов: {payload[0].payload?.count} шт.
 </p>
 </div>
 </div>
 );
 }
 return null;
 };

 return (
 <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
 {/* Summary Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3">
 {statsCards.map((card, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.05 }}
 className="crm-card p-5 bg-white flex flex-col justify-between hover:shadow-lg transition-all duration-500 group border-none relative overflow-hidden h-40"
 >
 <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", card.gradient)} />
 
 <div className="flex justify-between items-start relative z-10">
 <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform duration-500",
 card.bgIcon
 )}>
 <card.icon className={cn("h-5 w-5", card.color)} />
 </div>
 <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black",
 card.trendColor.replace('text-', 'bg-') +"/10",
 card.trendColor
 )}>
 <card.trendIcon className="w-3 h-3" />
 <span>{card.trend}</span>
 </div>
 </div>
 
 <div className="relative z-10">
 <p className="text-slate-400 text-xs font-black mb-1 opacity-70 group-hover:opacity-100 transition-opacity">{card.label}</p>
 <div className="text-2xl font-black text-slate-900 leading-tight">
 {card.value}
 <span className="text-xs text-slate-400 font-bold ml-1 opacity-60">{card.suffix}</span>
 </div>
 </div>
 </motion.div>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
 {/* Revenue Dynamics Chart */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.3 }}
 className="lg:col-span-2 crm-card p-6 bg-white border-none shadow-sm min-h-[400px] flex flex-col"
 >
 <div className="flex items-center justify-between mb-8">
 <div>
 <h3 className="text-lg font-black text-slate-900 leading-none">Динамика продаж</h3>
 <p className="text-xs font-bold text-slate-400 mt-1.5">Выручка по дням за период</p>
 </div>
 <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
 <Activity className="w-5 h-5" />
 </div>
 </div>
 
 <div className="flex-1 w-full h-full min-h-[280px]">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart 
 data={salesData.chartData} 
 margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
 style={{ cursor: 'pointer' }}
 onClick={(data) => {
 if (data && data.activeLabel) {
 router.push(`/dashboard/finance/transactions?from=${data.activeLabel}&to=${data.activeLabel}`);
 }
 }}
 >
 <defs>
 <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
 <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
 <XAxis 
 dataKey="date" 
 axisLine={false}
 tickLine={false}
 tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
 dy={10}
 tickFormatter={(str) => {
 const date = new Date(str);
 return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
 }}
 />
 <YAxis 
 axisLine={false}
 tickLine={false}
 tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
 />
 <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }} />
 <Area
 type="monotone"
 dataKey="revenue"
 stroke="var(--primary)"
 strokeWidth={4}
 fillOpacity={1}
 fill="url(#colorRevenue)"
 animationDuration={2000}
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </motion.div>

 {/* Category Performance */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.4 }}
 className="crm-card p-6 bg-white border-none shadow-sm flex flex-col"
 >
 <div className="flex items-center justify-between mb-8">
 <div>
 <h3 className="text-lg font-black text-slate-900 leading-none">По категориям</h3>
 <p className="text-xs font-bold text-slate-400 mt-1.5">Распределение выручки</p>
 </div>
 <div className="h-10 w-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
 <BarChart3 className="w-5 h-5" />
 </div>
 </div>

 <div className="flex-1 space-y-3">
 {salesData.categories.map((cat, i) => {
 const config = categoryConfig[cat.name] || categoryConfig.other;
 const totalRev = Number(salesData.summary.totalRevenue || 0);
 const percentage = totalRev > 0 ? (cat.revenue / totalRev) * 100 : 0;

 return (
 <div key={i} className="space-y-2">
 <div className="flex justify-between items-end">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
 <span className="text-xs font-black text-slate-700">{config.label}</span>
 </div>
 <div className="text-right">
 <span className="text-xs font-black text-slate-900">{cat.revenue.toLocaleString()} {currencySymbol}</span>
 <span className="text-xs font-bold text-slate-400 ml-1.5">({Math.round(percentage)}%)</span>
 </div>
 </div>
 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${percentage}%` }}
 transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
 className="h-full rounded-full"
 style={{ backgroundColor: config.color }}
 />
 </div>
 <div className="flex justify-between text-xs font-bold text-slate-400">
 <span>{cat.count} {pluralize(cat.count, 'заказ', 'заказа', 'заказов')}</span>
 <span>ср. чек: {Math.round(cat.revenue / (cat.count || 1)).toLocaleString()} {currencySymbol}</span>
 </div>
 </div>
 );
 })}
 </div>
 </motion.div>
 </div>
 
 {/* Category Cards - Grid for quick info */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
 {salesData.categories.map((cat, i) => {
 const config = categoryConfig[cat.name] || categoryConfig.other;
 const totalRev = Number(salesData.summary.totalRevenue || 0);
 const percentage = totalRev > 0 ? (cat.revenue / totalRev) * 100 : 0;

 return (
 <motion.div 
 key={i} 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.6 + i * 0.1 }}
 className="crm-card p-5 bg-white flex flex-col justify-between hover:shadow-md transition-all duration-500 group border-none shadow-sm relative overflow-hidden"
 >
 <div className="flex justify-between items-start mb-4">
 <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 transition-colors">
 <Package className="h-5 w-5" />
 </div>
 <div className="text-right">
 <div className="text-xl font-black text-slate-900 leading-none mb-1">{Math.round(percentage)}%</div>
 <div className="text-xs font-bold text-slate-400 leading-none">доля</div>
 </div>
 </div>

 <div>
 <p className="text-slate-400 text-xs font-black mb-1">{config.label}</p>
 <div className="text-xl font-black text-slate-900 leading-none mb-2">
 {cat.revenue.toLocaleString()} <span className="text-xs text-slate-400 font-bold">{currencySymbol}</span>
 </div>
 <div className="text-xs text-slate-500 font-bold bg-slate-50 inline-block px-2 py-0.5 rounded-md">{cat.count} {pluralize(cat.count, 'заказ', 'заказа', 'заказов')}</div>
 </div>
 </motion.div>
 );
 })}
 </div>
 </div>
 );
}
