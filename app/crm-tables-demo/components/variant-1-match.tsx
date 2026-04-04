"use client";

import React from "react";
import { Search, Download, Activity, Layers, Box, Plus, RotateCw, ArrowRightLeft, User, Calendar, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { operations } from "./demo-data";

export const Variant1Match = () => {
    return (
        <section>
            <div className="mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</div>
                    Абсолютное совпадение с макетом
                </h2>
                <p className="text-slate-500 text-sm mt-1">Отрисовано пиксель-в-пиксель по предоставленному скриншоту.</p>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden pb-4">
                {/* Header (История операций) */}
                <div className="px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#1C202E] text-white rounded-xl flex items-center justify-center shadow-sm">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h2 className="text-[22px] font-bold  text-[#1E293B]">История операций</h2>
                    </div>
                    <button type="button" className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white font-semibold rounded-[10px] transition-colors text-[14px] flex items-center gap-2">
                        <Download className="w-[18px] h-[18px]" /> Скачать
                    </button>
                </div>

                {/* Search and Filters Bar */}
                <div className="px-6 pb-6">
                    <div className="flex items-center gap-3 bg-[#F8FAFC] p-2 rounded-2xl border border-slate-200/60">
                        <div className="relative flex-1">
                            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Поиск по истории..." className="pl-11 pr-4 py-3 w-full text-[15px] border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-sm placeholder:text-slate-400 font-medium" />
                        </div>

                        <div className="hidden lg:block w-px h-8 bg-slate-200 mx-1"></div>

                        <div className="flex gap-1.5 items-center mr-2 text-slate-500">
                            <button type="button" className="px-6 py-3 h-full rounded-xl bg-[#6C2BD9] hover:bg-[#5b24b8] text-white text-[15px] font-bold shadow-sm flex items-center gap-2 transition-colors">
                                <Layers className="w-5 h-5" /> Все
                            </button>
                            <button type="button" className="w-11 h-11 flex items-center justify-center hover:bg-slate-200 rounded-xl transition-colors"><Box className="w-5 h-5" /></button>
                            <button type="button" className="w-11 h-11 flex items-center justify-center hover:bg-slate-200 rounded-xl transition-colors"><Plus className="w-5 h-5" /></button>
                            <button type="button" className="w-11 h-11 flex items-center justify-center hover:bg-slate-200 rounded-xl transition-colors"><RotateCw className="w-5 h-5" /></button>
                            <button type="button" className="w-11 h-11 flex items-center justify-center hover:bg-slate-200 rounded-xl transition-colors"><ArrowRightLeft className="w-5 h-5" /></button>
                            <button type="button" className="w-11 h-11 flex items-center justify-center hover:bg-slate-200 rounded-xl transition-colors"><RotateCw className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>

                {/* Table Area / Card List */}
                <div className="bg-[#f8fafc] px-6 py-6 border-t border-slate-100 rounded-b-[24px]">
                    {/* Table Headers */}
                    <div className="flex items-center px-6 mb-4 text-[12px] font-bold  text-[#94A3B8] select-none">
                        <div className="w-48 shrink-0 flex items-center gap-2.5">
                            <Layers className="w-[18px] h-[18px]" /> Тип
                        </div>
                        <div className="w-28 shrink-0 px-4 flex items-center gap-2.5">
                            <ArrowRightLeft className="w-[18px] h-[18px]" /> Изменение
                        </div>
                        <div className="flex-1 flex items-center gap-2.5 pr-4 pl-4">
                            <Box className="w-[18px] h-[18px]" /> Склад
                        </div>
                        <div className="flex-1 flex items-center gap-2.5 pr-4">
                            <RotateCw className="w-[18px] h-[18px]" /> Причина
                        </div>
                        <div className="w-48 shrink-0 flex items-center gap-2.5">
                            <User className="w-[18px] h-[18px]" /> Автор
                        </div>
                        <div className="w-24 shrink-0 flex items-center gap-2.5 justify-end">
                            <Calendar className="w-[18px] h-[18px]" /> Дата
                        </div>
                    </div>

                    {/* Card Rows */}
                    <div className="space-y-3">
                        {operations.map((op) => (
                            <div key={op.id} className="bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between transition-shadow hover:shadow-md">
                                {/* Left Group: Icon + Type */}
                                <div className="flex items-center gap-3 w-48 shrink-0">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0
                                        ${op.typeIcon === 'swap' ? 'bg-purple-100 text-purple-600' :
                                            op.typeIcon === 'refresh' ? 'bg-fuchsia-100 text-fuchsia-500' :
                                                op.typeIcon === 'expense' ? 'bg-rose-100 text-rose-500' :
                                                    'bg-emerald-100 text-emerald-600'}`}>
                                        {op.typeIcon === 'swap' ? <ArrowRightLeft className="w-4 h-4" /> :
                                            op.typeIcon === 'refresh' ? <RotateCw className="w-4 h-4" /> :
                                                op.typeIcon === 'expense' ? <ArrowUpCircle className="w-4 h-4" /> :
                                                    <ArrowDownCircle className="w-4 h-4" />}
                                    </div>
                                    <span className="font-bold text-slate-800 text-[15px]">{op.type}</span>
                                </div>

                                {/* Delta Badge */}
                                <div className="w-28 shrink-0 px-4">
                                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-bold font-mono 
                                        ${op.changeType === 'positive' ? 'bg-[#ebfbf3] text-[#10b981]' : 'text-[#f43f5e] bg-[#fff1f2]'}`}>
                                        {op.change}
                                    </span>
                                </div>

                                {/* Warehouse */}
                                <div className="flex-1 flex items-center gap-3 text-[15px] text-slate-500 min-w-0 pr-4 pl-4">
                                    <div className="w-[5px] h-[5px] rounded-full bg-slate-200 shrink-0"></div>
                                    <span className="truncate">{op.warehouse}</span>
                                </div>

                                {/* Reason */}
                                <div className="flex-1 text-[15px] text-slate-400 min-w-0 pr-4">
                                    <span className="truncate block">{op.reason}</span>
                                </div>

                                {/* Author */}
                                <div className="w-48 text-[15px] text-slate-500 font-medium shrink-0">
                                    {op.author}
                                </div>

                                {/* Date & Time */}
                                <div className="w-24 text-right flex flex-col items-end justify-center shrink-0">
                                    <div className="font-bold text-slate-900 text-[13px] leading-tight mb-0.5">{op.date}</div>
                                    <div className="text-slate-400 text-xs leading-tight">{op.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
