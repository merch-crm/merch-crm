"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/components/library/custom/utils/cn";

/**
 * BentoSchedulePreview - Вертикальный мини-таймлайн событий
 */
export function BentoSchedulePreview() {
  const [tasks, setTasks] = useState<{ id: number; time: string; title: string; completed: boolean }[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setTasks([
      { id: 1, time: "10:00", title: "Daily Sync", completed: true },
      { id: 2, time: "11:30", title: "Design Review", completed: false },
      { id: 3, time: "14:00", title: "Client Call", completed: false },
      { id: 4, time: "16:45", title: "Project Wrap-up", completed: false }
    ]);
  }, []);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (!isMounted) return <div className="w-full max-w-sm h-96 bg-white rounded-[3rem] border border-gray-100 shadow-sm animate-pulse" />;

  return (
    <div className="w-full max-w-sm bg-white rounded-[3rem] border border-gray-100 shadow-sm p-8 relative group">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
               <Circle className="size-5 text-gray-400" />
            </div>
            <div>
               <h4 className="text-sm font-black text-gray-900  ">Расписание</h4>
               <p className="text-[11px] font-bold text-gray-400   mt-1">4 Апреля</p>
            </div>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-gray-900">{Math.round(progress)}%</span>
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

      <div className="space-y-3 relative z-10">
         {tasks.map((task) => (
            <motion.div 
               key={task.id}
               onClick={() => toggleTask(task.id)}
               className={cn(
                  "group/item flex items-center gap-3 p-4 rounded-3xl border transition-all cursor-pointer",
                  task.completed ? "bg-gray-50 border-gray-100" : "bg-white border-transparent hover:border-gray-100 hover:shadow-lg"
               )}
            >
               <div className="text-[11px] font-black text-gray-400 w-10 ">{task.time}</div>
               <div className="flex-1">
                  <h5 className={cn(
                    "text-sm font-black transition-all",
                    task.completed ? "text-gray-400 line-through" : "text-gray-900"
                  )}>
                    {task.title}
                  </h5>
               </div>
               <div className={cn(
                  "size-8 rounded-2xl flex items-center justify-center transition-all",
                  task.completed ? "bg-emerald-500 text-white" : "bg-gray-50 text-gray-300 group-hover/item:bg-gray-950 group-hover/item:text-white"
               )}>
                  {task.completed ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
               </div>
            </motion.div>
         ))}
      </div>

      <motion.button 
         type="button"
         whileTap={{ scale: 0.98 }}
         className="w-full mt-6 py-4 bg-gray-50 hover:bg-gray-950 text-gray-400 hover:text-white text-[11px] font-black   rounded-2xl transition-all border border-gray-100 flex items-center justify-center gap-2"
      >
         Добавить событие
      </motion.button>
    </div>
  );
}
