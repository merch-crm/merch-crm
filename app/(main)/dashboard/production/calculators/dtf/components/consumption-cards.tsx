"use client";

import { memo } from "react";
import {
  Droplets,
  Layers,
  Wind,
  FileText,
  Package,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IconType } from "@/components/ui/stat-card";
import type { ConsumptionItem } from "../../types";

interface ConsumptionCardsProps {
  consumption: ConsumptionItem[];
  className?: string;
}

// Иконки для разных типов материалов
const CONSUMPTION_ICONS: Record<string, IconType> = {
  ink_white: Droplets as IconType,
  ink_cmyk: Droplets as IconType,
  powder: Wind as IconType,
  film: Layers as IconType,
  paper: FileText as IconType,
  primer: Package as IconType,
};

// Цвета для разных типов материалов
const CONSUMPTION_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  ink_white: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    icon: "text-slate-600",
  },
  ink_cmyk: {
    bg: "bg-gradient-to-br from-cyan-50 via-yellow-50 to-pink-50",
    text: "text-slate-700",
    icon: "text-purple-500",
  },
  powder: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: "text-amber-500",
  },
  film: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: "text-blue-500",
  },
  paper: {
    bg: "bg-green-50",
    text: "text-green-700",
    icon: "text-green-500",
  },
  primer: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    icon: "text-purple-500",
  },
};

const DEFAULT_COLORS = {
  bg: "bg-slate-50",
  text: "text-slate-700",
  icon: "text-slate-500",
};

export const ConsumptionCards = memo(function ConsumptionCards({
  consumption,
  className,
}: ConsumptionCardsProps) {
  if (consumption.length === 0) return null;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <h3 className="font-bold">Потребуется материалов</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {consumption.map((item) => (
            <ConsumptionCard key={item.key} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

// Отдельная карточка материала
interface ConsumptionCardProps {
  item: ConsumptionItem;
}

const ConsumptionCard = memo(function ConsumptionCard({ item }: ConsumptionCardProps) {
  const Icon = CONSUMPTION_ICONS[item.key] || Package;
  const colors = CONSUMPTION_COLORS[item.key] || DEFAULT_COLORS;

  // Форматирование значения
  const formattedValue = formatConsumptionValue(item.value, item.unit);

  return (
    <div
      className={cn(
        "p-3 rounded-xl border border-slate-100 transition-all hover:shadow-sm",
        colors.bg
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded-lg bg-white/80", colors.icon)}>
          <Icon className="h-4 w-4" />
        </div>
        <span className={cn("text-xs font-bold truncate", colors.text)}>
          {item.name}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-baseline justify-between">
        <span className={cn("text-xl font-bold", colors.text)}>
          {formattedValue}
        </span>
        <span className="text-sm text-muted-foreground">{item.unit}</span>
      </div>

      {/* Stock Status */}
      {item.stockStatus && (
        <div className="mt-2">
          <StockStatusBadge status={item.stockStatus} available={item.stockAvailable} />
        </div>
      )}
    </div>
  );
});

// Бейдж статуса наличия
interface StockStatusBadgeProps {
  status: "ok" | "low" | "none";
  available?: number;
}

function StockStatusBadge({ status, available }: StockStatusBadgeProps) {
  const config: Record<string, { color: "green" | "yellow" | "red", icon: IconType, text: string }> = {
    ok: {
      color: "green",
      icon: Check as IconType,
      text: "В наличии",
    },
    low: {
      color: "yellow",
      icon: AlertTriangle as IconType,
      text: "Мало",
    },
    none: {
      color: "red",
      icon: AlertTriangle as IconType,
      text: "Нет",
    },
  };

  const { color, icon: StatusIcon, text } = config[status];

  // Standard Badge usage
  return (
    <Badge color={color} className="w-full justify-center text-xs gap-1">
      <StatusIcon className="h-3 w-3" />
      {text}
      {available !== undefined && status !== "none" && (
        <span className="ml-1">({available})</span>
      )}
    </Badge>
  );
}

// Форматирование значения в зависимости от единицы измерения
function formatConsumptionValue(value: number, unit: string): string {
  if (unit === "м²") {
    return value.toFixed(4);
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(2) + " к";
  }
  if (value >= 100) {
    return value.toFixed(0);
  }
  return value.toFixed(1);
}
