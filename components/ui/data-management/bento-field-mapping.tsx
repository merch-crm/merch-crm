"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, FileSpreadsheet, Database, ArrowRight } from 'lucide-react';

export function BentoFieldMapping() {
  const mappings = [
    { from: 'Имя', to: 'customer_name', score: 98 },
    { from: 'Телефон', to: 'contact_mobile', score: 100 },
    { from: 'Компания', to: 'org_name', score: 85 },
  ];

  return (
    <div className="w-full max-w-sm rounded-card bg-white border border-slate-100 shadow-crm-md p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
         <h3 className="text-sm font-black text-slate-900 tracking-wide">Авто-привязка полей</h3>
         <div className="size-8 rounded-xl bg-primary-base/10 text-primary-base flex items-center justify-center">
            <ArrowRightLeft className="size-4" />
         </div>
      </div>

      <div className="space-y-3">
         {mappings.map((m, i) => (
           <div key={i} className="flex items-center gap-3 group">
              <div className="flex-1 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-bold text-slate-500 flex items-center gap-2">
                 <FileSpreadsheet className="size-3" /> {m.from}
              </div>
              <motion.div 
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-primary-base"
              >
                 <ArrowRight className="size-3.5" />
              </motion.div>
              <div className="flex-1 p-2.5 bg-primary-base text-white rounded-xl text-[11px] font-black flex items-center gap-2 shadow-lg shadow-primary-base/20">
                 <Database className="size-3" /> {m.to}
              </div>
              <div className="text-[11px] font-black text-emerald-500 w-8 text-right">{m.score}%</div>
           </div>
         ))}
      </div>

      <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-element flex items-center gap-3">
         <div className="size-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-[11px] font-black italic">ИИ</div>
         <p className="text-[11px] font-bold text-indigo-700 leading-tight">Система автоматически привязала 8 из 12 полей на основе совпадения схем.</p>
      </div>
    </div>
  );
}
