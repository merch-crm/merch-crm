/**
 * @fileoverview Компонент сводки стоимости расходников
 * @module calculators/components/ConsumablesCostSummary
 * @audit Создан 2026-03-26
 */

'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Package, ChevronDown, Info } from 'lucide-react';
import { ConsumablesConfig } from '@/lib/types/calculators';
import { formatCurrency } from '@/lib/utils/format';

/**
 * Пропсы компонента
 */
interface ConsumablesCostSummaryProps {
  /** Конфигурация расходников */
  config: ConsumablesConfig;
  /** Данные для расчёта (площадь, стежки, тираж и т.д.) */
  stats: {
    areaM2: number;
    stitchCount: number;
    quantity: number;
    colorCount?: number;
  };
  /** Показывать детали */
  showDetails?: boolean;
}

export function ConsumablesCostSummary({
  config,
  stats,
  showDetails = true,
}: ConsumablesCostSummaryProps) {
  /**
   * Расчёт стоимости каждого расходника
   */
  const itemCosts = useMemo(() => {
    return (config?.items || []).map((item) => {
      let consumption = 0;
      const unit = (item.consumptionUnit || '').toLowerCase();

      // Динамическое определение типа расхода на основе единицы измерения или ID
      if (unit === '1000 ст.') {
        consumption = (item.consumptionPerUnit * stats.stitchCount) / 1000;
      } else if (unit === 'стежок' || unit === 'ст.') {
        consumption = item.consumptionPerUnit * stats.stitchCount;
      } else if (unit === 'м²' || unit === 'm2') {
        // Краска в шелкографии зависит от количества цветов
        const colorMultiplier = (item.id.includes('ink') || item.id.includes('plastisol')) 
          ? (stats.colorCount || 1) 
          : 1;
        consumption = item.consumptionPerUnit * stats.areaM2 * colorMultiplier;
      } else if (unit === 'рамка' || unit === 'кадр' || item.id.includes('mesh')) {
        consumption = stats.colorCount || 1;
      } else if (unit === 'шт' || unit === 'изделие' || unit === 'принт') {
        consumption = item.consumptionPerUnit * stats.quantity;
      } else {
        // Фолбек на площадь, если не указано иное
        consumption = item.consumptionPerUnit * stats.areaM2;
      }

      const cost = consumption * item.pricePerUnit;

      return {
        id: item.id,
        name: item.name,
        consumption: Math.round(consumption * 100) / 100,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
        cost: Math.round(cost * 100) / 100,
      };
    });
  }, [config.items, stats]);

  /**
   * Общая стоимость
   */
  const totalCost = useMemo(() => {
    return itemCosts.reduce((sum, item) => sum + item.cost, 0);
  }, [itemCosts]);

  return (
    <Card className="">
      <Collapsible defaultOpen={showDetails}>
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm text-xl">
                <Package className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Расходники</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white border-slate-200 text-slate-900 font-bold px-3 py-1 text-sm shadow-sm">
                {String(formatCurrency(totalCost))}
              </Badge>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </div>

        <CollapsibleContent>
          <CardContent className="p-6">
            <div className="space-y-2">
              {(itemCosts || []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span>{String(item.name)}</span>
                    <Tooltip
                      content={
                        <span>
                          {String(item.consumption)} {String(item.unit)} × {String(formatCurrency(item.pricePerUnit))}/{String(item.unit)}
                        </span>
                      }
                    >
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </Tooltip>
                  </div>
                  <span className="font-medium">{String(formatCurrency(item.cost))}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default ConsumablesCostSummary;
