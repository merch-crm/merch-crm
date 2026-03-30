// app/(main)/dashboard/production/components/bento/calculators-grid.tsx
"use client";


import Link from "next/link";
import { 
  Layers, 
  Droplets, 
  Shirt, 
  Grid3X3, 
  Scissors, 
  Stamp,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IconType } from "@/components/ui/stat-card";

interface CalculatorMiniItem {
  id: string;
  name: string;
  shortName: string;
  href: string;
  icon: IconType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const calculators: CalculatorMiniItem[] = [
  {
    id: "dtf",
    name: "DTF-печать",
    shortName: "DTF",
    href: "/dashboard/production/calculators/dtf",
    icon: Layers as IconType,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
  },
  {
    id: "sublimation",
    name: "Сублимация",
    shortName: "Субл.",
    href: "/dashboard/production/calculators/sublimation",
    icon: Droplets as IconType,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-100",
  },
  {
    id: "dtg",
    name: "DTG-печать",
    shortName: "DTG",
    href: "/dashboard/production/calculators/dtg",
    icon: Shirt as IconType,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-100",
  },
  {
    id: "silkscreen",
    name: "Шелкография",
    shortName: "Шелк.",
    href: "/dashboard/production/calculators/silkscreen",
    icon: Grid3X3 as IconType,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
  },
  {
    id: "embroidery",
    name: "Вышивка",
    shortName: "Выш.",
    href: "/dashboard/production/calculators/embroidery",
    icon: Scissors as IconType,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-100",
  },
  {
    id: "print-application",
    name: "Нанесение",
    shortName: "Нан.",
    href: "/dashboard/production/calculators/print-application",
    icon: Stamp as IconType,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    borderColor: "border-slate-200",
  },
];

interface CalculatorsGridProps {
  className?: string;
}

export function CalculatorsGrid({ className }: CalculatorsGridProps) {
  return (
    <div className={cn("crm-card", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-700">Калькуляторы</h3>
        <Link 
          href="/dashboard/production/calculators"
          className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          <span>Все</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {calculators.map((calc) => (
          <CalculatorMiniCard key={calc.id} calculator={calc} />
        ))}
      </div>
    </div>
  );
}

interface CalculatorMiniCardProps {
  calculator: CalculatorMiniItem;
}

function CalculatorMiniCard({ calculator }: CalculatorMiniCardProps) {
  const Icon = calculator.icon;

  return (
    <Link
      href={calculator.href}
      className={cn(
        "group flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5",
        calculator.bgColor,
        calculator.borderColor
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform",
        "bg-white/80 shadow-sm border",
        calculator.borderColor,
        calculator.color,
        "group-hover:scale-110"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <span className={cn(
        "text-xs font-bold text-center truncate w-full",
        calculator.color
      )}>
        <span className="hidden sm:inline">{calculator.name}</span>
        <span className="sm:hidden">{calculator.shortName}</span>
      </span>
    </Link>
  );
}
