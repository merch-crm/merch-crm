"use client";

import Image from "next/image";
import React from "react";
import {
    Search,
    SlidersHorizontal,
    Calendar,
    ChevronDown,
    Plus,
    ArrowUpRight,
    MoreHorizontal,
    Apple
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AnalyticsCRM() {
    return (
        <div className="space-y-3 mt-10">

            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <h1 className="text-4xl font-bold text-slate-900">Analytics</h1>

                <div className="flex items-center gap-3">
                    <button type="button" className="w-10 h-10 rounded-[var(--radius-inner)] glass-panel flex items-center justify-center hover:scale-110 transition-transform"><Search className="w-5 h-5 text-slate-600" /></button>
                    <button type="button" className="w-10 h-10 rounded-[var(--radius-inner)] glass-panel flex items-center justify-center hover:scale-110 transition-transform"><SlidersHorizontal className="w-5 h-5 text-slate-600" /></button>
                    <button type="button" className="h-10 px-4 rounded-[var(--radius-inner)] glass-panel flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        <Calendar className="w-4 h-4" />
                        <span>27 Jan - 27 Feb</span>
                        <ChevronDown className="w-4 h-4 opacity-50" />
                    </button>
                    <button type="button" className="h-10 px-4 rounded-[var(--radius-inner)] bg-primary text-white flex items-center gap-2 text-sm font-bold hover:bg-primary-hover transition-colors shadow-xl shadow-primary/20">
                        <Plus className="w-4 h-4" />
                        Add Wallet
                    </button>
                </div>
            </header>


            {/* --- GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">

                {/* EXPENSES (Dark Card) */}
                <div className="lg:col-span-4 bg-slate-900 rounded-[var(--radius-outer)] p-6 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20 min-h-[400px] flex flex-col">
                    {/* Purple Glow */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#5d00ff]/30 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold">Expenses</h3>
                            <button type="button" className="w-8 h-8 rounded-[var(--radius-inner)] bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Pie Chart */}
                        <div className="flex items-center justify-center mb-8">
                            <div className="relative w-48 h-48">
                                <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="20" />
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="#5d00ff" strokeWidth="20" strokeDasharray="251 502" strokeLinecap="round" />
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="#a78bfa" strokeWidth="20" strokeDasharray="125 502" strokeDashoffset="-251" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-sm font-bold text-white/60 ">All expenses</div>
                                    <div className="text-3xl font-bold">$5120<span className="text-lg">.00</span></div>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm font-medium text-white/60 leading-relaxed">
                            All current month. There is an increase in spending in certain categories.
                        </p>
                    </div>
                </div>


                {/* REPLENISHMENT */}
                <div className="lg:col-span-4 glass-panel p-6 min-h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">Replenishment</h3>
                        <button type="button" className="w-8 h-8 rounded-[var(--radius-inner)] bg-white/50 border border-white/60 flex items-center justify-center hover:scale-110 transition-transform">
                            <MoreHorizontal className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>

                    {/* Credit Card Visual */}
                    <div className="relative w-full h-[180px] bg-gradient-to-br from-[#5d00ff] to-[#3a0099] rounded-[var(--radius-outer)] p-6 mb-6 shadow-xl shadow-[#5d00ff]/20">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md" />
                            <Apple className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="text-white/60 text-xs font-bold  mb-2">Balance</div>
                            <div className="text-white text-2xl font-bold">$ 4,532.00</div>
                        </div>
                    </div>

                    {/* Graph */}
                    <div className="flex-1 flex items-end justify-between gap-2 h-24">
                        {[30, 45, 60, 50, 55, 65, 40].map((h, idx) => (
                            <div key={idx} className="flex-1 bg-slate-100 rounded-t-lg" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </div>


                {/* TRANSFERS TO PEOPLE */}
                <div className="lg:col-span-4 glass-panel p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">Transfers to people</h3>
                        <button type="button" className="text-xs font-bold text-slate-400 hover:text-slate-900 ">See all</button>
                    </div>

                    <div className="space-y-3">
                        {[
                            { name: "Robert Fox", amount: "$1,300.00", percent: 68 },
                            { name: "Kathryn Murphy", amount: "$800.00", percent: 32 },
                            { name: "Darlene Robertson", amount: "$450.00", percent: 15 },
                        ].map((person, idx) => (
                            <div key={idx}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                                            <Image src={`https://i.pravatar.cc/100?img=${idx + 20}`} alt={person.name} width={40} height={40} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-sm font-bold">{person.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-400">{person.amount}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#5d00ff] rounded-full" style={{ width: `${person.percent}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


                {/* SPENDING CATEGORIES */}
                <div className="lg:col-span-6 glass-panel p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">Spending categories</h3>
                        <button type="button" className="w-8 h-8 rounded-[var(--radius-inner)] bg-white/50 border border-white/60 flex items-center justify-center hover:scale-110 transition-transform">
                            <MoreHorizontal className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-6 flex">
                        <div className="bg-slate-900" style={{ width: '40%' }} />
                        <div className="bg-slate-400" style={{ width: '30%' }} />
                        <div className="bg-slate-300" style={{ width: '20%' }} />
                        <div className="bg-slate-200" style={{ width: '10%' }} />
                    </div>

                    {/* Transactions */}
                    <div className="space-y-3">
                        {[
                            { icon: "🍔", name: "Nike Store", category: "Purchase", amount: "-$54.90", color: "bg-slate-900" },
                            { icon: "🎮", name: "PlayStation Network", category: "Purchase", amount: "-$28.66", color: "bg-slate-400" },
                        ].map((tx, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-[var(--radius-inner)] hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", tx.color)}>
                                        <span className="text-lg">{tx.icon}</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">{tx.name}</div>
                                        <div className="text-xs text-slate-400 font-medium">{tx.category}</div>
                                    </div>
                                </div>
                                <span className="text-sm font-bold">{tx.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>


                {/* YOUR EXPENSES THIS YEAR */}
                <div className="lg:col-span-6 glass-panel p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">Your expenses this year</h3>
                        <div className="flex items-center gap-2">
                            <button type="button" className="w-8 h-8 rounded-[var(--radius-inner)] bg-white/50 border border-white/60 flex items-center justify-center hover:scale-110 transition-transform">
                                <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                            </button>
                            <button type="button" className="w-8 h-8 rounded-[var(--radius-inner)] bg-white/50 border border-white/60 flex items-center justify-center hover:scale-110 transition-transform">
                                <ArrowUpRight className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                    </div>

                    {/* Wave Graph */}
                    <motion.svg
                        viewBox="0 0 400 100"
                        className="w-full h-24 mb-4"
                        initial="initial"
                        animate="animate"
                    >
                        <motion.path
                            d="M 0 50 Q 50 20, 100 50 T 200 50 T 300 50 T 400 50"
                            fill="none"
                            stroke="#5d00ff"
                            strokeWidth="2"
                            variants={{
                                initial: { pathLength: 0, opacity: 0 },
                                animate: {
                                    pathLength: 1,
                                    opacity: 1,
                                    transition: { duration: 2, ease: "easeInOut" }
                                }
                            }}
                        />
                        <motion.path
                            d="M 0 50 Q 50 20, 100 50 T 200 50 T 300 50 T 400 50 L 400 100 L 0 100 Z"
                            fill="url(#gradient)"
                            variants={{
                                initial: { opacity: 0 },
                                animate: {
                                    opacity: 0.2,
                                    transition: { duration: 1, delay: 1.5 }
                                }
                            }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#5d00ff" />
                                <stop offset="100%" stopColor="#5d00ff" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </motion.svg>

                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">$28,460</span>
                        <span className="text-sm text-slate-400 font-medium">.00 This is $10,660.00 less than last year</span>
                    </div>
                </div>


                {/* YOUR CURRENCIES */}
                <div className="lg:col-span-12 glass-panel p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">Your currencies</h3>
                        <button type="button" className="h-10 px-4 rounded-[var(--radius-inner)] bg-primary text-white flex items-center gap-2 text-sm font-bold hover:bg-primary-hover transition-colors shadow-xl shadow-primary/20">
                            <Plus className="w-4 h-4" />
                            Add Currency
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { flag: "🇺🇸", code: "USD", name: "US Dollar", amount: "96.00", percent: "+0.8%" },
                            { flag: "🇪🇺", code: "EUR", name: "Euro", amount: "103.00", percent: "+1.2%" },
                            { flag: "🇬🇧", code: "GBP", name: "British Pound", amount: "120.00", percent: "-0.3%" },
                        ].map((currency, idx) => (
                            <div key={idx} className="bg-slate-50/50 rounded-[var(--radius-inner)] p-4 border border-white/60 hover:bg-slate-100/50 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-3xl">{currency.flag}</span>
                                    <div>
                                        <div className="text-sm font-bold">{currency.code}</div>
                                        <div className="text-xs text-slate-400 font-medium">{currency.name}</div>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold">$ {currency.amount}</span>
                                    <span className={cn("text-xs font-bold", currency.percent.startsWith('+') ? "text-green-500" : "text-rose-500")}>
                                        {currency.percent}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}
