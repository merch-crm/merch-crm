"use client";

import React from "react";
import { motion } from "framer-motion";

const tabs = [
    { id: "01", label: "Research" },
    { id: "02", label: "Design approach" },
    { id: "03", label: "Site map" },
    { id: "04", label: "Low fidelity frames" },
    { id: "05", label: "High fidelity frames" },
    { id: "06", label: "Testing" },
];

export default function ProjectTabsCRM() {
    return (
        <section className="space-y-8 flex flex-col items-center py-12 px-4 bg-[#0a0a0a] rounded-[3rem]">
            <div className="flex items-center gap-3 self-start px-4 mb-4">
                <div className="h-8 w-1 bg-white/20 rounded-full" />
                <h2 className="text-3xl font-bold text-white">Project Phases</h2>
            </div>

            <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                {tabs.map((tab) => (
                    <motion.button
                        key={tab.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                        whileTap={{ scale: 0.98 }}
                        className="group flex items-center gap-6 px-8 py-5 rounded-2xl bg-[#161616] border border-white/5 hover:border-white/10 transition-colors duration-300"
                    >
                        <span className="text-lg font-light text-white/40 tracking-wide font-mono group-hover:text-white/60 transition-colors">
                            {tab.id}
                        </span>
                        <span className="text-xl font-normal text-white/90 tracking-tight group-hover:text-white transition-colors">
                            {tab.label}
                        </span>
                    </motion.button>
                ))}
            </div>
        </section>
    );
}
