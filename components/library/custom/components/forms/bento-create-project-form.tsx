"use client";

import React, { useState } from "react";
import { FolderPlus, Settings, CheckCircle2, ChevronRight, Hash, Type, Users, Lock, LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import { BentoCard, BentoIconContainer, BentoInput } from "@/components/library/custom/ui/bento-primitives";

export function BentoCreateProjectForm({ className }: { className?: string }) {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState("");

  return (
    <BentoCard className={cn("p-8 sm:p-10 flex flex-col w-full max-w-lg mx-auto relative overflow-hidden", className)}>
      <div className="relative z-10 w-full">
        <div className="flex justify-between items-center mb-8">
           <div className="flex items-center gap-3">
              <BentoIconContainer className="size-10 bg-primary-base/10 text-primary-base">
                 <FolderPlus size={20} strokeWidth={2.5} />
              </BentoIconContainer>
              <div>
                 <h2 className="text-xl font-black leading-none">New Project</h2>
                 <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500   mt-1">Setup Workspace</p>
              </div>
           </div>
           <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    s === step ? "w-6 bg-primary-base" : "w-1.5 bg-slate-100 dark:bg-zinc-800"
                  )} 
                />
              ))}
           </div>
        </div>

        <div className="min-h-[220px]">
          {step === 1 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
               <div>
                  <label className="text-[11px] font-black   text-slate-400 ml-1 px-1">Project Identifier</label>
                  <BentoInput icon={Hash} placeholder="e.g. MK-2024" wrapperClassName="mt-2" />
               </div>
               <div>
                  <label className="text-[11px] font-black   text-slate-400 ml-1 px-1">Display Name</label>
                  <BentoInput 
                    icon={Type} 
                    placeholder="Project Name" 
                    value={projectName} 
                    onChange={(e) => setProjectName(e.target.value)} 
                    wrapperClassName="mt-2"
                  />
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
               <label className="text-[11px] font-black   text-slate-400 ml-1 px-1">Access Level</label>
               <div className="grid grid-cols-1 gap-3">
                  {[
                    { title: "Team Private", icon: Lock, desc: "Only invited members can access" },
                    { title: "Organization", icon: Users, desc: "Anyone in your workspace" }
                  ].map((opt, i) => {
                    const Icon = opt.icon as LucideIcon;
                    return (
                      <button 
                        key={i} 
                        type="button"
                        className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-xl hover:scale-[1.02] transition-all text-left"
                      >
                         <div className="size-10 rounded-xl bg-white dark:bg-zinc-800 border dark:border-zinc-700 flex items-center justify-center text-slate-400">
                            <Icon size={18} />
                         </div>
                         <div>
                            <div className="text-sm font-bold">{opt.title}</div>
                            <div className="text-[11px] font-medium text-slate-400">{opt.desc}</div>
                         </div>
                      </button>
                    );
                  })}
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in-95 duration-500">
               <div className="size-20 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-500 shadow-lg shadow-indigo-500/10 animate-bounce">
                  <Settings size={40} className="animate-spin-slow" />
               </div>
               <h3 className="text-2xl font-black mb-2">Creating Workspace</h3>
               <p className="text-sm text-slate-400 dark:text-zinc-500 font-medium px-4 text-center">
                  Provisioning resources and setting up permissions for <b>{projectName || "your project"}</b>.
               </p>
            </div>
          )}
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-zinc-800/50 flex justify-between items-center">
          <button 
            type="button"
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1 || step === 3}
            className="text-xs font-black   text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors disabled:opacity-0"
          >
            Previous
          </button>
          
          <button 
            type="button"
            onClick={() => step < 3 && setStep(step + 1)}
            className={cn(
              "px-10 py-3.5 rounded-2xl font-black text-xs   transition-all",
              step === 3 ? "bg-emerald-500 text-white" : "bg-slate-950 dark:bg-white text-white dark:text-slate-950",
              "hover:shadow-xl active:scale-95 disabled:opacity-30"
            )}
          >
            {step === 3 ? "Go to Project" : step === 2 ? "Finalize" : "Continue"}
          </button>
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-[6px] bg-slate-50 dark:bg-zinc-900">
         <div 
            className="h-full bg-primary-base transition-all duration-700 ease-in-out" 
            style={{ width: `${(step / 3) * 100}%` }}
         />
      </div>
    </BentoCard>
  );
}
