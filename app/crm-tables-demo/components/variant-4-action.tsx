"use client";

import React from "react";
import { Box } from "lucide-react";
import { operations } from "./demo-data";

export const Variant4Action = () => {
    return (
        <section>
            <div className="mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">4</div>
                    Action-Oriented (Focus on Delta)
                </h2>
                <p className="text-slate-500 text-sm mt-1">Главный акцент на изменениях складских запасов (дельта). Цветовое кодирование строк.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-100">
                        {operations.map((op) => (
                            <tr key={op.id} className="hover:bg-slate-50/50 transition duration-150 relative">
                                <td className="pl-4 py-4 w-1">
                                    <div className={`w-1.5 h-10 rounded-full ${op.changeType === 'positive' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                                </td>
                                <td className="p-4 pl-6 w-32">
                                    <div className={`text-2xl font-black  ${op.changeType === 'positive' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {op.change}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-slate-900 text-[15px]">{op.type}</div>
                                    <div className="text-sm text-slate-500 mt-0.5">{op.reason} • Автор: {op.author}</div>
                                </td>
                                <td className="p-4">
                                    <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                        <Box className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-semibold text-slate-700">{op.warehouse}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right text-sm">
                                    <div className="font-medium text-slate-800">{op.date}</div>
                                    <div className="text-slate-400">{op.time}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
