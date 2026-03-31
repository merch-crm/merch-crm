"use client";

import React from "react";
import { ArrowUpCircle, ArrowDownCircle, ArrowRightLeft, RotateCw } from "lucide-react";
import { operations } from "./demo-data";

export const Variant3Dark = () => {
    return (
        <section>
            <div className="mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold">3</div>
                    Dark Mode Tech
                </h2>
                <p className="text-slate-500 text-sm mt-1">Идеально для мониторинга активности; высокий контраст, моноширинные акценты.</p>
            </div>

            <div className="bg-[#0A0A0B] rounded-xl border border-slate-800 overflow-hidden text-slate-300 shadow-2xl relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-emerald-500 to-rose-500 opacity-50"></div>

                <table className="w-full text-left text-[13px] font-mono mt-2">
                    <thead className="text-xs text-slate-500 bg-slate-900/40 border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Тип</th>
                            <th className="px-6 py-4">Delta</th>
                            <th className="px-6 py-4">Таргет:Склад</th>
                            <th className="px-6 py-4 text-right">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                        {operations.map((op, i) => (
                            <tr key={op.id} className="hover:bg-slate-800/40 transition-colors group">
                                <td className="px-6 py-4 text-slate-600 group-hover:text-slate-400">#{(1000 + i).toString().padStart(5, '0')}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {op.typeIcon === 'expense' ? <ArrowUpCircle className="w-4 h-4 text-rose-400" /> :
                                            op.typeIcon === 'income' ? <ArrowDownCircle className="w-4 h-4 text-emerald-400" /> :
                                                op.typeIcon === 'swap' ? <ArrowRightLeft className="w-4 h-4 text-purple-400" /> :
                                                    <RotateCw className="w-4 h-4 text-fuchsia-400" />}
                                        <span className="text-slate-200">{op.type}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`${op.changeType === 'positive' ? 'text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]'} px-1.5 py-0.5 font-bold`}>
                                        {op.change}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400">
                                    [{op.warehouse}] <span className="text-slate-600 ml-2">-- {op.reason}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-slate-500">{op.date}</span> <span className="text-slate-300 ml-1">{op.time}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
