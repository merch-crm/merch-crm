import { Suspense } from 'react';
import { Metadata } from 'next';
import { PlacementsPageClient } from './placements-page-client';
import { PlacementsPageSkeleton } from './components/PlacementsPageSkeleton';
import { getPlacementProducts } from '@/lib/actions/calculators/placements';

export const metadata: Metadata = {
  title: 'Нанесение | MerchCRM',
  description: 'Управление изделиями и зонами нанесения',
};

/**
 * Страница управления нанесением
 */
export default async function PlacementsPage() {
  const initialProducts = await getPlacementProducts();

  return (
    <Suspense fallback={<PlacementsPageSkeleton />}>
      <PlacementsPageClient initialProducts={initialProducts} />
    </Suspense>
  );
}
