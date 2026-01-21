"use client";

import React from "react";
import {
    Search,
    SlidersHorizontal,
    Calendar,
    ChevronDown,
    Plus,
    ArrowUpRight,
    Megaphone,
    Crown,
    Smartphone,
    Apple
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import LuminAnalytics from "./lumin-analytics";
import TwistyDashboard from "./twisty-dashboard";
import InvoiceDashboard from "./invoice-dashboard";
import SmartHomeDashboard from "./smart-home-dashboard";
import AquaflowLanding from "./aquaflow-landing";
import UiComponentsShowcase from "./ui-components-showcase";
import EduplexDashboard from "./eduplex-dashboard";
import FocusFlowDashboard from "./focus-flow-dashboard";

// --- Mock Data & Components ---

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

const CardAction = ({ icon: Icon, dark = false }: { icon: React.ElementType, dark?: boolean }) => (
    <div className={cn(
        "absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md",
        dark ? "bg-white/10 text-white" : "bg-black/5 text-black"
    )}>
        <Icon className="w-4 h-4" />
    </div>
);

export default function LuminTestPage() {
    return (
        <div className="min-h-screen bg-[#F2F4F8] p-4 md:p-8 font-sans text-slate-900">
            <div className="max-w-[1400px] mx-auto space-y-8">

                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                            <span className="sr-only">Back</span>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                        </button>
                        <h1 className="text-4xl font-normal tracking-tight text-slate-900">Cards</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="icon"><Search className="w-5 h-5" /></Button>
                        <Button variant="icon"><SlidersHorizontal className="w-5 h-5" /></Button>

                        <button className="h-10 px-4 rounded-full border border-slate-200 bg-white flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            <Calendar className="w-4 h-4" />
                            <span>27 Jan - 27 Feb, 2025</span>
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </button>
                    </div>
                </header>


                {/* --- HERO: DIGITAL CARDS --- */}
                <section className="bg-black rounded-[40px] p-2 overflow-hidden text-white relative">
                    <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-[#dfff00]/20 rounded-full blur-[100px] pointer-events-none" />

                    <div className="flex flex-col xl:flex-row gap-6 p-6 md:p-8">
                        {/* Left Text Block */}
                        <div className="flex flex-col justify-center min-w-[280px]">
                            <div className="flex items-center gap-3 mb-4">
                                <h2 className="text-3xl font-normal">Digital card</h2>
                                <span className="px-3 py-1 rounded-full border border-white/20 text-xs font-medium text-white/70">Free</span>
                            </div>
                            <p className="text-white/60 text-sm leading-relaxed max-w-[260px]">
                                A card that exists only online, but works everywhere. Easy, safe and always at hand.
                            </p>
                        </div>

                        {/* Cards Container */}
                        <div className="flex-1 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">

                            {/* Add Button */}
                            <button className="min-w-[80px] w-[80px] h-[200px] rounded-[24px] bg-[#1a1a1a] flex items-center justify-center hover:bg-[#252525] transition-colors group">
                                <Plus className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                            </button>

                            {/* Card 1: Main Dark */}
                            <div className="min-w-[340px] h-[200px] rounded-[24px] bg-[#1a1a1a] relative p-6 flex flex-col justify-between group cursor-pointer transition-transform hover:-translate-y-1">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-[#dfff00] rounded-sm flex items-center justify-center">
                                            <div className="w-2 h-2 bg-black rounded-full" />
                                        </div>
                                        <span className="font-semibold text-[#dfff00]">lumin</span>
                                    </div>
                                    <div className="flex -space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm" />
                                        <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-sm" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="font-mono text-xl tracking-widest text-white/90">7812 2139 0823 XXXX</div>
                                    <div className="flex gap-8 text-[10px] uppercase tracking-wider text-white/50">
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
                                <CardAction icon={SlidersHorizontal} dark />
                            </div>

                            {/* Card 2: Glass/Dark variation */}
                            <div className="min-w-[340px] h-[200px] rounded-[24px] bg-[#333] relative p-6 flex flex-col justify-between group cursor-pointer transition-transform hover:-translate-y-1 overflow-hidden">
                                {/* Background mesh/gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#111]" />

                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-[#dfff00] rounded-sm flex items-center justify-center">
                                            <div className="w-2 h-2 bg-black rounded-full" />
                                        </div>
                                        <span className="font-semibold text-[#dfff00]">lumin</span>
                                    </div>
                                    <div className="flex -space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm" />
                                        <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-sm" />
                                    </div>
                                </div>

                                <div className="relative z-10 space-y-4">
                                    <div className="font-mono text-xl tracking-widest text-white/90">5622 4544 0845 XXXX</div>
                                    <div className="flex gap-8 text-[10px] uppercase tracking-wider text-white/50">
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
                                <CardAction icon={SlidersHorizontal} dark />
                            </div>

                            {/* Card 3: Another variation */}
                            <div className="min-w-[340px] h-[200px] rounded-[24px] bg-[#1a1a1a] relative p-6 flex flex-col justify-between group cursor-pointer transition-transform hover:-translate-y-1">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-[#dfff00] rounded-sm flex items-center justify-center">
                                            <div className="w-2 h-2 bg-black rounded-full" />
                                        </div>
                                        <span className="font-semibold text-[#dfff00]">lumin</span>
                                    </div>
                                    <div className="flex -space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm" />
                                        <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-sm" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="font-mono text-xl tracking-widest text-white/90">6784 9987 7899 XXXX</div>
                                    <div className="flex gap-8 text-[10px] uppercase tracking-wider text-white/50">
                                        <div>
                                            <div className="mb-1 text-[8px]">Valid Thru</div>
                                            <div className="text-white font-mono">07/28</div>
                                        </div>
                                        <div>
                                            <div className="mb-1 text-[8px]">CVV</div>
                                            <div className="text-white font-mono">22X</div>
                                        </div>
                                    </div>
                                </div>
                                <CardAction icon={SlidersHorizontal} dark />
                            </div>

                        </div>
                    </div>
                </section>

                {/* --- BOTTOM GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* 1. PHYSICAL CARD (Col Span 4) */}
                    <div className="lg:col-span-4 bg-white rounded-[32px] p-8 flex flex-col justify-between min-h-[400px]">
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-medium mb-1">Order</h3>
                                    <h3 className="text-lg font-medium text-slate-500">a physical card</h3>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="icon" className="w-8 h-8"><SlidersHorizontal className="w-4 h-4" /></Button>
                                    <Button variant="icon" className="w-8 h-8"><ArrowUpRight className="w-4 h-4" /></Button>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-[200px] mb-8">
                                Pay and withdraw money all over the world. Your card is always ready.
                            </p>
                            <Button>Order Card</Button>
                        </div>

                        {/* Vertical Card Preview */}
                        <div className="self-end mt-4 relative w-[140px] h-[220px] bg-gradient-to-b from-[#b4d600] to-[#4a5e00] rounded-xl shadow-xl transform rotate-6 hover:rotate-0 transition-all duration-500 p-4 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-md" />
                                <div className="w-6 h-8 bg-black/20 rounded-sm" />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white overflow-hidden relative">
                                    <Image src="https://i.pravatar.cc/100?img=11" alt="avatar" fill className="object-cover" />
                                </div>
                                <span className="text-[8px] text-white font-medium">Albert Flores</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. WHATS NEW (Col Span 4) */}
                    <div className="lg:col-span-4 bg-white rounded-[32px] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-medium">Whats new</h3>
                            <div className="flex gap-2">
                                <Button variant="icon" className="w-8 h-8"><SlidersHorizontal className="w-4 h-4" /></Button>
                                <Button variant="icon" className="w-8 h-8"><ArrowUpRight className="w-4 h-4" /></Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Item 1 */}
                            <div className="bg-slate-50 rounded-2xl p-4 flex gap-4 hover:bg-slate-100 transition-colors cursor-pointer">
                                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shrink-0">
                                    <span className="text-[#dfff00] text-xs font-bold">16%</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-tight mb-2">Short-term deposits with increased income up to 16%</p>
                                    <span className="text-xs text-slate-400">27 Feb, 2025</span>
                                </div>
                            </div>

                            {/* Item 2 */}
                            <div className="bg-slate-50 rounded-2xl p-4 flex gap-4 hover:bg-slate-100 transition-colors cursor-pointer">
                                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shrink-0">
                                    <span className="text-white text-xs font-bold">x2</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-tight mb-2">we have increased the limits on physical cards by 2 times</p>
                                    <span className="text-xs text-slate-400">16 Feb, 2025</span>
                                </div>
                            </div>

                            {/* Item 3 */}
                            <div className="bg-slate-50 rounded-2xl p-4 flex gap-4 hover:bg-slate-100 transition-colors cursor-pointer">
                                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shrink-0">
                                    <span className="text-white text-xs font-bold">2%</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-tight mb-2">2% cashback is now available for tickets to sports matches</p>
                                    <span className="text-xs text-slate-400">02 Feb, 2025</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. WIDGETS & CASHBACK (Col Span 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {/* 3 Small Widgets */}
                        <div className="grid grid-cols-3 gap-3">
                            {/* Referral */}
                            <div className="bg-[#dfff00] rounded-2xl p-4 h-[120px] flex flex-col justify-between relative overflow-hidden group cursor-pointer">
                                <Megaphone className="w-6 h-6 text-black z-10" />
                                <div className="z-10 text-[10px] font-bold uppercase leading-tight">Referral<br />program</div>

                                {/* Decorative shape */}
                                <div className="absolute -right-4 -top-4 w-16 h-16 bg-black rounded-full" />
                                <div className="absolute -right-4 -top-4 w-16 h-16 bg-black rounded-full flex items-center justify-center pt-3 pr-3">
                                    <div className="w-8 h-8 rounded-l-full bg-white opacity-20" />
                                </div>
                            </div>

                            {/* PRO Version */}
                            <div className="bg-[#dfff00] rounded-2xl p-4 h-[120px] flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:bg-lime-400 transition-colors">
                                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white mb-2">
                                    <Crown className="w-4 h-4" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-[10px] font-bold uppercase leading-tight">PRO<br />version</div>
                                    <span className="text-[10px] font-bold">Pro</span>
                                </div>
                            </div>

                            {/* Cashback */}
                            <div className="bg-[#dfff00] rounded-2xl p-4 h-[120px] flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:bg-lime-400 transition-colors">
                                <div className="absolute top-2 right-2 w-10 h-10 bg-black rounded-xl rotate-12 flex items-center justify-center">
                                    <span className="text-white text-[10px] font-bold">20%</span>
                                </div>
                                <Smartphone className="w-6 h-6 text-black mt-1" />
                                <div className="text-[10px] font-bold uppercase leading-tight mt-auto">Cashback<br />up to 20%</div>
                            </div>
                        </div>

                        {/* Cashback List */}
                        <div className="bg-white rounded-[32px] p-6 flex-1">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-medium">Cashback from partners</h3>
                                <Button variant="icon" className="w-8 h-8"><ArrowUpRight className="w-4 h-4" /></Button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                                            <Apple className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">Apple</div>
                                            <div className="text-xs text-slate-400">Cashback 1.5%</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-black text-[#ffc400] flex items-center justify-center font-bold text-xs">M</div>
                                        <div>
                                            <div className="text-sm font-semibold">McDonald&apos;s</div>
                                            <div className="text-xs text-slate-400">Cashback 1.2%</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">P</div>
                                        <div>
                                            <div className="text-sm font-semibold">PlayStation Network</div>
                                            <div className="text-xs text-slate-400">Cashback 4.5%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            {/* --- SECTION 2: ANALYTICS --- */}
            <LuminAnalytics />

            {/* --- SECTION 3: TWISTY --- */}
            <TwistyDashboard />

            {/* --- SECTION 4: INVOICE --- */}
            <InvoiceDashboard />

            {/* --- SECTION 5: SMART HOME --- */}
            <SmartHomeDashboard />

            {/* --- SECTION 6: AQUAFLOW --- */}
            <AquaflowLanding />

            {/* --- SECTION 7: UI COMPONENTS --- */}
            <UiComponentsShowcase />

            {/* --- SECTION 8: EDUPLEX --- */}
            <EduplexDashboard />

            {/* --- SECTION 9: FOCUSFLOW --- */}
            <FocusFlowDashboard />

        </div>
    );
}
