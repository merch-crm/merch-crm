import { SkeletonPageHeader } from "@/components/ui/skeleton";

export default function WarehouseLoading() {
    return (
        <div className="space-y-3 animate-pulse">
            <SkeletonPageHeader buttons={2} />

            {/* Tabs Skeleton */}
            <div className="h-[58px] bg-white/50 border border-slate-200/50 rounded-[22px]" />

            {/* Content Skeleton - Premium Variant B Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="crm-card flex flex-col p-0 overflow-hidden bg-white shadow-sm border border-slate-100">
                        {/* Header skeleton */}
                        <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-[14px] bg-slate-100 shrink-0" />
                                <div className="space-y-2">
                                    <div className="h-5 w-24 bg-slate-100 rounded" />
                                    <div className="h-4 w-16 bg-slate-50 rounded" />
                                </div>
                            </div>
                        </div>
                        {/* Body skeleton */}
                        <div className="flex-1 p-5 pt-4 space-y-3">
                            <div className="space-y-2">
                                <div className="h-2 w-1/3 bg-slate-100 rounded" />
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="h-10 bg-slate-50 rounded-[10px]" />
                                    <div className="h-10 bg-slate-50 rounded-[10px]" />
                                </div>
                            </div>
                        </div>
                        {/* Footer skeleton */}
                        <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                            <div className="h-2 w-28 bg-slate-100 rounded" />
                            <div className="w-7 h-7 rounded-full bg-slate-100" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
