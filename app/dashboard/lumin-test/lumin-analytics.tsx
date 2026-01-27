"use client";

import React from "react";
import {
    Search,
    SlidersHorizontal,
    Calendar,
    ChevronDown,
    Plus,
    ArrowUpRight,
    Apple
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Reusing Button from page.tsx concept, but defined here for portability if needed
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "icon";
}

const Button = ({ className, children, variant = "primary", ...props }: ButtonProps) => {
    return (
        <button
            className={cn(
                "flex items-center justify-center transition-all active:scale-95",
                variant === "icon" && "w-10 h-10 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                variant === "primary" && "bg-black text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-slate-800",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export default function LuminAnalytics() {
    return (
        <div className="w-full bg-[#F2F4F8] p-8 rounded-[40px] border border-slate-200/50 mt-10">

            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                        <span className="sr-only">Back</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-4xl font-normal tracking-normal text-slate-900">Analytics</h1>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="icon"><Search className="w-5 h-5" /></Button>
                    <Button variant="icon"><SlidersHorizontal className="w-5 h-5" /></Button>

                    <button className="h-10 px-4 rounded-full border border-slate-200 bg-white flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        <Calendar className="w-4 h-4" />
                        <span>27 Jan - 27 Feb, 2025</span>
                        <ChevronDown className="w-4 h-4 opacity-50" />
                    </button>

                    <Button variant="primary" className="gap-2 bg-slate-900 border border-slate-800 hover:bg-black">
                        <Plus className="w-4 h-4" /> Add Widget
                    </Button>
                </div>
            </header>

            {/* --- GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* 1. EXPENSES (Dark Card) - Col Span 1 */}
                <div className="xl:col-span-1 bg-black rounded-[32px] p-6 text-white flex flex-col justify-between min-h-[380px] relative overflow-hidden group">
                    <div className="absolute top-[30%] -right-[20%] w-[200px] h-[200px] bg-[#dfff00]/10 rounded-full blur-[80px]" />

                    <div className="flex justify-between items-start z-10">
                        <h3 className="text-lg text-white/80 font-normal">Expenses</h3>
                        <div className="bg-[#1a1a1a] rounded-[18px] px-3 py-2 text-right">
                            <div className="text-[10px] text-white/40  tracking-wider mb-0.5">Purchases</div>
                            <div className="text-sm font-mono text-white/90">$3,254.00</div>
                        </div>
                    </div>

                    {/* Donut Chart Visual */}
                    <div className="relative w-48 h-48 mx-auto my-6 flex items-center justify-center">
                        {/* SVG Chart */}
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                            {/* Track */}
                            <circle cx="50" cy="50" r="40" stroke="#333" strokeWidth="12" fill="none" />
                            {/* Segment 1 (Lime) */}
                            <circle cx="50" cy="50" r="40" stroke="#dfff00" strokeWidth="12" fill="none" strokeDasharray="180 251" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(223,255,0,0.3)]" />
                            {/* Segment 2 (White) */}
                            <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="12" fill="none" strokeDasharray="40 251" strokeDashoffset="-190" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-mono text-xl tracking-normal">
                            $5,120.00
                        </div>
                    </div>

                    <div className="z-10">
                        <p className="text-xs text-white/50 leading-relaxed">
                            At current month, there is an increase in spending in certain categories.
                        </p>
                    </div>
                </div>

                {/* 2. REPLENISHMENT (White Card + Green Visual) - Col Span 1 */}
                <div className="xl:col-span-1 bg-white rounded-[32px] p-6 flex flex-col justify-between min-h-[380px] overflow-hidden">
                    <h3 className="text-lg font-normal mb-6">Replenishment</h3>

                    {/* Card Visual */}
                    <div className="w-[80%] mx-auto aspect-[1.58] bg-gradient-to-br from-[#b4d600] to-[#7a9100] rounded-[18px] shadow-lg relative p-4 mb-4 transform group-hover:scale-105 transition-transform">
                        <div className="flex justify-between">
                            <div className="w-6 h-6 rounded-full bg-white/20" />
                            <div className="w-8 h-10 bg-black/10 rounded-sm" />
                        </div>
                    </div>

                    {/* Area Chart Visual */}
                    <div className="relative h-24 mt-auto">
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            <path d="M0,80 Q30,60 50,70 T100,50 T150,60 T200,40 T250,50 V100 H0 Z" fill="#F3F4F6" />
                            <path d="M0,80 Q30,60 50,70 T100,50 T150,60 T200,40 T250,50" fill="none" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 4" />
                            {/* Point */}
                            <g transform="translate(130, 52)">
                                <rect x="-25" y="-25" width="50" height="24" rx="12" fill="#111" />
                                <text x="0" y="-10" textAnchor="middle" fill="#dfff00" fontSize="10" fontWeight="bold">+4.2%</text>
                                <text x="0" y="5" textAnchor="middle" fill="white" fontSize="8" opacity="0.7">27 Jan</text>
                                <circle cx="0" cy="12" r="3" fill="#111" />
                            </g>
                        </svg>
                    </div>
                </div>

                {/* 3. TRANSFERS TO PEOPLE & SPENDING CATEGORIES - Col Span 2 */}
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Transfers */}
                    <div className="bg-white rounded-[32px] p-6 flex flex-col">
                        <h3 className="text-lg font-normal mb-6">Transfers to people</h3>
                        <div className="space-y-6">
                            {[
                                { name: "Robert Fox", bg: "bg-slate-200", percent: 68 },
                                { name: "Kathryn Murphy", bg: "bg-orange-100", percent: 32 },
                                { name: "Darlene Robertson", bg: "bg-blue-100", percent: 15 },
                            ].map((person, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden relative">
                                        <Image src={`https://i.pravatar.cc/100?img=${idx + 15}`} fill className="object-cover" alt={person.name} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium">{person.name}</span>
                                            <span className="text-sm text-slate-400">{person.percent}%</span>
                                        </div>
                                        <div className="text-xs text-slate-400 mb-2">$1,200.00</div>
                                        {/* Thin Progress Bar */}
                                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-900 rounded-full" style={{ width: `${person.percent}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="bg-white rounded-[32px] p-6 flex flex-col">
                        <h3 className="text-lg font-normal mb-6">Spending categories</h3>

                        {/* Visual Bar */}
                        <div className="flex h-4 w-full rounded-full overflow-hidden mb-8">
                            <div className="w-[45%] bg-[#dfff00]" />
                            <div className="w-[30%] bg-[#7a9100]" />
                            <div className="w-[25%] bg-[#333]" />
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M21.419 15.345c.026.177.042.36.042.545 0 2.55-2.068 4.618-4.618 4.618-2.55 0-4.618-2.068-4.618-4.618 0-.185.016-.368.042-.545.918.57 2.016.903 3.19.903s3.655-.333 4.576-.903zm-14.838-2.69c.026.177.042.36.042.545 0 2.55-2.068 4.618-4.618 4.618-2.55 0-4.618-2.068-4.618-4.618 0-.185.016-.368.042-.545.918.57 2.016.903 3.19.903s3.655-.333 4.576-.903z" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">Nike Store</div>
                                        <div className="text-xs text-slate-400">Purchase</div>
                                    </div>
                                </div>
                                <span className="font-mono text-sm">-$45.90</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold font-serif">P</div>
                                    <div>
                                        <div className="text-sm font-medium">PlayStation Network</div>
                                        <div className="text-xs text-slate-400">Purchase</div>
                                    </div>
                                </div>
                                <span className="font-mono text-sm">-$28.60</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                                        <Apple className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">Apple Store</div>
                                        <div className="text-xs text-slate-400">Purchase</div>
                                    </div>
                                </div>
                                <span className="font-mono text-sm">-$112.00</span>
                            </div>
                        </div>

                    </div>

                </div>

                {/* 4. EXPENSES THIS YEAR (Wide Graph) - Col Span 3 */}
                <div className="xl:col-span-3 bg-white rounded-[32px] p-8 flex flex-col justify-between min-h-[300px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-normal">Your expenses this year</h3>
                        <div className="flex gap-2">
                            <Button variant="icon"><SlidersHorizontal className="w-4 h-4" /></Button>
                            <Button variant="icon"><ArrowUpRight className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    <div className="relative h-40 w-full">
                        {/* Simplified Wave Chart */}
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            <path d="M0,80 C50,80 80,40 120,60 S200,90 250,50 S350,20 400,60 S500,80 600,60 V120 H0 Z" fill="url(#gradient-wave)" opacity="0.1" />
                            <path d="M0,80 C50,80 80,40 120,60 S200,90 250,50 S350,20 400,60 S500,80 600,60" fill="none" stroke="#333" strokeWidth="2" />

                            <defs>
                                <linearGradient id="gradient-wave" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#000" />
                                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Tooltips/Points */}
                            <g transform="translate(250, 50)">
                                <circle r="4" fill="black" stroke="white" strokeWidth="2" />
                                <rect x="-30" y="-35" width="60" height="24" rx="12" fill="#dfff00" />
                                <text x="0" y="-20" textAnchor="middle" fontSize="10" fontWeight="bold">$2,100.00</text>
                            </g>

                            <g transform="translate(180, 70)">
                                <circle r="4" fill="white" stroke="#ccc" strokeWidth="2" />
                                <rect x="-30" y="-35" width="60" height="24" rx="12" fill="#eee" />
                                <text x="0" y="-20" textAnchor="middle" fontSize="10" fill="#666">$1,946.00</text>
                            </g>
                        </svg>
                    </div>

                    <div className="flex justify-between mt-4 text-xs text-slate-400  tracking-wider">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Jun</span>
                        <span className="text-black font-bold bg-black text-white px-2 py-0.5 rounded-md">Jul</span>
                        <span>Aug</span><span>Sep</span><span>Oct</span>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                        <span className="text-xl font-mono tracking-normal">$28,460.00</span>
                        <span className="text-xs text-slate-400">This is $5,650.00 less than last year</span>
                    </div>
                </div>

                {/* 5. YOUR CURRENCIES - Col Span 1 */}
                <div className="xl:col-span-1 bg-white rounded-[32px] p-6 relative overflow-hidden flex flex-col">
                    <h3 className="text-lg font-normal mb-6">Your currencies</h3>

                    <div className="relative flex-1 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-[#dfff00] flex items-center justify-center relative z-10">
                            <span className="text-3xl font-bold font-mono">USD</span>
                        </div>
                        <div className="w-20 h-20 rounded-full bg-slate-100 absolute top-10 right-0 flex items-center justify-center z-0">
                            <span className="text-xs font-bold font-mono text-slate-400">$</span>
                        </div>
                    </div>
                    <div className="text-center font-mono text-xl mt-4">86%</div>
                </div>

            </div>
        </div>
    );
}
