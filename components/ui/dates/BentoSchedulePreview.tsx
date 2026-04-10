"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Typo } from "@/components/ui/typo";

/**
 * BentoSchedulePreview - Вертикальный мини-таймлайн событий
 */
export function BentoSchedulePreview() {
  const [tasks, setTasks] = useState<{ id: number; time: string; title: string; completed: boolean }[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setTasks([
      { id: 1, time: "10:00", title: "Планерка", completed: true },
      { id: 2, time: "11:30", title: "Ревью дизайна", completed: false },
      { id: 3, time: "14:00", title: "Звонок клиенту", completed: false },
      { id: 4, time: "16:45", title: "Итоги проекта", completed: false }
    ]);
  }, []);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (!isMounted) return <div className="w-full max-w-sm h-96 bg-white rounded-card border border-gray-100 shadow-sm animate-pulse" />;

  return (
    <div className="w-full max-w-sm bg-white rounded-card border border-gray-100 shadow-crm-md p-6 flex flex-col group transition-colors hover:border-slate-200">
      <div className="flex items-center justify-between mb-4 px-1">
         <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
               <Calendar className="size-4" />
            </div>
            <Typo as="h4" className="text-[13px] font-black text-slate-900 tracking-wide leading-none">План на сегодня</Typo>
         </div>
         <div className="flex flex-col items-end">
            <Typo as="span" className="text-2xl font-black text-gray-900">{Math.round(progress)}%</Typo>
         </div>
      </div>

      <div className="h-1.5 w-full bg-gray-100 rounded-full mb-8 overflow-hidden">
         <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="h-full bg-gray-900 rounded-full" 
         />
      </div>

      <div className="space-y-1.5 relative z-10">
         {tasks.map((task) => (
            <motion.div 
               key={task.id}
               onClick={() => toggleTask(task.id)}
               className={cn(
                  "group/item flex items-center gap-3 px-4 py-3 rounded-card border transition-all cursor-pointer",
                  task.completed ? "bg-gray-50 border-gray-100" : "bg-white border-transparent hover:border-gray-200 hover:shadow-sm"
               )}
            >
               <Typo as="div" className="text-[11px] font-black text-gray-400 w-10 flex-shrink-0">{task.time}</Typo>
               <Typo as="h5" className={cn( "text-sm font-black transition-all relative w-fit", task.completed ? "text-gray-400" : "text-gray-900" )}>
                    {task.title}
                    {task.completed && (
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "calc(100% + 16px)" }}
                          className="absolute h-[1px] bg-black top-[58%] -left-2 -translate-y-1/2"
                       />
                    )}
               </Typo>
               <div className={cn(
                  "size-8 rounded-element flex items-center justify-center transition-all ml-auto",
                  task.completed ? "bg-emerald-500 text-white" : "bg-gray-50 text-gray-300 group-hover/item:bg-gray-950 group-hover/item:text-white"
               )}>
                  {task.completed ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
               </div>
            </motion.div>
         ))}
      </div>

      <Button variant="solid" color="primary" size="lg" className="w-full mt-6">
         <Typo>Добавить событие</Typo>
      </Button>
    </div>
  );
}
