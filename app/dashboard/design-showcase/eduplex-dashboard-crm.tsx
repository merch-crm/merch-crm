"use client";

import React from "react";
import {
    LayoutGrid,
    BookOpen,
    Calendar as CalendarIcon,
    ChevronRight,
    Search,
    Plus,
    GraduationCap,
    Users,
    Compass,
    ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EduplexDashboardCRM() {
    return (
        <div className="w-full glass-panel flex flex-col md:flex-row rounded-[var(--radius-outer)] mt-10 overflow-hidden bg-white/40 shadow-crm-xl relative min-h-[800px]">
            {/* Sidebar - Dark Glass */}
            <aside className="w-full md:w-[280px] bg-slate-900 text-white p-8 flex flex-col shrink-0 relative z-10 border-r border-white/5">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">Eduplex</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { label: "Dashboard", icon: <LayoutGrid />, active: true },
                        { label: "Courses", icon: <BookOpen /> },
                        { label: "Community", icon: <Users /> },
                        { label: "Discover", icon: <Compass /> },
                        { label: "Schedule", icon: <CalendarIcon /> },
                    ].map((item) => (
                        <button
                            key={item.label}
                            className={cn(
                                "w-full flex items-center gap-4 px-4 py-3 rounded-[var(--radius-inner)] text-sm font-bold transition-all group",
                                item.active
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
                            <span>{item.label}</span>
                            {item.active && <ChevronRight className="ml-auto w-4 h-4" />}
                        </button>
                    ))}
                </nav>

                {/* Upgrade Card */}
                <div className="mt-auto bg-white/5 border border-white/10 rounded-[var(--radius-outer)] p-6 relative overflow-hidden group hover:border-primary/40 transition-all">
                    <div className="relative z-10">
                        <h4 className="font-bold text-sm mb-2">Build your path</h4>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-4">Master new skills with our premium course library.</p>
                        <button className="w-full py-2 bg-primary rounded-[var(--radius-inner)] text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/10 group-hover:bg-primary-hover transition-colors">Go Premium</button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 md:p-12 relative z-0 overflow-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Education Dashboard</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 ml-0.5">Welcome back, Academy Member</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                className="w-64 h-12 pl-12 pr-4 bg-white/60 border border-slate-100 rounded-[var(--radius-inner)] text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all"
                            />
                        </div>
                        <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                            <Plus className="w-5 h-5" />
                        </div>
                        <div className="w-12 h-12 rounded-[var(--radius-inner)] overflow-hidden border-2 border-white shadow-crm-md">
                            <img src="https://i.pravatar.cc/100?img=51" alt="avatar" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold">Recommended for you</h3>
                            <button className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1">View Library <ChevronRight className="w-3 h-3" /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: "UI/UX Advanced Masterclass", mentor: "Sarah J.", time: "12h 30m", progress: 65, color: "bg-primary" },
                                { title: "3D Animation Basics", mentor: "Mike R.", time: "8h 45m", progress: 20, color: "bg-slate-900" },
                            ].map((course, i) => (
                                <div key={i} className="crm-card p-6 flex flex-col justify-between group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn("w-12 h-12 rounded-[var(--radius-inner)] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-all", course.color === "bg-primary" ? "bg-primary shadow-primary/20" : "bg-slate-900 shadow-slate-900/10")}>
                                            <Compass className="w-5 h-5" />
                                        </div>
                                        <button className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-slate-900">
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">{course.title}</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Mentor: {course.mentor}</p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                                <span className="text-slate-400">Progress</span>
                                                <span className="text-primary">{course.progress}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={cn("h-full rounded-full", course.color)} style={{ width: `${course.progress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Achievement Chart */}
                        <div className="crm-card p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="font-bold">Study Activity</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hours per day</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Personal</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Average</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-48 flex items-end justify-between gap-4">
                                {[45, 70, 30, 85, 60, 40, 95].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                        <div className="w-full relative h-full flex items-end">
                                            <div className="absolute inset-x-0 bottom-0 bg-slate-50 rounded-full h-full" />
                                            <div className="relative w-full bg-primary rounded-full transition-all duration-500 group-hover:bg-primary-hover shadow-lg shadow-primary/10" style={{ height: `${h}%` }} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{"MTWTFSS"[i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: Schedule */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="crm-card p-8 bg-primary text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            <h3 className="text-lg font-bold mb-4 relative z-10">Premium Perks</h3>
                            <p className="text-white/60 text-xs font-medium leading-relaxed mb-6 relative z-10">Access exclusive mentors and advanced workshops.</p>
                            <button className="px-6 py-2.5 bg-white text-primary rounded-[var(--radius-inner)] text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all w-fit relative z-10">Upgrade</button>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold px-2">Daily Schedule</h3>
                            <div className="space-y-4">
                                {[
                                    { time: "09:00 AM", subject: "Math Advanced", room: "L-12", color: "bg-primary" },
                                    { time: "11:30 AM", subject: "Design Theory", room: "S-5", color: "bg-slate-900" },
                                    { time: "02:00 PM", subject: "Physics Prep", room: "M-4", color: "bg-slate-400" },
                                ].map((task, i) => (
                                    <div key={i} className="crm-card p-6 flex gap-6 hover:translate-x-1 transition-transform">
                                        <div className="flex flex-col items-center justify-center shrink-0 border-r border-slate-50 pr-6 gap-1">
                                            <span className="text-xs font-bold text-slate-900">{task.time.split(' ')[0]}</span>
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">{task.time.split(' ')[1]}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-sm font-bold text-slate-900">{task.subject}</h4>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.room}</span>
                                            </div>
                                            <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                                                <div className={cn("h-full rounded-full", task.color)} style={{ width: "40%" }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full h-14 border-2 border-dashed border-slate-100 rounded-[var(--radius-outer)] flex items-center justify-center gap-2 text-slate-300 hover:border-primary/20 hover:text-primary hover:bg-primary/5 transition-all group">
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                <span className="text-xs font-bold uppercase tracking-widest">Add Event</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
