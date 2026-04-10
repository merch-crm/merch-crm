import { ListTodo, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductionTasksWidget() {
 return (
  <div className={cn(
    "crm-card h-full flex flex-col justify-between p-6 relative group overflow-hidden",
    "!bg-gradient-to-br !from-slate-800 !to-slate-900 border-none",
    "!shadow-xl !shadow-slate-900/10"
  )}>
   {/* Декоративные элементы */}
   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 pointer-events-none" />
   <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/10 rounded-full -ml-12 -mb-12 blur-xl opacity-30 pointer-events-none" />

   <div className="relative z-10">
     <div className="flex items-center justify-between mb-4">
       <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10 backdrop-blur-md">
         <ListTodo className="w-5 h-5 text-primary-foreground" />
       </div>
       <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/20 text-primary-foreground text-xs font-bold border border-primary/20">
         <Sparkles className="w-3 h-3" />
         <span>Beta</span>
       </div>
     </div>

     <h3 className="text-xl font-bold text-white mb-2 leading-tight">
       Задачи производства
     </h3>
     <p className="text-sm font-medium text-slate-400 leading-relaxed mb-6">
       Модуль управления детальными задачами для цехов находится в активной разработке. 
     </p>
   </div>

   <div className="relative z-10">
     <Link href="/dashboard/production/tasks" className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all group/link">
       <span className="text-sm font-bold">Открыть список задач</span>
       <ArrowRight className="w-4 h-4 text-slate-500 group-hover/link:text-white group-hover/link:translate-x-0.5 transition-all" />
     </Link>
   </div>
  </div>
 );
}

export function ProductionTasksWidgetSkeleton() {
 return <Skeleton className="h-[240px] w-full rounded-3xl" />;
}
