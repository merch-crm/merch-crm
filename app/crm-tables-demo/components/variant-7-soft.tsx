"use client";

import React from "react";
import { renderIcon } from "./demo-utils";
import { operations } from "./demo-data";

export const Variant7Soft = () => {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-pink-100 text-pink-600 flex items-center justify-center font-bold">7</div>
          Soft Form (Pill Rows)
        </h2>
        <p className="text-slate-500 text-sm mt-1">Округлые формы, мягкие тени при наведении, дружелюбный интерфейс.</p>
      </div>

      <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
        <div className="space-y-3">
          {operations.map((op) => (
            <div key={op.id} className="bg-white rounded-full px-5 py-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex justify-between items-center border border-slate-100 hover:border-slate-300 transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-3 flex-1">
                {/* Icon & Type */}
                <div className="flex items-center gap-3 w-40">
                  {renderIcon(op.typeIcon)}
                  <h4 className="font-bold text-slate-800">{op.type}</h4>
                </div>

                {/* Change Badge */}
                <div className="w-16 text-center">
                  <span className={`text-lg font-black font-mono ${op.changeType === 'positive' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {op.change}
                  </span>
                </div>

                {/* Warehouse Path */}
                <div className="flex-1 px-4 py-2 bg-slate-50 rounded-full border border-slate-200 text-sm font-medium text-slate-600 text-center truncate">
                  {op.warehouse}
                </div>
              </div>

              <div className="flex items-center gap-3 pl-6 border-l border-slate-100 ml-6">
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-400 text-right">Автор</div>
                  <div className="text-sm font-semibold text-slate-700">{op.author}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">{op.time}</div>
                  <div className="text-xs text-slate-400">{op.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
