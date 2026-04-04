"use client";

import React from "react";
import { Box, RotateCw, User } from "lucide-react";
import { renderIcon } from "./demo-utils";
import { operations } from "./demo-data";

export const Variant8Analytics = () => {
    return (
        <section>
            <div className="mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">8</div>
                    Modern Analytics Grid
                </h2>
                <p className="text-slate-500 text-sm mt-1">Отображение данных с сеткой как в аналитических панелях, акцент на колонку чисел.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="border-b border-slate-200 bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-xs  text-slate-400 font-bold">Операция</th>
                            <th className="px-6 py-4 text-xs  text-slate-400 font-bold text-center w-24">Дельта</th>
                            <th className="px-6 py-4 text-xs  text-slate-400 font-bold">Контекст (Склад / Причина)</th>
                            <th className="px-6 py-4 text-xs  text-slate-400 font-bold text-right">Метрика Времени</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {operations.map((op) => (
                            <tr key={op.id} className="hover:bg-blue-50/30 group transition">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        {renderIcon(op.typeIcon)}
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">{op.type}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><User className="w-3 h-3" /> {op.author}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 align-middle border-x border-slate-100 bg-slate-50/30">
                                    <div className={`text-xl font-black text-center font-mono ${op.changeType === 'positive' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {op.change}
                                    </div>
                                </td>
                                <td className="px-6 py-5 align-middle">
                                    <div className="font-medium text-slate-800 text-sm flex items-center gap-2">
                                        <Box className="w-4 h-4 text-slate-400" /> {op.warehouse}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                        <RotateCw className="w-3 h-3" /> {op.reason}
                                    </div>
                                </td>
                                <td className="px-6 py-5 align-middle text-right">
                                    <div className="inline-flex flex-col items-end">
                                        <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">{op.time}</span>
                                        <span className="text-xs font-medium text-slate-400 mt-1">{op.date}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
