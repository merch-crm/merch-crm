/**
 * @fileoverview Клиентская часть страницы истории расчётов
 * @module app/(main)/dashboard/production/calculators/history/history-page-client
 * @audit Создан 2026-03-26
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
 Search, 
 Trash2, 
 RefreshCw, 
 ChevronLeft, 
 ChevronRight,
 Eraser,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
 Select,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
 HistoryPaginatedResult, 
 HistoryFilters, 
 CalculationHistoryItem,
 CALCULATOR_TYPES_CONFIG,
 CalculatorType 
} from '@/lib/types/calculators';
import { HistoryCard } from './components/HistoryCard';
import { HistoryDetailModal } from './components/HistoryDetailModal';
import { HistoryEmptyState } from './components/HistoryEmptyState';
import { useCalculationHistory } from '../hooks/use-calculation-history';
import { cn } from '@/lib/utils';
import { 
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HistoryPageClientProps {
 initialData: HistoryPaginatedResult | null;
 initialFilters: HistoryFilters;
}

/**
 * Клиентский компонент страницы истории
 */
export function HistoryPageClient({ 
 initialData, 
 initialFilters 
}: HistoryPageClientProps) {
 const router = useRouter();
 const searchParams = useSearchParams();
 const [isPending, startTransition] = useTransition();
 const { remove, bulkRemove, clear, duplicate, isLoading: isActionLoading } = useCalculationHistory();

 // Состояние UI
 const [selectedIds, setSelectedIds] = useState<string[]>([]);
 const [viewedItem, setViewedItem] = useState<CalculationHistoryItem | null>(null);
 const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
 const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false);

 // Обработчики фильтров
 const updateFilters = (newFilters: Partial<HistoryFilters>) => {
  const params = new URLSearchParams(searchParams.toString());
  
  Object.entries(newFilters).forEach(([key, value]) => {
   if (value === undefined || value === null || value === '' || value === 'all') {
    params.delete(key);
   } else {
    params.set(key, String(value));
   }
  });

  // Сброс страницы при изменении фильтров
  if (!newFilters.page) {
   params.set('page', '1');
  }

  startTransition(() => {
   router.push(`?${params.toString()}`);
  });
 };

 const handleSearch = (value: string) => {
  updateFilters({ search: value });
 };

 const handleTypeChange = (value: string) => {
  updateFilters({ calculatorType: value as CalculatorType | 'all' });
 };

 const handleSortChange = (value: string) => {
  const [sortBy, sortOrder] = value.split('-');
  updateFilters({ 
   sortBy: sortBy as HistoryFilters['sortBy'], 
   sortOrder: sortOrder as HistoryFilters['sortOrder'] 
  });
 };

 const handlePageChange = (newPage: number) => {
  updateFilters({ page: newPage });
 };

 // Выбор элементов
 const toggleSelect = (id: string) => {
  setSelectedIds(prev => 
   prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );
 };

 const selectAll = () => {
  if (!initialData) return;
  if (selectedIds.length === (initialData?.items?.length ?? 0)) {
   setSelectedIds([]);
  } else {
   setSelectedIds((initialData?.items || []).map(i => i.id));
  }
 };

 if (!initialData || (initialData?.items || []).length === 0) {
  return <HistoryEmptyState hasFilters={!!initialFilters.search} onResetFilters={() => updateFilters({ search: '', calculatorType: 'all' })} />;
 }

 return (
  <div className="space-y-3">
   {/* Панель инструментов: Фильтры и Поиск */}
   <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between bg-muted/30 p-4 rounded-2xl border">
    <div className="relative w-full lg:max-w-md">
     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
     <Input placeholder="Поиск по названию, номеру или клиенту..." className="pl-10 h-11 bg-background border-2 rounded-xl" defaultValue={initialFilters.search} onChange={(e) => handleSearch(e.target.value)}
     />
    </div>

    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
     <Select value={initialFilters.calculatorType || 'all'} onChange={handleTypeChange} options={[ { id: 'all', title: 'Все типы' }, ...Object.values(CALCULATOR_TYPES_CONFIG).map((type) => ({
        id: type.type,
        title: type.label
       }))
      ]}
      className="w-[160px]"
      triggerClassName="h-11 border-2 rounded-xl bg-background font-semibold"
     />

     <Select value={`${initialFilters.sortBy}-${initialFilters.sortOrder}`} onChange={handleSortChange} options={[ { id: 'createdAt-desc', title: 'Новые сначала' }, { id: 'createdAt-asc', title: 'Старые сначала' }, { id: 'sellingPrice-desc', title: 'Дорогие сначала' }, { id: 'sellingPrice-asc', title: 'Дешевые сначала' }, { id: 'totalCost-desc', title: 'По себестоимости ↓' }, { id: 'name-asc', title: 'По названию (А-Я)' }, ]} className="w-[200px]" triggerClassName="h-11 border-2 rounded-xl bg-background font-semibold" />

     <Button variant="outline" color="gray" size="icon" className="h-11 w-11 border-2 rounded-xl bg-background" onClick={() => router.refresh()}
     >
      <RefreshCw className={cn("w-4 h-4", isPending && "animate-spin")} />
     </Button>

     {selectedIds.length > 0 ? (
      <Button variant="solid" color="red" className="h-11 px-4 rounded-xl font-bold animate-in fade-in slide-in-from-right-2" onClick={() => setIsDeleteDialogOpen(true)}
      >
       <Trash2 className="w-4 h-4 mr-2" />
       Удалить ({selectedIds.length})
      </Button>
     ) : (
       <Button variant="outline" color="gray" className="h-11 px-4 rounded-xl text-muted-foreground hover:text-destructive hover:border-destructive border-2" onClick={() => setIsClearAllDialogOpen(true)}
      >
       <Eraser className="w-4 h-4 mr-2" />
       Очистить историю
      </Button>
     )}
    </div>
   </div>

   {/* Массовый выбор */}
   <div className="flex items-center gap-2 px-2">
    <Button variant="ghost" color="gray" size="sm" className="h-8 text-xs text-muted-foreground" onClick={selectAll}>
     <span suppressHydrationWarning>{selectedIds.length === (initialData?.items?.length ?? 0) ? 'Снять выделение' : 'Выбрать все на странице'}</span>
    </Button>
    <span className="text-xs text-muted-foreground">|</span>
    <span className="text-xs text-muted-foreground">
     Всего записей: <strong>{initialData?.pagination?.totalCount ?? 0}</strong>
    </span>
   </div>

   {/* Сетка карточек */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
    {initialData?.items?.map((item) => (
     <HistoryCard key={item.id} item={item} onView={setViewedItem} onDuplicate={duplicate} onDelete={remove} isSelected={selectedIds.includes(item.id)} onSelect={toggleSelect} />
    ))}
   </div>

   {/* Пагинация */}
   {(initialData?.pagination?.totalPages ?? 0) > 1 && (
    <div className="flex items-center justify-center gap-3 py-8">
      <Button variant="outline" color="gray" className="rounded-xl border-2" disabled={!initialData?.pagination?.hasPrevPage || isPending} onClick={() => handlePageChange((initialData?.pagination?.page ?? 1) - 1)}
     >
      <ChevronLeft className="w-4 h-4 mr-2" />
      Назад
     </Button>
     
     <div className="flex items-center gap-2">
       <span className="text-sm font-medium">Страница</span>
       <Badge className="px-3 h-8 text-sm rounded-lg border-2" color="gray">
        {initialData?.pagination?.page ?? 1} / {initialData?.pagination?.totalPages ?? 1}
       </Badge>
     </div>

     <Button variant="outline" color="gray" className="rounded-xl border-2" disabled={!initialData?.pagination?.hasNextPage || isPending} onClick={() => handlePageChange((initialData?.pagination?.page ?? 1) + 1)}
     >
      Вперед
      <ChevronRight className="w-4 h-4 ml-2" />
     </Button>
    </div>
   )}

   {/* Модалки и Диалоги */}
   <HistoryDetailModal item={viewedItem} isOpen={!!viewedItem} onClose={() => setViewedItem(null)}
    onDuplicate={duplicate}
   />

   {/* Удаление выбранных */}
   <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
    <AlertDialogContent className="rounded-2xl border-2">
     <AlertDialogHeader>
      <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
      <AlertDialogDescription>
       Это действие переместит {selectedIds.length} расчётов в корзину. Вы сможете восстановить их позже из раздела корзины.
      </AlertDialogDescription>
     </AlertDialogHeader>
     <AlertDialogFooter>
      <AlertDialogCancel className="rounded-xl">Отмена</AlertDialogCancel>
      <AlertDialogAction onClick={() => {
        bulkRemove(selectedIds);
        setSelectedIds([]);
       }}
       className="bg-destructive hover:bg-destructive/90 rounded-xl"
      >
       Удалить
      </AlertDialogAction>
     </AlertDialogFooter>
    </AlertDialogContent>
   </AlertDialog>

   {/* Очистка всей истории */}
   <AlertDialog open={isClearAllDialogOpen} onOpenChange={setIsClearAllDialogOpen}>
    <AlertDialogContent className="rounded-2xl border-2">
     <AlertDialogHeader>
      <AlertDialogTitle>Полная очистка истории</AlertDialogTitle>
      <AlertDialogDescription>
       Вы действительно хотите переместить ВСЕ ваши расчёты в корзину? Это действие может занять некоторое время.
      </AlertDialogDescription>
     </AlertDialogHeader>
     <AlertDialogFooter>
      <AlertDialogCancel className="rounded-xl">Отмена</AlertDialogCancel>
      <AlertDialogAction onClick={clear} className="bg-destructive hover:bg-destructive/90 rounded-xl">
       Очистить всё
      </AlertDialogAction>
     </AlertDialogFooter>
    </AlertDialogContent>
   </AlertDialog>

   {/* Индикация глобальной загрузки */}
   {(isPending || isActionLoading) && (
    <div className="fixed inset-0 bg-background/20 backdrop-blur-[2px] z-50 flex items-center justify-center">
      <div className="bg-background border-2 p-6 rounded-2xl shadow-xl flex items-center gap-3">
       <RefreshCw className="w-6 h-6 animate-spin text-primary" />
       <span className="font-bold">Подождите...</span>
      </div>
    </div>
   )}
  </div>
 );
}
