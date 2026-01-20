"use client";

import React from "react";
import {
    Search,
    SlidersHorizontal,
    Calendar,
    ChevronDown,
    Plus,
    ArrowUpRight,
    CreditCard,
    Megaphone,
    Crown,
    Smartphone,
    Apple
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CardsCRM() {
    return (
        <div className="space-y-8">

            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button className="w-10 h-10 rounded-[var(--radius-inner)] glass-panel flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">Cards</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-[var(--radius-inner)] glass-panel flex items-center justify-center hover:scale-110 transition-transform"><Search className="w-5 h-5 text-slate-600" /></button>
                    <button className="w-10 h-10 rounded-[var(--radius-inner)] glass-panel flex items-center justify-center hover:scale-110 transition-transform"><SlidersHorizontal className="w-5 h-5 text-slate-600" /></button>

                    <button className="h-10 px-4 rounded-[var(--radius-inner)] glass-panel flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        <Calendar className="w-4 h-4" />
                        <span>27 Jan - 27 Feb, 2025</span>
                        <ChevronDown className="w-4 h-4 opacity-50" />
                    </button>
                </div>
            </header>


            {/* --- HERO: DIGITAL CARDS --- */}
            <section className="bg-slate-900 rounded-[var(--radius-outer)] p-2 overflow-hidden text-white relative shadow-2xl shadow-slate-900/20">
                {/* Purple Glow */}
                <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-[#5d00ff]/30 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex flex-col xl:flex-row gap-6 p-6 md:p-8">
                    {/* Left Text Block */}
                    <div className="flex flex-col justify-center min-w-[280px] relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-3xl font-bold">Digital card</h2>
                            <span className="px-3 py-1 rounded-[var(--radius-inner)] border border-white/20 text-xs font-bold text-white/70 bg-white/5">Free</span>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed max-w-[260px] font-medium">
                            A card that exists only online, but works everywhere. Easy, safe and always at hand.
                        </p>
                    </div>

                    {/* Cards Container */}
                    <div className="flex-1 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">

                        {/* Add Button */}
                        <button className="min-w-[80px] w-[80px] h-[200px] rounded-[var(--radius-outer)] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group backdrop-blur-sm">
                            <Plus className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                        </button>

                        {/* Card 1 */}
                        <div className="min-w-[340px] h-[200px] rounded-[var(--radius-outer)] bg-white/10 backdrop-blur-md border border-white/10 relative p-6 flex flex-col justify-between group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[#5d00ff]/20 hover:shadow-xl">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-[#5d00ff] rounded-sm flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                    <span className="font-bold text-[#5d00ff]">CRM</span>
                                </div>
                                <div className="flex -space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/10" />
                                    <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-sm border border-white/10" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="font-mono text-xl tracking-widest text-white/90">7812 2139 0823 XXXX</div>
                                <div className="flex gap-8 text-[10px] uppercase tracking-wider text-white/50 font-bold">
                                    <div>
                                        <div className="mb-1 text-[8px]">Valid Thru</div>
                                        <div className="text-white font-mono">05/24</div>
                                    </div>
                                    <div>
                                        <div className="mb-1 text-[8px]">CVV</div>
                                        <div className="text-white font-mono">09X</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10">
                                <SlidersHorizontal className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="min-w-[340px] h-[200px] rounded-[var(--radius-outer)] bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border border-white/10 relative p-6 flex flex-col justify-between group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[#5d00ff]/20 hover:shadow-xl">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-[#5d00ff] rounded-sm flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                    <span className="font-bold text-[#5d00ff]">CRM</span>
                                </div>
                                <div className="flex -space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/10" />
                                    <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-sm border border-white/10" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="font-mono text-xl tracking-widest text-white/90">5622 4544 0845 XXXX</div>
                                <div className="flex gap-8 text-[10px] uppercase tracking-wider text-white/50 font-bold">
                                    <div>
                                        <div className="mb-1 text-[8px]">Valid Thru</div>
                                        <div className="text-white font-mono">02/25</div>
                                    </div>
                                    <div>
                                        <div className="mb-1 text-[8px]">CVV</div>
                                        <div className="text-white font-mono">23X</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10">
                                <SlidersHorizontal className="w-4 h-4" />
                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* --- BOTTOM GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* 1. PHYSICAL CARD */}
                <div className="lg:col-span-4 glass-panel p-8 flex flex-col justify-between min-h-[400px]">
                    <div>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold mb-1">Order</h3>
                                <h3 className="text-lg font-bold text-slate-500">a physical card</h3>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-[var(--radius-inner)] bg-white/50 border border-white/60 flex items-center justify-center hover:scale-110 transition-transform"><SlidersHorizontal className="w-4 h-4 text-slate-600" /></button>
                                <button className="w-8 h-8 rounded-[var(--radius-inner)] bg-white/50 border border-white/60 flex items-center justify-center hover:scale-110 transition-transform"><ArrowUpRight className="w-4 h-4 text-slate-600" /></button>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-[200px] mb-8 font-medium">
                            Pay and withdraw money all over the world. Your card is always ready.
                        </p>
                        <button className="bg-primary text-white px-6 py-3 rounded-[var(--radius-inner)] font-bold text-sm hover:bg-primary-hover transition-colors shadow-xl shadow-primary/20">
                            Order Card
                        </button>
                    </div>

                    {/* Vertical Card Preview */}
                    <div className="self-end mt-4 relative w-[140px] h-[220px] bg-gradient-to-b from-[#5d00ff] to-[#3a0099] rounded-[var(--radius-outer)] shadow-2xl shadow-[#5d00ff]/30 transform rotate-6 hover:rotate-0 transition-all duration-500 p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-md" />
                            <div className="w-6 h-8 bg-black/20 rounded-sm" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                                <img src="https://i.pravatar.cc/100?img=11" alt="avatar" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[8px] text-white font-bold">Albert Flores</span>
                        </div>
                    </div>
                </div>

                {/* 2. WHATS NEW */}
                <div className="lg:col-span-4 glass-panel p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold">Whats new</h3>
                        <div className="flex gap-2">
                            <button className="w-8 h-8 rounded-[var(--radius-inner)] bg-white/50 border border-white/60 flex items-center justify-center hover:scale-110 transition-transform"><SlidersHorizontal className="w-4 h-4 text-slate-600" /></button>
                            <button className="w-8 h-8 rounded-[var(--radius-inner)] bg-white/50 border border-white/60 flex items-center justify-center hover:scale-110 transition-transform"><ArrowUpRight className="w-4 h-4 text-slate-600" /></button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { icon: "16%", text: "Short-term deposits with increased income up to 16%", date: "27 Feb, 2025" },
                            { icon: "x2", text: "we have increased the limits on physical cards by 2 times", date: "16 Feb, 2025" },
                            { icon: "2%", text: "2% cashback is now available for tickets to sports matches", date: "02 Feb, 2025" },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-slate-50/50 rounded-[var(--radius-inner)] p-4 flex gap-4 hover:bg-slate-100/50 transition-colors cursor-pointer border border-white/60">
                                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                                    <span className="text-[#5d00ff] text-xs font-bold">{item.icon}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold leading-tight mb-2">{item.text}</p>
                                    <span className="text-xs text-slate-400 font-medium">{item.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. WIDGETS & CASHBACK */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* 3 Small Widgets */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#5d00ff] rounded-[var(--radius-inner)] p-4 h-[120px] flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:bg-[#4a00cc] transition-colors">
                            <Megaphone className="w-6 h-6 text-white z-10" />
                            <div className="z-10 text-[10px] font-bold uppercase leading-tight text-white">Referral<br />program</div>
                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full" />
                        </div>

                        <div className="bg-[#5d00ff] rounded-[var(--radius-inner)] p-4 h-[120px] flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:bg-[#4a00cc] transition-colors">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#5d00ff] mb-2">
                                <Crown className="w-4 h-4" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] font-bold uppercase leading-tight text-white">PRO<br />version</div>
                                <span className="text-[10px] font-bold text-white">Pro</span>
                            </div>
                        </div>

                        <div className="bg-[#5d00ff] rounded-[var(--radius-inner)] p-4 h-[120px] flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:bg-[#4a00cc] transition-colors">
                            <div className="absolute top-2 right-2 w-10 h-10 bg-white rounded-xl rotate-12 flex items-center justify-center">
                                <span className="text-[#5d00ff] text-[10px] font-bold">20%</span>
                            </div>
                            <Smartphone className="w-6 h-6 text-white mt-1" />
                            <div className="text-[10px] font-bold uppercase leading-tight mt-auto text-white">Cashback<br />up to 20%</div>
                        </div>
                    </div>

                    {/* Cashback List */}
                    <div className="glass-panel p-6 flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Cashback from partners</h3>
                            <button className="w-8 h-8 rounded-[var(--radius-inner)] bg-white/50 border border-white/60 flex items-center justify-center hover:scale-110 transition-transform"><ArrowUpRight className="w-4 h-4 text-slate-600" /></button>
                        </div>

                        <div className="space-y-6">
                            {[
                                { name: "Apple", cashback: "1.5%" },
                                { name: "McDonald's", cashback: "1.2%" },
                                { name: "PlayStation Network", cashback: "4.5%" },
                            ].map((partner, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
                                            {idx === 0 && <Apple className="w-5 h-5" />}
                                            {idx === 1 && <div className="text-[#ffc400] font-bold text-xs">M</div>}
                                            {idx === 2 && <div className="font-bold text-lg">P</div>}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">{partner.name}</div>
                                            <div className="text-xs text-slate-400 font-medium">Cashback {partner.cashback}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
