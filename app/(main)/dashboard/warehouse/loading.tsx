export default function WarehouseLoading() {
    return (
        <div className="animate-pulse">
            {/* Content Skeleton - Premium Variant B Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="flex flex-col h-[220px] crm-card p-0 overflow-hidden bg-white shadow-sm border border-slate-100">
                        {/* Header skeleton */}
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 relative">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-[14px] bg-slate-100 shrink-0" />
                                <div className="space-y-2">
                                    <div className="h-[17px] w-28 bg-slate-100 rounded-md" />
                                    <div className="h-4 w-12 bg-slate-50 rounded-full" />
                                </div>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-slate-50" />
                        </div>
                        {/* Body skeleton */}
                        <div className="flex-1 p-6 pt-4 flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="h-3 w-20 bg-slate-100 rounded" />
                                <div className="h-4 w-6 bg-slate-50 rounded-md" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="h-8 bg-slate-50 rounded-[10px]" />
                                <div className="h-8 bg-slate-50 rounded-[10px]" />
                                <div className="h-8 bg-slate-50 rounded-[10px]" />
                                <div className="h-8 bg-slate-50 rounded-[10px]" />
                            </div>
                        </div>
                        {/* Footer skeleton */}
                        <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between mt-auto">
                            <div className="h-3 w-32 bg-slate-100 rounded" />
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
