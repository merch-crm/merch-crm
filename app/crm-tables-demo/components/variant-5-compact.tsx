"use client";

import React from "react";
import { operations } from "./demo-data";

export const Variant5Compact = () => {
    return (
        <section>
            <div className="mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-slate-800 text-white flex items-center justify-center font-bold">5</div>
                    Compact Data Heavy (Stripe)
                </h2>
                <p className="text-slate-500 text-sm mt-1">Максимальная плотность, &quot;зебра&quot; для удобного чтения длинных списков, минимум отступов.</p>
            </div>

            <div className="border border-slate-300 bg-white shadow-sm overflow-hidden text-[13px] rounded-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-slate-700 whitespace-nowrap">
                        <thead className="bg-slate-100 border-b border-slate-300 text-slate-600 font-semibold select-none">
                            <tr>
                                <th className="px-3 py-2 border-r border-slate-200">Date/Time</th>
                                <th className="px-3 py-2 border-r border-slate-200">Operation Type</th>
                                <th className="px-3 py-2 border-r border-slate-200 text-right">Qty</th>
                                <th className="px-3 py-2 border-r border-slate-200">Location</th>
                                <th className="px-3 py-2 border-r border-slate-200">Reason</th>
                                <th className="px-3 py-2 text-right">Operator</th>
                            </tr>
                        </thead>
                        <tbody>
                            {operations.map((op, idx) => (
                                <tr key={op.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'} hover:bg-blue-50/50 border-b border-slate-200/60`}>
                                    <td className="px-3 py-1.5 border-r border-slate-200/60 font-mono text-xs text-slate-500">{op.date} {op.time}</td>
                                    <td className="px-3 py-1.5 border-r border-slate-200/60 font-medium text-slate-800">{op.type}</td>
                                    <td className={`px-3 py-1.5 border-r border-slate-200/60 text-right font-mono font-bold ${op.changeType === 'positive' ? 'text-emerald-600' : 'text-rose-600'}`}>{op.change}</td>
                                    <td className="px-3 py-1.5 border-r border-slate-200/60 text-slate-600">{op.warehouse}</td>
                                    <td className="px-3 py-1.5 border-r border-slate-200/60 text-slate-500 truncate max-w-[150px]" title={op.reason}>{op.reason}</td>
                                    <td className="px-3 py-1.5 text-right text-slate-600 border-r border-slate-200/60">{op.author}</td>
                                </tr>
                            ))}
                            {/* Duplicates to show density */}
                            {operations.map((op, idx) => (
                                <tr key={op.id + 'dup'} className={`${(idx + 1) % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'} hover:bg-blue-50/50 border-b border-slate-200/60`}>
                                    <td className="px-3 py-1.5 border-r border-slate-200/60 font-mono text-xs text-slate-500">{op.date} 09:00</td>
                                    <td className="px-3 py-1.5 border-r border-slate-200/60 font-medium text-slate-800">{op.type}</td>
                                    <td className={`px-3 py-1.5 border-r border-slate-200/60 text-right font-mono font-bold ${op.changeType === 'positive' ? 'text-emerald-600' : 'text-rose-600'}`}>{op.change}</td>
                                    <td className="px-3 py-1.5 border-r border-slate-200/60 text-slate-600">{op.warehouse}</td>
                                    <td className="px-3 py-1.5 border-r border-slate-200/60 text-slate-500 truncate max-w-[150px]" title={op.reason}>{op.reason}</td>
                                    <td className="px-3 py-1.5 text-right text-slate-600 border-r border-slate-200/60">{op.author}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};
