"use client";

import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "../types";

interface TaskChecklistTabProps {
    task: Task;
    newItemValue: string;
    onItemValueChange: (value: string) => void;
    onAddItem: () => void;
    onToggleItem: (id: string, completed: boolean) => void;
    onDeleteItem: (id: string) => void;
}

export function TaskChecklistTab({
    task,
    newItemValue,
    onItemValueChange,
    onAddItem,
    onToggleItem,
    onDeleteItem
}: TaskChecklistTabProps) {
    return (
        <div className="space-y-3">
            <div className="flex gap-3">
                <input
                    type="text"
                    value={newItemValue}
                    onChange={(e) => onItemValueChange(e.target.value)}
                    placeholder="Добавить новый пункт..."
                    className="flex-1 px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium outline-none focus:border-primary transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && onAddItem()}
                />
                <button type="button"
                    onClick={onAddItem}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all"
                >
                    Добавить
                </button>
            </div>

            <div className="space-y-2">
                {task.checklists?.map((item) => (
                    <div
                        key={item.id}
                        className="group flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl transition-all"
                    >
                        <button type="button"
                            onClick={() => onToggleItem(item.id, !item.isCompleted)}
                            className={cn(
                                "h-6 w-6 rounded-2xl border-2 flex items-center justify-center transition-all",
                                item.isCompleted
                                    ? "bg-emerald-500 border-emerald-500"
                                    : "border-slate-200 hover:border-primary"
                            )}
                        >
                            {item.isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </button>
                        <span className={cn(
                            "flex-1 text-sm font-bold text-slate-700",
                            item.isCompleted && "line-through text-slate-400"
                        )}>
                            {item.content}
                        </span>
                        <button type="button"
                            onClick={() => onDeleteItem(item.id)}
                            className="p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
