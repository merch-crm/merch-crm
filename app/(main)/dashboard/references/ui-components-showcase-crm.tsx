"use client";

import Image from "next/image";
import React, { useState } from "react";
import {
    Search,
    ChevronDown,
    User,
    Lock,
    Upload,
    Bold,
    Italic,
    Underline,
    Link as LinkIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Calendar,
    Layers,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function UiComponentsShowcaseCRM() {
    const [activeTab, setActiveTab] = useState("all");
    const [range, setRange] = useState(45);

    return (
        <div className="w-full glass-panel p-8 rounded-[var(--radius-outer)] mt-10 overflow-hidden relative min-h-[800px]">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-12 relative z-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">UI Showcase</h1>
                    <p className="text-xs font-bold  tracking-normal text-slate-400 mt-2">Design Components Library</p>
                </div>
                <div className="flex gap-2">
                    {["all", "forms", "widgets", "editors"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-5 py-2.5 rounded-[var(--radius-inner)] text-[10px] font-bold  tracking-normal transition-all",
                                activeTab === tab
                                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                                    : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">

                {/* Left Column: Form Elements */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="crm-card p-8 space-y-8">
                        <h3 className="text-sm font-bold  tracking-normal text-slate-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            Auth Controls
                        </h3>

                        <div className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border-none rounded-[var(--radius-inner)] text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border-none rounded-[var(--radius-inner)] text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            <button className="btn-primary w-full h-12 rounded-[var(--radius-inner)] font-bold text-sm">
                                Sign In
                            </button>
                        </div>
                    </div>

                    <div className="crm-card p-8 space-y-6">
                        <h3 className="text-sm font-bold  tracking-normal text-slate-900 flex items-center gap-2">
                            <Upload className="w-4 h-4 text-primary" />
                            File Assets
                        </h3>
                        <div className="border-2 border-dashed border-slate-200 rounded-[var(--radius-inner)] p-10 flex flex-col items-center justify-center gap-4 group hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer">
                            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                <Upload className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-900">Upload Media</p>
                                <p className="text-[10px] font-bold text-slate-400  tracking-normal mt-1">SVG, PNG, JPG (Max 10MB)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Column: Interactive Widgets */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="crm-card p-8 space-y-8">
                        <h3 className="text-sm font-bold  tracking-normal text-slate-900 flex items-center gap-2">
                            <Search className="w-4 h-4 text-primary" />
                            Smart Selectors
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 group cursor-pointer hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">🇺🇸</div>
                                    <span className="text-sm font-bold text-slate-900">United States</span>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-bold  tracking-normal text-slate-400">
                                    <span>Price Range</span>
                                    <span className="text-primary">${range} — $250</span>
                                </div>
                                <div className="relative h-6 flex items-center">
                                    <div className="absolute inset-0 h-1.5 my-auto bg-slate-100 rounded-full" />
                                    <div className="absolute left-0 h-1.5 my-auto bg-primary rounded-full transition-all" style={{ width: `${(range / 250) * 100}%` }} />
                                    <input
                                        type="range"
                                        min="0"
                                        max="250"
                                        value={range}
                                        onChange={(e) => setRange(parseInt(e.target.value))}
                                        className="absolute w-full h-1.5 cursor-pointer opacity-0"
                                    />
                                    <div className="absolute pointer-events-none w-5 h-5 bg-white border-4 border-primary rounded-full shadow-lg transition-all" style={{ left: `calc(${(range / 250) * 100}% - 10px)` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-8 bg-primary/5 border-2 border-primary/20 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-slate-900 flex items-center justify-center text-primary shadow-xl shadow-slate-900/10">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Weekend Launch</h4>
                                <p className="text-xs font-bold text-slate-400  tracking-normal">Global Event</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-5 bg-white rounded-[var(--radius-inner)] shadow-crm-sm border border-slate-200">
                            <span className="text-sm font-bold text-slate-900">Enable Reminders</span>
                            <button className="w-12 h-6 bg-primary rounded-full relative p-1 group">
                                <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm group-active:scale-90 transition-all" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Editor & Tools */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="crm-card p-8 space-y-8 min-h-[440px] flex flex-col">
                        <h3 className="text-sm font-bold  tracking-normal text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Text Engine
                        </h3>

                        <div className="flex-1 border border-slate-200 rounded-[var(--radius-inner)] overflow-hidden flex flex-col">
                            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2">
                                {[Bold, Italic, Underline, LinkIcon, AlignLeft, AlignCenter, AlignRight].map((Icon, i) => (
                                    <button key={i} className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-white hover:text-primary hover:shadow-sm transition-all">
                                        <Icon className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 p-6">
                                <p className="text-sm font-medium text-slate-900 leading-relaxed italic opacity-40">
                                    Capture your vision here...
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <button className="h-10 px-6 rounded-[var(--radius-inner)] btn-secondary text-[10px] font-bold  tracking-normal">Discard</button>
                            <button className="h-10 px-6 rounded-[var(--radius-inner)] btn-primary text-[10px] font-bold  tracking-normal">Publish</button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Meta */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex items-center justify-between px-4 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                                <Image src={`https://i.pravatar.cc/100?img=${i + 45}`} alt="u" width={40} height={40} />
                            </div>
                        ))}
                    </div>
                    <p className="text-xs font-bold text-slate-400  tracking-normal">Used by <span className="text-slate-900">12 designers</span> in this session</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-200 text-[10px] font-bold  tracking-normal text-slate-400">
                    <Layers className="w-4 h-4" />
                    v2.4.0 — Stable Build
                </div>
            </div>
        </div>
    );
}
