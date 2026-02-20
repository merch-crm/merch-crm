"use client";

import Image from "next/image";
import React from "react";
import {
    Plus,
    MoreHorizontal,
    Smartphone,
    Thermometer,
    Wind,
    Lightbulb,
    Power,
    ChevronRight,
    ChevronDown,
    Search,
    Settings,
    Zap,
    Moon,
    Sun
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SmartHomeDashboardCRM() {
    return (
        <div className="w-full glass-panel p-8 rounded-[var(--radius-outer)] mt-10 overflow-hidden relative">
            {/* Ambient Orbs */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[var(--radius-inner)] bg-slate-900 flex items-center justify-center text-primary shadow-2xl shadow-slate-900/20 overflow-hidden group">
                        <Image src="https://i.pravatar.cc/100?img=33" alt="user" width={64} height={64} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 leading-tight">Welcome home, Leonid</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-bold  text-slate-400">Monday, 27 Jan 2025</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <div className="flex items-center gap-1.5 text-primary text-xs font-bold ">
                                <Zap className="w-3 h-3" />
                                <span>4 active devices</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button type="button" className="w-12 h-12 rounded-[var(--radius-inner)] glass-panel flex items-center justify-center hover:scale-110 transition-transform">
                        <Search className="w-5 h-5 text-slate-600" />
                    </button>
                    <button type="button" className="h-12 px-6 rounded-[var(--radius-inner)] btn-primary flex items-center gap-2 text-sm font-bold">
                        <Plus className="w-4 h-4" />
                        Add Device
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">

                {/* Left: Device Grid */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold text-slate-900">Your Devices</h2>
                        <button type="button" className="text-xs font-bold text-slate-400 hover:text-primary  transition-colors flex items-center gap-1">
                            Filter by Room <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {[
                            { name: "Smart TV", room: "Living Room", icon: <Smartphone />, status: "On", color: "bg-primary" },
                            { name: "Air Purifier", room: "Bedroom", icon: <Wind />, status: "Off", color: "bg-slate-200" },
                            { name: "Smart Light", room: "Kitchen", icon: <Lightbulb />, status: "On", color: "bg-primary" },
                            { name: "AC Unit", room: "Bedroom", icon: <Thermometer />, status: "Auto", color: "bg-primary" },
                        ].map((device, idx) => (
                            <div key={idx} className="crm-card p-6 flex flex-col justify-between min-h-[160px] group">
                                <div className="flex justify-between items-start">
                                    <div className={cn(
                                        "w-12 h-12 rounded-[var(--radius-inner)] flex items-center justify-center transition-all duration-500",
                                        device.status === "Off" ? "bg-slate-100 text-slate-400" : "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                                    )}>
                                        {React.isValidElement(device.icon) && React.cloneElement(device.icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <button type="button" className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-300 hover:text-slate-600 transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                        {device.status === "On" && (
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{device.name}</h3>
                                    <p className="text-xs font-bold  text-slate-400 mt-1">{device.room}</p>
                                </div>
                            </div>
                        ))}

                        {/* Add New Card Overlay */}
                        <button type="button" className="border-2 border-dashed border-slate-200 rounded-[var(--radius-outer)] p-6 min-h-[160px] flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all group">
                            <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-primary/40">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold ">Connect Device</span>
                        </button>
                    </div>

                    {/* Activity Section */}
                    <div className="crm-card p-0 overflow-hidden">
                        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                            <div>
                                <h3 className="font-bold">Energy Conservation</h3>
                                <p className="text-xs font-bold text-white/40  mt-1">Real-time stats</p>
                            </div>
                            <div className="flex gap-1">
                                <div className="w-2 h-8 bg-primary/20 rounded-full" />
                                <div className="w-2 h-8 bg-primary/40 rounded-full" />
                                <div className="w-2 h-8 bg-primary/60 rounded-full" />
                                <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_12px_rgba(93,0,255,0.6)]" />
                            </div>
                        </div>
                        <div className="p-8 flex items-end justify-between gap-4 h-48">
                            {[40, 60, 35, 75, 45, 90, 55, 30, 85, 40, 70].map((h, i) => (
                                <div key={i} className="flex-1 group relative">
                                    <div className="h-full w-full bg-slate-50 rounded-full overflow-hidden absolute inset-0" />
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-primary/10 group-hover:bg-primary transition-all duration-500 rounded-full"
                                        style={{ height: `${h}%` }}
                                    />
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {h}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Controls & Scenes */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Temperature Widget */}
                    <div className="crm-card p-8 bg-slate-900 text-white relative flex flex-col items-center">
                        <div className="absolute top-4 right-4">
                            <button type="button" className="w-10 h-10 rounded-[var(--radius-inner)] bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>

                        <h3 className="text-lg font-bold mb-8 w-full">Climate Control</h3>

                        {/* Dial SVG */}
                        <div className="relative w-48 h-48 mb-6">
                            <svg className="w-full h-full -rotate-180" viewBox="0 0 100 100">
                                <path d="M 15 50 A 35 35 0 1 1 85 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" strokeLinecap="round" />
                                <path d="M 15 50 A 35 35 0 1 1 65 20" fill="none" stroke="#5d00ff" strokeWidth="8" strokeLinecap="round" strokeDasharray="110" strokeDashoffset="0" className="drop-shadow-[0_0_8px_rgba(93,0,255,0.8)]" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-4xl font-bold">24.5°</div>
                                <div className="text-xs  font-bold text-primary mt-1">Optimal</div>
                            </div>
                        </div>

                        <div className="flex gap-4 w-full">
                            <button type="button" className="flex-1 h-12 rounded-[var(--radius-inner)] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                                <Wind className="w-5 h-5 text-sky-400" />
                            </button>
                            <button type="button" className="flex-1 h-12 rounded-[var(--radius-inner)] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                                <Zap className="w-5 h-5 text-amber-400" />
                            </button>
                        </div>
                    </div>

                    {/* Scenes */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-900 px-2">Ready Scenes</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { name: "Night Mode", icon: <Moon />, active: true, color: "bg-slate-900" },
                                { name: "Morning", icon: <Sun />, active: false, color: "bg-white" },
                            ].map((scene, idx) => (
                                <div key={idx} className={cn(
                                    "p-6 rounded-[var(--radius-outer)] flex flex-col gap-4 border transition-all cursor-pointer group shadow-crm-md hover:shadow-crm-lg",
                                    scene.active ? (scene.color === "bg-slate-900" ? "bg-slate-900 text-white border-slate-800" : "bg-white text-slate-900 border-primary/40") : "bg-white text-slate-900 border-slate-200 opacity-60 hover:opacity-100"
                                )}>
                                    <div className={cn(
                                        "w-10 h-10 rounded-[var(--radius-inner)] flex items-center justify-center transition-transform group-hover:rotate-12",
                                        scene.color === "bg-slate-900" ? "bg-white/10 text-primary" : "bg-slate-50 text-slate-400"
                                    )}>
                                        {React.isValidElement(scene.icon) && React.cloneElement(scene.icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
                                    </div>
                                    <div className="text-xs font-bold ">{scene.name}</div>
                                </div>
                            ))}
                        </div>

                        <div className="crm-card p-4 flex items-center justify-between group cursor-pointer hover:bg-primary/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                                    <Power className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-bold text-slate-900">Manage all shortcuts</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
