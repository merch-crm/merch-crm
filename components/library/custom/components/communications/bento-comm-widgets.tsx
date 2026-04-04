"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MessageSquare, Send, Paperclip, Play, Pause, Mic, Smile, TrendingUp } from "lucide-react";
import { cn } from "@/components/library/custom/utils/cn";

/**
 * 4. BentoEmailComposer - Минималистичный редактор писем с эффектом стекла
 */
export function BentoEmailComposer() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full max-w-sm h-80 bg-gray-50 animate-pulse rounded-[2.5rem]" />;
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 relative group overflow-hidden">
      <div className="flex items-center justify-between mb-6">
         <h4 className="text-xs font-black text-gray-900   leading-none">Draft Email</h4>
         <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 text-[11px] font-black text-amber-600 border border-amber-100">
            Autosaved 14:42
         </div>
      </div>


      <div className="space-y-3 relative z-10">
         <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
            <span className="text-[11px] font-black text-gray-400 ">To:</span>
            <div className="px-2 py-1 bg-primary-base/10 text-primary-base rounded-lg text-[11px] font-bold">victor@alpha.com</div>
         </div>
         <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
            <span className="text-[11px] font-black text-gray-400 ">Sub:</span>
            <input aria-label="Email Subject" className="flex-1 bg-transparent border-none text-[11px] font-bold text-gray-900 focus:ring-0 p-0" defaultValue="Project Q2 Proposal" />
         </div>
         <textarea 
            aria-label="Email Body"
            className="w-full h-32 bg-gray-50/50 rounded-2xl p-4 border border-gray-100 text-xs font-medium focus:ring-1 focus:ring-primary-base/20 resize-none"
            placeholder="Write your email here..."
            defaultValue="Hi Victor, Attached is the draft for the Q2 Merch project. Let me know what you think!"
         />
      </div>

      <div className="mt-6 flex items-center justify-between">
         <div className="flex gap-2">
            <button 
              type="button" 
              aria-label="Attach File"
              className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-950 transition-colors"
            >
              <Paperclip className="size-4" />
            </button>
            <button 
              type="button" 
              aria-label="Insert Emoji"
              className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-950 transition-colors"
            >
              <Smile className="size-4" />
            </button>
         </div>
         <button type="button" className="flex items-center gap-2 px-6 py-2.5 bg-primary-base text-white text-[11px] font-black   rounded-xl shadow-lg shadow-primary-base/30 active:scale-95 transition-transform">
            Send Email <Send className="size-3" />
         </button>
      </div>
      
      <div className="absolute -top-10 -right-10 size-32 bg-primary-base/5 rounded-full blur-2xl group-hover:bg-primary-base/10 transition-colors duration-700" />
    </div>
  );
}

/**
 * 5. BentoContactChip - Расширяемая карточка контакта
 */
export function BentoContactChip() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-64 h-14 bg-gray-50 animate-pulse rounded-full" />;
  }

  return (
    <div className="w-fit flex items-center bg-white rounded-full border border-gray-100 shadow-sm p-1.5 hover:shadow-md transition-shadow cursor-default group">
       <div className="relative">
          <div className="size-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xs group-hover:rotate-12 transition-transform duration-500">
             MV
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 border-2 border-white" />
       </div>
       <div className="px-4 flex flex-col">
          <span className="text-sm font-black text-gray-900 truncate max-w-[120px]">Veronika Sales</span>
          <span className="text-[11px] font-bold text-gray-400">Head of Merch</span>
       </div>
       <div className="pr-1.5 pl-2 flex gap-1">
          <button type="button" aria-label="Call contact" className="size-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-primary-base hover:text-white transition-all"><Phone className="size-3.5" /></button>
          <button type="button" aria-label="Message contact" className="size-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"><MessageSquare className="size-3.5" /></button>
       </div>
    </div>
  );
}

