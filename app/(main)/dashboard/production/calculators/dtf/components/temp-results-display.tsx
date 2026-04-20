"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import type { CalculationResult } from "../../types";

interface TempResultsDisplayProps {
  result: CalculationResult;
}

export const TempResultsDisplay = memo(function TempResultsDisplay({
  result,
}: TempResultsDisplayProps) {
  return (
    <>
      {/* Summary */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Итоговая себестоимость
              </p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(result.totalCost)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="px-3 py-1.5" color="gray">
                {result.totalLengthM.toFixed(2)} м
              </Badge>
              <Badge className="px-3 py-1.5" color="gray">
                КПД {result.efficiencyPercent.toFixed(1)}%
              </Badge>
              <Badge className="px-3 py-1.5" color="gray">
                {result.totalPrints} принтов
              </Badge>
            </div>
          </div>

          {/* Breakdown */}
          <div className="mt-4 pt-4 border-t border-primary/10">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Цена/метр</p>
                <p className="font-bold">{formatCurrency(result.pricePerMeter)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Печать</p>
                <p className="font-bold">{formatCurrency(result.printCost)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Нанесение</p>
                <p className="font-bold">{formatCurrency(result.placementCost)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Материалы</p>
                <p className="font-bold">{formatCurrency(result.materialsCost)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Средняя/шт</p>
                <p className="font-bold">{formatCurrency(result.avgCostPerPrint)}</p>
              </div>
            </div>
          </div>

          {/* Price Range */}
          {result.minCostPerPrint !== result.maxCostPerPrint && (
            <div className="mt-3 p-3 rounded-xl bg-white/50">
              <p className="text-xs text-muted-foreground mb-1">
                Диапазон стоимости за принт
              </p>
              <p className="text-sm font-bold">
                от {formatCurrency(result.minCostPerPrint)} до{" "}
                {formatCurrency(result.maxCostPerPrint)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="font-bold">Себестоимость по принтам</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {result.sections.map((section) => (
              <div
                key={section.groupId}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-md shrink-0"
                    style={{ backgroundColor: section.color }}
                  />
                  <div>
                    <p className="font-bold text-sm">{section.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {section.widthMm}×{section.heightMm} мм •{" "}
                      {section.quantity} шт •{" "}
                      {section.printsPerRow} в ряд × {section.rowsCount} рядов
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">
                    {formatCurrency(section.costPerPrint)} / шт
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Всего: {formatCurrency(section.sectionCost)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consumption */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="font-bold">Потребуется материалов</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {result.consumption.map((item) => (
              <div
                key={item.key}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <p className="text-xs text-muted-foreground mb-1">
                  {item.name}
                </p>
                <p className="text-lg font-bold">
                  {item.value.toFixed(item.unit === "м²" ? 4 : 1)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {item.unit}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
});
