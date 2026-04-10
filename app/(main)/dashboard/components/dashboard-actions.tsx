"use client";

import Link from "next/link";
import { Plus, UserPlus, UploadCloud, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardActions() {
  const primaryAction = {
    name: "Новый заказ",
    icon: Plus,
    color: "bg-primary",
    href: "/dashboard/orders",
  };

  const actions = [
    {
      name: "Добавить клиента",
      icon: UserPlus,
      color: "bg-primary",
      href: "/dashboard/clients",
    },
    {
      name: "Загрузить дизайн",
      icon: UploadCloud,
      color: "bg-violet-500",
      href: "/dashboard/design",
    },
    {
      name: "Склад",
      icon: Package,
      color: "bg-amber-500",
      href: "/dashboard/warehouse",
    },
  ];

  return (
    <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <Link href={primaryAction.href} className="group flex flex-col">
        <div className="crm-card h-full !bg-primary !border-primary flex flex-col items-center justify-center gap-3 text-white !shadow-lg !shadow-primary/20 hover:opacity-90">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 transition-all">
            <Plus className="h-8 w-8 text-white" />
          </div>
          <span className="font-bold text-lg">{primaryAction.name}</span>
        </div>
      </Link>

      {actions.map((action) => (
        <Link key={action.name} href={action.href} className="group">
          <div className="crm-card h-full flex flex-col items-center justify-center gap-3">
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-all", action.color === "bg-primary" ? "bg-primary/10" : action.color.replace('bg-', 'bg-').replace('500', '50'))}>
              <action.icon className={cn("h-7 w-7", action.color === "bg-primary" ? "text-primary" : action.color.replace('bg-', 'text-').replace('500', '600'))} />
            </div>
            <span className="font-bold text-slate-700 group-hover:text-primary transition-colors">{action.name}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
