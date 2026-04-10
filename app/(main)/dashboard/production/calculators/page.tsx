// app/(main)/dashboard/production/calculators/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { 
 Layers, 
 Droplets, 
 Shirt, 
 Grid3X3, 
 Scissors, 
 Stamp,
 Sun,
 History,
 Info,
 ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { IconType } from "@/components/ui/stat-card";

interface CalculatorItem {
 id: string;
 title: string;
 description: string;
 href: string;
 icon: IconType;
 iconColor: string;
 iconBgColor: string;
 featured?: boolean;
 className?: string; // For Bento grid layout control
}

const calculators: CalculatorItem[] = [
 {
  id: "dtf",
  title: "DTF-печать",
  description: "Прямая печать на плёнку с переносом на ткань. Отлично подходит для полноцветных изображений и мелких деталей.",
  href: "/dashboard/production/calculators/dtf",
  icon: Layers as IconType,
  iconColor: "text-white",
  iconBgColor: "bg-white/20",
  featured: true,
  className: "md:col-span-2 lg:col-span-2 row-span-2",
 },
 {
  id: "sublimation",
  title: "Сублимация",
  description: "Надежный перенос красителя в структуру...",
  href: "/dashboard/production/calculators/sublimation",
  icon: Droplets as IconType,
  iconColor: "text-blue-600",
  iconBgColor: "bg-blue-50",
  className: "md:col-span-1 lg:col-span-1",
 },
 {
  id: "dtg",
  title: "DTG-печать",
  description: "Прямая цифровая печать на текстиль",
  href: "/dashboard/production/calculators/dtg",
  icon: Shirt as IconType,
  iconColor: "text-violet-600",
  iconBgColor: "bg-violet-50",
  className: "md:col-span-1 lg:col-span-1",
 },
 {
  id: "silkscreen",
  title: "Шелкография",
  description: "Трафаретная печать через сетку",
  href: "/dashboard/production/calculators/silkscreen",
  icon: Grid3X3 as IconType,
  iconColor: "text-slate-600",
  iconBgColor: "bg-slate-50",
  className: "md:col-span-1 lg:col-span-1",
 },
 {
  id: "embroidery",
  title: "Вышивка",
  description: "Логотипы нитками на текстиле",
  href: "/dashboard/production/calculators/embroidery",
  icon: Scissors as IconType,
  iconColor: "text-rose-600",
  iconBgColor: "bg-rose-50",
  className: "md:col-span-1 lg:col-span-1",
 },
 {
  id: "uv-dtf",
  title: "UV DTF-печать",
  description: "УФ-печать для брендирования сувениров",
  href: "/dashboard/production/calculators/uv-dtf",
  icon: Sun as IconType,
  iconColor: "text-cyan-600",
  iconBgColor: "bg-cyan-50",
  className: "md:col-span-2 lg:col-span-2", // Wide bento block
 },
 {
  id: "thermotransfer",
  title: "Нанесение принта",
  description: "Термотрансферы, нашивки, шевроны",
  href: "/dashboard/production/calculators/thermotransfer",
  icon: Stamp as IconType,
  iconColor: "text-orange-600",
  iconBgColor: "bg-orange-50",
  className: "md:col-span-2 lg:col-span-2", // Wide bento block
 },
];

const utilities: CalculatorItem[] = [
 {
  id: "history",
  title: "История",
  description: "Архив сохраненных расчётов",
  href: "/dashboard/production/calculators/history",
  icon: History as IconType,
  iconColor: "text-slate-600",
  iconBgColor: "bg-slate-50",
  className: "lg:col-span-2 md:col-span-1",
 },
 {
  id: "placements",
  title: "База нанесений",
  description: "Управление стандартными зонами",
  href: "/dashboard/production/calculators/placements",
  icon: Info as IconType,
  iconColor: "text-emerald-600",
  iconBgColor: "bg-emerald-50",
  className: "lg:col-span-2 md:col-span-1",
 },
];

function BentoCard({ calc }: { calc: CalculatorItem }) {
 const Icon = calc.icon;
 const isLarge = calc.featured;
 const isWide = calc.className?.includes('lg:col-span-2') && !isLarge;

 if (isLarge) {
  return (
   <Link href={calc.href} className={cn("group block", calc.className)}>
    <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] p-8 text-white transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1">
     {/* Decorative Icon inside Hero */}
     <Icon className="absolute -right-6 -bottom-6 h-64 w-64 opacity-[0.07] text-white transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12" />
     
     <div className="absolute top-0 right-0 p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-colors group-hover:bg-white/25">
       <ArrowRight className="h-6 w-6 text-white" />
      </div>
     </div>
     
     <div className="flex h-full flex-col justify-between pt-2">
      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/20 backdrop-blur-sm shadow-inner ring-1 ring-white/30">
       <Icon className="h-8 w-8 text-white" strokeWidth={2.5} />
      </div>
      
      <div className="mt-8 z-10 w-full lg:w-[85%]">
       <h3 className="text-3xl font-bold mb-3 text-white">{calc.title}</h3>
       <p className="text-indigo-100/90 text-sm md:text-base leading-relaxed font-medium">{calc.description}</p>
      </div>
     </div>
    </div>
   </Link>
  );
 }

 // Regular & Wide Bento Cards
 return (
  <Link href={calc.href} className={cn("group block", calc.className)}>
   <div className={cn(
    "relative flex h-full rounded-2xl bg-white border border-slate-200 p-6 transition-all duration-300",
    "hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-indigo-100 hover:-translate-y-1 overflow-hidden",
    isWide ? "flex-col lg:flex-row lg:items-center gap-3" : "flex-col gap-3"
   )}>
    {/* Subtle decorative background glow on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className={cn(
     "flex items-center justify-center rounded-[20px] shrink-0 transition-transform duration-500 group-hover:scale-105", 
     calc.iconBgColor,
     isWide ? "h-16 w-16" : "h-14 w-14"
    )}>
     <Icon className={cn("h-7 w-7", calc.iconColor)} strokeWidth={2.5} />
    </div>
    
    <div className="relative z-10 flex-1">
     <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors">
      {calc.title}
     </h3>
     <p className="text-slate-500 text-sm leading-relaxed font-medium">{calc.description}</p>
    </div>

    {isWide && (
     <div className="relative z-10 hidden lg:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:translate-x-1">
      <ArrowRight className="h-5 w-5" />
     </div>
    )}
   </div>
  </Link>
 );
}

export default function CalculatorsOverviewPage() {
 return (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
   {/* Standard Page Header (no icon) */}
   <PageHeader title="Калькулятор расчета себестоимости" description="Выберите тип нанесения для расчёта стоимости" className="mb-8 pt-2 px-1" />

   {/* Main Bento Grid */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
    {calculators.map((calc) => (
     <BentoCard key={calc.id} calc={calc} />
    ))}
   </div>

   {/* Utilities Section mapped as Wide Bento Cards */}
   <div className="mt-8 pt-8 border-t border-slate-100/80">
    <div className="flex items-center justify-between mb-5">
     <h2 className="text-sm font-bold text-slate-400">
      Инструменты и история
     </h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
     {utilities.map((calc) => (
      <BentoCard key={calc.id} calc={calc} />
     ))}
    </div>
   </div>
  </div>
 );
}

