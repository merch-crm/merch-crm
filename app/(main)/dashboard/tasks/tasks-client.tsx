"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Calendar,
    ListTodo,
    BarChart3
} from "lucide-react";
import { CreateTaskDialog } from "./create-task-dialog";
import { KanbanBoard } from "./kanban-board";
import { CalendarView } from "./calendar-view";
import { TaskAnalytics } from "./task-analytics";
import { TaskDetailsDialog } from "./task-details-dialog";
import { TasksList } from "./tasks-list";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Task } from "./types";
import { X } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Input } from "@/components/ui/input";


interface User {
    id: string;
    name: string;
}

interface Department {
    id: string;
    name: string;
}

interface Order {
    id: string;
    orderNumber: string;
}

interface TasksClientProps {
    initialTasks: Task[];
    users: User[];
    departments: Department[];
    orders: Order[];
    currentUserId: string;
    currentUserDepartmentId?: string | null;
}

export function TasksClient({ initialTasks, users, departments, orders, currentUserId, currentUserDepartmentId }: TasksClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isMobile = useMediaQuery("(max-width: 767px)");
    const [searchQuery, setSearchQuery] = useState("");

    // Initialize from URL params
    const initialTab = searchParams.get("tab");
    const initialView = searchParams.get("view");

    const [activeTab, setActiveTab] = useState(
        initialTab && ["all", "my", "role"].includes(initialTab) ? initialTab : "all"
    );
    const [view, setView] = useState<'kanban' | 'calendar' | 'analytics' | 'list'>(
        initialView && ['kanban', 'calendar', 'analytics', 'list'].includes(initialView)
            ? initialView as 'kanban' | 'calendar' | 'analytics' | 'list'
            : 'kanban'
    );

    useEffect(() => {
        if (!initialView && isMobile === true) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setView('list');
        }
    }, [initialView, isMobile]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);



    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        router.replace(`?${params.toString()}`, { scroll: false });
    };



    const filteredTasks = initialTasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());

        let matchesTab = true;
        // For Kanban, we don't filter by 'done' here, as 'done' is a column.
        // We only filter by 'my' and 'department' for active tasks.
        if (activeTab === "my") matchesTab = task.assignedToUserId === currentUserId;
        else if (activeTab === "role") matchesTab = task.assignedToDepartmentId === currentUserDepartmentId;

        return matchesSearch && matchesTab;
    });

    const tabs = [
        { id: "all", label: "Все потоки", icon: ListTodo },
        { id: "my", label: "Моя работа", icon: Filter },
        { id: "role", label: "Отдел", icon: Filter },
    ];

    const viewTabs = [
        { id: 'kanban' as const, label: 'Доска', icon: ListTodo },
        { id: 'list' as const, label: 'Список', icon: ListTodo },
        { id: 'calendar' as const, label: 'Календарь', icon: Calendar },
        { id: 'analytics' as const, label: 'Аналитика', icon: BarChart3 },
    ];

    return (
        <div className="space-y-4 animate-in fade-in duration-500 h-full flex flex-col">
            {/* Premium Header */}
            <div className="crm-card relative shrink-0 mb-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full -ml-24 -mb-24 blur-3xl opacity-50" />

                <div className="relative flex flex-col gap-6">
                    <div className="flex flex-row items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none truncate">Рабочие процессы</h1>
                            <p className="hidden sm:block text-slate-400 font-medium max-w-md text-[13px] leading-relaxed mt-1">Контролируйте движение задач в реальном времени на интерактивной доске</p>
                        </div>
                        <div className="shrink-0">
                            <CreateTaskDialog users={users} departments={departments} orders={orders} />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group flex-1">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                type="text"
                                placeholder="Найти поручение..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="crm-filter-tray-search pl-12 pr-10 focus:outline-none w-full"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-6">
                    <div className="crm-filter-tray w-full sm:w-fit overflow-x-auto no-scrollbar flex-nowrap p-1.5 rounded-3xl">
                        <div className="flex items-center gap-1 auto-cols-min">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={cn(
                                            "crm-filter-tray-tab flex-1 sm:flex-none shrink-0 rounded-2xl",
                                            isActive && "active"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTaskTab"
                                                className="absolute inset-0 bg-primary rounded-2xl z-0"
                                                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                            />
                                        )}
                                        <tab.icon className="w-3.5 h-3.5 relative z-10" />
                                        <span className="relative z-10">{tab.label}</span>
                                        {isActive && (
                                            <span className="relative z-10 ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-[10px] text-white">
                                                {filteredTasks.length}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="crm-filter-tray w-full sm:w-fit overflow-x-auto no-scrollbar flex-nowrap p-1.5 rounded-3xl">
                        <div className="flex items-center gap-1 auto-cols-min">
                            {viewTabs.map((tab) => {
                                const isActive = view === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setView(tab.id)}
                                        className={cn(
                                            "crm-filter-tray-tab flex-1 sm:flex-none shrink-0 rounded-2xl",
                                            isActive && "active"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTaskView"
                                                className="absolute inset-0 bg-primary rounded-2xl z-0"
                                                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                            />
                                        )}
                                        <tab.icon className="w-3.5 h-3.5 relative z-10" />
                                        <span className="relative z-10">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden min-h-0">
                {view === 'kanban' && (
                    <KanbanBoard tasks={filteredTasks} currentUserId={currentUserId} currentUserDepartmentId={currentUserDepartmentId} />
                )}
                {view === 'list' && (
                    <TasksList tasks={filteredTasks} currentUserId={currentUserId} />
                )}
                {view === 'calendar' && (
                    <CalendarView tasks={filteredTasks} onTaskClick={(task) => setSelectedTask(task)} />
                )}
                {view === 'analytics' && (
                    <TaskAnalytics tasks={initialTasks} users={users} />
                )}
            </div>

            {
                selectedTask && (
                    <TaskDetailsDialog task={selectedTask} onClose={() => setSelectedTask(null)} />
                )
            }
        </div >
    );
}
