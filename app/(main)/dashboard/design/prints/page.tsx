import { Suspense } from"react";
import { PageContainer } from"@/components/ui/page-container";
import { PrintsPageClient } from"./prints-page-client";
import { getCollections, getPrintsStats } from"./actions/index";

export const metadata = {
 title:"Принты | Дизайн",
 description:"Управление коллекциями принтов",
};

export const dynamic ="force-dynamic";

export default async function PrintsPage() {
 const [statsResult, collectionsResult] = await Promise.all([
 getPrintsStats(),
 getCollections(),
 ]);

 const stats = statsResult.success && statsResult.data
 ? statsResult.data
 : { collections: 0, designs: 0, versions: 0, files: 0, linkedLines: 0 };

 const collections = collectionsResult.success && collectionsResult.data ? collectionsResult.data : [];

 return (
 <PageContainer>
 <Suspense fallback={<PrintsPageSkeleton />}>
 <PrintsPageClient stats={stats} collections={collections} />
 </Suspense>
 </PageContainer>
);
}

function PrintsPageSkeleton() {
 return (
 <div className="space-y-3">
 {/* Header skeleton */}
 <div className="h-10 w-48 bg-muted animate-pulse rounded-lg"/>

 {/* Widgets skeleton */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl"/>
))}
 </div>

 {/* Grid skeleton */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
 {[...Array(6)].map((_, i) => (
 <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl"/>
))}
 </div>
 </div>
);
}
