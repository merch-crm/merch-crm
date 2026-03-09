import { Skeleton } from"@/components/ui/skeleton";
import { Card, CardContent } from"@/components/ui/card";
import { PageContainer } from"@/components/ui/page-container";

export function CollectionPageSkeleton() {
 return (
 <PageContainer>
 {/* Back button */}
 <Skeleton className="h-9 w-36 mb-4"/>

 {/* Header */}
 <Card>
 <CardContent className="p-6">
 <div className="flex flex-col lg:flex-row gap-3">
 <Skeleton className="w-full lg:w-48 h-48 rounded-lg"/>
 <div className="flex-1 space-y-3">
 <Skeleton className="h-8 w-64"/>
 <Skeleton className="h-4 w-full max-w-lg"/>
 <div className="flex gap-3 mt-6">
 <Skeleton className="h-5 w-24"/>
 <Skeleton className="h-5 w-24"/>
 <Skeleton className="h-5 w-24"/>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Toolbar */}
 <div className="flex justify-between items-center mt-8 mb-6">
 <Skeleton className="h-10 w-80"/>
 <div className="flex gap-3">
 <Skeleton className="h-10 w-32"/>
 <Skeleton className="h-10 w-40"/>
 </div>
 </div>

 {/* Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
 {Array.from({ length: 8 }).map((_, i) => (
 <Card key={i}>
 <CardContent className="p-0">
 <Skeleton className="aspect-square rounded-t-lg"/>
 <div className="p-4 space-y-2">
 <Skeleton className="h-5 w-32"/>
 <Skeleton className="h-4 w-24"/>
 </div>
 </CardContent>
 </Card>
))}
 </div>
 </PageContainer>
);
}

export default function Loading() {
 return <CollectionPageSkeleton />;
}
