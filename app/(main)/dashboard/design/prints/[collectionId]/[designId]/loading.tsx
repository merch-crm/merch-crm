import { Skeleton } from"@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from"@/components/ui/card";
import { PageContainer } from"@/components/ui/page-container";

export function DesignPageSkeleton() {
 return (
 <PageContainer>
 {/* Back button */}
 <Skeleton className="h-9 w-48 mb-4"/>

 {/* Header */}
 <Card>
 <CardContent className="p-6">
 <div className="flex flex-col lg:flex-row gap-3">
 <Skeleton className="w-full lg:w-48 h-48 rounded-lg"/>
 <div className="flex-1 space-y-3">
 <Skeleton className="h-6 w-32"/>
 <Skeleton className="h-8 w-64"/>
 <Skeleton className="h-4 w-full max-w-lg"/>
 <div className="flex gap-3 mt-6">
 <Skeleton className="h-5 w-24"/>
 <Skeleton className="h-5 w-24"/>
 <Skeleton className="h-5 w-32"/>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Toolbar */}
 <div className="flex justify-between items-center mt-8 mb-6">
 <Skeleton className="h-7 w-32"/>
 <div className="flex gap-3">
 <Skeleton className="h-10 w-32"/>
 <Skeleton className="h-10 w-40"/>
 </div>
 </div>

 {/* Versions */}
 <div className="space-y-3">
 {Array.from({ length: 3 }).map((_, i) => (
 <Card key={i}>
 <CardHeader className="p-4">
 <div className="flex items-center gap-3">
 <Skeleton className="w-12 h-12 rounded-md"/>
 <div className="flex-1 space-y-2">
 <Skeleton className="h-5 w-48"/>
 <div className="flex gap-2">
 <Skeleton className="h-5 w-24"/>
 <Skeleton className="h-5 w-28"/>
 </div>
 </div>
 <Skeleton className="h-8 w-8 rounded-md"/>
 </div>
 </CardHeader>
 </Card>
))}
 </div>
 </PageContainer>
);
}

export default function Loading() {
 return <DesignPageSkeleton />;
}
