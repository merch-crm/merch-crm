export default function PrintsLoading() {
 return (
 <div className="p-6 space-y-3">
 {/* Header skeleton */}
 <div className="flex justify-between items-center">
 <div className="space-y-2">
 <div className="h-8 w-32 bg-muted animate-pulse rounded-lg"/>
 <div className="h-4 w-64 bg-muted animate-pulse rounded-lg"/>
 </div>
 <div className="h-10 w-40 bg-muted animate-pulse rounded-lg"/>
 </div>

 {/* Widgets skeleton */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[...Array(4)].map((_, i) => (
 <div
 key={i}
 className="h-28 bg-muted animate-pulse rounded-2xl"
 />
))}
 </div>

 {/* Search skeleton */}
 <div className="h-10 w-full max-w-md bg-muted animate-pulse rounded-lg"/>

 {/* Grid skeleton */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
 {[...Array(6)].map((_, i) => (
 <div key={i} className="space-y-0 rounded-2xl overflow-hidden border">
 <div className="h-40 bg-muted animate-pulse"/>
 <div className="p-4 space-y-3">
 <div className="h-5 w-3/4 bg-muted animate-pulse rounded"/>
 <div className="h-4 w-1/2 bg-muted animate-pulse rounded"/>
 </div>
 </div>
))}
 </div>
 </div>
);
}
