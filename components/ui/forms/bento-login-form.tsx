"use client";

import React, { useState, useEffect } from "react";
import { Mail, Chrome, ArrowRight, ShieldCheck, Key } from "lucide-react";
import { cn } from "@/lib/utils";

export function BentoLoginForm({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  if (!isMounted) {
    return (
      <div className="w-full max-w-md h-[520px] rounded-card bg-white border border-slate-100 animate-pulse shadow-premium p-10" />
    );
  }

  return (
    <div className={cn(
      "bg-white text-slate-950 shadow-premium border border-slate-100 p-10 sm:p-12 rounded-card flex flex-col w-full max-w-md mx-auto relative overflow-hidden group/card hover:border-primary-base transition-all duration-700",
      className
    )}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary-base/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover/card:bg-primary-base/10 transition-colors duration-700" />
      
      <div className="relative z-10 flex flex-col items-center mb-12">
        <div className="p-3 rounded-element bg-slate-50 border border-slate-100 mb-6 shadow-inner group-hover/card:scale-110 group-hover/card:rotate-3 transition-all duration-500">
          <ShieldCheck className="size-6 text-primary-base" />
        </div>
        <h2 className="text-[12px] font-black text-slate-900 tracking-widest leading-none mb-4">
          Авторизация
        </h2>
        <p className="text-[11px] font-black text-slate-400 tracking-wide text-center max-w-[240px] leading-relaxed">
          Инициализация защищенной сессии
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-10 relative z-10">
        <button 
          type="button" 
          aria-label="Аутентификация через Google"
          className="flex items-center justify-center gap-4 py-4 rounded-element border border-slate-100 bg-slate-50 text-[11px] font-black tracking-widest hover:bg-slate-950 hover:text-white hover:shadow-2xl transition-all duration-500 outline-none focus-visible:ring-2 focus-visible:ring-primary-base active:scale-[0.98]"
        >
          <Chrome className="size-4" /> Войти через Google
        </button>
      </div>

      <div className="relative mb-10 z-10">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-6 text-[10px] font-black text-slate-300 tracking-[0.2em]">ИЛИ</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-400 tracking-wider px-1 flex items-center gap-2" htmlFor="email">
            <Mail className="size-3" /> E-mail
          </label>
          <div className="relative group/input">
            <input 
              id="email"
              type="email" 
              autoComplete="email"
              placeholder="mail@merch-crm.ru"
              className="w-full px-6 py-5 bg-[#F8FAFC] border border-slate-100 rounded-element text-[11px] font-black tracking-wider focus:border-primary-base focus:bg-white transition-all outline-none shadow-inner placeholder:text-slate-300" 
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
             <label className="text-[11px] font-black text-slate-400 tracking-wider flex items-center gap-2" htmlFor="password">
               <Key className="size-3" /> Пароль
             </label>
             <button 
               type="button" 
               aria-label="Восстановить забытый пароль"
               className="text-[10px] font-black text-primary-base tracking-wide hover:text-slate-950 transition-colors outline-none focus-visible:underline underline-offset-4"
             >
               Забыли пароль?
             </button>
          </div>
          <div className="relative group/input">
            <input 
              id="password"
              type="password" 
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-6 py-5 bg-[#F8FAFC] border border-slate-100 rounded-element text-[11px] font-black tracking-wider focus:border-primary-base focus:bg-white transition-all outline-none shadow-inner placeholder:text-slate-300" 
              required
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          aria-label={isLoading ? "Выполняется вход..." : "Войти"}
          className={cn(
            "w-full py-6 mt-6 bg-slate-950 text-white rounded-element font-black text-[12px] tracking-widest flex items-center justify-center gap-4 transition-all hover:bg-primary-base hover:shadow-xl active:scale-[0.98] disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-primary-base border-0 shadow-xl shadow-slate-200",
            isLoading && "cursor-wait"
          )}
        >
          {isLoading ? (
            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Войти <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" /></>
          )}
        </button>
      </form>

      <div className="mt-12 text-center relative z-10 border-t border-slate-50 pt-8">
        <p className="text-[11px] font-black text-slate-400 tracking-wide">
          Нет аккаунта? <button type="button" aria-label="Создать новый аккаунт" className="text-primary-base hover:text-slate-950 transition-colors focus-visible:underline underline-offset-4 outline-none ml-1">Зарегистрироваться</button>
        </p>
      </div>

      <div className="absolute -bottom-24 -left-24 size-48 bg-indigo-500/5 rounded-full blur-3xl -z-0" />
    </div>
  );
}
