import { Suspense } from 'react';
import { Metadata } from 'next';
import { BrandingPageClient } from './BrandingPageClient';
import { BrandingPageSkeleton } from './components/BrandingPageSkeleton';

export const metadata: Metadata = {
  title: 'Настройки брендинга | MerchCRM',
  description: 'Настройки компании и брендинга для PDF документов',
};

/**
 * Страница настроек брендинга
 * @requires auth
 */
export default function BrandingPage() {
  return (
    <Suspense fallback={<BrandingPageSkeleton />}>
      <BrandingPageClient />
    </Suspense>
  );
}
