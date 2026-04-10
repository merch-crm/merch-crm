/**
 * @fileoverview Карточка записи в истории расчётов
 * @module app/(main)/dashboard/production/calculators/history/components/HistoryCard
 * @audit Создан 2026-03-26
 */

'use client';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
 MoreVertical, 
 ExternalLink, 
 Copy, 
 Trash2, 
 User, 
 Calendar, 
 Hash,
 Eye,
 FileDown
} from 'lucide-react';
import { 
 Card, 
 CardContent, 
 CardFooter, 
 CardHeader 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
 DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
 CalculationHistoryItem, 
 CALCULATOR_TYPES_CONFIG 
} from '@/lib/types/calculators';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { generateAndDownloadPDF, mapHistoryItemToPDFData } from '@/lib/services/pdf/utils';

interface HistoryCardProps {
 item: CalculationHistoryItem;
 onView: (item: CalculationHistoryItem) => void;
 onDuplicate: (id: string) => void;
 onDelete: (id: string) => void;
 isSelected?: boolean;
 onSelect?: (id: string) => void;
}

/**
 * Карточка расчёта в списке истории
 */
export function HistoryCard({
 item,
 onView,
 onDuplicate,
 onDelete,
 isSelected,
 onSelect,
}: HistoryCardProps) {
 const config = CALCULATOR_TYPES_CONFIG[item.calculatorType];
 
 return (
  <Card className={cn( "group relative flex flex-col transition-all", isSelected && "ring-2 ring-primary border-primary" )}>
   {/* Чекбокс выбора (опционально) */}
   {onSelect && (
    <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
      <input 
      type="checkbox" 
      checked={isSelected}
      onChange={() => onSelect(item.id)}
      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
      />
    </div>
   )}

   <CardHeader className="p-4 pb-2 space-y-2">
    <div className="flex items-start justify-between">
     <Badge color="primary" variant="outline" className={cn("capitalize", `bg-${config.color}-50 text-${config.color}-700 border-${config.color}-200`)}>
      {config.label}
     </Badge>
     <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
      <Hash className="w-3 h-3" />
      {item.calculationNumber}
     </div>
    </div>
    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors cursor-pointer" onClick={() => onView(item)}>
     {item.name}
    </h3>
    {item.clientName && (
     <p suppressHydrationWarning className="text-sm text-muted-foreground line-clamp-1 italic">
      Клиент: {item.clientName}
     </p>
    )}
   </CardHeader>

   <CardContent className="p-4 pt-0 flex-1 flex flex-col gap-3">
    <div className="grid grid-cols-2 gap-2 text-sm">
     <div className="flex flex-col p-2 bg-muted/50 rounded-lg border border-border/50">
      <span className="text-xs text-muted-foreground font-bold">Цена продажи</span>
      <span className="font-bold text-primary">{formatCurrency(item.sellingPrice)}</span>
     </div>
     <div className="flex flex-col p-2 bg-muted/50 rounded-lg border border-border/50">
      <span className="text-xs text-muted-foreground font-bold">Количество</span>
      <span className="font-bold">{item.quantity} шт.</span>
     </div>
     <div className="flex flex-col p-2 bg-muted/50 rounded-lg border border-border/50">
      <span className="text-xs text-muted-foreground font-bold">Себестоимость</span>
      <span className="font-medium text-muted-foreground">{formatCurrency(item.totalCost)}</span>
     </div>
     <div className="flex flex-col p-2 bg-muted/50 rounded-lg border border-border/50">
      <span className="text-xs text-muted-foreground font-bold">Маржа</span>
      <span className="font-medium text-emerald-600">+{item.marginPercent}%</span>
     </div>
    </div>
   </CardContent>

   <CardFooter className="p-4 pt-0 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
    <div className="flex items-center gap-3">
     <div className="flex items-center gap-1">
      <Calendar className="w-3 h-3" />
      {format(new Date(item.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
     </div>
     <div className="flex items-center gap-1">
      <User className="w-3 h-3" />
      {item.createdByName || 'Система'}
     </div>
    </div>

    <div className="flex items-center gap-1">
     <Button variant="ghost" color="neutral" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onView(item)}>
      <Eye className="h-4 w-4" />
     </Button>

     <DropdownMenu>
      <DropdownMenuTrigger asChild>
       <Button variant="ghost" color="neutral" size="icon" className="h-8 w-8">
        <MoreVertical className="h-4 w-4" />
       </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
       <DropdownMenuItem onClick={() => onView(item)}>
        <ExternalLink className="mr-2 h-4 w-4" />
        Открыть детали
       </DropdownMenuItem>
       <DropdownMenuItem onClick={() => onDuplicate(item.id)}>
        <Copy className="mr-2 h-4 w-4" />
        Дублировать
       </DropdownMenuItem>
       <DropdownMenuSeparator />
       <DropdownMenuItem onClick={() => {
        const pdfData = mapHistoryItemToPDFData(item);
        generateAndDownloadPDF(pdfData, { documentType: 'calculation' });
       }}>
        <FileDown className="mr-2 h-4 w-4" />
        Скачать PDF
       </DropdownMenuItem>
       <DropdownMenuSeparator />
       <DropdownMenuItem onClick={() => onDelete(item.id)}
        className="text-destructive focus:text-destructive"
       >
        <Trash2 className="mr-2 h-4 w-4" />
        Удалить в корзину
       </DropdownMenuItem>
      </DropdownMenuContent>
     </DropdownMenu>
    </div>
   </CardFooter>
  </Card>
 );
}
