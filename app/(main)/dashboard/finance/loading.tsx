export default function FinanceLoading() {
    return (
        <div className="space-y-3 animate-in fade-in duration-500">
            {/* Grid for Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="crm-card p-6 bg-white flex flex-col justify-between h-40 border-none shadow-sm animate-pulse">
                        <div className="flex justify-between items-start">
                            <div className="h-10 w-10 rounded-[var(--radius-inner)] bg-slate-100" />
                            <div className="h-4 w-12 bg-slate-100 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-20 bg-slate-50 rounded" />
                            <div className="h-8 w-24 bg-slate-100 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Grid for Larger Widgets / Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="crm-card p-6 bg-white h-72 border-none shadow-md animate-pulse">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100" />
                            <div className="space-y-2">
                                <div className="h-5 w-40 bg-slate-100 rounded" />
                                <div className="h-3 w-24 bg-slate-50 rounded" />
                            </div>
                        </div>
                        <div className="w-full h-32 bg-slate-50 rounded-xl" />
                    </div>
                ))}
            </div>

            {/* Table Mockup */}
            <div className="crm-card bg-white border-none shadow-md overflow-hidden !rounded-3xl animate-pulse">
                <div className="px-8 py-7 bg-slate-50/70 border-b border-slate-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[20px] bg-white" />
                        <div className="h-5 w-48 bg-slate-200/50 rounded" />
                    </div>
                    <div className="h-8 w-32 bg-slate-200/50 rounded" />
                </div>
                <div className="p-6 space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100" />
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-slate-100 rounded" />
                                    <div className="h-3 w-20 bg-slate-50 rounded" />
                                </div>
                            </div>
                            <div className="h-6 w-24 bg-slate-100 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
