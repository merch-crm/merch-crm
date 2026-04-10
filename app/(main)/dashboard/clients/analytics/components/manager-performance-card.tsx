"use client";

import { motion } from "framer-motion";
import { User, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import type { ManagerPerformanceData } from "../../actions/analytics.actions";

interface ManagerPerformanceCardProps {
  managers: ManagerPerformanceData[];
  currencySymbol?: string;
  className?: string;
}

export function ManagerPerformanceCard({
  managers,
  currencySymbol = "₽",
  className
}: ManagerPerformanceCardProps) {
  const maxRevenue = Math.max(...managers.map((m) => m.totalRevenue), 1);

  return (
    <div className={cn("space-y-3", className)}>
      {managers.map((manager, index) => (
        <motion.div
          key={manager.managerId || "unassigned"}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              {manager.managerAvatar && (
                <AvatarImage src={manager.managerAvatar} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {manager.managerName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">
                {manager.managerName}
              </p>
              <p className="text-xs text-slate-500">
                Конверсия: {manager.conversionRate}%
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-slate-900">
                {manager.totalRevenue.toLocaleString()} {currencySymbol}
              </p>
              <p className="text-xs text-slate-500">
                Ср. чек: {manager.averageCheck.toLocaleString()} {currencySymbol}
              </p>
            </div>
          </div>

          {/* Revenue progress bar */}
          <Progress value={(manager.totalRevenue / maxRevenue) * 100} className="h-1.5 mb-3" />

          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-1 text-slate-500">
              <Users className="w-3.5 h-3.5" />
              <span>{manager.clientCount} клиентов</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{manager.activeClients} активных</span>
            </div>
            {manager.atRiskClients > 0 && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{manager.atRiskClients} в зоне риска</span>
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {managers.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Нет данных о менеджерах</p>
        </div>
      )}
    </div>
  );
}
