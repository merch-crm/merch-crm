"use client";

import { memo } from "react";
import { Copy, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import type { CalculationResult } from "../../types";

interface CostSummaryProps {
  result: CalculationResult;
  onCopy?: () => void;
  className?: string;
}

export const CostSummary = memo(function CostSummary({
  result,
  onCopy,
  className,
}: CostSummaryProps) {
  const hasPriceRange = result.minCostPerPrint !== result.maxCostPerPrint;

  return (
    <Card className={cn( "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20", className )}>
      <CardContent className="p-4">
        {/* Main Result */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Итоговая себестоимость
            </p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(result.totalCost)}
              </span>
              {onCopy && (
                <Button variant="ghost" color="gray" size="sm" onClick={onCopy} className="text-muted-foreground hover:text-primary">
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className="px-3 py-1.5 text-sm" color="gray">
              {result.totalLengthM.toFixed(2)} м
            </Badge>
            <Badge variant={result.efficiencyPercent >= 75 ? "solid" : "outline"} color={result.efficiencyPercent >= 75 ? "green" : "yellow"}
              className="px-3 py-1.5 text-sm"
            >
              КПД {result.efficiencyPercent.toFixed(1)}%
            </Badge>
            <Badge variant="solid" color="purple" className="rounded-xl px-4 py-2 text-sm font-bold shadow-sm shadow-blue-100/50">
              {result.totalPrints} принтов
            </Badge>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="mt-4 pt-4 border-t border-primary/10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <CostItem label="Цена за метр" value={formatCurrency(result.pricePerMeter)} />
            <CostItem label="Печать" value={formatCurrency(result.printCost)} percentage={getPercentage(result.printCost, result.totalCost)} />
            <CostItem label="Нанесение" value={formatCurrency(result.placementCost)} percentage={getPercentage(result.placementCost, result.totalCost)} />
            <CostItem label="Материалы" value={formatCurrency(result.materialsCost)} percentage={getPercentage(result.materialsCost, result.totalCost)} />
            {result.blanksCost !== undefined && result.blanksCost > 0 && (
              <CostItem label="Заготовки" value={formatCurrency(result.blanksCost)} percentage={getPercentage(result.blanksCost, result.totalCost)} />
            )}
            <CostItem label="Средняя за шт" value={formatCurrency(result.avgCostPerPrint)} highlight />
          </div>
        </div>

        {/* Price Range */}
        {hasPriceRange && (
          <div className="mt-3 p-3 rounded-xl bg-white/50 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Диапазон стоимости за принт
              </p>
              <p className="text-sm font-bold">
                от {formatCurrency(result.minCostPerPrint)} до{" "}
                {formatCurrency(result.maxCostPerPrint)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-green-500" />
              <span>мин</span>
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span>макс</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Вспомогательный компонент для элемента стоимости
interface CostItemProps {
  label: string;
  value: string;
  percentage?: number;
  highlight?: boolean;
}

function CostItem({ label, value, percentage, highlight }: CostItemProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("font-bold", highlight && "text-primary")}>{value}</p>
      {percentage !== undefined && percentage > 0 && (
        <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
      )}
    </div>
  );
}

function getPercentage(value: number, total: number): number {
  if (total <= 0) return 0;
  return (value / total) * 100;
}
