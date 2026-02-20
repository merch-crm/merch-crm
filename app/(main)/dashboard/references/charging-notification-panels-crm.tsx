"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";

export default function ChargingNotificationPanelsCRM() {
    return (
        <section className="space-y-4 flex flex-col items-center py-12">
            <div className="flex items-center gap-3 self-start px-4">
                <div className="h-8 w-1 bg-[#22c55e] rounded-full" />
                <h2 className="text-3xl font-bold text-slate-800">Charging Notifications</h2>
            </div>

            {/* Panel 1: Charging State */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-[#1c1c1e] text-white rounded-3xl p-6 shadow-xl font-sans"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-200 font-medium">
                            <Zap size={20} className="fill-white text-white" />
                            <span className="text-xl tracking-wide">46.2%</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Animated Spinner */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-5 h-5 border-2 border-[#22c55e] border-t-transparent rounded-full"
                            />
                            <span className="text-lg text-gray-200">Charging</span>
                        </div>
                    </div>

                    <div className="text-gray-400 font-medium tracking-wide">
                        Est. end in <span className="text-gray-200">~25 mins</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2.5 bg-[#2c2c2e] rounded-full overflow-hidden w-full">
                    <motion.div
                        initial={{ width: "0%" }}
                        whileInView={{ width: "46.2%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-[#00d65f] rounded-full shadow-[0_0_10px_rgba(0,214,95,0.5)]"
                    />
                </div>
            </motion.div>

            {/* Panel 2: Charged State */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full max-w-2xl bg-[#1c1c1e] text-white rounded-3xl p-6 shadow-xl font-sans"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-200 font-medium">
                            <Zap size={20} className="fill-current text-gray-400" />
                            <span className="text-xl tracking-wide">82.6%</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Check size={20} className="text-[#22c55e]" strokeWidth={3} />
                            <span className="text-lg text-gray-200">Charged</span>
                        </div>
                    </div>

                    <div className="text-gray-400 font-medium tracking-wide">
                        Charged in <span className="text-gray-200">42 mins</span>
                    </div>
                </div>

                {/* Progress Bar (Gray/Inactive) */}
                <div className="h-2.5 bg-[#2c2c2e] rounded-full overflow-hidden w-full relative">
                    <div className="absolute top-0 bottom-0 left-0 w-[82.6%] bg-[#48484a] rounded-full" />
                </div>
            </motion.div>

        </section>
    );
}
