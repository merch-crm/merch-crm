"use client";

import React from "react";
import {
    LayoutGrid,
    BookOpen,
    Calendar as CalendarIcon,
    MessageSquare,
    Bell,
    Users,
    Settings,
    ChevronRight,
    Search,
    Plus,
    ArrowUpRight,
    Zap,
    Tv,
    Droplets,
    Crown
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EduplexDashboard() {
    return (
        <div className="w-full bg-[#F3F4F6] p-8 rounded-[40px] mt-10 font-sans flex gap-0 overflow-hidden min-h-[800px]">

            {/* --- SIDEBAR --- */}
            <div className="w-[240px] bg-[#1F2937] rounded-[32px] p-6 flex flex-col text-white shrink-0">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-12">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-[#1F2937]" />
                    </div>
                    <span className="font-bold text-lg">Eduplex</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-2">
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#DFFF00] text-[#1F2937] font-semibold">
                        <LayoutGrid className="w-5 h-5" />
                        <span>Dashboard</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
                        <BookOpen className="w-5 h-5" />
                        <span>My Courses</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
                        <CalendarIcon className="w-5 h-5" />
                        <span>My Classes</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                        <span>Messages</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span>Notifications</span>
                        <div className="absolute right-3 top-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">2</div>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
                        <CalendarIcon className="w-5 h-5" />
                        <span>Calendars</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
                        <Users className="w-5 h-5" />
                        <span>Community</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                    </a>
                </nav>

                {/* Download App Promo */}
                <div className="bg-[#DFFF00] rounded-[24px] p-4 mt-auto relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3">
                            <ArrowUpRight className="w-5 h-5 text-[#1F2937]" />
                        </div>
                        <h4 className="font-bold text-sm text-[#1F2937] mb-2">Download our<br />mobile app</h4>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full" />
                    <div className="absolute -right-2 -top-2 w-12 h-12 bg-white/20 rounded-full" />
                </div>
            </div>


            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 p-8 overflow-auto">

                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Welcome back Taylor 👋</h1>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search courses"
                                className="pl-10 pr-4 py-2 bg-white rounded-full text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img src="https://i.pravatar.cc/100?img=25" alt="User" />
                        </div>
                    </div>
                </header>


                {/* New Courses */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900">New Courses</h2>
                        <button className="text-sm font-semibold text-slate-600 hover:text-slate-900">View All</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Course 1 */}
                        <div className="bg-white rounded-[24px] p-5 hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-500">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10 9 9 9 8 9" />
                                    </svg>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-yellow-400">★</span>
                                    <span className="text-sm font-bold">4.8</span>
                                </div>
                            </div>
                            <h3 className="font-bold text-sm mb-1">Content Writing</h3>
                            <p className="text-xs text-slate-400 mb-3">12 Lessons</p>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Rate</span>
                                <span className="font-semibold">Data Research</span>
                            </div>
                        </div>

                        {/* Course 2 */}
                        <div className="bg-white rounded-[24px] p-5 hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-600">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                        <path d="M2 17l10 5 10-5" />
                                        <path d="M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-yellow-400">★</span>
                                    <span className="text-sm font-bold">5.0</span>
                                </div>
                            </div>
                            <h3 className="font-bold text-sm mb-1">Usability Testing</h3>
                            <p className="text-xs text-slate-400 mb-3">15 Lessons</p>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Type</span>
                                <span className="font-semibold">UI/UX Design</span>
                            </div>
                        </div>

                        {/* Go Premium */}
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[24px] p-5 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <Crown className="w-8 h-8 text-[#DFFF00] mb-3" />
                                <h3 className="font-bold text-lg mb-2">Go Premium</h3>
                                <p className="text-xs text-slate-300 mb-4">Explore 250+ elite courses with lifetime membership</p>
                                <button className="bg-[#DFFF00] text-slate-900 text-xs font-bold px-4 py-2 rounded-full hover:bg-[#d0f000] transition-colors">
                                    Get Access
                                </button>
                            </div>
                            {/* Illustration placeholder */}
                            <div className="absolute -right-6 -top-6 w-32 h-32 opacity-10">
                                <svg viewBox="0 0 100 100" fill="currentColor">
                                    <circle cx="50" cy="30" r="15" />
                                    <path d="M50 50 L35 80 L50 75 L65 80 Z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Grid: Activity + Schedule + Calendar + Assignments */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Hours Activity */}
                    <div className="lg:col-span-5 bg-white rounded-[24px] p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg">Hours Activity</h3>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-xs">
                                    <Zap className="w-3 h-3 text-green-500" />
                                    <span className="text-green-500 font-bold">+3%</span>
                                    <span className="text-slate-400">Increase than last week</span>
                                </div>
                                <select className="text-xs border border-slate-200 rounded-lg px-2 py-1">
                                    <option>Weekly</option>
                                </select>
                            </div>
                        </div>

                        {/* Bar Chart */}
                        <div className="flex items-end justify-between h-32 gap-2">
                            {[
                                { day: "Su", hours: 8, active: false },
                                { day: "Mo", hours: 6, active: false },
                                { day: "Tu", hours: 8, active: false },
                                { day: "We", hours: 4, active: false },
                                { day: "Th", hours: 8, active: false },
                                { day: "Fr", hours: 6, active: true, tooltip: "6h 45m, 5 Jun 2023" },
                                { day: "Sa", hours: 6, active: false },
                            ].map((item, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                                    <div className="w-full bg-slate-100 rounded-t-lg relative" style={{ height: `${item.hours * 12}px` }}>
                                        {item.active && (
                                            <>
                                                <div className="absolute inset-0 bg-blue-500 rounded-t-lg" />
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap">
                                                    {item.tooltip}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-400 font-semibold">{item.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Daily Schedule */}
                    <div className="lg:col-span-4 bg-white rounded-[24px] p-6">
                        <h3 className="font-bold text-lg mb-6">Daily Schedule</h3>
                        <div className="space-y-3">
                            {[
                                { icon: LayoutGrid, title: "Design System", subtitle: "Lecture - Class", color: "bg-yellow-100 text-yellow-600" },
                                { icon: Zap, title: "Typography", subtitle: "Group - Test", color: "bg-purple-100 text-purple-600" },
                                { icon: Droplets, title: "Color Style", subtitle: "Group - Test", color: "bg-green-100 text-green-600" },
                                { icon: Tv, title: "Visual Design", subtitle: "Lecture - Test", color: "bg-yellow-100 text-yellow-600" },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.color)}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm">{item.title}</h4>
                                        <p className="text-xs text-slate-400">{item.subtitle}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Calendar + Assignments */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Calendar */}
                        <div className="bg-white rounded-[24px] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold">Calendar</h3>
                                <select className="text-xs border border-slate-200 rounded-lg px-2 py-1">
                                    <option>June</option>
                                </select>
                            </div>

                            {/* Mini Calendar */}
                            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                                    <div key={i} className="text-slate-400 font-semibold py-1">{d}</div>
                                ))}
                                {Array.from({ length: 35 }, (_, i) => {
                                    const day = i - 2;
                                    const isToday = day === 17;
                                    const hasEvent = [2, 3, 4, 23, 24, 30].includes(day);

                                    return day > 0 && day <= 30 ? (
                                        <div key={i} className={cn(
                                            "aspect-square flex items-center justify-center rounded-lg text-xs font-semibold",
                                            isToday && "bg-blue-500 text-white",
                                            !isToday && hasEvent && "bg-purple-100 text-purple-600",
                                            !isToday && !hasEvent && "text-slate-600 hover:bg-slate-50"
                                        )}>
                                            {day}
                                        </div>
                                    ) : <div key={i} />;
                                })}
                            </div>
                        </div>

                        {/* Assignments */}
                        <div className="bg-white rounded-[24px] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold">Assignments</h3>
                                <button className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { title: "Methods of data", date: "02 July, 10:30 AM", status: "In progress", color: "bg-purple-100 text-purple-600" },
                                    { title: "Market Research", date: "14 June, 12:45 AM", status: "Completed", color: "bg-green-100 text-green-600" },
                                    { title: "Data Collection", date: "16 May, 11:00 AM", status: "Upcoming", color: "bg-orange-100 text-orange-600" },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-xs truncate">{item.title}</h4>
                                            <p className="text-[10px] text-slate-400">{item.date}</p>
                                        </div>
                                        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap", item.color)}>
                                            {item.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
