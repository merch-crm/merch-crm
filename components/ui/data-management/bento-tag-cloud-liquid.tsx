"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, Plus } from 'lucide-react';
import { pluralizeRU } from "@/lib/pluralize";

export function BentoTagCloudLiquid() {
  const [tags, setTags] = useState(['VIP', 'Крупный бизнес', 'Перезвонить', 'Июльские лиды', 'B2B', 'Технологии']);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  if (!isMounted) {
    return <div className="w-full max-w-sm h-[320px] rounded-card bg-white border border-slate-100 shadow-crm-md animate-pulse p-6" />;
  }

  return (
    <div className="w-full max-w-sm rounded-card bg-white border border-slate-100 shadow-crm-md p-8 flex flex-col gap-5 group/card hover:border-primary-base/30 transition-colors duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="size-4 text-primary-base" />
          <h3 className="text-[11px] font-black text-slate-900 tracking-[0.2em] leading-none">Активные теги</h3>
        </div>
        <button 
          type="button"
          aria-label="Добавить новый тег"
          className="size-10 rounded-element bg-slate-50 text-slate-400 hover:text-primary-base hover:bg-slate-100 transition-all flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-primary-base shadow-sm"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2.5 py-4 min-h-[120px] content-start">
        <AnimatePresence mode="popLayout">
          {tags.map((tag, _i) => (
            <motion.div
              key={tag}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-element flex items-center gap-3 group transition-all hover:bg-white hover:border-slate-300 hover:shadow-md cursor-default text-left"
            >
              <span className="text-[11px] font-black text-slate-900 tracking-tight leading-none transition-colors group-hover:text-primary-base">{tag}</span>
              <button 
                type="button"
                aria-label={`Удалить тег ${tag}`}
                onClick={() => removeTag(tag)}
                className="opacity-0 group-hover:opacity-100 transition-all hover:text-rose-500 p-1 -mr-1 outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-base rounded-lg"
              >
                <X className="size-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-auto flex items-center justify-between px-2 pt-6 border-t border-slate-50">
         <span className="text-[11px] font-black text-slate-400 tracking-widest leading-none">Всего сегментов</span>
          <span className="text-[11px] font-black text-primary-base bg-primary-base/5 px-2.5 py-1 rounded-lg border border-primary-base/10">
            {tags.length} {pluralizeRU(tags.length, "группа", "группы", "групп")}
          </span>
      </div>
    </div>
  );
}
