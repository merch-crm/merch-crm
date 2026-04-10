"use client";

import React from "react";
import { motion } from "framer-motion";
import { Video, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Participant {
  name: string;
  avatar?: string;
  initials: string;
  color: string;
}

interface BentoUpcomingMeetingProps {
  className?: string;
  title?: string;
  time?: string;
  duration?: string;
  participants?: Participant[];
}

const defaultParticipants: Participant[] = [
  { name: "Ольга К.", initials: "ОК", color: "bg-rose-500" },
  { name: "Дмитрий С.", initials: "ДС", color: "bg-blue-500" },
  { name: "Анна Р.", initials: "АР", color: "bg-emerald-500" },
  { name: "Максим П.", initials: "МП", color: "bg-amber-500" },
];

export function BentoUpcomingMeeting({
  className,
  title = "Обзор пайплайна Q3",
  time = "14:30",
  duration = "45 мин",
  participants = defaultParticipants,
}: BentoUpcomingMeetingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
      className={cn(
        "relative overflow-hidden bg-card text-card-foreground shadow-crm-lg border border-border flex flex-col",
        "rounded-card",
        className
      )}
    >
      {/* Upper: Time block – bold asymmetric placement */}
      <div className="p-6 pb-4 flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-full mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-black tracking-tight">Скоро начнется</span>
          </div>
          <h3 className="text-[11px] font-black tracking-tight text-slate-900 leading-tight">{title}</h3>
        </div>
        <motion.button
          type="button"
          aria-label="Войти в видеоконференцию"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
        >
          < Video size={18} />
        </motion.button>
      </div>

      {/* Middle: Time info */}
      <div className="px-6 flex items-center gap-3 text-[11px] font-bold text-slate-400">
        <div className="flex items-center gap-1.5 font-black text-slate-900">
          <Clock size={14} />
          <span>{time}</span>
        </div>
        <span className="text-border">•</span>
        <span className="tracking-tighter">{duration}</span>
        <motion.a
          href="#"
          whileHover={{ x: 3 }}
          className="ml-auto flex items-center gap-1 text-[11px] font-black text-primary hover:underline cursor-pointer tracking-widest"
        >
          Войти <ExternalLink size={12} />
        </motion.a>
      </div>


      {/* Bottom: Overlapping avatars crossing the border */}
      <div className="mt-auto pt-6 px-6 pb-6 relative">
        <div className="border-t border-border/50 pt-4" />
        <div className="flex items-center">
          <div className="flex -space-x-3">
            {participants.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.08, type: "spring", bounce: 0.4 }}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-card",
                  p.color
                )}
                style={{ zIndex: participants.length - i }}
              >
                {p.initials}
              </motion.div>
            ))}
          </div>
          <span className="ml-3 text-[11px] font-bold text-slate-400 tracking-tighter">
            {participants.length} участников
          </span>
        </div>
      </div>
    </motion.div>
  );
}
