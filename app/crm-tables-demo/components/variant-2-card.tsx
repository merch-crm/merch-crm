"use client";

import React from "react";
import { ArrowRightLeft, RotateCw, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { operations } from "./demo-data";

export const Variant2Card = () => {
    return (
        <section>
            <div className="mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">2</div>
                    Card-Style List
                </h2>
                <p className="text-slate-500 text-sm mt-1">Отказ от сплошной сетки. Каждая строка читается как отдельная карточка операции.</p>
            </div>

            <div className="bg-slate-100/50 p-6 rounded-2xl border border-slate-200/60">
                <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold text-slate-500  mb-2">
                    <div className="col-span-3">Операция</div>
                    <div className="col-span-1 text-center">Изменение</div>
                    <div className="col-span-3">Маршрут / Склад</div>
                    <div className="col-span-2">Основание</div>
                    <div className="col-span-2">Исполнитель</div>
                    <div className="col-span-1 text-right">Время</div>
                </div>

                <div className="space-y-3">
                    {operations.map((op) => (
                        <div key={op.id} className="grid grid-cols-12 gap-3 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group hover:-translate-y-0.5 text-sm">
                            <div className="col-span-3 flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border
                                    ${op.typeIcon === 'swap' ? 'bg-purple-100 text-purple-600 border-purple-200/50' :
                                        op.typeIcon === 'refresh' ? 'bg-fuchsia-100 text-fuchsia-500 border-fuchsia-200/50' :
                                            op.typeIcon === 'expense' ? 'bg-rose-100 text-rose-500 border-rose-200/50' :
                                                'bg-emerald-100 text-emerald-600 border-emerald-200/50'}`}>
                                    {op.typeIcon === 'swap' ? <ArrowRightLeft className="w-4 h-4" /> :
                                        op.typeIcon === 'refresh' ? <RotateCw className="w-4 h-4" /> :
                                            op.typeIcon === 'expense' ? <ArrowUpCircle className="w-4 h-4" /> :
                                                <ArrowDownCircle className="w-4 h-4" />}
                                </div>
                                <span className="font-bold text-slate-800">{op.type}</span>
                            </div>
                            <div className="col-span-1 flex justify-center">
                                <span className={`px-2.5 py-1 rounded-md font-mono text-sm font-bold ${op.changeType === 'positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {op.change}
                                </span>
                            </div>
                            <div className="col-span-3 font-medium text-slate-700 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> {op.warehouse}
                            </div>
                            <div className="col-span-2 text-slate-500 truncate" title={op.reason}>
                                {op.reason}
                            </div>
                            <div className="col-span-2 text-slate-600 font-medium">
                                {op.author}
                            </div>
                            <div className="col-span-1 text-right text-xs">
                                <div className="font-bold text-slate-800">{op.date}</div>
                                <div className="text-slate-400 font-medium mt-0.5">{op.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
