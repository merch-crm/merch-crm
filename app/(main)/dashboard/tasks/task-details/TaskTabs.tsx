"use client";

import { cn } from "@/lib/utils";
import { Task } from "../types";

export type TabId = 'details' | 'checklist' | 'comments' | 'history';

interface TaskTabsProps {
    task: Task;
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function TaskTabs({ task, activeTab, onTabChange }: TaskTabsProps) {
    const tabs: { id: TabId; label: string }[] = [
        { id: 'details', label: 'Детали' },
        { id: 'checklist', label: 'Чек-лист' },
        { id: 'comments', label: 'Обсуждение' },
        { id: 'history', label: 'История' },
    ];

    return (
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0">
            {tabs.map((tab) => (
                <button type="button"
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        "px-4 sm:px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap shrink-0",
                        activeTab === tab.id
                            ? "border-primary text-primary"
                            : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                >
                    {tab.label}
                    {tab.id === 'checklist' && task.checklists && task.checklists.length > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md text-xs">
                            {task.checklists.filter(i => i.isCompleted).length}/{task.checklists.length}
                        </span>
                    )}
                    {tab.id === 'comments' && task.comments && task.comments.length > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-primary/5 text-primary rounded-md text-xs">
                            {task.comments.length}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
