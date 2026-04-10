"use client";

import React, { useState, useEffect } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function CustomAlertTrigger() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full max-w-sm h-20 rounded-card bg-slate-900/5 animate-pulse" />
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button 
          type="button"
          aria-label="Запустить последовательность удаления данных"
          className="group flex items-center gap-4 rounded-card bg-slate-950 p-5 shadow-premium select-none hover:bg-slate-900 transition-all border border-white/5 w-full max-w-sm text-left outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20 active:scale-[0.98] duration-500"
        >
          <div className="flex size-14 shrink-0 items-center justify-center rounded-element bg-rose-500/10 text-rose-500 transition-all duration-500 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white shadow-inner">
            <Trash2 className="size-6" />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-1">
            <p className="text-[11px] font-black text-white tracking-[0.2em] leading-none">Удалить ресурс</p>
            <p className="text-[10px] font-black text-rose-500/60 tracking-widest leading-none">Безвозвратное удаление</p>
          </div>
        </button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="sm:max-w-[440px] bg-slate-950 border border-white/10 rounded-card p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <AlertDialogHeader className="relative z-10">
          <div className="flex size-16 items-center justify-center rounded-card bg-rose-500/10 text-rose-500 mb-6 shadow-inner border border-rose-500/10">
            <AlertTriangle className="size-8 animate-pulse" />
          </div>
          <AlertDialogTitle className="text-[14px] font-black text-white tracking-[0.3em] leading-tight">Требуется подтверждение</AlertDialogTitle>
          <AlertDialogDescription className="text-[11px] font-black text-slate-400 tracking-widest pt-4 leading-relaxed">
            Вы собираетесь начать процедуру безвозвратного удаления этого ресурса. Это действие обойдет стандартное кэширование и приведет к немедленному стиранию данных. Желаете продолжить?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="mt-12 gap-3 relative z-10 sm:flex-row flex-col">
          <AlertDialogCancel type="button" className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-element text-[11px] font-black tracking-[0.2em] py-5 outline-none focus:ring-4 focus:ring-white/10 transition-all">
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction type="button" className="flex-1 bg-rose-500 hover:bg-rose-600 text-white border-0 rounded-element text-[11px] font-black tracking-[0.2em] py-5 shadow-2xl shadow-rose-500/40 active:scale-95 outline-none focus:ring-4 focus:ring-rose-500/30 transition-all">
            Подтвердить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
