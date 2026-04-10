"use client";

import React, { useState, useEffect } from "react";
import { Star, Smile, MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function BentoFeedbackForm({ className }: { className?: string }) {
  const [rating, setRating] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  const handleRating = (r: number) => {
    setRating(r);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (!isMounted) {
    return <div className={cn("bg-white dark:bg-zinc-950 min-h-[480px] rounded-card animate-pulse border border-slate-200 dark:border-zinc-800", className)} />;
  }

  return (
    <div className={cn(
      "bg-white dark:bg-zinc-950 text-slate-950 dark:text-zinc-50 shadow-premium border border-slate-200 dark:border-zinc-800 p-8 sm:p-10 rounded-card flex flex-col w-full max-w-md mx-auto relative overflow-hidden",
      className
    )}>
      <div className="relative z-10 w-full text-center">
        <h2 className="text-2xl font-black  mb-2">We value your input</h2>
        <p className="text-sm font-medium text-slate-400 dark:text-zinc-500 mb-8 max-w-[240px] mx-auto">
          How was your experience with MerchCRM today?
        </p>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in-95 duration-500">
             <div className="w-16 h-16 rounded-element bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-500 shadow-lg shadow-amber-500/10">
                <Smile size={32} strokeWidth={2.5} />
             </div>
             <h3 className="text-2xl font-black mb-2">Thank you!</h3>
             <p className="text-sm text-slate-400 dark:text-zinc-500 font-medium px-4">
                Your feedback helps us build a better CRM for everyone.
             </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex justify-between max-w-[260px] mx-auto">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate ${star} stars out of 5`}
                  onClick={() => handleRating(star)}
                  className={cn(
                    "p-3 rounded-element transition-all duration-300 relative group",
                    (rating || 0) >= star ? "text-amber-500 scale-110 shadow-lg shadow-amber-500/10 bg-amber-50/50" : "text-slate-200 dark:text-zinc-800 hover:text-slate-400 dark:hover:text-zinc-600"
                  )}
                >
                  <Star size={28} fill={(rating || 0)>= star ? "currentColor" : "none"} 
                    className={cn(
                        "transition-all",
                        isAnimating && (rating === star) && "animate-ping"
                    )}
                    aria-hidden="true"
                  />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[11px] font-black py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {star === 1 ? 'Poor' : star === 5 ? 'Amazing!' : star}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative group space-y-2">
               <div className="flex items-center gap-2 mb-1 px-1 ml-1">
                  <MessageSquare size={14} className="text-slate-300" />
                  <span className="text-[11px] font-black   text-slate-400">Your thoughts</span>
               </div>
               <textarea 
                  placeholder="Tell us what you liked or what we can improve..."
                  className="w-full min-h-[120px] p-4 bg-slate-50 dark:bg-zinc-900 border-none rounded-element text-sm font-bold focus:ring-2 focus:ring-primary-base/10 transition-all outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-zinc-700"
               />
            </div>

            <button 
              type="submit"
              disabled={rating === null}
              className="w-full py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-element font-black text-xs   flex items-center justify-center gap-2 transition-all hover:shadow-xl active:scale-95 disabled:opacity-30 disabled:grayscale"
            >
              Send Feedback <Send size={14} />
            </button>
          </form>
        )}
      </div>

      <div className="absolute -top-12 -left-12 size-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
    </div>
  );
}
