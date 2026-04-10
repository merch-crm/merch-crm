import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PlacementsPageSkeleton() {
 return (
  <div className="container max-w-6xl py-6 animate-in fade-in duration-500">
   <div className="mb-6 flex items-center justify-between">
    <div className="space-y-2">
     <Skeleton className="h-8 w-48" />
     <Skeleton className="h-4 w-80" />
    </div>
    <Skeleton className="h-10 w-40 rounded-xl" />
   </div>

   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    {Array.from({ length: 3 }).map((_, i) => (
     <Card key={i} className="overflow-hidden border-2">
      <CardHeader className="bg-slate-50/50 pb-4">
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
         <Skeleton className="h-10 w-10 rounded-xl" />
         <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
       </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
       <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-wrap gap-2">
         <Skeleton className="h-7 w-20 rounded-lg" />
         <Skeleton className="h-7 w-24 rounded-lg" />
        </div>
       </div>
       <div className="pt-4 border-t flex justify-end">
        <Skeleton className="h-9 w-24 rounded-lg" />
       </div>
      </CardContent>
     </Card>
    ))}
   </div>
  </div>
 );
}
