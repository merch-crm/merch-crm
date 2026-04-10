"use client";

import React from "react";
import { Filter, ArrowDownCircle, ArrowUpCircle, User } from "lucide-react";
import { operations } from "./demo-data";

export const Variant10Mobile = () => {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-yellow-100 text-yellow-600 flex items-center justify-center font-bold">10</div>
          App-like List View
        </h2>
        <p className="text-slate-500 text-sm mt-1">Оптимизировано для узких экранов терминалов или мобильных устройств. Вертикальное выравнивание инфы.</p>
      </div>

      <div className="max-w-md bg-slate-50 border border-slate-200 shadow-xl rounded-[2rem] overflow-hidden mx-auto h-[600px] flex flex-col">
        <div className="bg-white px-6 py-5 border-b border-slate-100 sticky top-0 z-10 flex justify-between items-center shadow-sm">
          <h3 className="font-bold text-lg text-slate-900">Операции</h3>
          <button type="button" className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><Filter className="w-4 h-4 text-slate-600" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {operations.map((op) => (
            <div key={op.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${op.changeType === 'positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {op.changeType === 'positive' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-[15px]">{op.type}</div>
                    <div className="text-xs text-slate-500 font-medium">{op.time} • {op.date}</div>
                  </div>
                </div>
                <div className={`text-xl font-black font-mono ${op.changeType === 'positive' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {op.change}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100/50">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Склад:</span>
                  <span className="font-semibold text-slate-800 text-right">{op.warehouse}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Причина:</span>
                  <span className="font-medium text-slate-700 text-right">{op.reason}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200 mt-2">
                  <span className="text-slate-500">Автор:</span>
                  <span className="font-medium text-slate-600 flex items-center gap-1"><User className="w-3 h-3" /> {op.author}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
