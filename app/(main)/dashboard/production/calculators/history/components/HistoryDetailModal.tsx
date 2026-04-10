/**
 * @fileoverview Модальное окно деталей расчёта
 * @module app/(main)/dashboard/production/calculators/history/components/HistoryDetailModal
 * @audit Создан 2026-03-26
 */

'use client';

import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription,
 DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
 CalculationHistoryItem, 
 CALCULATOR_TYPES_CONFIG 
} from '@/lib/types/calculators';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { 
 FileText, 
 Layers, 
 ChevronRight, 
 Calculator,
} from 'lucide-react';

interface HistoryDetailModalProps {
 item: CalculationHistoryItem | null;
 isOpen: boolean;
 onClose: () => void;
 onDuplicate: (id: string) => void;
}

import { usePDFGenerator } from '@/app/(main)/dashboard/production/calculators/hooks/use-pdf-generator';
import { mapHistoryToPDFData } from '@/lib/utils/pdf-mapping';
import { Download, Loader2 } from 'lucide-react';

/**
 * Детальный просмотр расчёта
 */
export function HistoryDetailModal({
 item,
 isOpen,
 onClose,
 onDuplicate,
}: HistoryDetailModalProps) {
 const { isGenerating, generateAndDownload } = usePDFGenerator();

 if (!item) return null;

 const config = CALCULATOR_TYPES_CONFIG[item.calculatorType];
 const params = item.parameters;

 return (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
   <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl border-2">
    <DialogHeader className="p-6 pb-4 border-b bg-muted/10">
     <div className="flex items-center justify-between gap-3 mb-2">
      <Badge color="primary" variant="outline" className={cn(`bg-${config.color}-50 text-${config.color}-700 border-${config.color}-200`)}>
       {config.label}
      </Badge>
      <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
        {item.calculationNumber}
      </span>
     </div>
     <DialogTitle className="text-2xl font-bold flex items-center gap-2">
      {item.name}
     </DialogTitle>
     <DialogDescription suppressHydrationWarning className="flex items-center gap-2">
      {item.clientName && <span>Клиент: {item.clientName}</span>}
     </DialogDescription>
    </DialogHeader>

    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
     {/* Левая панель: Краткая статистика */}
     <div className="w-full md:w-80 bg-muted/20 border-r p-6 space-y-3">
      <div className="space-y-3">
       <h4 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
        <Calculator className="w-3 h-3" />
        Итоговые данные
       </h4>
       
       <div className="grid grid-cols-1 gap-3">
        <StatItem label="Цена продажи" value={formatCurrency(item.sellingPrice)} primary />
        <StatItem label="Себестоимость" value={formatCurrency(item.totalCost)} />
        <StatItem label="Количество" value={`${item.quantity} шт.`} />
        <StatItem label="Цена за ед." value={formatCurrency(item.pricePerItem)} />
        <StatItem label="Процент маржи" value={`${item.marginPercent}%`} success />
       </div>
      </div>

      <div className="space-y-3">
       <h4 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
        <FileText className="w-3 h-3" />
        Комментарий
       </h4>
       <p suppressHydrationWarning className="text-sm text-balance italic">
        {item.comment || 'Без комментария'}
       </p>
      </div>
     </div>

     {/* Основная панель: Табы с деталями */}
     <div className="flex-1 flex flex-col overflow-hidden">
      <Tabs defaultValue="breakdown" className="flex-1 flex flex-col">
       <div className="px-6 border-b bg-background">
        <TabsList className="h-12 w-full justify-start bg-transparent p-0 gap-3">
         <TabsTrigger value="breakdown" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0">
          Себестоимость
         </TabsTrigger>
         <TabsTrigger value="consumables" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0">
          Расходники
         </TabsTrigger>
         {params.layoutSettings && (
          <TabsTrigger value="layout" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0">
           Раскладка
          </TabsTrigger>
         )}
        </TabsList>
       </div>

       <ScrollArea className="flex-1 p-6">
        <TabsContent value="breakdown" className="m-0 space-y-3">
          <div className="grid grid-cols-1 gap-3">
           {Object.entries(params.costBreakdown).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
             <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
               <Layers className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium capitalize">
               {getBreakdownLabel(key)}
              </span>
             </div>
             <span className="font-bold">{formatCurrency(value as number)}</span>
            </div>
           ))}
          </div>
        </TabsContent>

        <TabsContent value="consumables" className="m-0 space-y-3">
          {params.consumables?.items?.map((c, idx: number) => (
           <div key={idx} className="flex items-center justify-between p-3 border-b last:border-0">
            <div className="flex flex-col">
             <span className="text-sm font-medium">{c.name}</span>
             <span className="text-xs text-muted-foreground">
              Расход: {c.consumptionPerUnit} {c.consumptionUnit}
             </span>
            </div>
            <span className="text-sm font-semibold">{formatCurrency(c.pricePerUnit)}</span>
           </div>
          ))}
        </TabsContent>

        <TabsContent value="layout" className="m-0 space-y-3">
          {params.layoutSettings && (
           <div className="grid grid-cols-2 gap-3">
            <LayoutItem label="Ширина рулона" value={`${params.layoutSettings.rollWidthMm} мм`} />
            <LayoutItem label="Отступы" value={`${params.layoutSettings.edgeMarginMm} мм`} />
            <LayoutItem label="Зазор" value={`${params.layoutSettings.gapMm} мм`} />
            {item.rollVisualization && (
             <div className="col-span-2 p-4 rounded-xl border bg-primary/5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-bold">Эффективность</p>
                <p className="text-2xl font-black text-primary">{item.rollVisualization.efficiencyPercent}%</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-muted-foreground font-bold">Длина рулона</p>
                <p className="text-2xl font-black">{item.rollVisualization.totalLengthM.toFixed(2)} м</p>
              </div>
             </div>
            )}
           </div>
          )}
        </TabsContent>
       </ScrollArea>
      </Tabs>
     </div>
    </div>

    <DialogFooter className="p-4 border-t bg-muted/5 gap-2 flex-col sm:flex-row">
     <div className="flex-1 flex gap-2">
      <Button variant="outline" color="neutral" onClick={() => item && generateAndDownload(mapHistoryToPDFData(item))}
       disabled={isGenerating}
       className="rounded-lg"
      >
       {isGenerating ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
       ) : (
        <Download className="w-4 h-4 mr-2" />
       )}
       PDF
      </Button>
     </div>
     <div className="flex gap-2">
      <Button variant="outline" color="neutral" onClick={onClose} className="rounded-lg">
       Закрыть
      </Button>
      <Button onClick={() => onDuplicate(item.id)} className="rounded-lg bg-primary hover:bg-primary/90">
       <ChevronRight className="w-4 h-4 mr-1" />
       Загрузить в калькулятор
      </Button>
     </div>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 );
}

function StatItem({ label, value, primary, success }: { label: string, value: string, primary?: boolean, success?: boolean }) {
 return (
  <div className="space-y-1">
   <p className="text-xs font-bold text-muted-foreground">{label}</p>
   <p className={cn(
    "text-xl font-black ",
    primary && "text-primary",
    success && "text-emerald-600"
   )}>
    {value}
   </p>
  </div>
 );
}

function LayoutItem({ label, value }: { label: string, value: string }) {
 return (
  <div className="p-3 bg-muted/10 rounded-lg border border-dashed text-center">
   <p className="text-xs font-bold text-muted-foreground mb-1">{label}</p>
   <p className="font-bold">{value}</p>
  </div>
 );
}

/**
 * Локализация ключей детализации
 */
function getBreakdownLabel(key: string): string {
 const map: Record<string, string> = {
  print: 'Печать',
  materials: 'Материалы',
  placements: 'Нанесения',
  programCost: 'Программа',
  framesCost: 'Рамки/Сетки',
  total: 'Итого себест.',
 };
 return map[key] || key;
}
