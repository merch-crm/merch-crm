"use client";

import React, { useState } from "react";
import { Briefcase, Building, Code, User } from "lucide-react";
import { cn } from "../../utils/cn";

export function BentoOnboardingSurvey({ className }: { className?: string }) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    { id: "dev", icon: Code, title: "Developer", desc: "I write code and build." },
    { id: "design", icon: User, title: "Designer", desc: "I create UI/UX experiences." },
    { id: "pm", icon: Briefcase, title: "Manager", desc: "I oversee projects." },
    { id: "exec", icon: Building, title: "Executive", desc: "I run the business." },
  ];

  return (
    <div className={cn(
      "bg-white dark:bg-zinc-950 text-slate-950 dark:text-zinc-50 shadow-premium border border-slate-200 dark:border-zinc-800 p-8 sm:p-12 rounded-[2.5rem] flex flex-col w-full max-w-2xl mx-auto relative overflow-hidden",
      className
    )}>
      <div className="relative z-10">
        <h2 className="text-3xl font-black  mb-3 text-center bg-clip-text text-transparent bg-gradient-to-b from-slate-950 to-slate-500 dark:from-white dark:to-zinc-500">
          What describes you best?
        </h2>
        <p className="text-sm font-medium text-slate-400 dark:text-zinc-500 mb-10 text-center max-w-sm mx-auto">
          This helps us personalize your experience to match your professional workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
        {roles.map((role) => (
          <button 
            type="button"
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={cn(
              "group relative p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center text-center",
              "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
              selectedRole === role.id 
                ? "border-primary-base bg-primary-base/5 shadow-premium text-primary-base" 
                : "border-slate-100 dark:border-zinc-800 hover:border-primary-base/30 bg-slate-50/50 dark:bg-zinc-900/50"
            )}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl mb-4 flex items-center justify-center transition-all duration-500",
              selectedRole === role.id 
                ? "bg-primary-base text-white shadow-lg shadow-primary-base/40 rotate-6" 
                : "bg-white dark:bg-zinc-800 text-slate-400 group-hover:text-primary-base group-hover:shadow-md"
            )}>
              <role.icon className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg mb-2">{role.title}</h3>
            <p className="text-[11px] font-medium leading-relaxed opacity-60">
              {role.desc}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-slate-100 dark:border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center gap-3 relative z-10">
        <button type="button" className="text-sm font-bold text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors">
          Skip for now
        </button>
        <button 
          type="button"
          disabled={!selectedRole}
          className={cn(
            "w-full sm:w-auto px-10 py-3.5 rounded-2xl font-black text-xs   transition-all",
            "bg-slate-950 dark:bg-white text-white dark:text-slate-950",
            "hover:shadow-xl active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
          )}
        >
          Continue
        </button>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-base/20 to-transparent" />
    </div>
  );
}
