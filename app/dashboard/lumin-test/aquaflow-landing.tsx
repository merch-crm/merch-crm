"use client";

import React from "react";
import { ShoppingCart, ArrowUpRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AquaflowLanding() {
    return (
        <div className="w-full bg-[#F5F5F7] p-8 rounded-[40px] mt-10 font-sans text-slate-900">

            {/* --- HEADER --- */}
            <header className="flex items-center justify-between mb-12 px-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full border-2 border-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">Aquaflow</span>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                    <a href="#" className="hover:text-slate-900 transition-colors">Dashboard</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Payments</a>
                    <a href="#" className="bg-black text-white px-5 py-2 rounded-full">Analytics</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Cards</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">History</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Services</a>
                    <a href="#" className="hover:text-slate-900 transition-colors">Help</a>
                </nav>

                <div className="flex items-center gap-3">
                    <button className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Login</button>
                    <button className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">Sign up</button>
                </div>
            </header>


            {/* --- GRID LAYOUT --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1200px] mx-auto">

                {/* 1. HERO CARD (Bottle) */}
                <div className="bg-[#2C2C2E] rounded-[40px] p-12 relative overflow-hidden flex flex-col justify-between min-h-[500px]">
                    {/* Text */}
                    <div className="relative z-10">
                        <h1 className="text-white text-6xl font-light leading-tight mb-4">
                            The simple<br />Bottle<br />Water
                        </h1>
                        <p className="text-white/50 text-sm font-medium uppercase tracking-wider">More Offers</p>
                    </div>

                    {/* Bottle Image */}
                    <div className="absolute right-[-50px] top-[50%] -translate-y-1/2 w-[400px] h-[400px]">
                        <div className="relative w-full h-full">
                            {/* Bottle SVG/Shape */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-[200px] h-[350px] bg-gradient-to-b from-[#3a3a3c] to-[#1c1c1e] rounded-[100px] relative shadow-2xl">
                                    {/* Cap */}
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[80px] h-[40px] bg-[#4a4a4c] rounded-t-[40px] border-b-4 border-[#2a2a2c]" />
                                    {/* Handle */}
                                    <div className="absolute right-[-30px] top-[60px] w-[50px] h-[80px] border-8 border-[#3a3a3c] rounded-r-full" />
                                    {/* Highlight */}
                                    <div className="absolute left-[20%] top-[20%] w-[30px] h-[100px] bg-white/10 rounded-full blur-sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shop Button */}
                    <div className="relative z-10 flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full p-2 pr-4 w-max">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-black" />
                        </div>
                        <span className="text-white font-medium text-sm">All Products</span>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-12 right-12 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M19 12l-7 7-7-7" />
                        </svg>
                    </div>
                </div>


                {/* RIGHT COLUMN (2 cards stacked) */}
                <div className="flex flex-col gap-6">

                    {/* 2. BLOG CARD */}
                    <div className="bg-[#D8D8DC] rounded-[40px] p-12 relative overflow-hidden flex flex-col justify-between min-h-[240px] group cursor-pointer hover:bg-[#c8c8cc] transition-colors">
                        <h2 className="text-4xl font-light text-slate-900 leading-tight relative z-10">See our<br />blog</h2>

                        {/* 3D Sphere */}
                        <div className="absolute right-[10%] top-[50%] -translate-y-1/2 w-[180px] h-[180px]">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-white to-[#e8e8ec] shadow-2xl relative">
                                {/* Highlight */}
                                <div className="absolute top-[20%] left-[25%] w-[50px] h-[50px] bg-white/60 rounded-full blur-xl" />
                                {/* Shadow */}
                                <div className="absolute bottom-[15%] right-[20%] w-[60px] h-[30px] bg-black/10 rounded-full blur-lg" />
                            </div>
                        </div>

                        <div className="relative z-10 w-10 h-10 rounded-full border border-slate-900/20 flex items-center justify-center group-hover:bg-white transition-colors">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </div>

                    {/* 3. CONTACT CARD */}
                    <div className="bg-[#DFFF00] rounded-[40px] p-12 relative overflow-hidden flex flex-col justify-between min-h-[240px] group cursor-pointer hover:bg-[#d0f000] transition-colors">
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-slate-700 mb-2">Have some<br />Questions?</p>
                            <h2 className="text-5xl font-bold text-slate-900 leading-tight">Contact us</h2>
                        </div>

                        <div className="relative z-10 w-12 h-12 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Send className="w-5 h-5 text-[#DFFF00]" />
                        </div>

                        {/* Decorative Arrow */}
                        <div className="absolute top-8 right-8 opacity-20">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M7 17L17 7M17 7H7M17 7v10" />
                            </svg>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
