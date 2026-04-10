import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { SilkscreenCalculationResult } from '../../silkscreen-types';

interface SilkscreenSummaryProps {
  result: SilkscreenCalculationResult | null;
}

export function SilkscreenSummary({ result }: SilkscreenSummaryProps) {
  if (!result) return null;

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          Итоговый расчет
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-muted-foreground font-title">Общий тираж</p>
            <p className="text-2xl font-bold font-title">{result.quantity} шт.</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-title">На 1 изделие</p>
            <p className="text-2xl font-bold text-primary font-title">
              {formatCurrency(result.costPerItem)}
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Изделия</span>
            <span>{formatCurrency(result.garmentCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Печатные формы (сетки)</span>
            <span>{formatCurrency(result.totalScreensCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Подготовка (приладка)</span>
            <span>{formatCurrency(result.totalSetupCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Печать (базовая)</span>
            <span>{formatCurrency(result.printCostBeforeDiscount)}</span>
          </div>

          {result.discountPercent > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span className="flex items-center gap-1">
                Скидка за тираж
                <Badge color="primary" variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs h-4">
                  -{result.discountPercent}%
                </Badge>
              </span>
              <span>-{formatCurrency(result.quantityDiscount)}</span>
            </div>
          )}

          <Separator className="my-2" />

          <div className="flex justify-between font-bold text-lg pt-2">
            <span>Общая сумма</span>
            <span className="text-primary">{formatCurrency(result.totalCost)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
