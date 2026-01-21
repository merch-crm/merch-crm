"use client";

import React from "react";
import {
    LayoutGrid,
    BookOpen,
    Calendar as CalendarIcon,
    MessageSquare,
    Bell,
    Settings,
    ChevronDown,
    Search,
    Plus,
    ArrowUpRight,
    TrendingUp,
    Video
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function FocusFlowDashboard() {
    return (
        <div className="w-full bg-gradient-to-br from-[#E8EDF5] via-[#F0F4F8] to-[#E3E8F0] p-8 rounded-[40px] mt-10 font-sans flex gap-0 overflow-hidden min-h-[800px]">

            {/* --- SIDEBAR --- */}
            <div className="w-[240px] bg-white rounded-[32px] p-6 flex flex-col shrink-0 shadow-sm">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-12">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        F
                    </div>
                    <span className="font-bold text-lg text-slate-900">FocusFlow</span>
                </div>

                {/* Menu Label */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Menu</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-1">
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-semibold">
                        <LayoutGrid className="w-5 h-5" />
                        <span>Dashboard</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600">
                        <BookOpen className="w-5 h-5" />
                        <span>My tasks</span>
                        <div className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">3</div>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600">
                        <CalendarIcon className="w-5 h-5" />
                        <span>Calendar</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600">
                        <TrendingUp className="w-5 h-5" />
                        <span>Progress</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600">
                        <MessageSquare className="w-5 h-5" />
                        <span>Recommendations</span>
                    </a>

                    <div className="pt-6">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Team Workspace</div>
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600">
                            <span className="text-xs">Invite</span>
                            <span className="text-xs text-slate-400">(up to 5 max)</span>
                        </a>
                        <div className="flex items-center gap-2 px-4 py-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full overflow-hidden border-2 border-white relative">
                                    <Image src={`https://i.pravatar.cc/100?img=${i + 30}`} fill className="object-cover" alt="User" />
                                </div>
                            ))}
                            <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600">
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <span>Help center</span>
                        </a>
                    </div>
                </nav>

                {/* Add Project Promo */}
                <div className="border-2 border-dashed border-slate-200 rounded-[24px] p-6 mt-auto text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-3">
                        <Plus className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">Add new project</h4>
                    <p className="text-xs text-slate-400">Or use invite link</p>
                </div>
            </div>


            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 p-8 overflow-auto">

                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold">AW</span>
                            <span className="text-xs text-slate-400">Agency Workspace</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Start searching here..."
                                className="pl-10 pr-4 py-2 bg-white rounded-full text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                ⌘ K
                            </div>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                            <Bell className="w-5 h-5 text-slate-600" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                            <Plus className="w-5 h-5 text-slate-600" />
                        </button>
                        <div className="w-10 h-10 rounded-full overflow-hidden relative">
                            <Image src="https://i.pravatar.cc/100?img=28" fill className="object-cover" alt="User" />
                        </div>
                    </div>
                </header>


                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Task Progress */}
                        <div className="bg-white rounded-[24px] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Task progress</h3>
                                        <p className="text-xs text-slate-400">See all</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-green-500 font-bold">-13%</span>
                                    <span className="text-slate-400">+11%</span>
                                </div>
                            </div>

                            {/* Progress Info */}
                            <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-3xl font-bold text-slate-900">13</span>
                                    <span className="text-sm text-slate-500">Completed tasks</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-slate-400">Of</span>
                                    <span className="font-bold text-slate-900">24</span>
                                    <span className="text-slate-400">tasks</span>
                                    <span className="ml-auto font-bold text-blue-600">100.1%</span>
                                </div>
                            </div>

                            {/* Bar Chart */}
                            <div className="flex items-end justify-between h-40 gap-2">
                                {[
                                    { label: "April", value: 30, active: false },
                                    { label: "May", value: 50, active: false },
                                    { label: "June", value: 90, active: true },
                                    { label: "July", value: 40, active: false },
                                    { label: "August", value: 35, active: false },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full relative" style={{ height: `${item.value}%` }}>
                                            <div className={cn(
                                                "absolute bottom-0 w-full rounded-t-xl transition-all",
                                                item.active ? "bg-blue-500" : "bg-slate-200"
                                            )} style={{ height: '100%' }} />
                                        </div>
                                        <span className="text-xs text-slate-400 font-semibold">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* Course You're Taking */}
                        <div className="bg-white rounded-[24px] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg">Course You&apos;re Taking</h3>
                                <div className="flex items-center gap-2">
                                    <select className="text-xs border border-slate-200 rounded-lg px-3 py-1.5">
                                        <option>Active</option>
                                    </select>
                                    <button className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { title: "3D Design Course", author: "Michael Andrew", time: "8h 45 min", progress: 45, color: "bg-purple-100" },
                                    { title: "Development Basics", author: "Natalia Varman", time: "15h 12 min", progress: 75, color: "bg-pink-100" },
                                ].map((course, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", course.color)}>
                                            <BookOpen className="w-6 h-6 text-slate-700" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm mb-1">{course.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full overflow-hidden relative">
                                                    <Image src={`https://i.pravatar.cc/100?img=${idx + 15}`} fill className="object-cover" alt={course.author} />
                                                </div>
                                                <span className="text-xs text-slate-400">{course.author}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-slate-400 mb-1">Remaining</div>
                                            <div className="font-bold text-sm">{course.time}</div>
                                        </div>
                                        <div className="relative w-16 h-16">
                                            <svg className="transform -rotate-90" width="64" height="64">
                                                <circle cx="32" cy="32" r="28" stroke="#E5E7EB" strokeWidth="6" fill="none" />
                                                <circle
                                                    cx="32" cy="32" r="28"
                                                    stroke="#3B82F6"
                                                    strokeWidth="6"
                                                    fill="none"
                                                    strokeDasharray={`${course.progress * 1.76} 176`}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                                                {course.progress}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>


                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Calendar */}
                        <div className="bg-white rounded-[24px] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold">Calendar</h3>
                                <select className="text-xs border border-slate-200 rounded-lg px-2 py-1">
                                    <option>June</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-4">
                                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                                    <div key={i} className="text-slate-400 font-semibold py-1">{d}</div>
                                ))}
                                {Array.from({ length: 35 }, (_, i) => {
                                    const day = i - 1;
                                    const isToday = day === 11;
                                    const hasEvent = [2, 3, 4, 23, 24].includes(day);

                                    return day > 0 && day <= 30 ? (
                                        <div key={i} className="relative">
                                            <div className={cn(
                                                "aspect-square flex items-center justify-center rounded-lg text-xs font-semibold cursor-pointer",
                                                isToday && "bg-blue-500 text-white",
                                                !isToday && "text-slate-600 hover:bg-slate-50"
                                            )}>
                                                {day}
                                            </div>
                                            {hasEvent && !isToday && (
                                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500" />
                                            )}
                                        </div>
                                    ) : <div key={i} />;
                                })}
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="text-slate-600">Important tasks</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className="text-slate-600">Everyday tasks</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                                    <span className="text-slate-600">Unfulfilled tasks</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                                    <span className="text-slate-600">Team tasks</span>
                                </div>
                            </div>
                        </div>


                        {/* Your Productivity */}
                        <div className="bg-white rounded-[24px] p-6 shadow-sm">
                            <h3 className="font-bold mb-6">Your productivity</h3>

                            <div className="relative w-full aspect-square mb-6">
                                <svg viewBox="0 0 200 120" className="w-full">
                                    {/* Background arc */}
                                    <path
                                        d="M 20 100 A 80 80 0 0 1 180 100"
                                        fill="none"
                                        stroke="#E5E7EB"
                                        strokeWidth="20"
                                        strokeLinecap="round"
                                    />
                                    {/* Progress arc */}
                                    <path
                                        d="M 20 100 A 80 80 0 0 1 140 40"
                                        fill="none"
                                        stroke="url(#gradient)"
                                        strokeWidth="20"
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#8B5CF6" />
                                            <stop offset="100%" stopColor="#3B82F6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-4xl font-bold text-slate-900">576</div>
                                    <div className="text-xs text-slate-400">points</div>
                                </div>
                            </div>

                            <div className="bg-green-50 rounded-2xl p-3 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-xs text-slate-600 flex-1">You&apos;re productive than <span className="font-bold text-slate-900">93% users!</span></p>
                            </div>
                        </div>


                        {/* Upgrade Pro Plan */}
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-[24px] p-6 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-2">Upgrade pro plan!</h3>
                                <p className="text-xs text-white/80 mb-4">Get access to all our features with lifetime membership</p>
                                <button className="bg-white text-blue-600 text-xs font-bold px-4 py-2 rounded-full hover:bg-blue-50 transition-colors">
                                    Get Access
                                </button>
                            </div>
                            {/* Decorative blob */}
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                        </div>


                        {/* Calls with Teammates */}
                        <div className="bg-white rounded-[24px] p-6 shadow-sm">
                            <h3 className="font-bold mb-4">Calls with Teammates</h3>

                            <div className="flex items-center gap-2 mb-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm relative">
                                        <Image src={`https://i.pravatar.cc/100?img=${i + 35}`} fill className="object-cover" alt="User" />
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                    +3
                                </div>
                                <div className="flex gap-1 ml-auto">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <Video className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <MessageSquare className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                        <Plus className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-200 my-4" />

                            <div className="text-center">
                                <h4 className="font-bold mb-1">Assess your productivity today?</h4>
                                <div className="flex justify-center gap-2 mt-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <button key={i} className={cn(
                                            "w-10 h-10 rounded-xl font-bold text-sm transition-colors",
                                            i === 3 ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                        )}>
                                            {i}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}
