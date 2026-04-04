"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/library/custom/utils/cn';
import { Heart, MessageSquare, Star } from 'lucide-react';

export function BentoNotificationStack() {
  const notifications = [
    { icon: Heart, title: 'New Like', desc: 'Sarah liked your proposal', color: 'text-pink-500', bg: 'bg-pink-50' },
    { icon: MessageSquare, title: 'Comment', desc: 'Alex commented on Deal #42', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Star, title: 'Deal Won', desc: 'Alpha Bank closed at $50k', color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="relative w-full max-w-xs h-[180px] flex justify-center items-end">
      {notifications.map((item, i) => (
        <motion.div
           key={i}
           initial={{ y: -20 * i, scale: 1 - i * 0.05, opacity: 1 - i * 0.2 }}
           whileHover={{ y: -20 * i - 5, scale: 1.02 - i * 0.05 }}
           className="absolute bottom-0 w-full rounded-[24px] bg-white border border-gray-100 shadow-xl p-4 flex items-center gap-3 cursor-pointer"
           style={{ zIndex: 10 - i }}
        >
           <div className={cn("size-10 rounded-full flex items-center justify-center shrink-0", item.bg, item.color)}>
             <item.icon className="size-5" />
           </div>
           <div className="flex flex-col">
              <span className="text-sm font-black text-gray-900">{item.title}</span>
              <span className="text-[11px] font-medium text-gray-500">{item.desc}</span>
           </div>
        </motion.div>
      ))}
    </div>
  );
}
