"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/library/custom/utils/cn';
import { MessageSquare, Mail, Phone, MessageCircle } from 'lucide-react';

export function BentoOmniChannel() {
  const channels = [
    { icon: Mail, label: 'Email', count: 4, color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: MessageCircle, label: 'WhatsApp', count: 12, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: MessageSquare, label: 'Telegram', count: 2, color: 'text-sky-500', bg: 'bg-sky-50' },
    { icon: Phone, label: 'Calls', count: 0, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md overflow-hidden">
      <div className="p-5 border-b border-gray-50 flex items-center justify-between">
         <h3 className="text-sm font-black text-gray-900">Omnichannel Inbox</h3>
         <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-black">18 UNREAD</span>
      </div>
      <div className="grid grid-cols-2 p-2 gap-2">
         {channels.map((channel, i) => (
           <motion.div 
             key={i}
             whileHover={{ scale: 0.98 }}
             whileTap={{ scale: 0.95 }}
             className={cn("p-4 rounded-[24px] border border-gray-50 cursor-pointer flex flex-col gap-3", channel.bg)}
           >
              <div className="flex items-center justify-between">
                 <div className={cn("p-2 rounded-xl bg-white shadow-sm", channel.color)}>
                    <channel.icon className="size-5" />
                 </div>
                 {channel.count > 0 && (
                   <span className={cn("text-lg font-black", channel.color)}>{channel.count}</span>
                 )}
              </div>
              <span className="text-sm font-bold text-gray-700">{channel.label}</span>
           </motion.div>
         ))}
      </div>
    </div>
  );
}
