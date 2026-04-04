'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, History, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/components/library/custom/utils/cn";

interface BentoRelativeTimeProps {
  items?: { text: string; time: Date; status: "success" | "warning" | "error" }[];
}

export function BentoRelativeTime({ items: propItems }: BentoRelativeTimeProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [items, setItems] = useState<{ text: string; time: Date; status: "success" | "warning" | "error" }[]>([]);

  useEffect(() => {
    setIsMounted(true);
    // Инициализация данных в useEffect для предотвращения гидратации
    // audit-ok: hydration (inside useEffect)
    const defaultItems = [
      // audit-ok: hydration
      { text: "Платеж получен", time: new Date(Date.now() - 1000 * 60 * 5), status: "success" as const },
      // audit-ok: hydration
      { text: "Заказ задержан", time: new Date(Date.now() - 1000 * 60 * 60 * 2), status: "warning" as const },
      // audit-ok: hydration
      { text: "Ошибка синхронизации", time: new Date(Date.now() - 1000 * 60 * 60 * 5), status: "error" as const },
    ];
    setItems(propItems || defaultItems);
  }, [propItems]);

  if (!isMounted) {
    return (
      <div className="w-full max-w-sm h-64 bg-white rounded-[2rem] border border-gray-100 shadow-sm animate-pulse p-6">
        <div className="flex items-center gap-2 mb-6">
           <div className="size-4 bg-gray-50 rounded-full" />
           <div className="h-4 w-32 bg-gray-50 rounded-full" />
        </div>
        <div className="space-y-4">
           {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-2xl w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 relative group overflow-hidden hover:border-primary-base/30 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-primary-base" />
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tighter leading-none">Недавняя активность</h4>
        </div>
        <History className="size-4 text-slate-300 group-hover:text-primary-base transition-colors" />
      </div>

      <div className="space-y-3" role="list" aria-label="Activity list">
        <AnimatePresence initial={false}>
          {(items || []).map((item, i) => (
            <motion.div
              key={i}
              role="listitem"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group/item"
            >
              <div className={cn(
                "size-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover/item:scale-110",
                item.status === "success" ? "bg-emerald-50 text-emerald-600 shadow-emerald-500/10" :
                item.status === "warning" ? "bg-amber-50 text-amber-600 shadow-amber-500/10" :
                "bg-rose-50 text-rose-600 shadow-rose-500/10"
              )}>
                <AlertCircle className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{item.text}</span>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-[10px]">
                  {formatDistanceToNow(item.time, { addSuffix: true, locale: ru })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute top-0 right-0 size-32 bg-primary-base/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
    </div>
  );
}
