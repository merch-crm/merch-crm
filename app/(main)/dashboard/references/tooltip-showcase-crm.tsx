"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, Sparkles } from "lucide-react";

const TooltipVariant = ({ dark = false }: { dark?: boolean }) => {
    return (
        <div className="flex flex-col items-center gap-4">
            {/* Tooltip Bubble */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`relative p-6 rounded-[1.25rem] w-[320px] shadow-[0_10px_40px_-5px_rgba(0,0,0,0.1)] ${dark
                        ? "bg-[#161617] text-white"
                        : "bg-white text-[#161617]"
                    }`}
            >
                {/* Content */}
                <div className="space-y-2 relative z-10">
                    <h3 className="font-bold text-lg leading-tight">Tooltip</h3>
                    <p className={`text-[0.93rem] leading-relaxed ${dark ? "text-white/60" : "text-[#161617]/60"
                        }`}>
                        Try connecting to another server. In case of a repeated error, please wait, if nothing happens, try to write a letter to the post office.
                    </p>
                </div>

                {/* Arrow (Triangle) */}
                <div className={`absolute -bottom-3 left-8 w-6 h-6 rotate-45 transform ${dark ? "bg-[#161617]" : "bg-white"
                    }`} />
            </motion.div>

            {/* Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] self-start ml-4 ${dark
                        ? "bg-[#161617] text-white"
                        : "bg-white text-[#161617]"
                    }`}
            >
                <div className="relative">
                    <Lightbulb size={24} strokeWidth={2.5} />
                    <Sparkles size={10} className="absolute -top-1 -right-2 text-current fill-current opacity-60" />
                </div>
            </motion.button>
        </div>
    );
};

export default function TooltipShowcaseCRM() {
    return (
        <section className="space-y-12 py-12 flex flex-col items-center">
            <div className="flex items-center gap-3 self-start px-2 mb-[-1rem]">
                <div className="h-8 w-1 bg-slate-900 rounded-full" />
                <h2 className="text-3xl font-bold text-slate-800">Smart Tooltips</h2>
            </div>

            <div className="flex flex-wrap gap-12 md:gap-24 items-start justify-center p-8 bg-[#e8e8e8] rounded-[3rem] w-full">
                <TooltipVariant />
                <TooltipVariant dark />
            </div>
        </section>
    );
}
