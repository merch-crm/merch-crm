"use client";

interface PLReport {
    totalRevenue: number;
    totalCOGS: number;
    totalOverhead: number;
    netProfit: number;
    margin: number;
}

interface PLClientProps {
    plReport: PLReport;
}

export function PLClient({ plReport }: PLClientProps) {
    if (!plReport) return null;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-[var(--crm-grid-gap)]">
                <div className="crm-card p-10 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Выручка</p>
                    <div className="text-4xl font-black tracking-tight">{plReport.totalRevenue.toLocaleString()} <span className="text-lg opacity-50">₽</span></div>
                </div>
                <div className="crm-card p-10 bg-white border border-slate-100 shadow-lg group hover:border-rose-100 transition-colors">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Себестоимость (COGS)</p>
                    <div className="text-4xl font-black text-rose-500 tracking-tight">-{plReport.totalCOGS.toLocaleString()} <span className="text-lg opacity-50">₽</span></div>
                    <div className="text-[10px] font-bold text-rose-400/70 uppercase mt-4 tracking-tighter">Расходы на производство</div>
                </div>
                <div className="crm-card p-10 bg-white border border-slate-100 shadow-lg group hover:border-rose-200 transition-colors">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Опер. расходы</p>
                    <div className="text-4xl font-black text-rose-600 tracking-tight">-{plReport.totalOverhead.toLocaleString()} <span className="text-lg opacity-50">₽</span></div>
                    <div className="text-[10px] font-bold text-rose-500/70 uppercase mt-4 tracking-tighter">Аренда, налоги и др.</div>
                </div>
                <div className="crm-card p-10 bg-emerald-600 text-white border-none shadow-2xl relative overflow-hidden group">
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mb-16 blur-2xl" />
                    <p className="text-emerald-100/70 text-[10px] font-black uppercase tracking-widest mb-4">Чистая прибыль</p>
                    <div className="text-4xl font-black tracking-tight">{plReport.netProfit.toLocaleString()} <span className="text-lg opacity-60">₽</span></div>
                    <div className="mt-6 flex items-center gap-2">
                        <div className="text-[10px] font-black bg-white/20 px-4 py-1.5 rounded-full uppercase tracking-widest">Маржа: {plReport.margin.toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            <div className="crm-card bg-white p-12 border-none shadow-xl !rounded-[32px] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 via-primary to-emerald-400" />
                <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tight uppercase border-b border-slate-50 pb-6 w-fit">Структура расходов</h3>
                <div className="space-y-10">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-4 h-4 rounded-full bg-rose-500 shadow-lg shadow-rose-200" />
                                <span className="text-[14px] font-black text-slate-700 uppercase tracking-wider">Себестоимость закупки (COGS)</span>
                            </div>
                            <span className="text-xl font-black text-slate-900">{plReport.totalCOGS.toLocaleString()} <span className="text-sm font-bold text-slate-400">₽</span></span>
                        </div>
                        <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
                            <div
                                className="h-full bg-rose-500 rounded-full shadow-inner transition-all duration-1000"
                                style={{ width: `${(plReport.totalCOGS / (plReport.totalCOGS + plReport.totalOverhead)) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-4 h-4 rounded-full bg-rose-400 shadow-lg shadow-rose-100" />
                                <span className="text-[14px] font-black text-slate-700 uppercase tracking-wider">Косвенные / Опер. расходы (OPEX)</span>
                            </div>
                            <span className="text-xl font-black text-slate-900">{plReport.totalOverhead.toLocaleString()} <span className="text-sm font-bold text-slate-400">₽</span></span>
                        </div>
                        <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
                            <div
                                className="h-full bg-rose-400 rounded-full shadow-inner transition-all duration-1000"
                                style={{ width: `${(plReport.totalOverhead / (plReport.totalCOGS + plReport.totalOverhead)) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
