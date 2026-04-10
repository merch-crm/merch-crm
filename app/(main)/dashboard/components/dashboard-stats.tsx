"use client";

import { ModernStatCard } from "@/components/ui/stat-card";
import { Users, ShoppingBag } from "lucide-react";
import { Rouble } from "@/components/ui/icons";

interface DashboardStats {
  totalClients: number;
  newClients: number;
  totalOrders: number;
  inProduction: number;
  revenue: string;
  averageCheck: string;
  rawRevenue: number;
}

interface DashboardStatsProps {
  statsData: DashboardStats;
  currencySymbol: string;
}

export function DashboardStats({ statsData, currencySymbol }: DashboardStatsProps) {
  return (
    <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-3">
      <ModernStatCard icon={Users} value={statsData?.totalClients ?? 0} label="Всего клиентов" badge={{ text: "+12%", variant: "success" }} />

      <ModernStatCard icon={ShoppingBag} value={statsData?.totalOrders ?? 0} label="Заказов в работе" badge={{ text: `${statsData?.inProduction ?? 0} в работе`, variant: "primary" }} />

      <ModernStatCard icon={Rouble} value={statsData?.averageCheck?.replace(new RegExp(`[\\s\\u00A0]*${(currencySymbol || "₽").replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\u00A0]*`, 'g'), '') || '0'} suffix={currencySymbol} label="Средний чек" badge={{ text: "-2.4%", variant: "error" }} colorScheme="rose" />
    </div>
  );
}
