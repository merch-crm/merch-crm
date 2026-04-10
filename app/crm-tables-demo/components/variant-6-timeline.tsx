"use client";

import React from "react";
import { ArrowDownCircle, ArrowUpCircle, ArrowRightLeft, User, Box } from "lucide-react";
import { operations } from "./demo-data";

export const Variant6Timeline = () => {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-teal-100 text-teal-600 flex items-center justify-center font-bold">6</div>
          Timeline Log View
        </h2>
        <p className="text-slate-500 text-sm mt-1">Отображение операций не как таблицы, а как непрерывного исторического лога событий.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-hidden">
        <div className="relative border-l-2 border-slate-100 ml-6 py-2 space-y-3">
          {operations.map((op) => (
            <div key={op.id} className="relative pl-8 group">
              <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-[3px] border-white flex items-center justify-center
                ${op.changeType === 'positive' ? 'bg-emerald-100 text-emerald-600' :
                  op.typeIcon === 'swap' ? 'bg-purple-100 text-purple-600' :
                    'bg-rose-100 text-rose-600'}`}>
                {op.changeType === 'positive' ? <ArrowDownCircle className="w-3.5 h-3.5" /> :
                  op.changeType === 'negative' ? <ArrowUpCircle className="w-3.5 h-3.5" /> :
                    <ArrowRightLeft className="w-3.5 h-3.5" />}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start group-hover:bg-slate-50 p-2 -mt-2 -ml-2 lg:mr-4 rounded-xl transition-colors">
                <div className="col-span-1 border-r border-slate-100">
                  <div className="text-sm font-bold text-slate-900">{op.time}</div>
                  <div className="text-xs text-slate-500 mt-1">{op.date}</div>
                  <div className="text-xs text-slate-400 font-medium mt-3 flex items-center gap-1"><User className="w-3 h-3" /> {op.author}</div>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-slate-800 text-base">{op.type}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${op.changeType === 'positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {op.change}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm">
                      <Box className="w-3.5 h-3.5 text-slate-400" />
                      {op.warehouse}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 bg-slate-100/80 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-xs font-semibold mb-1">Причина</span>
                    {op.reason}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
