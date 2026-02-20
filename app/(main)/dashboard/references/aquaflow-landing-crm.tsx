"use client";

import Image from "next/image";
import React from "react";
import {
    ArrowRight,
    ChevronRight,
    Search,
    ShoppingBag,
    Send,
    ArrowUpRight,
    Sparkles
} from "lucide-react";

export default function AquaflowLandingCRM() {
    return (
        <div className="w-full glass-panel p-8 rounded-[var(--radius-outer)] mt-10 overflow-hidden relative min-h-[700px]">
            {/* Ambient Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white/40 to-slate-100 opacity-50 pointer-events-none" />

            {/* Mesh Orbs */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute top-1/2 -left-40 w-80 h-80 bg-slate-300/30 rounded-full blur-[100px] pointer-events-none" />

            {/* Navigation Header */}
            <header className="flex items-center justify-between mb-12 relative z-10 px-4">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-primary shadow-lg shadow-slate-900/10">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl text-slate-900">AQUAFLOW</span>
                </div>

                <nav className="hidden md:flex items-center gap-4">
                    {["Shop", "Our Story", "Sustainability", "Contact"].map((item) => (
                        <a key={item} href="#" className="text-xs font-bold  text-slate-400 hover:text-primary transition-colors">
                            {item}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <button type="button" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-transform">
                        <Search className="w-4 h-4 text-slate-600" />
                    </button>
                    <button type="button" className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:scale-110 transition-transform relative">
                        <ShoppingBag className="w-4 h-4" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                            2
                        </div>
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10 p-2">
                {/* Hero Card */}
                <div className="lg:col-span-8 bg-slate-900 rounded-[var(--radius-outer)] p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40 min-h-[440px] flex flex-col justify-between group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <div className="absolute -right-20 top-0 bottom-0 w-[300px] bg-gradient-to-l from-primary/30 to-transparent blur-3xl group-hover:from-primary/50 transition-all duration-1000" />

                    <div className="relative z-10 max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[xs] font-bold  mb-6 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            New Collection
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-8">
                            Purity in <span className="text-primary">Every</span> Drop
                        </h1>
                        <p className="text-white/60 text-lg leading-relaxed mb-10 font-medium">
                            Discover our new titanium-grade filtered bottles. Designed for a lifetime of hydration and sustainable living.
                        </p>
                        <button type="button" className="btn-primary h-14 px-8 rounded-[var(--radius-inner)] flex items-center gap-3 text-sm font-bold w-fit">
                            Explore Collection
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* 3D Bottle Placeholder Visual */}
                    <div className="absolute right-0 bottom-0 top-0 w-1/3 flex items-center justify-center pointer-events-none overflow-hidden">
                        <div className="w-[120px] h-[320px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] shadow-2xl rotate-12 group-hover:rotate-6 transition-all duration-700 flex flex-col items-center justify-end p-8 gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/40 blur-xl" />
                            <div className="w-full h-1/2 bg-gradient-to-t from-primary/20 to-transparent rounded-b-[30px]" />
                        </div>
                    </div>
                </div>

                {/* Side Grid */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    {/* Blog Card */}
                    <div className="crm-card p-8 flex flex-col justify-between min-h-[250px] relative overflow-hidden hover:border-primary/20 transition-all">
                        <div className="absolute -right-5 -top-5 w-24 h-24 bg-slate-50 rounded-full" />
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Inside the<br />Design Process</h3>
                            <p className="text-xs font-bold  text-slate-400 mb-6">Article — 5 min read</p>
                        </div>
                        <button type="button" className="w-10 h-10 rounded-[var(--radius-inner)] glass-panel flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                            <ArrowUpRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Contact Card */}
                    <div className="glass-panel p-8 flex-1 flex flex-col justify-between border-2 border-primary/20 bg-primary/5 group cursor-pointer hover:bg-primary/10 transition-all">
                        <div>
                            <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-slate-900 flex items-center justify-center text-primary mb-6 shadow-xl shadow-slate-900/10">
                                <Send className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Join the Club</h3>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                Connect with us for exclusive drops and limited editions.
                            </p>
                        </div>
                        <div className="h-10 border-b border-slate-200 flex items-center justify-between group-hover:border-primary transition-colors">
                            <span className="text-xs font-bold  text-slate-400 group-hover:text-slate-900">Sign Up Now</span>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Partners/Stats Footer */}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-slate-200 relative z-10 px-4">
                {[
                    { label: "Used by", val: "10k+", sub: "customers" },
                    { label: "Rated", val: "4.9/5", sub: "stars" },
                    { label: "Carbon", val: "0.0kg", sub: "neutral" },
                ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="text-xs font-bold  text-slate-400">{stat.label}:</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-slate-900">{stat.val}</span>
                            <span className="text-xs font-bold  text-slate-400">{stat.sub}</span>
                        </div>
                    </div>
                ))}
                <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-slate-100">
                            <Image src={`https://i.pravatar.cc/100?img=${i + 25}`} alt="avatar" width={36} height={36} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
