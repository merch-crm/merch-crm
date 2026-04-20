"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Flag, 
  ListTodo, 
  Users, 
  Eye, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Sparkles, 
  X
} from "lucide-react";
import { UserMultiSelect } from "../../components/user-multi-select";
import { TASK_PRIORITY_CONFIG } from "../../constants";
import type { TaskPriority } from "@/lib/types/tasks";

interface BasicInfoStepProps {
  data: {
    title: string;
    description: string;
    priority: string;
    type: string;
  };
  actions: {
    setTitle: (val: string) => void;
    setDescription: (val: string) => void;
    setPriority: (val: string) => void;
    setType: (val: string) => void;
  };
  options: {
    priorityOptions: Array<{ id: string; title: string; color?: string }>;
    typeOptions: Array<{ id: string; title: string }>;
  };
}

/**
 * Шаг 1: Основная информация
 */
export function BasicInfoStep({ data, actions, options }: BasicInfoStepProps) {
  const { title, description, priority, type } = data;
  const { setTitle, setDescription, setPriority, setType } = actions;
  const { priorityOptions, typeOptions } = options;

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2.5">
        <Label htmlFor="title" className="text-[13px] font-black text-slate-900 ml-1 ">
          Название задачи <span className="text-destructive">*</span>
        </Label>
        <Input id="title" placeholder="Что именно нужно сделать?" value={title} onChange={(e) => setTitle(e.target.value)}
          className="h-12 text-sm font-bold rounded-[18px] border-none bg-slate-50 focus:bg-white focus:ring-indigo-500/20 shadow-sm transition-all"
          autoFocus
        />
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="description" className="text-[13px] font-black text-slate-900 ml-1 ">
          Описание
        </Label>
        <Textarea id="description" placeholder="Описание деталей или требований..." value={description} onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="resize-none rounded-[18px] border-none bg-slate-50 focus:bg-white focus:ring-indigo-500/20 shadow-sm transition-all text-sm font-bold p-4"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2.5">
          <Label className="text-[13px] font-black text-slate-900 ml-1 flex items-center gap-2 ">
            <Flag className="h-4 w-4 text-indigo-500" />
            Приоритет
          </Label>
          <Select options={priorityOptions} value={priority} onChange={setPriority} className="h-12 rounded-[18px] border-none bg-slate-50 font-bold focus:ring-indigo-500/20 shadow-sm" />
        </div>

        <div className="space-y-2.5">
          <Label className="text-[13px] font-black text-slate-900 ml-1 flex items-center gap-2 ">
            <ListTodo className="h-4 w-4 text-indigo-500" />
            Тип
          </Label>
          <Select options={typeOptions} value={type} onChange={setType} className="h-12 rounded-[18px] border-none bg-slate-50 font-bold focus:ring-indigo-500/20 shadow-sm" />
        </div>
      </div>
    </div>
  );
}

interface ParticipantsStepProps {
  data: {
    assigneeIds: string[];
    watcherIds: string[];
    departmentId: string;
  };
  actions: {
    setAssigneeIds: (val: string[] | ((prev: string[]) => string[])) => void;
    setWatcherIds: (val: string[]) => void;
    setDepartmentId: (val: string) => void;
  };
  options: {
    users: Array<{ id: string; name: string; image?: string; email?: string }>;
    departmentOptions: Array<{ id: string; title: string }>;
  };
}

/**
 * Шаг 2: Участники
 */
