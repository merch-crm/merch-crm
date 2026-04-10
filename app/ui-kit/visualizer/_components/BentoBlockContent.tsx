"use client";

import React from "react";
import {
 FileText, BarChart3, Users, Image as ImageIcon, TrendingUp, TrendingDown,
 ArrowUpRight, Star, Eye, Table2, Bell, Activity, UserCircle,
 CheckCircle2, AlertTriangle, Info, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BentoBlockContentProps {
 type: string;
 title?: string;
 isDark: boolean;
 colSpan: number;
 rowSpan: number;
}

function getBlockSize(colSpan: number, rowSpan: number): "sm" | "md" | "lg" {
 const area = colSpan * rowSpan;
 if (area <= 1) return "sm";
 if (area <= 4) return "md";
 return "lg";
}

function Pad({ children, size }: { children: React.ReactNode; size: "sm" | "md" | "lg" }) {
 return (
  <div className={cn(
   "flex flex-col w-full h-full overflow-hidden",
   size === "sm" ? "px-3 pt-5 pb-2" : "px-4 pt-7 pb-3"
  )}>
   {children}
  </div>
 );
}

function TextContent({ isDark, size }: { isDark: boolean; size: "sm" | "md" | "lg" }) {
 const textColor = isDark ? "text-slate-200" : "text-slate-800";
 const mutedColor = isDark ? "text-slate-400" : "text-slate-500";
 const lineColor = isDark ? "bg-slate-600/40" : "bg-slate-300/60";

 if (size === "sm") {
  return (
   <Pad size={size}>
    <FileText size={14} className={cn(mutedColor, "mb-1.5")} />
    <div className={cn("h-1.5 rounded-full w-3/4", lineColor)} />
    <div className={cn("h-1.5 rounded-full w-1/2 mt-1.5", lineColor)} />
   </Pad>
  );
 }

 return (
  <Pad size={size}>
   <div className="flex items-center gap-2 mb-2">
    <FileText size={16} className={mutedColor} />
    <span className={cn("text-[11px] font-bold uppercase tracking-wider", mutedColor)}>Документ</span>
   </div>
   <p className={cn("text-sm font-bold leading-snug", textColor)}>
    Проект системы мерчандайзинга
   </p>
   <p className={cn("text-xs leading-relaxed mt-1", mutedColor)}>
    Описание ключевых процессов работы с поставщиками и управлением товарными остатками.
   </p>
   {size === "lg" && (
    <>
     <div className="flex flex-wrap gap-1.5 mt-2">
      {["Мерч", "CRM", "Аналитика"].map(tag => (
       <span key={tag} className={cn(
        "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider",
        isDark ? "bg-slate-700/60 text-slate-300" : "bg-slate-200/80 text-slate-600"
       )}>{tag}</span>
      ))}
     </div>
     <div className="mt-3 space-y-1.5">
      {[85, 60, 40].map((w, i) => (
       <div key={i} className={cn("h-1.5 rounded-full", lineColor)} style={{ width: `${w}%` }} />
      ))}
     </div>
    </>
   )}
  </Pad>
 );
}

function StatsContent({ isDark, size }: { isDark: boolean; size: "sm" | "md" | "lg" }) {
 const textColor = isDark ? "text-slate-100" : "text-slate-900";
 const mutedColor = isDark ? "text-slate-400" : "text-slate-500";
 const accentColor = isDark ? "text-emerald-400" : "text-emerald-600";

 if (size === "sm") {
  return (
   <Pad size={size}>
    <span className={cn("text-[9px] font-bold uppercase tracking-wider", mutedColor)}>Доход</span>
    <span className={cn("text-lg font-black tabular-nums tracking-tight", textColor)}>₽14.8M</span>
    <span className={cn("text-[10px] font-bold flex items-center gap-0.5", accentColor)}>
     <TrendingUp size={10} /> +12%
    </span>
   </Pad>
  );
 }

 const stats = [
  { label: "Выручка", value: "₽14.8M", change: "+12.4%", up: true },
  { label: "Заказы", value: "2,847", change: "+8.2%", up: true },
  { label: "Конверсия", value: "4.6%", change: "-0.3%", up: false },
  { label: "Средний чек", value: "₽5,200", change: "+2.1%", up: true },
 ];
 const visibleStats = size === "lg" ? stats : stats.slice(0, 2);

 return (
  <Pad size={size}>
   <div className="flex items-center gap-2 mb-3">
    <BarChart3 size={16} className={mutedColor} />
    <span className={cn("text-[11px] font-bold uppercase tracking-wider", mutedColor)}>Показатели</span>
   </div>
   <div className={cn("grid gap-3", size === "lg" ? "grid-cols-2" : "grid-cols-1")}>
    {visibleStats.map((s, i) => (
     <div key={i} className={cn("rounded-element p-3", isDark ? "bg-white/5" : "bg-slate-50/80")}>
      <span className={cn("text-[9px] font-bold uppercase tracking-wider block mb-0.5", mutedColor)}>{s.label}</span>
      <span className={cn("text-lg font-black tabular-nums tracking-tight block", textColor)}>{s.value}</span>
      <span className={cn(
       "text-[10px] font-bold flex items-center gap-0.5 mt-0.5",
       s.up ? accentColor : (isDark ? "text-rose-400" : "text-rose-500")
      )}>
       {s.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
       {s.change}
      </span>
     </div>
    ))}
   </div>
  </Pad>
 );
}

function ChartContent({ isDark, size }: { isDark: boolean; size: "sm" | "md" | "lg" }) {
 const mutedColor = isDark ? "text-slate-400" : "text-slate-500";
 const barColor = isDark ? "bg-blue-400/70" : "bg-blue-500/60";
 const barAltColor = isDark ? "bg-blue-500/40" : "bg-blue-400/40";
 const bars = [35, 55, 40, 70, 85, 60, 75, 90, 65, 50, 80, 95];
 const visibleBars = size === "sm" ? bars.slice(0, 6) : size === "md" ? bars.slice(0, 8) : bars;

 return (
  <Pad size={size}>
   <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
     <BarChart3 size={16} className={mutedColor} />
     <span className={cn("text-[11px] font-bold uppercase tracking-wider", mutedColor)}>Аналитика</span>
    </div>
    {size !== "sm" && (
     <span className={cn("text-[10px] font-bold flex items-center gap-1", isDark ? "text-emerald-400" : "text-emerald-600")}>
      <ArrowUpRight size={12} /> +24.5%
     </span>
    )}
   </div>
   <div className="flex-1 flex items-end gap-[3px] min-h-0">
    {visibleBars.map((h, i) => (
     <div key={i} className={cn("flex-1 rounded-t-sm", i % 3 === 0 ? barAltColor : barColor)} style={{ height: `${h}%` }} />
    ))}
   </div>
   {size !== "sm" && (
    <div className="flex justify-between mt-2">
     {["Янв", "Фев", "Мар", "Апр"].slice(0, size === "lg" ? 4 : 3).map(m => (
      <span key={m} className={cn("text-[8px] font-bold uppercase tracking-wider", mutedColor)}>{m}</span>
     ))}
    </div>
   )}
  </Pad>
 );
}

function UserContent({ isDark, size }: { isDark: boolean; size: "sm" | "md" | "lg" }) {
 const textColor = isDark ? "text-slate-200" : "text-slate-800";
 const mutedColor = isDark ? "text-slate-400" : "text-slate-500";
 const users = [
  { name: "Алексей М.", role: "Менеджер", avatar: "АМ", color: "bg-blue-500" },
  { name: "Екатерина С.", role: "Дизайнер", avatar: "ЕС", color: "bg-rose-500" },
  { name: "Дмитрий К.", role: "Разработчик", avatar: "ДК", color: "bg-emerald-500" },
  { name: "Ольга П.", role: "Аналитик", avatar: "ОП", color: "bg-amber-500" },
 ];

 if (size === "sm") {
  return (
   <Pad size={size}>
    <div className="flex -space-x-2 justify-center">
     {users.slice(0, 3).map((u, i) => (
      <div key={i} className={cn("size-7 rounded-full flex items-center justify-center text-[8px] font-black text-white ring-2", u.color, isDark ? "ring-slate-900" : "ring-white")}>
       {u.avatar}
      </div>
     ))}
    </div>
    <span className={cn("text-[9px] font-bold text-center mt-1", mutedColor)}>+4 чел.</span>
   </Pad>
  );
 }

 const visibleUsers = size === "lg" ? users : users.slice(0, 3);
 return (
  <Pad size={size}>
   <div className="flex items-center gap-2 mb-3">
    <Users size={16} className={mutedColor} />
    <span className={cn("text-[11px] font-bold uppercase tracking-wider", mutedColor)}>Команда</span>
    <span className={cn("ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md", isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700")}>Online</span>
   </div>
   <div className="space-y-2.5">
    {visibleUsers.map((u, i) => (
     <div key={i} className="flex items-center gap-2.5">
      <div className={cn("size-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0", u.color)}>{u.avatar}</div>
      <div className="min-w-0 flex-1">
       <span className={cn("text-xs font-bold block truncate", textColor)}>{u.name}</span>
       <span className={cn("text-[10px] block truncate", mutedColor)}>{u.role}</span>
      </div>
      {size === "lg" && <div className={cn("size-2 rounded-full shrink-0", i < 3 ? "bg-emerald-500" : "bg-slate-400")} />}
     </div>
    ))}
   </div>
  </Pad>
 );
}

function MediaContent({ isDark, size }: { isDark: boolean; size: "sm" | "md" | "lg" }) {
 const mutedColor = isDark ? "text-slate-400" : "text-slate-500";

 if (size === "sm") {
  return (
   <div className="flex flex-col items-center justify-center w-full h-full gap-1">
    <ImageIcon size={20} className={mutedColor} />
    <span className={cn("text-[8px] font-bold uppercase tracking-wider", mutedColor)}>Фото</span>
   </div>
  );
 }

 return (
  <div className="flex flex-col w-full h-full overflow-hidden">
   <div className={cn(
    "flex-1 flex flex-col items-center justify-center relative",
    isDark ? "bg-gradient-to-br from-blue-900/30 via-slate-800/20 to-indigo-900/30"
        : "bg-gradient-to-br from-blue-100/60 via-slate-50/30 to-indigo-100/60"
   )}>
    <ImageIcon size={size === "lg" ? 40 : 28} strokeWidth={1} className={cn(mutedColor, "relative z-10")} />
    <span className={cn("text-[10px] font-bold uppercase tracking-wider mt-2 relative z-10", mutedColor)}>1920 × 1080</span>
   </div>
   <div className={cn("px-4 py-2.5 flex items-center justify-between shrink-0", isDark ? "bg-white/5 border-t border-white/5" : "bg-slate-50/80 border-t border-slate-100")}>
    <span className={cn("text-[10px] font-bold truncate", isDark ? "text-slate-200" : "text-slate-700")}>product_banner.webp</span>
    <div className="flex items-center gap-2">
     <Eye size={12} className={mutedColor} />
     <span className={cn("text-[9px] font-bold tabular-nums", mutedColor)}>2.4k</span>
     <Star size={12} className={cn(isDark ? "text-amber-400" : "text-amber-500")} fill="currentColor" />
    </div>
   </div>
  </div>
 );
}

function TableContent({ isDark, size }: { isDark: boolean; size: "sm" | "md" | "lg" }) {
 const textColor = isDark ? "text-slate-200" : "text-slate-800";
 const mutedColor = isDark ? "text-slate-400" : "text-slate-500";
 const borderColor = isDark ? "border-white/5" : "border-slate-100";
 const rowBg = isDark ? "even:bg-white/[0.02]" : "even:bg-slate-50/50";

 const rows = [
  { name: "SKU-001", product: "Футболка", qty: "1,240", status: "ok" },
  { name: "SKU-002", product: "Худи", qty: "860", status: "ok" },
  { name: "SKU-003", product: "Кепка", qty: "45", status: "low" },
  { name: "SKU-004", product: "Сумка", qty: "2,100", status: "ok" },
  { name: "SKU-005", product: "Шарф", qty: "0", status: "out" },
 ];

 if (size === "sm") {
  return (
   <Pad size={size}>
    <Table2 size={14} className={cn(mutedColor, "mb-1.5")} />
    <div className="space-y-1">
     {rows.slice(0, 3).map((r, i) => (
      <div key={i} className="flex justify-between">
       <span className={cn("text-[8px] font-bold truncate", textColor)}>{r.product}</span>
       <span className={cn("text-[8px] font-bold tabular-nums", mutedColor)}>{r.qty}</span>
      </div>
     ))}
    </div>
   </Pad>
  );
 }

 const visibleRows = size === "lg" ? rows : rows.slice(0, 3);
 const headers = size === "lg" ? ["Артикул", "Товар", "Остаток", "Статус"] : ["Артикул", "Товар", "Остаток"];

 return (
  <Pad size={size}>
   <div className="flex items-center gap-2 mb-3">
    <Table2 size={16} className={mutedColor} />
    <span className={cn("text-[11px] font-bold uppercase tracking-wider", mutedColor)}>Таблица</span>
    <span className={cn("ml-auto text-[9px] font-bold tabular-nums", mutedColor)}>{rows.length} записей</span>
   </div>
   <div className="flex-1 overflow-hidden">
    <table className="w-full text-left">
     <thead>
      <tr className={cn("border-b", borderColor)}>
       {headers.map(h => (
        <th key={h} className={cn("pb-2 text-[9px] font-black uppercase tracking-wider", mutedColor)}>{h}</th>
       ))}
      </tr>
     </thead>
     <tbody>
      {visibleRows.map((r, i) => (
       <tr key={i} className={cn("border-b last:border-b-0", borderColor, rowBg)}>
        <td className={cn("py-1.5 text-[10px] font-bold tabular-nums", mutedColor)}>{r.name}</td>
        <td className={cn("py-1.5 text-[11px] font-bold", textColor)}>{r.product}</td>
        <td className={cn("py-1.5 text-[11px] font-bold tabular-nums", textColor)}>{r.qty}</td>
        {size === "lg" && (
         <td className="py-1.5">
          <span className={cn(
           "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md",
           r.status === "ok" ? (isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700") :
           r.status === "low" ? (isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700") :
           (isDark ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-700")
          )}>
           {r.status === "ok" ? "Ок" : r.status === "low" ? "Мало" : "Нет"}
          </span>
         </td>
        )}
       </tr>
      ))}
     </tbody>
    </table>
   </div>
  </Pad>
 );
}

function NotificationContent({ isDark, size }: { isDark: boolean; size: "sm" | "md" | "lg" }) {
 const mutedColor = isDark ? "text-slate-400" : "text-slate-500";

 const items = [
  { icon: CheckCircle2, text: "Заказ #847 отгружен", time: "2 мин", color: isDark ? "text-emerald-400" : "text-emerald-600", bg: isDark ? "bg-emerald-500/10" : "bg-emerald-50" },
  { icon: AlertTriangle, text: "Склад B — низкий остаток", time: "15 мин", color: isDark ? "text-amber-400" : "text-amber-600", bg: isDark ? "bg-amber-500/10" : "bg-amber-50" },
  { icon: Info, text: "Новый клиент зарегистрирован", time: "1 ч", color: isDark ? "text-blue-400" : "text-blue-600", bg: isDark ? "bg-blue-500/10" : "bg-blue-50" },
  { icon: AlertTriangle, text: "Сбой синхронизации CRM", time: "3 ч", color: isDark ? "text-rose-400" : "text-rose-600", bg: isDark ? "bg-rose-500/10" : "bg-rose-50" },
 ];

 if (size === "sm") {
  return (
   <Pad size={size}>
    <div className="relative">
     <Bell size={16} className={mutedColor} />
     <div className="absolute -top-0.5 -right-0.5 size-2.5 bg-rose-500 rounded-full" />
    </div>
    <span className={cn("text-[9px] font-bold mt-1", mutedColor)}>3 новых</span>
   </Pad>
  );
 }

 const visibleItems = size === "lg" ? items : items.slice(0, 3);

 return (
  <Pad size={size}>
   <div className="flex items-center gap-2 mb-3">
    <Bell size={16} className={mutedColor} />
    <span className={cn("text-[11px] font-bold uppercase tracking-wider", mutedColor)}>Уведомления</span>
    <span className="ml-auto size-5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">{items.length}</span>
   </div>
   <div className="space-y-2">
    {visibleItems.map((item, i) => {
     const Icon = item.icon;
     return (
      <div key={i} className={cn("flex items-start gap-2.5 rounded-element p-2.5", item.bg)}>
       <Icon size={14} className={cn(item.color, "shrink-0 mt-0.5")} />
       <div className="min-w-0 flex-1">
        <span className={cn("text-[11px] font-bold block truncate", isDark ? "text-slate-200" : "text-slate-800")}>{item.text}</span>
        <span className={cn("text-[9px] font-bold flex items-center gap-1 mt-0.5", mutedColor)}>
         <Clock size={8} /> {item.time}
        </span>
       </div>
      </div>
     );
    })}
   </div>
  </Pad>
 );
}

function ProgressContent({ isDark, size }: { isDark: boolean; size: "sm" | "md" | "lg" }) {
 const textColor = isDark ? "text-slate-100" : "text-slate-900";
 const mutedColor = isDark ? "text-slate-400" : "text-slate-500";
 const trackBg = isDark ? "bg-white/10" : "bg-slate-200/80";

 const metrics = [
  { label: "CPU", value: 72, color: "bg-blue-500" },
  { label: "RAM", value: 58, color: "bg-emerald-500" },
  { label: "Диск", value: 89, color: "bg-amber-500" },
  { label: "Сеть", value: 34, color: "bg-violet-500" },
 ];

 if (size === "sm") {
  return (
   <Pad size={size}>
    <span className={cn("text-[9px] font-bold uppercase tracking-wider", mutedColor)}>CPU</span>
    <span className={cn("text-lg font-black tabular-nums", textColor)}>72%</span>
    <div className={cn("w-full h-1.5 rounded-full mt-1", trackBg)}>
     <div className="h-full rounded-full bg-blue-500" style={{ width: "72%" }} />
    </div>
   </Pad>
  );
 }

 const visibleMetrics = size === "lg" ? metrics : metrics.slice(0, 3);

 return (
  <Pad size={size}>
   <div className="flex items-center gap-2 mb-3">
    <Activity size={16} className={mutedColor} />
    <span className={cn("text-[11px] font-bold uppercase tracking-wider", mutedColor)}>Мониторинг</span>
   </div>
   <div className="space-y-3">
    {visibleMetrics.map((m, i) => (
     <div key={i}>
      <div className="flex items-center justify-between mb-1">
       <span className={cn("text-[10px] font-bold", mutedColor)}>{m.label}</span>
       <span className={cn("text-[11px] font-black tabular-nums", textColor)}>{m.value}%</span>
      </div>
      <div className={cn("w-full h-2 rounded-full", trackBg)}>
       <div className={cn("h-full rounded-full transition-all", m.color)} style={{ width: `${m.value}%` }} />
      </div>
     </div>
    ))}
   </div>
  </Pad>
 );
}

function ProfileContent({ isDark, size }: { isDark: boolean; size: "sm" | "md" | "lg" }) {
 const textColor = isDark ? "text-slate-200" : "text-slate-800";
 const mutedColor = isDark ? "text-slate-400" : "text-slate-500";

 if (size === "sm") {
  return (
   <Pad size={size}>
    <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white mx-auto">
     АП
    </div>
    <span className={cn("text-[9px] font-bold text-center mt-1 truncate w-full", textColor)}>А. Петров</span>
   </Pad>
  );
 }

 return (
  <Pad size={size}>
   <div className="flex items-center gap-2 mb-3">
    <UserCircle size={16} className={mutedColor} />
    <span className={cn("text-[11px] font-bold uppercase tracking-wider", mutedColor)}>Профиль</span>
   </div>
   <div className="flex items-center gap-3 mb-3">
    <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-black text-white shrink-0">
     АП
    </div>
    <div className="min-w-0">
     <span className={cn("text-sm font-bold block truncate", textColor)}>Александр Петров</span>
     <span className={cn("text-[10px] block", mutedColor)}>Ведущий менеджер</span>
    </div>
   </div>
   {size === "lg" && (
    <div className={cn("grid grid-cols-3 gap-2 rounded-element p-2.5", isDark ? "bg-white/5" : "bg-slate-50/80")}>
     {[
      { label: "Сделок", value: "124" },
      { label: "Клиентов", value: "87" },
      { label: "Рейтинг", value: "4.9" },
     ].map(s => (
      <div key={s.label} className="text-center">
       <span className={cn("text-sm font-black block tabular-nums", textColor)}>{s.value}</span>
       <span className={cn("text-[8px] font-bold uppercase tracking-wider", mutedColor)}>{s.label}</span>
      </div>
     ))}
    </div>
   )}
   <div className={cn("flex items-center gap-1.5 mt-2", mutedColor)}>
    <span className="size-2 rounded-full bg-emerald-500" />
    <span className="text-[10px] font-bold">В сети • Москва</span>
   </div>
  </Pad>
 );
}

export function BentoBlockContent({ type, isDark, colSpan, rowSpan }: BentoBlockContentProps) {
 const size = getBlockSize(colSpan, rowSpan);

 switch (type) {
  case "text": return <TextContent isDark={isDark} size={size} />;
  case "stats": return <StatsContent isDark={isDark} size={size} />;
  case "chart": return <ChartContent isDark={isDark} size={size} />;
  case "user": return <UserContent isDark={isDark} size={size} />;
  case "image": return <MediaContent isDark={isDark} size={size} />;
  case "table": return <TableContent isDark={isDark} size={size} />;
  case "notification": return <NotificationContent isDark={isDark} size={size} />;
  case "progress": return <ProgressContent isDark={isDark} size={size} />;
  case "profile": return <ProfileContent isDark={isDark} size={size} />;
  default: return <TextContent isDark={isDark} size={size} />;
 }
}
