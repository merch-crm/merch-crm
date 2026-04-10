import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Skeleton для страницы брендинга
 */
export function BrandingPageSkeleton() {
 return (
  <div className="container max-w-4xl py-6 space-y-3">
   <div className="h-8 w-64 bg-muted rounded animate-pulse" />
   <div className="h-4 w-96 bg-muted rounded animate-pulse" />
   
   {[1, 2, 3, 4].map((i) => (
    <Card key={i}>
     <CardHeader>
      <div className="h-6 w-32 bg-muted rounded animate-pulse" />
     </CardHeader>
     <CardContent className="space-y-3">
      <div className="h-10 bg-muted rounded animate-pulse" />
      <div className="h-10 bg-muted rounded animate-pulse" />
     </CardContent>
    </Card>
   ))}
  </div>
 );
}
