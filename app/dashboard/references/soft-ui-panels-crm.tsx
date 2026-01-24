"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Check, Grid, List, Menu } from "lucide-react";

export default function SoftUiPanelsCRM() {
    return (
        <section className="space-y-12 py-12 flex flex-col items-center bg-[#f0f2f5] rounded-[3rem]">
            <div className="flex items-center gap-3 self-start px-12 mb-[-1rem]">
                <div className="h-8 w-1 bg-black rounded-full" />
                <h2 className="text-3xl font-bold text-slate-800">Soft UI Controls</h2>
            </div>

            <div className="flex flex-col gap-8 items-center scale-110">

                {/* 1. Tab Switcher */}
                <div className="bg-white p-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-1">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#1a1a1a] text-white px-8 py-3 rounded-full text-sm font-medium shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] transition-transform"
                    >
                        Storage
                    </motion.button>
                    <button className="px-8 py-3 rounded-full text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">
                        Inactive
                    </button>
                    <button className="px-8 py-3 rounded-full text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">
                        Inactive
                    </button>
                    <div className="w-2" />
                </div>

                {/* 2. Pagination */}
                <div className="bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-2">
                    <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                        <ChevronLeft size={20} />
                    </button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 bg-[#1a1a1a] text-white rounded-2xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3)] flex items-center justify-center font-medium text-lg"
                    >
                        1
                    </motion.button>

                    {[2, 3, 4, 5].map((num) => (
                        <button key={num} className="w-12 h-12 flex items-center justify-center text-slate-500 font-medium hover:bg-slate-50 rounded-2xl transition-colors">
                            {num}
                        </button>
                    ))}
                </div>

                {/* 3. Toggles & View Switcher Row */}
                <div className="flex gap-6 w-full justify-center">

                    {/* Checkboxes */}
                    <div className="bg-white p-2 pr-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-12 h-12 bg-[#1a1a1a] text-white rounded-2xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3)] flex items-center justify-center"
                        >
                            <Check size={20} strokeWidth={3} />
                        </motion.button>
                        <span className="text-slate-700 font-medium">Check</span>

                        <div className="w-[1px] h-8 bg-slate-100 mx-1" />

                        <button className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-colors">
                            <Check size={20} strokeWidth={3} />
                        </button>
                        <span className="text-slate-700 font-medium">Check</span>
                    </div>

                    {/* View Switcher */}
                    <div className="bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-2">
                        <button className="w-12 h-12 flex items-center justify-center text-slate-800 hover:bg-slate-50 rounded-2xl transition-colors">
                            <List size={24} strokeWidth={2.5} />
                        </button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-12 h-12 bg-[#1a1a1a] text-white rounded-2xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3)] flex items-center justify-center"
                        >
                            <Grid size={20} fill="white" />
                        </motion.button>
                    </div>

                </div>

            </div>
        </section>
    );
}
