"use client";

import Image from "next/image";
import React from "react";
import {
    Plus,
    ChevronDown,
    Search,
    MoreHorizontal,
    ArrowRight,
    Briefcase,
    PenTool,
    Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TwistyCRM() {
    return (
        <div className="w-full glass-panel p-6 rounded-[var(--radius-outer)] mt-10">

            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#5d00ff] flex items-center justify-center text-white font-bold text-lg">
                        T
                    </div>
                    <span className="font-bold text-lg">TWISTY</span>
                </div>

                <nav className="hidden md:flex items-center gap-3 bg-transparent text-sm font-medium text-slate-500">
                    <a href="#" className="text-slate-900 font-bold">Home</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Messages</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Discover</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Wallet</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Projects</a>
                </nav>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Enter your search request..."
                        className="pl-4 pr-10 py-2.5 rounded-[var(--radius-inner)] bg-white/50 border border-white/60 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-300 font-medium"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">

                {/* LEFT COLUMN (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-3">

                    {/* 1. INCOME TRACKER */}
                    <div className="crm-card p-6 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Income Tracker</h2>
                                </div>
                                <p className="text-slate-400 text-xs max-w-sm leading-relaxed ml-11 font-medium">
                                    Track changes in income over time and access detailed data on each project and payments received
                                </p>
                            </div>
                            <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-inner)] border border-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors">
                                <span>Week</span>
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </button>
                        </div>

                        {/* Chart Area */}
                        <div className="h-48 flex items-end justify-between gap-2 px-4 mb-4">
                            {[
                                { day: "S", h: "30%" },
                                { day: "M", h: "45%" },
                                { day: "T", h: "60%", active: true, val: "$2,567" },
                                { day: "W", h: "50%" },
                                { day: "T", h: "55%" },
                                { day: "F", h: "65%" },
                                { day: "S", h: "40%" },
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-3 w-full group cursor-pointer">
                                    <div className="relative w-full flex justify-center h-40 items-end">
                                        {/* Bar Line */}
                                        <div className="w-[1px] h-full bg-slate-100 absolute bottom-0" />

                                        {/* Dot */}
                                        <div
                                            className={cn(
                                                "w-2.5 h-2.5 rounded-full transition-all duration-300 z-10 mb-[calc(100%-5px)]",
                                                item.active ? "bg-[#5d00ff] scale-125" : "bg-slate-300 group-hover:bg-[#5d00ff]"
                                            )}
                                            style={{ marginBottom: item.h }}
                                        />

                                        {/* Active Tooltip Pill */}
                                        {item.active && (
                                            <div className="absolute top-[20%] transition-all bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-[var(--radius-inner)] shadow-xl">
                                                {item.val}
                                            </div>
                                        )}

                                        {/* Active Background Pill */}
                                        {item.active && (
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#5d00ff]/5 to-[#5d00ff]/10 rounded-[var(--radius-inner)] w-12 mx-auto -z-0 border border-[#5d00ff]/10" />
                                        )}
                                    </div>

                                    <span className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold z-10 transition-colors",
                                        item.active ? "bg-[#5d00ff] text-white" : "text-slate-400 bg-slate-50 group-hover:text-[#5d00ff]"
                                    )}>{item.day}</span>
                                </div>
                            ))}
                        </div>

                        <div className="absolute bottom-8 left-8">
                            <div className="text-3xl font-bold text-[#5d00ff] mb-1">+20%</div>
                            <div className="text-xs text-slate-400 font-medium">This week&apos;s income is<br />higher than last week&apos;s</div>
                        </div>
                    </div>

                    {/* BOTTOM ROW (Connect + Premium) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Let's Connect */}
                        <div className="crm-card p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg">Let&apos;s Connect</h3>
                                <button type="button" className="text-xs font-bold text-slate-400 hover:text-slate-900">See all</button>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { name: "Randy Gouse", role: "Cybersecurity specialist", tag: "Senior", bg: "bg-[#5d00ff]" },
                                    { name: "Giana Schleifer", role: "UX/UI Designer", tag: "Middle", bg: "bg-blue-400" },
                                ].map((user, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                                <Image src={`https://i.pravatar.cc/100?img=${idx + 40}`} className="w-full h-full object-cover" alt={user.name} width={40} height={40} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-900">{user.name}</span>
                                                    <span className={cn("text-xs text-white px-1.5 py-0.5 rounded-md font-bold", user.bg)}>{user.tag}</span>
                                                </div>
                                                <div className="text-xs text-slate-400 font-medium">{user.role}</div>
                                            </div>
                                        </div>
                                        <button type="button" className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Unlock Premium */}
                        <div className="bg-gradient-to-br from-[#5d00ff] to-[#3a0099] rounded-[var(--radius-outer)] p-6 shadow-xl shadow-[#5d00ff]/20 relative overflow-hidden flex flex-col justify-between">
                            {/* Mesh effect simulation */}
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#3a0099] rounded-full blur-3xl" />
                                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '10px 10px', opacity: 0.3 }}></div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="font-bold text-lg text-white mb-2">Unlock Premium Features</h3>
                                <p className="text-xs text-white/80 leading-relaxed max-w-[200px] font-medium">
                                    Get access to exclusive benefits and expand your freelancing opportunities
                                </p>
                            </div>

                            <button type="button" className="relative z-10 bg-white text-[#5d00ff] text-xs font-bold py-3 px-4 rounded-[var(--radius-inner)] flex items-center justify-between mt-6 shadow-sm hover:shadow-md transition-all group">
                                <span>Upgrade now</span>
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-3">

                    <h3 className="text-lg font-bold px-2">Your Recent Projects</h3>

                    <div className="space-y-3">
                        {/* Project 1 */}
                        <div className="crm-card p-6 hover:shadow-crm-lg transition-shadow cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-[#5d00ff] flex items-center justify-center text-white">
                                    <Code className="w-5 h-5" />
                                </div>
                                <MoreHorizontal className="text-slate-300 w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-slate-900 mb-1">Web Development</h4>
                            <div className="text-xs text-slate-400 mb-4 font-medium">$10/hour</div>
                            <div className="flex gap-2 mb-4">
                                <span className="px-3 py-1 bg-slate-100 rounded-[var(--radius-inner)] text-xs font-bold text-slate-500">Remote</span>
                                <span className="px-3 py-1 bg-slate-100 rounded-[var(--radius-inner)] text-xs font-bold text-slate-500">Part-time</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4 font-medium">
                                This project involves implementing new features as well as integrating with third-party APIs
                            </p>
                            <div className="flex items-center gap-3 text-xs text-slate-400 border-t border-slate-200 pt-4 font-medium">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-slate-300" /> Germany</span>
                                <span>2h ago</span>
                            </div>
                        </div>

                        {/* Project 2 */}
                        <div className="crm-card p-6 opacity-60 hover:opacity-100 hover:shadow-crm-lg transition-all cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-slate-100 flex items-center justify-center text-slate-500">
                                        <PenTool className="w-5 h-5" />
                                    </div>
                                    <div className="px-3 py-1 bg-slate-100 rounded-[var(--radius-inner)] text-xs font-bold text-slate-500">Copyright</div>
                                </div>
                                <div className="text-xs text-slate-400 font-medium">$10/hour</div>
                            </div>
                        </div>

                        {/* Project 3 */}
                        <div className="crm-card p-6 opacity-60 hover:opacity-100 hover:shadow-crm-lg transition-all cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-slate-100 flex items-center justify-center text-blue-500">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div className="px-3 py-1 bg-slate-100 rounded-[var(--radius-inner)] text-xs font-bold text-slate-500">Web Des...</div>
                                </div>
                                <div className="text-xs text-slate-400 font-medium">$10/hour</div>
                            </div>
                        </div>

                    </div>

                    {/* Proposals Widget */}
                    <div className="crm-card p-6 mt-auto">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-sm">Proposals</h4>
                        </div>
                        <div className="text-3xl font-bold text-[#5d00ff] mt-2">64</div>
                    </div>

                </div>

            </div>
        </div>
    );
}
