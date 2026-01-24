"use client";
import Image from "next/image";
import React from "react";
import {
    LayoutGrid,
    BookOpen,
    Calendar as CalendarIcon,
    Bell,
    Users,
    Settings,
    ChevronRight,

    Plus,
    TrendingUp,

    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
// CRM-styled FocusFlow component
export default function FocusFlowDashboardCRM() {
    return (
        <div className="w-full glass-panel flex rounded-[var(--radius-outer)] mt-10 overflow-hidden bg-white/30 backdrop-blur-xl border border-white/50 shadow-crm-xl relative min-h-[800px]">
            {/* Side Profile / Minimap - Left Sidebar Style */}
            <aside className="w-20 md:w-[240px] bg-white border-r border-slate-50 p-6 flex flex-col shrink-0 relative z-10 transition-all">
                <div className="flex items-center gap-3 mb-10 md:mb-12">
                    <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                        <Sparkles className="w-5 h-5 font-bold" />
                    </div>
                    <span className="hidden md:block font-bold text-xl tracking-tight text-slate-900">FocusFlow</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { label: "Overview", icon: <LayoutGrid />, active: true },
                        { label: "My Tasks", icon: <BookOpen />, count: 3 },
                        { label: "Calendar", icon: <CalendarIcon /> },
                        { label: "Team", icon: <Users /> },
                        { label: "Settings", icon: <Settings /> },
                    ].map((item) => (
                        <button
                            key={item.label}
                            className={cn(
                                "w-full flex items-center gap-4 p-3 rounded-[var(--radius-inner)] text-sm font-bold transition-all group relative",
                                item.active
                                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20"
                                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5 shrink-0" })}
                            <span className="hidden md:block">{item.label}</span>
                            {item.count && (
                                <span className="absolute right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[8px] font-bold text-white border-2 border-white shadow-sm">
                                    {item.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="hidden md:flex flex-col gap-4 mt-auto">
                    <div className="bg-slate-50 rounded-[var(--radius-outer)] p-6 border border-slate-100 text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-crm-sm text-primary">
                            <Plus className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs  tracking-normal mb-1">New Flow</h4>
                        <p className="text-[10px] font-medium text-slate-400">Launch workspace</p>
                    </div>

                    <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-[var(--radius-inner)] shadow-xl shadow-slate-900/10">
                        <div className="w-8 h-8 rounded-[var(--radius-inner)] overflow-hidden border border-white/10">
                            <Image src="https://i.pravatar.cc/100?img=65" width={32} height={32} className="w-full h-full object-cover" alt="p" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-[10px] font-bold text-white truncate">L. Molchanov</div>
                            <div className="text-[8px] font-bold text-primary  tracking-normal">Admin</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 md:p-10 relative overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-bold  tracking-normal text-primary">Deep Focus Session</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-[var(--radius-inner)] bg-white border border-slate-100 flex items-center justify-center text-slate-400 group hover:text-slate-900 transition-colors">
                            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </button>
                        <button className="h-10 px-6 rounded-[var(--radius-inner)] btn-primary text-xs font-bold  tracking-normal shadow-lg shadow-primary/20">Resume session</button>
                    </div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">

                    {/* Main Progress Block */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="crm-card p-8 flex flex-col justify-between min-h-[440px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50/50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                            <div className="relative z-10 flex items-start justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Team Efficiency</h2>
                                    <p className="text-sm font-medium text-slate-400">Total metrics across 12 active streams</p>
                                </div>
                                <div className="flex gap-1.5">
                                    {[3, 5, 2, 8].map((h, i) => (
                                        <div key={i} className="w-1 bg-primary/20 rounded-full" style={{ height: `${h * 4}px` }} />
                                    ))}
                                </div>
                            </div>

                            {/* Large Wave Graph Visual */}
                            <div className="relative h-48 flex items-end">
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                                    <path d="M0 80 C 100 80, 150 20, 200 50 S 300 10, 400 60" fill="none" stroke="#5d00ff" strokeWidth="4" strokeLinecap="round" />
                                    <path d="M0 80 C 100 80, 150 20, 200 50 S 300 10, 400 60 L 400 100 L 0 100 Z" fill="url(#focus-grad)" opacity="0.1" />
                                    <defs>
                                        <linearGradient id="focus-grad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#5d00ff" />
                                            <stop offset="100%" stopColor="#5d00ff" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="relative z-10 w-full flex justify-between items-end pb-4">
                                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(m => (
                                        <span key={m} className="text-[10px] font-bold  tracking-normal text-slate-300">{m}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                                {[
                                    { label: "Completed", val: "182", unit: "tasks" },
                                    { label: "Hours", val: "1.2k", unit: "logged" },
                                    { label: "Revenue", val: "$45k", unit: "mtd" },
                                    { label: "Active", val: "93%", unit: "score" },
                                ].map((stat, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="text-[10px] font-bold  tracking-normal text-slate-400">{stat.label}</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-slate-900">{stat.val}</span>
                                            <span className="text-[8px] font-bold text-primary  tracking-normal">{stat.unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Courses / Active Flows List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: "Design Audit Phase", meta: "3 collaborators", color: "bg-primary" },
                                { title: "Client Handover", meta: "Final stage", color: "bg-slate-900" },
                            ].map((flow, i) => (
                                <div key={i} className="crm-card p-8 flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-5">
                                        <div className={cn("w-14 h-14 rounded-[var(--radius-inner)] flex items-center justify-center text-white transition-all group-hover:scale-110", flow.color)}>
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{flow.title}</h4>
                                            <p className="text-xs font-bold text-slate-400  tracking-normal mt-1">{flow.meta}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-100 group-hover:text-primary transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column Metrics */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="crm-card p-10 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px]">
                            <div className="absolute inset-0 bg-primary/5" />
                            <div className="relative z-10 space-y-8 w-full">
                                <div className="relative w-40 h-40 mx-auto">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="10" />
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#5d00ff" strokeWidth="10" strokeDasharray="212 282" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(93,0,255,0.4)]" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="text-4xl font-bold text-slate-900">576</div>
                                        <div className="text-[10px] font-bold text-primary  tracking-normal">Points</div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Elite Productivity</h3>
                                    <p className="text-xs font-medium text-slate-400 mt-2">You are in the <span className="text-slate-900 font-bold">top 5%</span> of performers</p>
                                </div>
                            </div>
                        </div>

                        <div className="blue-mesh rounded-[var(--radius-outer)] p-8 bg-slate-900 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[60px] translate-x-1/4 -translate-y-1/4" />
                            <div className="relative z-10 h-full flex flex-col justify-between min-h-[160px]">
                                <div>
                                    <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-white/10 flex items-center justify-center mb-6 text-primary border border-white/5">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Workspace Pro</h3>
                                    <p className="text-xs text-white/50 leading-relaxed font-medium">Activate full automation and custom node integration.</p>
                                </div>
                                <button className="h-10 px-6 rounded-[var(--radius-inner)] bg-white text-slate-900 text-[10px] font-bold  tracking-normal w-fit mt-6 hover:bg-primary hover:text-white transition-all shadow-md">Enable Node</button>
                            </div>
                        </div>

                        <div className="glass-panel p-6 flex flex-col gap-6 bg-white/50 border-white/80">
                            <h4 className="text-xs font-bold text-slate-400  tracking-normal border-b border-slate-50 pb-4">Live Connections</h4>
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 overflow-hidden relative group cursor-pointer hover:z-20 transition-all">
                                        <Image src={`https://i.pravatar.cc/100?img=${i + 55}`} width={48} height={48} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="avatar" />
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                                <div className="w-12 h-12 rounded-full bg-slate-50 border-4 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                                    +8
                                </div>
                            </div>
                            <button className="w-full h-12 rounded-[var(--radius-inner)] bg-white border border-slate-100 hover:border-primary/40 hover:text-primary text-xs font-bold  tracking-normal transition-all">Open Session</button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
