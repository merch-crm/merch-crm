"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Info, Bell, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Typo } from "@/components/ui/typo";

export function BentoNotificationTile() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full max-w-sm h-64 rounded-card bg-white border border-slate-100 shadow-crm-md animate-pulse" />;
  }

  const notifications = [
    { icon: UserPlus, text: "Узел команды добавлен", time: "2м", color: "text-primary-base", bg: "bg-primary-base/5", border: "border-primary-base/10" },
    { icon: Info, text: "Обновление матрицы заплан.", time: "1ч", color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/10" }
  ];

  return (
    <div className="w-full max-w-sm rounded-card bg-white border border-slate-100 shadow-premium p-8 flex flex-col gap-6 group/card hover:border-primary-base/30 transition-all duration-500">
      <div className="flex items-center justify-between px-2">
         <div className="flex items-center gap-3">
            <Bell className="size-4 text-slate-400" />
            <Typo as="h3" className="text-xs font-black text-slate-900 tracking-tight leading-none">Матрица уведомлений</Typo>
         </div>
         <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-full border border-rose-100">
            <div className="size-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
            <Typo as="span" className="text-xs font-black text-rose-500 tracking-tight leading-none">2 новых</Typo>
         </div>
      </div>

      <div className="space-y-3" role="log" aria-label="Недавние системные уведомления">
         {notifications.map((n, i) => (
            <motion.button 
               key={i}
               type="button"
               aria-label={`Уведомление: ${n.text} получено ${n.time} назад`}
               initial={{ x: -10, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: i * 0.1, duration: 0.5 }}
               className="p-5 rounded-element bg-slate-50/50 border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-xl hover:border-primary-base/20 transition-all cursor-pointer w-full text-left outline-none focus-visible:ring-4 focus-visible:ring-primary-base/5 group/item"
            >
               <div className="flex items-center gap-4">
                  <div className={cn("size-10 rounded-xl flex items-center justify-center transition-all group-hover/item:scale-110 group-hover/item:rotate-6 border shadow-sm", n.bg, n.color, n.border)}>
                     <n.icon className="size-5" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Typo as="span" className="text-xs font-black text-slate-900 tracking-tight leading-none">{n.text}</Typo>
                    <Typo as="span" className="text-xs font-black text-slate-400 tracking-tight leading-none tabular-nums opacity-60 text-left">{n.time} назад</Typo>
                  </div>
               </div>
               <CheckCircle2 className="size-4 text-slate-200 group-hover/item:text-primary-base transition-colors" />
            </motion.button>
         ))}
      </div>

      <button 
        type="button"
        aria-label="Очистить все активные уведомления"
        className="w-full py-4 text-xs font-black text-slate-300 tracking-tight hover:text-slate-900 transition-colors focus:outline-none focus:text-slate-900 active:scale-95 border-t border-slate-50 mt-2"
      >
         <Typo as="span">Очистить буфер уведомлений</Typo>
      </button>

    </div>
  );
}
