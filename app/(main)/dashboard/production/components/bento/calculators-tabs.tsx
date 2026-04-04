// app/(main)/dashboard/production/components/bento/calculators-tabs.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Layers,
  Droplets,
  Shirt,
  Grid3X3,
  Scissors,
  Stamp,
  Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IconType } from "@/components/ui/stat-card";

interface CalculatorTab {
  id: string;
  label: string;
  href: string;
  icon: IconType;
}

const calculatorTabs: CalculatorTab[] = [
  {
    id: "overview",
    label: "Обзор",
    href: "/dashboard/production/calculators",
    icon: Calculator as IconType,
  },
  {
    id: "dtf",
    label: "DTF",
    href: "/dashboard/production/calculators/dtf",
    icon: Layers as IconType,
  },
  {
    id: "sublimation",
    label: "Сублимация",
    href: "/dashboard/production/calculators/sublimation",
    icon: Droplets as IconType,
  },
  {
    id: "dtg",
    label: "DTG",
    href: "/dashboard/production/calculators/dtg",
    icon: Shirt as IconType,
  },
  {
    id: "silkscreen",
    label: "Шелкография",
    href: "/dashboard/production/calculators/silkscreen",
    icon: Grid3X3 as IconType,
  },
  {
    id: "embroidery",
    label: "Вышивка",
    href: "/dashboard/production/calculators/embroidery",
    icon: Scissors as IconType,
  },
  {
    id: "print-application",
    label: "Нанесение",
    href: "/dashboard/production/calculators/print-application",
    icon: Stamp as IconType,
  },
];

interface CalculatorsTabsProps {
  className?: string;
}

export function CalculatorsTabs({ className }: CalculatorsTabsProps) {
  const pathname = usePathname();

  // Определяем активный таб
  const getActiveTab = () => {
    // Точное совпадение для обзора
    if (pathname === "/dashboard/production/calculators") {
      return "overview";
    }
    // Проверяем остальные табы
    const tab = calculatorTabs.find(
      (t) => t.id !== "overview" && (pathname === t.href || pathname.startsWith(t.href + "/"))
    );
    return tab?.id || "overview";
  };

  const activeTab = getActiveTab();

  return (
    <div className={cn("w-full", className)}>
      <div className="crm-filter-tray">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {calculatorTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-xs font-bold whitespace-nowrap transition-colors",
                  isActive
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="calculators-tab-indicator"
                    className="absolute inset-0 bg-primary rounded-[14px] shadow-lg shadow-primary/25"
                    transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
