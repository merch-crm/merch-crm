import { SkeletonStats, SkeletonCard, SkeletonTable, SkeletonPageHeader } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="space-y-3 animate-pulse">
            {/* Header Skeleton */}
            <SkeletonPageHeader buttons={1} />

            {/* Stats Grid */}
            <SkeletonStats count={4} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2">
                    <SkeletonCard className="h-[400px]" />
                </div>
                <div>
                    <div className="crm-card h-full flex flex-col gap-3">
                        <div className="h-6 w-32 bg-slate-200 rounded-lg" />
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-100" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-24 bg-slate-200 rounded" />
                                        <div className="h-2 w-16 bg-slate-100 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Table */}
            <SkeletonTable rows={5} columns={5} />
        </div>
    );
}
