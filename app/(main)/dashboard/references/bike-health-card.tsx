"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Wrench, Fuel, Link as LinkIcon, Disc } from "lucide-react";

export default function BikeHealthCard() {
    return (
        <section className="space-y-12 py-12 flex flex-col items-center">
            <div className="flex items-center gap-3 self-start px-2 mb-[-2rem]">
                <div className="h-8 w-1 bg-[#d4fb4e] rounded-full" />
                <h2 className="text-3xl font-bold text-slate-800">Vehicle Health Monitor</h2>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative w-full max-w-[420px] aspect-[4/5] rounded-[3rem] overflow-hidden group select-none"
            >
                {/* Background - Dark Olive/Grey Tone */}
                <div className="absolute inset-0 bg-[#2C2E29]/95 backdrop-blur-xl z-0" />

                {/* Top Gradient Overlay for Depth */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent z-10 pointer-events-none" />

                {/* Content Container */}
                <div className="relative z-20 h-full flex flex-col p-6">

                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <h3 className="text-white text-2xl font-medium tracking-wide">Bike Health Summary</h3>
                        <div className="w-12 h-12 rounded-full bg-[#3a3c36] flex items-center justify-center border border-white/5 cursor-pointer hover:bg-[#464842] transition-colors">
                            <ArrowUpRight className="text-[#d4fb4e] w-6 h-6" />
                        </div>
                    </div>

                    {/* Bike Image Area */}
                    <div className="flex-1 relative flex items-center justify-center py-4">
                        {/* Motion Blur Effect (Simulated with CSS) */}
                        <div className="absolute w-[120%] h-full opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-full group-hover:-translate-x-full" />

                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative w-[130%] h-[120%] -ml-8"
                        >
                            <Image
                                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop"
                                alt="KTM Bike"
                                fill
                                className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                                priority
                            />
                        </motion.div>
                    </div>

                    {/* Bike Model Name */}
                    <div className="text-center mb-8">
                        <h2 className="text-white/90 text-2xl font-medium tracking-wide">KTM 450 SX-F</h2>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Stat Item 1: Last Service */}
                        <div className="bg-[#383A35]/50 rounded-[1.5rem] p-5 backdrop-blur-md border border-white/5 hover:bg-[#383A35]/70 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <Wrench className="text-[#8e8f8b] w-5 h-5" />
                                <span className="text-[#8e8f8b] text-lg">Last Service</span>
                            </div>
                            <p className="text-white text-lg font-medium">24 Apr 2025</p>
                        </div>

                        {/* Stat Item 2: Oil */}
                        <div className="bg-[#383A35]/50 rounded-[1.5rem] p-5 backdrop-blur-md border border-white/5 hover:bg-[#383A35]/70 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <Fuel className="text-[#8e8f8b] w-5 h-5" />
                                <span className="text-[#8e8f8b] text-lg">Oil</span>
                            </div>
                            <p className="text-white text-lg font-medium">Good</p>
                        </div>

                        {/* Stat Item 3: Chain */}
                        <div className="relative bg-[#383A35]/50 rounded-[1.5rem] p-5 backdrop-blur-md border border-white/5 hover:bg-[#383A35]/70 transition-colors">
                            {/* Warning Dot */}
                            <div className="absolute top-5 right-5 w-2 h-2 bg-[#ffaa00] rounded-full shadow-[0_0_8px_#ffaa00]" />

                            <div className="flex items-center gap-3 mb-2">
                                <LinkIcon className="text-[#8e8f8b] w-5 h-5" />
                                <span className="text-[#8e8f8b] text-lg">Chain</span>
                            </div>
                            <p className="text-white text-lg font-medium">Dry (Lube)</p>
                        </div>

                        {/* Stat Item 4: Brakes */}
                        <div className="bg-[#383A35]/50 rounded-[1.5rem] p-5 backdrop-blur-md border border-white/5 hover:bg-[#383A35]/70 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <Disc className="text-[#8e8f8b] w-5 h-5" />
                                <span className="text-[#8e8f8b] text-lg">Brakes</span>
                            </div>
                            <p className="text-white text-lg font-medium">Good</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