export function ParticipantsStep({ data, actions, options }: ParticipantsStepProps) {
  const { assigneeIds, watcherIds, departmentId } = data;
  const { setAssigneeIds, setWatcherIds, setDepartmentId } = actions;
  const { users, departmentOptions } = options;

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-3">
        <Label className="text-[13px] font-black text-slate-900 ml-1 flex items-center gap-2 ">
          <Users className="h-4 w-4 text-indigo-500" />
          Исполнители <span className="text-destructive">*</span>
        </Label>
        <UserMultiSelect users={users} selectedIds={assigneeIds} onSelectionChange={setAssigneeIds} placeholder="Кто будет выполнять?" />
        {assigneeIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {assigneeIds.map((id) => {
              const user = users.find((u) => u.id === id);
              if (!user) return null;
              return (
                <Badge key={id} className="pl-1 pr-2 py-1 gap-2 rounded-[14px] bg-slate-50 border-none text-slate-700 font-bold shadow-sm" color="gray">
                  <Avatar className="h-6 w-6 ring-2 ring-white">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                      {user.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{user.name}</span>
                  <button type="button"
                    onClick={() =>
                      setAssigneeIds(assigneeIds.filter((i) => i !== id))
                    }
                    className="ml-0.5 p-0.5 hover:bg-black/5 rounded-full transition-colors text-slate-400 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-[13px] font-black text-slate-900 ml-1 flex items-center gap-2 ">
          <Eye className="h-4 w-4 text-indigo-500" />
          Наблюдатели
        </Label>
        <UserMultiSelect users={(users || []).filter((u) => !assigneeIds.includes(u.id))}
          selectedIds={watcherIds}
          onSelectionChange={setWatcherIds}
          placeholder="Добавить наблюдателей..."
        />
      </div>

      <div className="space-y-2.5">
        <Label className="text-[13px] font-black text-slate-900 ml-1 flex items-center gap-2 ">
          <Building2 className="h-4 w-4 text-indigo-500" />
          Отдел
        </Label>
        <Select options={departmentOptions} value={departmentId} onChange={setDepartmentId} placeholder="Выберите отдел..." className="h-12 rounded-[18px] border-none bg-slate-50 font-bold shadow-sm" />
      </div>
    </div>
  );
}

interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

interface DetailsStepProps {
  data: {
    deadline: string;
    checklist: ChecklistItem[];
    newChecklistItem: string;
    title: string;
    priority: string;
    assigneeIds: string[];
  };
  actions: {
    setDeadline: (val: string) => void;
    handleAddChecklistItem: () => void;
    handleRemoveChecklistItem: (id: string) => void;
    setNewChecklistItem: (val: string) => void;
  };
}

/**
 * Шаг 3: Детали и Сводка
 */
export function DetailsStep({ data, actions }: DetailsStepProps) {
  const { deadline, checklist, newChecklistItem, title, priority, assigneeIds } = data;
  const { setDeadline, handleAddChecklistItem, handleRemoveChecklistItem, setNewChecklistItem } = actions;

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2.5">
        <Label className="text-[13px] font-black text-slate-900 ml-1 flex items-center gap-2 ">
          <Calendar className="h-4 w-4 text-indigo-500" />
          Дедлайн
        </Label>
        <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)}
          className="h-12 rounded-[18px] border-none bg-slate-50 font-bold focus:bg-white focus:ring-indigo-500/20 shadow-sm transition-all"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-[13px] font-black text-slate-900 ml-1 flex items-center gap-2 ">
          <CheckCircle2 className="h-4 w-4 text-indigo-500" />
          Чек-лист
        </Label>
        <div className="flex gap-3">
          <Input placeholder="Добавить этап..." value={newChecklistItem} onChange={(e) => setNewChecklistItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddChecklistItem();
              }
            }}
            className="flex-1 h-12 rounded-[18px] border-none bg-slate-50 font-bold focus:bg-white focus:ring-indigo-500/20 shadow-sm transition-all"
          />
          <Button type="button" onClick={handleAddChecklistItem} disabled={!newChecklistItem.trim()} className="w-12 h-12 p-0 rounded-xl bg-slate-900 transition-all active:scale-90 hover:bg-slate-800 shrink-0 shadow-lg shadow-black/10 border-none">
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>
        {checklist.length > 0 && (
          <div className="space-y-2 mt-4 bg-slate-50/50 p-3 rounded-[22px] border border-slate-100">
            {checklist.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-4 bg-white border border-slate-100/50 rounded-[18px] group transition-all shadow-sm"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm font-bold text-slate-700">{item.text}</span>
                <button type="button"
                  onClick={() => handleRemoveChecklistItem(item.id)}
                  className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-destructive hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-8 p-6 bg-slate-50 border border-slate-100 rounded-[28px] shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
        
        <h4 className="font-black text-slate-900 mb-5 flex items-center gap-2.5  text-xs">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          Сводка задачи
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-xs font-black  text-slate-400 ml-0.5">Название</span>
            <p className="font-bold text-slate-700 truncate text-sm">{title || "—"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-black  text-slate-400 ml-0.5">Приоритет</span>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TASK_PRIORITY_CONFIG[priority as TaskPriority]?.color || '#cbd5e1' }} />
               <p className="font-bold text-slate-700 text-sm">
                {TASK_PRIORITY_CONFIG[priority as TaskPriority]?.label}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-black  text-slate-400 ml-0.5">Исполнители</span>
            <p className="font-bold text-slate-700 text-sm">
              {assigneeIds.length > 0 ? `${assigneeIds.length} чел.` : "—"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-black  text-slate-400 ml-0.5">Дедлайн</span>
            <p className="font-bold text-slate-700 text-sm">
              {deadline ? new Date(deadline).toLocaleDateString("ru-RU", { day: 'numeric', month: 'long' }) : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
