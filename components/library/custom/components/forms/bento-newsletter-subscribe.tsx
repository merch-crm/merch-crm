"use client";

import React, { useState } from "react";
import { Mail, Sparkles, Send } from "lucide-react";
import { cn } from "../../utils/cn";

export function BentoNewsletterSubscribe({ className }: { className?: string }) {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setSubscribed(true);
  };

  if (!isMounted) {
    return <div className={cn("bg-white dark:bg-zinc-950 min-h-[400px] rounded-[2.5rem] animate-pulse border border-slate-200 dark:border-zinc-800", className)} />;
  }

  return (
    <div className={cn(
      "bg-white dark:bg-zinc-950 text-slate-950 dark:text-zinc-50 shadow-premium border border-slate-200 dark:border-zinc-800 p-8 rounded-[2.5rem] flex flex-col items-center text-center w-full max-w-md mx-auto relative overflow-hidden group",
      className
    )}>
      <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-primary-base/10 via-primary-base/5 to-transparent pointer-events-none transition-all duration-700 group-hover:from-primary-base/15" />
      
      <div className="relative z-10 w-full pt-4">
        <div className="w-16 h-16 rounded-[1.5rem] bg-primary-base/20 border border-primary-base/30 flex items-center justify-center mx-auto mb-6 text-primary-base shadow-sm ring-4 ring-primary-base/5">
          <Mail size={32} strokeWidth={1.5} />
        </div>
        
        <h2 className="text-3xl font-black  mb-3">Будьте в курсе</h2>
        <p className="text-sm font-medium text-slate-400 dark:text-zinc-500 mb-8 max-w-xs mx-auto">
          Еженедельные обновления о трендах производства и советы от экспертов CRM.
        </p>

        {subscribed ? (
          <div className="bg-primary-base/10 dark:bg-primary-base/20 border border-primary-base/20 rounded-2xl p-4 flex items-center gap-3 animate-in zoom-in-95 duration-500">
            <Sparkles className="text-primary-base size-5 animate-pulse" />
            <span className="text-sm font-bold text-primary-base">Вы в списке! Добро пожаловать!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            <div className="relative group/input">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 dark:text-zinc-700 group-focus-within/input:text-primary-base transition-colors" />
              <input 
                type="email" 
                placeholder="mail@merchcrm.ru" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-zinc-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-base/20 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-700"
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-4 bg-primary-base text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all hover:shadow-xl active:scale-95 shadow-lg shadow-primary-base/20",
                isLoading && "opacity-80 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  Подписаться <Send size={14} aria-hidden="true" />
                </>
              )}
            </button>
            <p className="text-[11px] font-bold text-slate-300 dark:text-zinc-700  ">
              Никакого спама. Отписка в любой момент.
            </p>
          </form>
        )}
      </div>

      <div className="absolute -bottom-12 -right-12 size-32 bg-primary-base/10 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
}
