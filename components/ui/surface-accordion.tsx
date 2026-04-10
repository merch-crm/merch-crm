"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, FileText, FolderOpen, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_ACCORDION_ITEMS = [
  { 
    title: "Финансовые отчёты", 
    icon: <FileText className="size-4" />, 
    content: "Подробный анализ выручки, прибыли и операционных расходов за текущий отчетный период. Включает графики и прогнозы.",
    status: "Обновлено"
  },
  { 
    title: "Безопасность системы", 
    icon: <ShieldCheck className="size-4" />, 
    content: "Конфигурация прав доступа, аудит логов и настройки двухфакторной аутентификации для всех ролей в системе.",
    status: "Важно"
  },
  { 
    title: "Модули и компоненты", 
    icon: <FolderOpen className="size-4" />, 
    content: "Каталог установленных расширений, управление версиями и настройки интеграций с внешними API сервисами.",
    status: "24 шт"
  }
];

export function SurfaceAccordion({ items: propItems }: { items?: { title: string; icon: React.ReactNode; content: string; status?: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isMounted, setIsMounted] = useState(false);
  const items = propItems || DEFAULT_ACCORDION_ITEMS;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full max-w-sm h-[320px] bg-white rounded-card border border-gray-100 animate-pulse" />;
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-card border border-gray-100 shadow-crm-md p-6 flex flex-col gap-3 group relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
         <h3 className="text-[11px] font-black text-gray-400 px-2   tracking-wider">Структура данных</h3>
      </div>

      <div className="space-y-3 relative z-10">
         {(items || []).map((item, i) => (
           <div 
             key={i} 
             className={cn(
               "group/item rounded-card border transition-all duration-500 overflow-hidden",
               openIndex === i ? "bg-white border-primary-base/20 shadow-crm-lg" : "bg-gray-50/50 border-transparent hover:bg-gray-50"
             )}
           >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-4 outline-none"
              >
                 <div className="flex items-center gap-3">
                    <div className={cn(
                      "size-9 rounded-element flex items-center justify-center transition-all shadow-sm",
                      openIndex === i ? "bg-primary-base text-white shadow-primary-base/30" : "bg-white text-gray-400 group-hover/item:text-gray-900"
                    )}>
                       {item.icon}
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                       <span className="text-sm font-black text-gray-900 ">{item.title}</span>
                       {item.status && <span className="text-[11px] font-black text-gray-400 leading-none">{item.status}</span>}
                    </div>
                 </div>

                 <motion.div
                   animate={{ rotate: openIndex === i ? 180 : 0 }}
                   className="text-gray-300 group-hover/item:text-primary-base transition-colors"
                 >
                    <ChevronDown className="size-4" />
                 </motion.div>
              </button>
              
              <AnimatePresence initial={false}>
                 {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
                    >
                       <div className="px-5 pb-5 text-[11px] font-black text-gray-500 leading-relaxed  ">
                          {item.content}
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
         ))}
      </div>

      <div className="absolute -right-20 -top-20 size-64 bg-primary-base/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
