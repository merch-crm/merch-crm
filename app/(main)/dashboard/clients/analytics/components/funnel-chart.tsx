"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FunnelAnalyticsData } from "../../actions/analytics.actions";
import {
  UserPlus,
  Phone,
  MessageSquare,
  ShoppingCart,
  Star,
  ArrowRight
} from "lucide-react";

import { IconType } from "@/components/ui/stat-card";

interface FunnelChartProps {
  data: FunnelAnalyticsData[];
  className?: string;
}

const stageIcons: Record<string, IconType> = {
  lead: UserPlus as IconType,
  first_contact: Phone as IconType,
  negotiation: MessageSquare as IconType,
  first_order: ShoppingCart as IconType,
  regular: Star as IconType,
};

export function FunnelChart({ data, className }: FunnelChartProps) {
  const maxCount = Math.max(...(data || []).map((d: FunnelAnalyticsData) => d.count), 1);

  return (
    <div className={cn("space-y-3", className)}>
      {(data || []).map((stage: FunnelAnalyticsData, index: number) => {
        const Icon = (stageIcons[stage.stage] || UserPlus) as IconType;
        const widthPercentage = Math.max((stage.count / maxCount) * 100, 15);

        return (
          <motion.div
            key={stage.stage}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="flex items-center gap-3">
              {/* Stage bar */}
              <div className="flex-1 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-14 rounded-xl flex items-center px-4 gap-3"
                  style={{ backgroundColor: `${stage.color}20` }}
                >
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: stage.color }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {stage.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {stage.count} клиентов • {stage.percentage}%
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Conversion arrow */}
              {index < (data || []).length - 1 && stage.conversionFromPrevious !== null && (
                <div className="flex items-center gap-1 text-slate-400 w-20 flex-shrink-0">
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {data[index + 1].conversionFromPrevious}%
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
