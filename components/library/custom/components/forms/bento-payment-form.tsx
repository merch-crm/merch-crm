"use client";

import React, { useState } from "react";
import { CreditCard, ShieldCheck, Mail, Calendar, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "../../utils/cn";

export function BentoPaymentForm({ amount, className }: { amount: string; className?: string }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setIsSuccess(true);
    }, 2000);
  };

  return (
    <div className={cn(
      "bg-white dark:bg-zinc-950 text-slate-950 dark:text-zinc-50 shadow-premium border border-slate-200 dark:border-zinc-800 p-8 sm:p-10 rounded-[2.5rem] flex flex-col w-full max-w-md mx-auto relative overflow-hidden",
      className
    )}>
      <div className="relative z-10 w-full">
        <h2 className="text-2xl font-black  mb-2 text-center">Complete Payment</h2>
        <p className="text-sm font-medium text-slate-400 dark:text-zinc-500 mb-8 text-center max-w-xs mx-auto">
          Transaction for: <span className="text-slate-950 dark:text-white font-bold">{amount}</span>
        </p>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in-95 duration-500">
             <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-500 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={40} strokeWidth={2.5} />
             </div>
             <h3 className="text-2xl font-black mb-2">Payment Successful</h3>
             <p className="text-sm text-slate-400 dark:text-zinc-500 text-center font-medium max-w-xs px-2">
                Your order is confirmed. A receipt has been sent to your email.
             </p>
             <button type="button" className="mt-8 px-10 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all hover:shadow-xl active:scale-95 shadow-lg shadow-emerald-500/20">
                Return home
             </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-3">
              <div className="relative group">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 dark:text-zinc-700 group-focus-within:text-primary-base transition-colors" />
                <input 
                  type="text" 
                  placeholder="Card Number"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-zinc-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-base/20 transition-all outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 dark:text-zinc-700 group-focus-within:text-primary-base transition-colors" />
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-zinc-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-base/20 transition-all outline-none"
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 dark:text-zinc-700 group-focus-within:text-primary-base transition-colors" />
                  <input 
                    type="password" 
                    placeholder="CVC"
                    maxLength={4}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-zinc-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-base/20 transition-all outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-4 lg:py-5 rounded-2xl font-black text-xs   flex items-center justify-center gap-2 transition-all hover:shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="size-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
              ) : (
                 <>Authorize Payment <Lock size={14} /></>
              )}
            </button>

            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl text-center flex items-center justify-center gap-2">
               <ShieldCheck className="w-4 h-4 text-emerald-500" />
               <p className="text-[11px] font-black   text-emerald-600 dark:text-emerald-400">
                  Payments are secure and encrypted
               </p>
            </div>
            
            <div className="flex justify-center gap-3 py-2 grayscale opacity-40">
               <div className="w-10 h-6 bg-slate-200 dark:bg-zinc-800 rounded flex items-center justify-center text-[11px] font-bold">VISA</div>
               <div className="w-10 h-6 bg-slate-200 dark:bg-zinc-800 rounded flex items-center justify-center text-[11px] font-bold">MC</div>
               <div className="w-10 h-6 bg-slate-200 dark:bg-zinc-800 rounded flex items-center justify-center text-[11px] font-bold">AMEX</div>
            </div>
          </form>
        )}
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-base/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
    </div>
  );
}
