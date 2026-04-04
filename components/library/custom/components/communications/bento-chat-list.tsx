"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from "next/image";
import { cn } from '@/components/library/custom/utils/cn';

interface Chat {
  id: string;
  name: string;
  message: string;
  time: string;
  unread?: number;
  online?: boolean;
}

export function BentoChatList({ chats = [] }: { chats?: Chat[] }) {
  const [activeChat, setActiveChat] = useState<string | null>(chats[0]?.id || null);

  return (
    <div className="w-full max-w-sm rounded-[27px] bg-white border border-gray-100 shadow-crm-md p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="text-sm font-black text-gray-900">Messages</h3>
        <span className="text-[11px] font-bold text-gray-400  ">{chats.length} Active</span>
      </div>
      <div className="flex flex-col gap-1">
        {chats.map((chat) => (
          <motion.button
            key={chat.id}
            type="button"
            whileHover={{ scale: 0.98 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveChat(chat.id)}
            className={cn(
              "relative flex w-full items-center justify-between p-3 rounded-[20px] cursor-pointer transition-colors text-left",
              activeChat === chat.id ? "bg-primary-base text-white" : "hover:bg-gray-50 bg-transparent text-gray-950"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold overflow-hidden">
                  <Image 
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${chat.name}`} 
                    alt={chat.name} 
                    width={40} 
                    height={40} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                {chat.online && (
                  <div className="absolute top-0 right-0 size-3 rounded-full bg-emerald-500 border-2 border-white" />
                )}
              </div>
              <div className="flex flex-col">
                <span className={cn("text-sm font-bold leading-tight", activeChat === chat.id ? "text-white" : "text-gray-900")}>
                  {chat.name}
                </span>
                <span className={cn("text-xs font-medium truncate max-w-[140px]", activeChat === chat.id ? "text-primary-base/20 opacity-80" : "text-gray-500")}>
                  {chat.message}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={cn("text-[11px] font-bold", activeChat === chat.id ? "text-primary-base/20 opacity-80" : "text-gray-400")}>
                {chat.time}
              </span>
              {chat.unread && chat.unread > 0 && (
                <div className={cn("size-5 rounded-full flex flex-col items-center justify-center text-[11px] font-black", activeChat === chat.id ? "bg-white text-primary-base" : "bg-red-500 text-white")}>
                  {chat.unread}
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
