"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    Calendar,
    ListTodo
} from "lucide-react";
import { CreateTaskDialog } from "./create-task-dialog";
import { KanbanBoard } from "./kanban-board";
import { cn } from "@/lib/utils";

interface Task {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    assignedToUserId?: string | null;
    assignedToRoleId?: string | null;
    dueDate?: Date | string | null;
    createdAt: Date | string;
}

interface User {
    id: string;
    name: string;
}

interface Role {
    id: string;
    name: string;
}

interface TasksClientProps {
    initialTasks: Task[];
    users: User[];
    roles: Role[];
    currentUserId: string;
    currentUserRoleId: string;
}

export function TasksClient({ initialTasks, users, roles, currentUserId, currentUserRoleId }: TasksClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all"); // all, my, role (done handled via kanban column)

    const filteredTasks = initialTasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());

        let matchesTab = true;
        // For Kanban, we don't filter by 'done' here, as 'done' is a column.
        // We only filter by 'my' and 'role' for active tasks.
        if (activeTab === "my") matchesTab = task.assignedToUserId === currentUserId;
        else if (activeTab === "role") matchesTab = task.assignedToRoleId === currentUserRoleId;

        return matchesSearch && matchesTab;
    });

    const tabs = [
        { id: "all", label: "Все потоки", icon: ListTodo },
        { id: "my", label: "Моя работа", icon: Calendar },
        { id: "role", label: "Отдел", icon: Filter },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
            {/* Premium Header */}
            <div className="relative overflow-hidden bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50/50 rounded-full -ml-24 -mb-24 blur-3xl" />

                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Рабочие процессы</h1>
                        <p className="text-slate-500 font-medium max-w-md">Контролируйте движение задач в реальном времени на интерактивной доске</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Найти поручение..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 w-full sm:w-64 transition-all"
                            />
                        </div>
                        <CreateTaskDialog users={users} roles={roles} />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="ml-1 px-1.5 py-0.5 bg-indigo-500 rounded-md text-[10px] text-white">
                                    {filteredTasks.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-hidden min-h-0">
                <KanbanBoard tasks={filteredTasks} currentUserId={currentUserId} currentUserRoleId={currentUserRoleId} />
            </div>
        </div>
    );
}
