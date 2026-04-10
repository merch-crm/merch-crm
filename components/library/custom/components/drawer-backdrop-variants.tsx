"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, GripHorizontal } from "lucide-react";

export function DrawerBackdropVariants() {
  const [openVariant, setOpenVariant] = useState<string | null>(null);
  const variants = ["opaque", "blur", "transparent"] as const;

  const backdropClasses = {
    opaque: "bg-slate-900/80",
    blur: "bg-white/10 backdrop-blur-xl",
    transparent: "bg-transparent"
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {variants.map((variant) => (
        <React.Fragment key={variant}>
          <Button variant="solid" color="neutral" className="rounded-full px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold capitalize transition-all active:scale-95" onClick={() => setOpenVariant(variant)}
          >
            {variant}
          </Button>

          {openVariant === variant && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
               {/* Backdrop */}
               <button 
                 type="button"
                 aria-label="Закрыть"
                 className={cn("absolute inset-0 transition-all border-none outline-none", backdropClasses[variant])} 
                 onClick={() => setOpenVariant(null)} 
               />
               
               {/* Content */}
               <div className="relative w-full max-w-sm bg-white rounded-t-[3rem] sm:rounded-[3rem] shadow-3xl overflow-hidden animate-in slide-in-from-bottom-1/2 duration-500 border border-border">
                  <div className="flex flex-col p-8">
                     <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6" />
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black  text-slate-900 capitalize">
                          Backdrop: {variant}
                        </h3>
                        <button 
                          type="button"
                          aria-label="Закрыть модальное окно"
                          onClick={() => setOpenVariant(null)}
                          className="size-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
                        >
                          <X className="size-5 text-slate-500" />
                        </button>
                     </div>
                     <div className="space-y-3">
                        <p className="text-slate-500 leading-relaxed font-medium">
                          This drawer uses the <code className="px-1.5 py-0.5 rounded-md bg-slate-100 font-bold text-slate-900">{variant}</code> backdrop variant to create a premium overlay effect.
                        </p>
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                           <div className="size-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                              <GripHorizontal className="size-5" />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-emerald-900">Adaptive Detail</p>
                              <p className="text-xs text-emerald-600">Smooth animations included.</p>
                           </div>
                        </div>
                     </div>
                     <Button className="w-full mt-10 rounded-2xl h-14 text-lg font-black bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={() => setOpenVariant(null)}
                     >
                       Close
                     </Button>
                  </div>
               </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
