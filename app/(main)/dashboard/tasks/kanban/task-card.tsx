"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow, isPast } from "date-fns";
import { ru } from "date-fns/locale";
import {
 Calendar,
 AlertTriangle,
 Lock,
 CheckSquare,
 MessageSquare,
 Flag,
 GripVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types/tasks";
import type { User } from "@/lib/types";
import { TASK_PRIORITY_CONFIG } from "../constants";
import { AvatarStack } from "./avatar-stack";

interface TaskCardProps {
 task: Task;
 onClick: () => void;
 isDragging?: boolean;
}

export function TaskCard({ task, onClick, isDragging = false }: TaskCardProps) {
 const {
  attributes,
  listeners,
  setNodeRef,
  transform,
  transition,
  isDragging: isSortableDragging,
 } = useSortable({ id: task.id });

 const style = {
  transform: CSS.Transform.toString(transform),
  transition,
 };

 const isOverdue =
  task.deadline &&
  isPast(new Date(task.deadline)) &&
  task.status !== "done" &&
  task.status !== "cancelled";

 const isBlocked = task.dependencies?.some(
  (dep) =>
   dep.dependsOnTask?.status !== "done" &&
   dep.dependsOnTask?.status !== "cancelled"
 );

 const checklistProgress = task.checklists?.length
  ? {
    completed: task.checklists.filter((i) => i.isCompleted).length,
    total: task.checklists.length,
   }
  : null;

 const assigneeUsers = (task.assignees?.map((a) => a.user).filter(Boolean) || []) as Array<Partial<User> & { id: string }>;
 const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];

 return (
  <div
   ref={setNodeRef}
   style={style}
   role="button"
   tabIndex={0}
   onClick={onClick}
   onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
   className={cn(
    "group relative bg-white rounded-xl border border-slate-200/80 p-4 cursor-pointer",
    "transition-all duration-200 ease-out",
    "hover:shadow-xl hover:shadow-slate-200/60 hover:border-slate-300 hover:-translate-y-1",
    (isDragging || isSortableDragging) && "opacity-60 shadow-2xl scale-105 rotate-2 z-50",
    isOverdue && "border-l-4 border-l-red-400 bg-gradient-to-r from-red-50/50 to-transparent",
    isBlocked && "border-l-4 border-l-amber-400 bg-gradient-to-r from-amber-50/50 to-transparent"
   )}
  >
   {/* Drag Handle */}
   <div
    {...attributes}
    {...listeners}
    role="button"
    tabIndex={0}
    className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition-all cursor-grab active:cursor-grabbing"
    onClick={(e) => e.stopPropagation()}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
   >
    <GripVertical className="h-4 w-4 text-slate-400" />
   </div>

   {/* Priority Dot */}
   <div
    className="absolute top-4 right-10 w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm"
    style={{ backgroundColor: priorityConfig?.color }}
   />

   {/* Title */}
   <h4 className="font-medium text-slate-900 text-sm leading-relaxed pr-12 line-clamp-2 mb-3">
    {task.title}
   </h4>

   {/* Tags */}
   <div className="flex flex-wrap gap-1.5 mb-3">
    <Badge className={cn( "text-xs font-medium border-0 px-2.5 py-0.5 rounded-md", priorityConfig?.bgClass, priorityConfig?.className )}>
     <Flag className="h-3 w-3 mr-1" />
     {priorityConfig?.label}
    </Badge>

    {task.department && (
     <Badge className="text-xs font-medium bg-slate-100 text-slate-600 border-0 px-2.5 py-0.5 rounded-md hover:bg-slate-200">
      {task.department.name}
     </Badge>
    )}

    {isBlocked && (
     <Badge className="text-xs font-medium bg-amber-100 text-amber-700 border-0 px-2.5 py-0.5 rounded-md">
      <Lock className="h-3 w-3 mr-1" />
      Блок
     </Badge>
    )}
   </div>

   {/* Checklist Progress */}
   {checklistProgress && (
    <div className="mb-3">
     <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
      <span className="flex items-center gap-1.5 font-medium">
       <CheckSquare className="h-3.5 w-3.5" />
       Чек-лист
      </span>
      <span className="font-semibold text-slate-700">
       {checklistProgress.completed}/{checklistProgress.total}
      </span>
     </div>
     <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
       className={cn(
        "h-full rounded-full transition-all duration-500",
        checklistProgress.completed === checklistProgress.total
         ? "bg-gradient-to-r from-emerald-400 to-green-500"
         : "bg-gradient-to-r from-violet-400 to-purple-500"
       )}
       style={{
        width: `${(checklistProgress.completed / checklistProgress.total) * 100}%`,
       }}
      />
     </div>
    </div>
   )}

   {/* Footer */}
   <div className="flex items-center justify-between pt-3 border-t border-slate-100">
    <AvatarStack users={assigneeUsers} maxDisplay={3} size="sm" />

    <div className="flex items-center gap-3">
     {task.comments && task.comments.length > 0 && (
      <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
       <MessageSquare className="h-3.5 w-3.5" />
       {task.comments.length}
      </span>
     )}

     {task.deadline && (
      <span
       className={cn(
        "flex items-center gap-1 text-xs font-semibold",
        isOverdue ? "text-red-600" : "text-slate-500"
       )}
      >
       {isOverdue ? (
        <AlertTriangle className="h-3.5 w-3.5" />
       ) : (
        <Calendar className="h-3.5 w-3.5" />
       )}
       {formatDistanceToNow(new Date(task.deadline), {
        addSuffix: true,
        locale: ru,
       })}
      </span>
     )}
    </div>
   </div>

   {/* Hover Gradient */}
   <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-violet-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
  </div>
 );
}