/**
 * 6. BentoOmniChannel - 3D-селектор каналов связи
 */
export function BentoOmniChannel() {
  const [active, setActive] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-[240px] h-64 bg-gray-50 animate-pulse rounded-[2rem]" />;
  }

  const channels = [
    { icon: <MessageSquare />, name: "WhatsApp", color: "text-emerald-500", bg: "bg-emerald-50" },
    { icon: <Mail />, name: "Email", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: <Phone />, name: "SIP Phone", color: "text-amber-500", bg: "bg-amber-50" },
  ];

  return (
    <div className="w-full max-w-[240px] bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 relative group overflow-hidden">
      <h4 className="text-[11px] font-black text-gray-400   text-center mb-6">Omni-Channel UI</h4>
      
      <div className="flex flex-col gap-2 relative z-10">
          {channels.map((ch, i) => (
            <motion.button
              key={i}
              type="button"
              aria-label={`Select ${ch.name} channel`}
              onClick={() => setActive(i)}
              whileHover={{ x: 5 }}
              animate={{ scale: active === i ? 1.05 : 1, opacity: active === i ? 1 : 0.6 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300",
                active === i ? "bg-white shadow-xl border-gray-100" : "bg-gray-50/50 border-transparent grayscale"
              )}
            >
              <div aria-hidden="true" className={cn("size-8 rounded-xl flex items-center justify-center", active === i ? ch.bg : "bg-gray-100")}>
                {React.cloneElement(ch.icon as React.ReactElement<{ size: number; className: string }>, { 
                  size: 16, 
                  className: active === i ? ch.color : "text-gray-400" 
                })}
              </div>
              <span className={cn("text-xs font-black", active === i ? "text-gray-950" : "text-gray-400")}>{ch.name}</span>
            </motion.button>
          ))}
      </div>
    </div>
  );
}

/**
 * 8. BentoVoiceNote - Виджет голосового сообщения с волной
 */
export function BentoVoiceNote() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full max-w-sm h-40 bg-gray-900 animate-pulse rounded-[2rem]" />;
  }
  
  return (
    <div className="w-full max-w-sm bg-gray-950 rounded-[2rem] p-5 shadow-xl relative group overflow-hidden">
       <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div aria-hidden="true" className="size-10 rounded-full bg-white/10 flex items-center justify-center text-white ring-1 ring-white/20">
                <Mic className="size-5" />
             </div>
             <div>
                <span className="text-[11px] font-black text-white/50  ">Voice Note</span>
                <p className="text-xs font-bold text-white">Project Briefing</p>
             </div>
          </div>
          <span className="text-[11px] font-black text-primary-base animate-pulse ">01:42</span>
       </div>

       <div className="flex items-center gap-3 py-2">
          <button 
            type="button"
            aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
            onClick={() => setIsPlaying(!isPlaying)}
            className="size-12 rounded-2xl bg-white text-gray-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
          >
             {isPlaying ? <Pause className="size-6 fill-gray-950" /> : <Play className="size-6 fill-gray-950 translate-x-0.5" />}
          </button>
          
          <div className="flex-1 flex items-center gap-1 h-8 overflow-hidden" aria-hidden="true">
            {[2, 4, 3, 5, 2, 6, 4, 3, 5, 2, 1, 4, 3, 5, 2, 6, 4, 3, 5, 2, 1, 4].map((h, i) => (
               <motion.div 
                 key={i} 
                 animate={isPlaying ? { height: [`${h * 4}px`, `${h * 8}px`, `${h * 4}px`] } : { height: `${h * 4}px` }}
                 transition={{ repeat: Infinity, duration: 1, delay: i * 0.05 }}
                 className={cn("w-1 rounded-full", isPlaying && i < 8 ? "bg-primary-base" : "bg-white/20")} 
               />
            ))}
          </div>
       </div>

       <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <TrendingUp className="size-20 text-white" />
       </div>
    </div>
  );
}
