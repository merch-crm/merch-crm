import { PageHeader } from "@/components/layout/page-header";
import { Users, Target } from "lucide-react";
import { getRFMStats, calculateAllClientsRFM } from "@/app/(main)/dashboard/clients/actions/rfm.actions";
import { RFMSegmentBadge } from "@/app/(main)/dashboard/clients/components/rfm-segment-badge";
import { RFMAnalysisTrigger } from "./rfm-analysis-trigger";
import { revalidatePath } from "next/cache";

export default async function RFMPage() {
    const statsRes = await getRFMStats();
    const stats = statsRes.success && statsRes.data ? statsRes.data : [];

    async function handleAnalyze() {
        "use server";
        await calculateAllClientsRFM();
        revalidatePath("/dashboard/analytics/rfm");
    }

    const totalClients = stats.reduce((sum, s) => sum + s.count, 0);

    return (
        <div className="space-y-3">
            <PageHeader
                title="RFM-аналитика"
                description="Сегментация клиентской базы по давности, частоте и сумме покупок"
                actions={
                    <RFMAnalysisTrigger onAnalyze={handleAnalyze} />
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Segment Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-slate-100 overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50">
                        <h3 className="text-sm font-black text-slate-900">Сегменты клиентов</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-slate-50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400">Сегмент</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 text-right">Клиентов</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 text-right">%</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 text-right">Ср. чек</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 text-right">LTV</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats.length > 0 ? (
                                    stats.map((row) => (
                                        <tr key={row.segment} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <RFMSegmentBadge segment={row.segment} size="md" />
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                                                {row.count}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-400 text-right">
                                                {((row.count / totalClients) * 100).toFixed(1)}%
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-600 text-right">
                                                {Math.round(Number(row.averageCheck)).toLocaleString()} ₽
                                            </td>
                                            <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">
                                                {Math.round(Number(row.totalAmount)).toLocaleString()} ₽
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold">
                                            Данные отсутствуют. Запустите анализ.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RFM Matrix Explanation */}
                <div className="space-y-3">
                    <div className="crm-card p-6 bg-white space-y-3 shadow-sm border-2 border-slate-100 rounded-3xl">
                        <div className="flex items-center gap-3 text-primary">
                            <Target className="w-5 h-5" />
                            <h3 className="text-sm font-bold tracking-wider">Что такое RFM?</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-black text-slate-400 mb-1">RECENCY (Давность)</p>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">Как давно клиент совершал покупку. Чем меньше времени прошло, тем выше вероятность повторного заказа.</p>
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 mb-1">FREQUENCY (Частота)</p>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">Как часто клиент покупает. Постоянные клиенты — основа бизнеса.</p>
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 mb-1">MONETARY (Деньги)</p>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">Общая сумма покупок. Показывает ценность клиента для компании.</p>
                            </div>
                        </div>
                    </div>

                    <div className="crm-card p-6 bg-slate-900 text-white space-y-3 shadow-xl shadow-slate-200 rounded-3xl">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-primary" />
                            <h3 className="text-sm font-bold tracking-wider">Важность сегментации</h3>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            Разным сегментам нужны разные маркетинговые подходы.
                            <span className="block mt-2 text-white">🏆 Чемпионы — приоритетное обслуживание.</span>
                            <span className="block mt-1 text-white">⚠️ В зоне риска — реактивация и спецпредложения.</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
