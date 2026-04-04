"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Phone, CheckCheck, User, Video, Smile, Paperclip, Send } from "lucide-react";
import { cn } from "@/components/library/custom/utils/cn";

/**
 * 1. BentoChatList - Список активных чатов с индикаторами
 */
export function BentoChatList() {
  const chats = [
    { name: "Alpha Group", msg: "When can we start?", time: "10m", unread: 2, status: "online", emoji: "🚀" },
    { name: "Veronika Sales", msg: "Sent the proposal.", time: "1h", unread: 0, status: "away", emoji: "💼" },
    { name: "Alex (Support)", msg: "Ticket #492 resolved.", time: "2h", unread: 5, status: "online", emoji: "✅" },
  ];

  return (
    <div className="w-full max-w-[300px] bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 relative group overflow-hidden">
      <div className="flex items-center justify-between mb-6">
         <h4 className="text-xs font-black text-gray-900   leading-none">Active Chats</h4>
         <div className="size-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 animate-pulse">
            <MessageSquare className="size-4 text-primary-base" />
         </div>
      </div>

      <div className="space-y-3 relative z-10">
         {chats.map((chat, i) => (
           <motion.div 
             key={i}
             whileHover={{ x: 5 }}
             className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all cursor-pointer group/row border border-transparent hover:border-gray-100"
           >
             <div className="relative shrink-0">
                <div className="size-10 rounded-full bg-white flex items-center justify-center text-lg shadow-sm border border-gray-100 group-hover/row:scale-110 transition-transform">
                   {chat.emoji}
                </div>
                <div className={cn("absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white", chat.status === 'online' ? "bg-emerald-500" : "bg-amber-500")} />
             </div>
             <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                   <p className="text-xs font-black text-gray-900 truncate">{chat.name}</p>
                   <span className="text-[11px] text-gray-400 font-bold">{chat.time}</span>
                </div>
                <p className="text-[11px] text-gray-500 truncate font-medium">{chat.msg}</p>
             </div>
             {chat.unread > 0 && (
               <div className="size-5 rounded-full bg-primary-base flex items-center justify-center text-[11px] font-black text-white shadow-lg shadow-primary-base/20">
                  {chat.unread}
               </div>
             )}
           </motion.div>
         ))}
      </div>
      
      <button type="button" className="w-full mt-6 py-3.5 bg-gray-950 text-white text-[11px] font-black   rounded-2xl hover:bg-gray-800 transition-colors shadow-xl shadow-gray-950/10">
         View all messages
      </button>
    </div>
  );
}

/**
 * 2. BentoMessageBubble - Реактивный пузырь сообщения
 */
export function BentoMessageBubble() {
  return (
    <div className="w-full max-w-sm bg-gray-50 rounded-[2.5rem] p-6 border border-gray-100 relative group overflow-hidden">
       <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-gray-100">
             <User className="size-5 text-gray-400" />
          </div>
          <div className="flex flex-col">
             <span className="text-xs font-black text-gray-900">Johnathan Doe</span>
             <span className="text-[11px] font-bold text-emerald-500">Typing...</span>
          </div>
       </div>

       <div className="space-y-3">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, x: -10 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            className="w-fit p-4 rounded-3xl bg-white border border-gray-200 shadow-sm relative"
          >
             <p className="text-sm font-medium text-gray-700 leading-relaxed">Could you please send the final contract draft for the Q2 project?</p>
             <div className="absolute -bottom-2 -left-1 w-4 h-4 bg-white border-l border-b border-gray-200 rotate-45" />
          </motion.div>

          <div className="flex justify-end">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, x: 10 }}
               animate={{ scale: 1, opacity: 1, x: 0 }}
               transition={{ delay: 1 }}
               className="w-fit p-4 rounded-[2rem] bg-gray-950 text-white shadow-xl shadow-gray-950/20 relative group/sent"
             >
                <div className="flex flex-col">
                   <p className="text-sm font-medium leading-relaxed">Sure thing! Attaching it now. 📋</p>
                   <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[11px] font-bold text-gray-500  ">14:22</span>
                      <CheckCheck className="size-3 text-primary-base" />
                   </div>
                </div>
                <div className="absolute -bottom-2 -right-1 w-4 h-4 bg-gray-950 rotate-45" />
             </motion.div>
          </div>
       </div>

       <div className="mt-8 flex items-center gap-2 p-2 bg-white rounded-2xl border border-gray-100 shadow-inner">
          <button type="button" className="p-2 text-gray-400 hover:text-gray-950"><Smile className="size-5" /></button>
          <input className="flex-1 bg-transparent border-none text-xs font-medium focus:ring-0 placeholder:text-gray-300" placeholder="Type message..." />
          <button type="button" className="size-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 hover:text-primary-base transition-all"><Paperclip className="size-5" /></button>
          <button type="button" className="size-10 rounded-xl bg-primary-base text-white flex items-center justify-center shadow-lg shadow-primary-base/20 hover:scale-105 active:scale-95 transition-all"><Send className="size-5" /></button>
       </div>
    </div>
  );
}

/**
 * 3. BentoCallCard - Виджет текущего звонка с волновым визуализатором
 */
export function BentoCallCard() {
  return (
    <div className="w-full max-w-[280px] bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6">
         <div className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
      </div>
      
      <div className="flex flex-col items-center gap-3 relative z-10">
         <div className="relative">
            <motion.div 
               animate={{ scale: [1, 1.1, 1] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="size-20 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center shadow-xl"
            >
               <User className="size-10 text-slate-500" />
            </motion.div>
            <div className="absolute -bottom-1 -right-1 bg-primary-base p-1.5 rounded-lg shadow-lg rotate-12"><Phone className="size-3 text-white fill-white" /></div>
         </div>

         <div className="text-center">
            <h4 className="text-lg font-black text-white font-heading truncate max-w-[200px]">Marcus Aurelius</h4>
            <div className="flex items-center justify-center gap-2 mt-1">
               <span className="text-[11px] font-black text-emerald-400  ">Active Call</span>
               <span className="text-[11px] font-bold text-slate-500">12:04</span>
            </div>
         </div>

         <div className="flex gap-3 items-center h-4">
            {[1, 2, 4, 3, 5, 2, 6, 1].map((h, i) => (
              <motion.div 
                key={i} 
                animate={{ height: [`${h * 4}px`, `${h * 8}px`, `${h * 4}px`] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                className="w-1 bg-emerald-500 rounded-full" 
              />
            ))}
         </div>

         <div className="flex gap-3 w-full">
            <button type="button" className="flex-1 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"><Phone className="size-6 rotate-[135deg]" /></button>
            <button type="button" className="flex-1 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"><Video className="size-6" /></button>
         </div>

      </div>

      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />
    </div>
  );
}
