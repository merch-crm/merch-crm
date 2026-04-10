import { Suspense } from 'react';
import { Metadata } from 'next';
import { HistoryPageClient } from './history-page-client';
import { HistoryPageSkeleton } from './components/HistoryPageSkeleton';
import { getCalculationHistory } from '@/lib/actions/calculators/history';
import { HistoryFilters, PAGINATION_LIMITS } from '@/lib/types/calculators';

export const metadata: Metadata = {
 title: 'История расчётов | MerchCRM',
 description: 'Сохранённые расчёты себестоимости',
};

interface PageProps {
 searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Страница истории расчётов
 */
export default async function HistoryPage({ searchParams }: PageProps) {
 const params = await searchParams;
 
 const filters: HistoryFilters = {
  page: params.page ? parseInt(params.page as string, 10) : 1,
  limit: params.limit ? parseInt(params.limit as string, 10) : PAGINATION_LIMITS.historyPerPage,
  search: params.search as string,
  calculatorType: (params.calculatorType as import('@/lib/types/calculators').CalculatorType | 'all') || 'all',
  sortBy: (params.sortBy as HistoryFilters['sortBy']) || 'createdAt',
  sortOrder: (params.sortOrder as HistoryFilters['sortOrder']) || 'desc',
 };

 const result = await getCalculationHistory(filters);
 const initialData = result.success ? result.data : null;

 return (
  <Suspense fallback={<HistoryPageSkeleton />}>
   <HistoryPageClient initialData={initialData} initialFilters={filters} />
  </Suspense>
 );
}
