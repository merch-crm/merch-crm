"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Loader2, CheckCircle2 } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { createTask } from "../actions/task-actions";
import { TASK_PRIORITY_CONFIG, TASK_TYPE_CONFIG } from "../constants";
import type { TaskPriority, TaskType, CreateTaskInput } from "@/lib/types/tasks";

// Компоненты шагов
import { BasicInfoStep, ParticipantsStep, DetailsStep } from "./components/task-dialog-steps";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: Array<{ id: string; name: string; image?: string | null; email?: string | null }>;
  departments: Array<{ id: string; name: string }>;
  currentUserId: string;
  defaultDepartmentId?: string;
  onTaskCreated?: () => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  users,
  departments,
  currentUserId: _currentUserId,
  defaultDepartmentId,
  onTaskCreated,
}: CreateTaskDialogProps) {
  const router = useRouter();
  const [state, setState] = useState({
    isSubmitting: false,
    activeStep: 1,
    title: "",
    description: "",
    priority: "normal",
    type: "general",
    deadline: "",
    departmentId: defaultDepartmentId || "",
    assigneeIds: [] as string[],
    watcherIds: [] as string[],
    checklist: [] as ChecklistItem[],
    newChecklistItem: "",
  });

  const {
    isSubmitting,
    activeStep,
    title,
    description,
    priority,
    type,
    deadline,
    departmentId,
    assigneeIds,
    watcherIds,
    checklist,
    newChecklistItem,
  } = state;

  const setIsSubmitting = (val: boolean) => setState(s => ({ ...s, isSubmitting: val }));
  const setActiveStep = (val: number) => setState(s => ({ ...s, activeStep: val }));
  const setTitle = (val: string) => setState(s => ({ ...s, title: val }));
  const setDescription = (val: string) => setState(s => ({ ...s, description: val }));
  const setPriority = (val: string) => setState(s => ({ ...s, priority: val }));
  const setType = (val: string) => setState(s => ({ ...s, type: val }));
  const setDeadline = (val: string) => setState(s => ({ ...s, deadline: val }));
  const setDepartmentId = (val: string) => setState(s => ({ ...s, departmentId: val }));
  const setAssigneeIds = (val: string[] | ((prev: string[]) => string[])) => 
    setState(s => ({ ...s, assigneeIds: typeof val === 'function' ? val(s.assigneeIds) : val }));
  const setWatcherIds = (val: string[]) => setState(s => ({ ...s, watcherIds: val }));
  const setChecklist = (val: ChecklistItem[] | ((prev: ChecklistItem[]) => ChecklistItem[])) => 
    setState(s => ({ ...s, checklist: typeof val === 'function' ? val(s.checklist) : val }));
  const setNewChecklistItem = (val: string) => setState(s => ({ ...s, newChecklistItem: val }));

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setState({
        isSubmitting: false,
        activeStep: 1,
        title: "",
        description: "",
        priority: "normal",
        type: "general",
        deadline: "",
        departmentId: defaultDepartmentId || "",
        assigneeIds: [],
        watcherIds: [],
        checklist: [],
        newChecklistItem: "",
      });
    }
  }, [open, defaultDepartmentId]);

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setChecklist((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: newChecklistItem.trim(),
        isCompleted: false,
      },
    ]);
    setNewChecklistItem("");
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Введите название задачи");
      return;
    }

    if (assigneeIds.length === 0) {
      toast.error("Выберите хотя бы одного исполнителя");
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateTaskInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority as TaskPriority,
        type: type as TaskType,
        deadline: deadline ? new Date(deadline) : new Date(), // suppressHydrationWarning
        departmentId: departmentId || undefined,
        assigneeIds,
        watcherIds,
      };

      const result = await createTask(input);

      if (result.success) {
        toast.success("Задача успешно создана", {
          description: title,
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        });
        onOpenChange(false);
        onTaskCreated?.();
        router.refresh();
      } else {
        toast.error(result.error || "Не удалось создать задачу");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Произошла ошибка при создании задачи");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Основное", icon: Plus },
    { number: 2, title: "Участники", icon: Plus },
    { number: 3, title: "Детали", icon: Plus },
  ];

  const canProceed = () => {
    if (activeStep === 1) return title.trim().length > 0;
    if (activeStep === 2) return assigneeIds.length > 0;
    return true;
  };

  const priorityOptions = Object.entries(TASK_PRIORITY_CONFIG).map(([key, config]) => ({
    id: key,
    title: config.label,
    color: config.color,
  }));

  const typeOptions = Object.entries(TASK_TYPE_CONFIG).map(([key, config]) => ({
    id: key,
    title: config.label,
  }));

  const departmentOptions = [
    { id: "", title: "Без отдела" },
    ...departments.map((dept) => ({ id: dept.id, title: dept.name })),
  ];

  return (
    <ResponsiveModal 
      isOpen={open} 
      onClose={() => onOpenChange(false)}
      showVisualTitle={false}
      className="sm:max-w-[700px]"
    >
      <div className="flex flex-col relative bg-white overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-[22px] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm transition-colors transform hover:rotate-3 duration-300 shrink-0">
              <Plus className="h-8 w-8 stroke-[2.5px]" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-none">
                Новая задача
              </h2>
              <p className="text-sm font-bold text-slate-400 mt-2">
                Создание рабочего поручения
              </p>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mt-10 p-1.5 bg-slate-50/80 rounded-[22px] w-fit border border-slate-100 shadow-inner">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center">
                <button type="button"
                  onClick={() => {
                    if (step.number < activeStep || canProceed()) {
                      setActiveStep(step.number);
                    }
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-[18px] transition-all font-black text-xs select-none ${
                    activeStep === step.number
                      ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                      : activeStep > step.number
                        ? "text-emerald-500 hover:text-emerald-600 hover:bg-white/60"
                        : "text-slate-400 hover:text-slate-600 hover:bg-white/60"
                  }`}
                >
                  <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                    activeStep === step.number 
                      ? "bg-indigo-600 text-white" 
                      : activeStep > step.number
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-500"
                  }`}>
                    {activeStep > step.number ? "✓" : step.number}
                  </span>
                  <span>{step.title}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-8 pt-2">

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          {activeStep === 1 && (
            <BasicInfoStep 
              data={{ title, description, priority, type }}
              actions={{ setTitle, setDescription, setPriority, setType }}
              options={{ priorityOptions, typeOptions }}
            />
          )}

          {activeStep === 2 && (
            <ParticipantsStep 
              data={{ assigneeIds, watcherIds, departmentId }}
              actions={{ setAssigneeIds, setWatcherIds, setDepartmentId }}
              options={{ users: (users || []).map(u => ({ ...u, image: u.image || undefined, email: u.email || undefined })), departmentOptions }}
            />
          )}

          {activeStep === 3 && (
            <DetailsStep 
              data={{ deadline, checklist, newChecklistItem, title, priority, assigneeIds }}
              actions={{ setDeadline, handleAddChecklistItem, handleRemoveChecklistItem, setNewChecklistItem }}
            />
          )}
        </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/20 backdrop-blur-sm shrink-0">
          <Button
            variant="ghost"
            onClick={() =>
              activeStep > 1 ? setActiveStep(activeStep - 1) : onOpenChange(false)
            }
            className="rounded-[18px] px-8 h-12 hover:bg-slate-100 text-slate-400 font-bold transition-all active:scale-95"
          >
            {activeStep > 1 ? "Назад" : "Отмена"}
          </Button>

          <div className="flex items-center gap-3">
            {activeStep < 3 ? (
              <Button
                variant="btn-dark"
                onClick={() => setActiveStep(activeStep + 1)}
                disabled={!canProceed()}
                className="bg-slate-900 border-none hover:bg-slate-800 text-white rounded-[18px] px-10 h-12 shadow-lg shadow-black/10 transition-all font-bold active:scale-95 disabled:opacity-50"
              >
                Далее
              </Button>
            ) : (
              <Button
                variant="btn-dark"
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceed()}
                className="bg-indigo-600 border-none hover:bg-indigo-700 text-white rounded-[18px] px-10 h-12 min-w-[200px] shadow-lg shadow-indigo-500/20 transition-all font-black text-xs active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Загрузка
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Создать задачу
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}
