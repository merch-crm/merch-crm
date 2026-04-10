import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HistoryPageSkeleton() {
 return (
  <div className="container max-w-6xl py-6 animate-in fade-in duration-500">
   <div className="mb-6 space-y-2">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-4 w-96" />
   </div>

   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    {Array.from({ length: 6 }).map((_, i) => (
     <Card key={i} className="overflow-hidden">
      <CardHeader className="pb-3 border-b bg-muted/20">
       <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20 rounded-full" />
       </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
       <div className="flex justify-between items-end">
        <div className="space-y-1">
         <Skeleton className="h-3 w-16" />
         <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-3 w-32" />
       </div>
       <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed">
        <div className="space-y-1">
         <Skeleton className="h-3 w-20" />
         <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-1">
         <Skeleton className="h-3 w-20" />
         <Skeleton className="h-4 w-16" />
        </div>
       </div>
      </CardContent>
     </Card>
    ))}
   </div>
  </div>
 );
}
