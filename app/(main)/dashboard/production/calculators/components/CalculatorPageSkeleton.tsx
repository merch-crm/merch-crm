// app/(main)/dashboard/production/calculators/components/CalculatorPageSkeleton.tsx

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

/**
 * Skeleton для страницы калькулятора
 */
export function CalculatorPageSkeleton() {
  return (
    <div className="container max-w-6xl py-6 space-y-3">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Левая колонка */}
        <div className="lg:col-span-2 space-y-3">
          {/* Параметры */}
          <Card className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </Card>

          {/* Загрузчик файлов */}
          <Card className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </Card>

          {/* Размещения */}
          <Card className="p-6">
            <Skeleton className="h-6 w-28 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </Card>
        </div>

        {/* Правая колонка - результат */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
