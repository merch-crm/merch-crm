"use client";

import React from "react";
import { operations } from "./demo-data";

export const Variant9ERP = () => {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center font-bold">9</div>
          Condensed ERP View
        </h2>
        <p className="text-slate-500 text-sm mt-1">Традиционный, плотный табличный вид, характерный для enterprise ERP-систем типа 1С или SAP, но осовремененный.</p>
      </div>

      <div className="border border-slate-300 rounded-lg bg-white overflow-hidden text-xs">
        <div className="bg-[#f0f4f8] border-b border-slate-300 px-2 py-1 flex items-center justify-between text-slate-700 font-medium font-mono">
          <div className="flex items-center gap-2">
            <button type="button" className="px-2 py-0.5 border border-slate-300 bg-white hover:bg-slate-50 rounded text-xs">Refresh</button>
            <button type="button" className="px-2 py-0.5 border border-slate-300 bg-white hover:bg-slate-50 rounded text-xs">Filter: None</button>
          </div>
          <div>Count: 7 rows</div>
        </div>
        <table className="w-full text-left font-mono">
          <thead className="bg-[#e4ebf1] text-slate-700 border-b-2 border-[#cbd5e1] font-bold">
            <tr>
              <th className="px-2 py-1.5 border-r border-[#cbd5e1] w-28">DateTime</th>
              <th className="px-2 py-1.5 border-r border-[#cbd5e1] w-32">Type_ID</th>
              <th className="px-2 py-1.5 border-r border-[#cbd5e1] text-right w-16">Delta</th>
              <th className="px-2 py-1.5 border-r border-[#cbd5e1]">Source/Dest</th>
              <th className="px-2 py-1.5 border-r border-[#cbd5e1]">Description_Nxt</th>
              <th className="px-2 py-1.5 text-right w-32">Exec_User</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((op, idx) => (
              <tr key={op.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'} hover:bg-[#e0e7ff] hover:text-blue-900 border-b border-[#e2e8f0] cursor-pointer selection:bg-blue-200`}>
                <td className="px-2 py-1 border-r border-[#e2e8f0] text-[#64748b]">{op.date} {op.time}</td>
                <td className="px-2 py-1 border-r border-[#e2e8f0] font-semibold text-[#334155]">{op.type}</td>
                <td className={`px-2 py-1 border-r border-[#e2e8f0] text-right font-bold ${op.changeType === 'positive' ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>{op.change}</td>
                <td className="px-2 py-1 border-r border-[#e2e8f0] text-[#475569]">{op.warehouse}</td>
                <td className="px-2 py-1 border-r border-[#e2e8f0] text-[#64748b] truncate max-w-[200px]" title={op.reason}>{op.reason}</td>
                <td className="px-2 py-1 text-right border-r border-[#e2e8f0] text-[#64748b]">{op.author}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
