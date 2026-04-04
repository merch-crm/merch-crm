"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Mail, X, Plus, Users, ShieldCheck, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

export function BentoInviteTeamForm({ className }: { className?: string }) {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [role, setRole] = useState("member");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addEmail = () => {
    if (currentEmail && !emails.includes(currentEmail)) {
      setEmails([...emails, currentEmail]);
      setCurrentEmail("");
    }
  };

  const removeEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  if (!isMounted) {
    return <div className="w-full max-w-lg h-[400px] rounded-[40px] bg-white border border-slate-100 animate-pulse shadow-premium p-8" />;
  }

  return (
    <div className={cn(
      "bg-white text-slate-950 shadow-premium border border-slate-100 p-8 sm:p-10 rounded-[40px] flex flex-col w-full max-w-lg mx-auto relative overflow-hidden group/card hover:border-primary-base/30 transition-colors duration-500",
      className
    )}>
      <div className="relative z-10 w-full">
        <div className="flex items-center gap-4 mb-10">
           <div className="size-16 rounded-[28px] bg-primary-base/10 border border-primary-base/20 flex items-center justify-center text-primary-base rotate-3 group-hover/card:rotate-0 transition-transform duration-500 shadow-sm">
              <UserPlus size={28} />
           </div>
           <div>
              <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Assemble Team</h2>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-tight mt-2">Scale production together with ease.</p>
           </div>
        </div>

        <div className="space-y-4">
          <div className="relative group/input">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within/input:text-primary-base transition-colors" />
            <input 
              type="email" 
              placeholder="PARTNER@MERCHCRM.COM"
              aria-label="Partner email address"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEmail()}
              className="w-full pl-12 pr-16 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-tight focus:ring-4 focus:ring-primary-base/5 focus:border-primary-base transition-all outline-none shadow-inner placeholder:text-slate-200"
            />
            <button 
              type="button"
              aria-label="Add email to invite list"
              onClick={addEmail}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 size-11 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-800 hover:shadow-xl transition-all active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5 min-h-[48px] content-start">
            {emails.length === 0 && (
               <p className="text-[11px] font-black text-slate-200 uppercase tracking-widest py-3 ml-1">No recipients added yet</p>
            )}
            {emails.map((email) => (
              <div key={email} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl group/tag animate-in zoom-in-95 duration-300 hover:border-slate-200 hover:bg-white transition-all shadow-sm">
                <span className="text-[11px] font-black uppercase tracking-tight text-slate-700">{email}</span>
                <button 
                  type="button" 
                  aria-label={`Remove ${email}`}
                  onClick={() => removeEmail(email)} 
                  className="text-slate-300 hover:text-rose-500 transition-colors p-1 -mr-1 outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-lg"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2 px-1">
               <ShieldCheck size={14} className="text-slate-300" />
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Access Level</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {[
                 { id: 'member', label: 'MEMBER' },
                 { id: 'admin', label: 'ADMIN' }
               ].map((r) => (
                 <button 
                  type="button"
                  key={r.id}
                  aria-pressed={role === r.id}
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "py-4 rounded-2xl border-2 transition-all text-[11px] font-black uppercase tracking-widest outline-none",
                    role === r.id 
                      ? "border-primary-base bg-primary-base/5 text-primary-base shadow-lg shadow-primary-base/5" 
                      : "border-slate-50 bg-slate-50 text-slate-300 hover:border-slate-100 hover:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary-base"
                  )}
                 >
                    {r.label}
                 </button>
               ))}
            </div>
          </div>
        </div>

        <button 
          type="button"
          disabled={emails.length === 0}
          className="w-full mt-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:bg-slate-800 hover:shadow-2xl active:scale-95 disabled:opacity-20 disabled:pointer-events-none outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20"
        >
          {emails.length > 0 ? (
            <>Send {emails.length} Invite{emails.length === 1 ? '' : 's'} <ChevronRight size={14} /></>
          ) : (
            "Add recipients above"
          )}
        </button>
      </div>

      <div className="absolute -bottom-24 -left-24 size-48 bg-primary-base/5 rounded-full blur-3xl -z-0" />
      <div className="absolute top-12 right-6 opacity-[0.03] pointer-events-none -rotate-12">
         <Users size={120} />
      </div>
    </div>
  );
}
