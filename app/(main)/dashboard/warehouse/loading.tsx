import { Loader2 } from "lucide-react";

export default function WarehouseLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-start">
                <div className="space-y-3">
                    <div className="h-10 w-64 bg-slate-200 rounded-2xl" />
                    <div className="h-4 w-96 bg-slate-100 rounded-lg" />
                </div>
                <div className="flex gap-3">
                    <div className="h-11 w-40 bg-slate-200 rounded-xl" />
                    <div className="h-11 w-40 bg-slate-200 rounded-xl" />
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="h-[58px] bg-white/50 border border-slate-200/50 rounded-[22px]" />

            {/* Content Skeleton - Consistent with Categories Page */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--crm-grid-gap)]">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="bg-white border border-slate-200 rounded-[var(--radius-outer)] p-6 flex flex-col gap-4 relative overflow-hidden">
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-[var(--radius-inner)] bg-slate-100 flex items-center justify-center animate-pulse" />
                                <div>
                                    <div className="h-6 w-32 bg-slate-100 rounded animate-pulse mb-2" />
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 text-slate-200 animate-spin" />
                                        <div className="h-2 w-16 bg-slate-100 rounded animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="min-h-[3rem] relative z-10">
                            <div className="space-y-2">
                                <div className="h-2 w-full bg-slate-100 rounded animate-pulse" />
                                <div className="h-2 w-2/3 bg-slate-100 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 mt-auto relative z-10">
                            <div className="h-2 w-20 bg-slate-100 rounded animate-pulse" />
                            <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
