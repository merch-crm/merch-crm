"use client";

import React, { useState, useEffect } from "react";
import { Check, GripVertical, ListTodo, MoreHorizontal, Zap, Target, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";

export interface TaskItem {
  id: string;
  task: string;
  project: string;
  priority: "high" | "medium" | "low";
  isDone?: boolean;
}

interface BentoTaskQueueProps {
  title: string;
  tasks: TaskItem[];
  className?: string;
}

export function BentoTaskQueue({ title = "Active Task Queue", tasks: initialTasks, className }: BentoTaskQueueProps) {
  const [tasks, setTasks] = useState(initialTasks.map(t => ({...t, isDone: !!t.isDone})));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isDone: !t.isDone } : t));
  };

  const priorityMeta = {
    high: { color: "bg-rose-50 text-rose-500 border-rose-100", label: "P-CRITICAL" },
    medium: { color: "bg-amber-50 text-amber-600 border-amber-100", label: "P-ELEVATED" },
    low: { color: "bg-emerald-50 text-emerald-500 border-emerald-100", label: "P-STANDBY" },
  };

  if (!isMounted) {
    return (
       <div className="bg-white border border-slate-100 p-8 rounded-[3rem] animate-pulse h-96 w-full" />
    );
  }

  return (
    <div className={cn("bg-white text-slate-900 shadow-premium border border-slate-100 p-8 rounded-[3rem] flex flex-col gap-8 group/card transition-all duration-700 hover:shadow-2xl overflow-hidden relative", className)}>
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-lg shadow-black/20">
            <ListTodo className="size-4" />
          </div>
          <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 tabular-nums">{tasks.filter(t => !t.isDone).length.toString().padStart(2, '0')} PENDING</span>
           <button type="button" aria-label="Task queue options" className="size-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-950 hover:text-white transition-all duration-500 outline-none focus-visible:ring-4 focus-visible:ring-slate-950/10">
              <MoreHorizontal className="size-4" />
           </button>
        </div>
      </div>
      
      <div className="flex-1 space-y-3 relative z-10">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, idx) => (
            <motion.div 
              key={task.id} 
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "flex items-center gap-4 p-4 rounded-[2rem] border transition-all duration-700 relative overflow-hidden group/item",
                task.isDone 
                  ? "bg-slate-50/50 border-transparent opacity-40 shadow-inner" 
                  : "bg-white border-slate-100 shadow-crm-md hover:border-primary-base/30 hover:shadow-2xl"
              )}
            >
              <div className="cursor-grab text-slate-200 group-hover/item:text-slate-400 active:cursor-grabbing transition-colors pl-1">
                <GripVertical className="size-4" />
              </div>
              
              <button 
                type="button"
                aria-pressed={task.isDone}
                aria-label={`Mark task ${task.task} as ${task.isDone ? 'incomplete' : 'complete'}`}
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "size-8 rounded-xl border-2 flex items-center justify-center transition-all duration-500 shrink-0 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10",
                  task.isDone 
                    ? "bg-slate-950 border-slate-950 text-white shadow-lg shadow-black/20" 
                    : "bg-white border-slate-100 hover:border-primary-base group-hover/item:scale-105"
                )}
              >
                <motion.div
                  initial={false}
                  animate={{ scale: task.isDone ? 1 : 0.5, opacity: task.isDone ? 1 : 0 }}
                >
                  <Check className="size-4 stroke-[4]" />
                </motion.div>
              </button>
              
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <p className={cn(
                   "text-[11px] font-black uppercase tracking-widest truncate transition-all duration-700", 
                   task.isDone ? "line-through text-slate-400" : "text-slate-900"
                )}>
                  {task.task}
                </p>
                <div className="flex items-center gap-2">
                   <Target className="size-3 text-slate-300" />
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter opacity-60 truncate">Matrix // {task.project}</p>
                </div>
              </div>
              
              <div className={cn(
                 "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 border transition-all duration-500", 
                 priorityMeta[task.priority].color
              )}>
                {priorityMeta[task.priority].label}
              </div>

              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-primary-base/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute -left-32 -bottom-32 size-96 bg-primary-base/5 rounded-full blur-[120px] -z-10 group-hover/card:bg-primary-base/10 transition-all duration-1000" />
    </div>
  );
}
