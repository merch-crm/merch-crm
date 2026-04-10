"use client";

import React, { useState, useEffect } from "react";
import { Github, Mail, Chrome, Lock, ArrowRight, ShieldCheck, Key } from "lucide-react";
import { cn } from "../../utils/cn";
import { BentoFormField, BentoInput } from "../../ui/bento-primitives";

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
      <div className="w-full max-w-md h-[520px] rounded-[48px] bg-white border border-slate-100 animate-pulse shadow-premium p-10" />
    );
  }

  return (
    <div className={cn(
      "bg-white text-slate-950 shadow-premium border border-slate-100 p-10 sm:p-12 rounded-[48px] flex flex-col w-full max-w-md mx-auto relative overflow-hidden group/card hover:border-primary-base/30 transition-all duration-700",
      className
    )}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary-base/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover/card:bg-primary-base/10 transition-colors duration-700" />
      
      <div className="relative z-10 flex flex-col items-center mb-12">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-6 shadow-inner group-hover/card:scale-110 group-hover/card:rotate-3 transition-all duration-500">
          <ShieldCheck className="size-6 text-primary-base" />
        </div>
        <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none mb-4">
          Identity Vault
        </h2>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center max-w-[240px] leading-relaxed">
          Initialize secure session authentication sequence.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-10 relative z-10">
        <button 
          type="button" 
          aria-label="Authenticate via Global Google Identity"
          className="flex items-center justify-center gap-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-950 hover:text-white hover:shadow-2xl transition-all duration-500 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10 active:scale-[0.98]"
        >
          <Chrome className="size-4" /> Nexus Connect
        </button>
      </div>

      <div className="relative mb-10 z-10">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-6 text-[10px] font-black text-slate-200 uppercase tracking-[0.4em]">OR</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <BentoFormField label="Root Access">
          <BentoInput 
            id="email"
            type="email" 
            autoComplete="email"
            placeholder="NAME@ALPHA.SYSTEM"
            required
          />
        </BentoFormField>

        <BentoFormField 
          label="Cipher Key"
          className="relative"
        >
          <div className="absolute top-0 right-2">
            <button 
              type="button" 
              aria-label="Recover forgotten password"
              className="text-[10px] font-black text-primary-base uppercase tracking-widest hover:text-slate-950 transition-colors outline-none focus-visible:underline underline-offset-4"
            >
              Recover?
            </button>
          </div>
          <BentoInput 
            id="password"
            type="password" 
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </BentoFormField>

        <button 
          type="submit"
          disabled={isLoading}
          aria-label={isLoading ? "Processing authentication batch..." : "Commit authentication sequence"}
          className={cn(
            "w-full py-6 mt-6 bg-slate-950 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all hover:bg-primary-base hover:shadow-2xl hover:shadow-primary-base/40 active:scale-[0.98] disabled:opacity-50 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20 border-0 shadow-2xl shadow-black/20",
            isLoading && "cursor-wait"
          )}
        >
          {isLoading ? (
            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Transmit <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" /></>
          )}
        </button>
      </form>

      <div className="mt-12 text-center relative z-10 border-t border-slate-50 pt-8">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
          No Matrix Access? <button type="button" aria-label="Create a new account" className="text-primary-base hover:text-slate-950 transition-colors focus-visible:underline underline-offset-4 outline-none">Register Unit</button>
        </p>
      </div>

      <div className="absolute -bottom-24 -left-24 size-48 bg-indigo-500/5 rounded-full blur-3xl -z-0" />
    </div>
  );
}
