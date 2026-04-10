'use client';

import { History, Calculator, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HistoryEmptyStateProps {
 /** Есть ли активные фильтры */
 hasFilters: boolean;
 /** Callback для сброса фильтров */
 onResetFilters?: () => void;
}

/**
 * Компонент пустого состояния для истории расчётов
 */
export function HistoryEmptyState({ 
 hasFilters, 
 onResetFilters 
}: HistoryEmptyStateProps) {
 if (hasFilters) {
  return (
   <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="rounded-full bg-muted p-4 mb-4">
     <History className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-medium mb-2">
     Расчёты не найдены
    </h3>
    <p className="text-muted-foreground mb-4 max-w-sm">
     Попробуйте изменить параметры поиска или сбросить фильтры
    </p>
    <Button variant="outline" onClick={onResetFilters}>
     Сбросить фильтры
    </Button>
   </div>
  );
 }

 return (
  <div className="flex flex-col items-center justify-center py-12 text-center">
   <div className="rounded-full bg-muted p-4 mb-4">
    <Calculator className="h-8 w-8 text-muted-foreground" />
   </div>
   <h3 className="text-lg font-medium mb-2">
    История расчётов пуста
   </h3>
   <p className="text-muted-foreground mb-4 max-w-sm">
    Создайте первый расчёт в одном из калькуляторов, и он появится здесь
   </p>
   <Button asChild>
    <Link href="/dashboard/production/calculators">
     <Plus className="h-4 w-4 mr-2" />
     Перейти к калькуляторам
    </Link>
   </Button>
  </div>
 );
}
