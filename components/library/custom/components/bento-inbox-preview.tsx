"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { cn } from "../utils/cn";

interface Message {
  id: string;
  sender: string;
  avatar: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
}

interface BentoInboxPreviewProps {
  className?: string;
  messages?: Message[];
}

const defaultMessages: Message[] = [
  {
    id: "1",
    sender: "Anna Ridz",
    avatar: "AR",
    subject: "Contract Approval",
    preview: "I have reviewed the final draft of the XYZ proposal. We are good to go ahead with...",
    time: "10:14 AM",
    unread: true,
  },
  {
    id: "2",
    sender: "Max Petrov",
    avatar: "MP",
    subject: "Meeting Notes",
    preview: "Quick recap from our alignment session earlier today. Key takeaways include...",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "3",
    sender: "System",
    avatar: "S",
    subject: "Weekly Report",
    preview: "Here is your automated weekly summary of the pipeline targets and metrics.",
    time: "Oct 12",
    unread: false,
  },
];

export function BentoInboxPreview({ className, messages = defaultMessages }: BentoInboxPreviewProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      aria-label="Priority Inbox: 2 new messages"
      className={cn(
        "relative overflow-hidden bg-card text-card-foreground shadow-crm-lg border border-border cursor-pointer group text-left w-full outline-none focus-visible:ring-2 focus-visible:ring-primary-base transition-all",
        "rounded-[27px] p-6",
        className
      )}
    >

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary p-2 rounded-xl">
            <Mail size={18} />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-tight">Priority Inbox</h3>
        </div>
        <div className="bg-primary text-primary-foreground text-[11px] font-black px-2 py-0.5 rounded-full">
          2 New
        </div>
      </div>


      {/* Layered Messages Container */}
      <div className="relative h-[200px]">
        {messages.map((msg, i) => {
          const isTop = i === 0;
          const translateY = i * 20;
          const scale = 1 - i * 0.05;
          const opacity = isTop || hovered ? 1 : 0.6 - i * 0.2;
          const isBlurred = !isTop && !hovered;
          const blurFilter = isBlurred ? `blur(${i * 2}px)` : "blur(0px)";

          return (
            <motion.div
              key={msg.id}
              animate={{
                y: hovered ? i * 75 : translateY,
                scale: hovered ? 1 : scale,
                opacity: hovered ? (i > 1 ? 0 : 1) : opacity, // Show top 2 when hovered
                filter: blurFilter,
                zIndex: messages.length - i,
              }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
              className={cn(
                "absolute top-0 left-0 right-0 p-4 rounded-2xl border bg-card/95 backdrop-blur-md shadow-sm",
                msg.unread ? "border-primary/30 shadow-primary/5" : "border-border/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-[11px]",
                  msg.unread ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                )}>
                  {msg.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={cn("text-[11px] font-black uppercase tracking-tight truncate pr-2", msg.unread && "text-primary")}>
                      {msg.sender}
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap tracking-tighter">{msg.time}</span>
                  </div>
                  <h4 className="text-[11px] font-bold leading-tight mb-1 truncate text-foreground">{msg.subject}</h4>
                  <p className="text-[11px] font-bold text-muted-foreground/80 line-clamp-1">{msg.preview}</p>

                </div>
              </div>
              
              {/* Unread dot */}
              {msg.unread && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
              )}
            </motion.div>
          );
        })}

        {/* Floating action button reveal on hover */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center z-50 pointer-events-none">
          <AnimatePresence>
            {hovered && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="pointer-events-auto bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-crm-md flex items-center gap-2 hover:bg-primary-hover transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // open inbox logic
                }}
              >
                Open Inbox <ArrowRight size={16} />
              </motion.button>

            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Decorative gradient when not hovered */}
      <motion.div 
        animate={{ opacity: hovered ? 0 : 1 }}
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent z-40 pointer-events-none" 
      />
    </motion.button>

  );
}
