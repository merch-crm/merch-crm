"use client";

import React, { useState } from "react";
import { User, Mail, Send, CheckCircle2, Building, Phone } from "lucide-react";
import { cn } from "../../utils/cn";
import { inputStyles, textAreaStyles, BentoInput, BentoFormField } from "@/components/library/custom/ui/bento-primitives";

export function BentoContactForm({ className }: { className?: string }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className={cn(
      "bg-white dark:bg-zinc-950 text-slate-950 dark:text-zinc-50 shadow-premium border border-slate-200 dark:border-zinc-800 p-8 sm:p-10 rounded-[3rem] flex flex-col w-full max-w-lg mx-auto relative overflow-hidden",
      className
    )}>
      <div className="relative z-10 w-full">
        <div className="flex flex-col items-center text-center mb-10">
          <h2 className="text-3xl font-black  mb-2 bg-clip-text text-transparent bg-gradient-to-b from-slate-950 to-slate-500 dark:from-white dark:to-zinc-500">
            Let&apos;s talk
          </h2>
          <p className="text-sm font-medium text-slate-400 dark:text-zinc-500 max-w-xs px-4">
            Have a question? Our team is ready to help you grow.
          </p>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 animate-in slide-in-from-bottom-5 duration-700">
             <div className="w-20 h-20 rounded-[2.5rem] bg-primary-base/10 border border-primary-base/20 flex items-center justify-center mb-6 text-primary-base shadow-lg shadow-primary-base/10 rotate-3">
                <CheckCircle2 size={40} strokeWidth={2.5} />
             </div>
             <h3 className="text-2xl font-black mb-2">Message Sent!</h3>
             <p className="text-sm text-slate-400 dark:text-zinc-500 text-center font-medium max-w-sm px-6">
                We&apos;ve received your request and will get back to you within 24 hours.
             </p>
             <button 
               type="button"
               onClick={() => setIsSuccess(false)}
               className="mt-8 px-8 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black text-xs   transition-all hover:shadow-xl active:scale-95"
             >
                Send another
             </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <div className="space-y-3">
                  <BentoInput icon={User} placeholder="Full Name" required />
                  <BentoInput icon={Mail} type="email" placeholder="Email Address" required />
               </div>
               <div className="space-y-3">
                  <BentoInput icon={Building} placeholder="Company" />
                  <BentoInput icon={Phone} type="tel" placeholder="Phone" />
               </div>
            </div>

            <div className="relative group px-1">
               <textarea 
                  placeholder="How can we help you?"
                  className={textAreaStyles}
                  required
               />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-5 rounded-2xl font-black text-xs   flex items-center justify-center gap-2 transition-all hover:shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="size-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
              ) : (
                <>Send Message <Send size={14} /></>
              )}
            </button>

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pt-6">
               <div className="flex items-center gap-2 text-[11px] font-black   text-slate-400">
                  <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Support Online
               </div>
               <div className="flex items-center gap-2 text-[11px] font-black   text-slate-400">
                  Avg. response: 2h
               </div>
            </div>
          </form>
        )}
      </div>

      <div className="absolute top-0 right-[-10%] w-[40%] h-[30%] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[30%] bg-primary-base/5 rounded-full blur-[80px] pointer-events-none" />
    </div>
  );
}
