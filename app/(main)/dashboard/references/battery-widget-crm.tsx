"use client";

import React from "react";
import { motion } from "framer-motion";

export const BatteryWidget = ({ charge = 52 }: { charge?: number }) => {
    // Exact lightning bolt from reference - very wide, chunky shape
    // The bolt goes: top-left corner → bottom-left → middle-left → bottom-right → top-right → middle-right → back to start
    const boltPath = "M 50 5 L 8 88 L 45 88 L 30 145 L 92 60 L 55 60 Z";

    return (
        <div className="flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative w-full max-w-[340px] aspect-square bg-[#1c1c1e] rounded-[4.5rem] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.7)] overflow-hidden mx-auto"
            >
                {/* Text Layer - Highest z-index */}
                <div className="relative z-40 flex flex-col justify-between h-full p-11">
                    <div>
                        <h1 className="text-[5.8rem] font-[900] text-[#f2c94c] leading-[0.8] tracking-[-0.06em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                            52%
                        </h1>
                        <p className="text-[#b8b8bd] text-[1.65rem] font-medium mt-3">
                            Charged
                        </p>
                    </div>

                    <div>
                        <p className="text-[#b8b8bd] text-[1.65rem] font-semibold leading-tight">
                            2,5 hours
                        </p>
                        <p className="text-[#6e6e73] text-[1.35rem] font-medium mt-0.5">
                            for full charge
                        </p>
                    </div>
                </div>

                {/* Lightning Bolt - Behind text */}
                <div className="absolute right-[-8%] top-[6%] w-[75%] h-[88%] z-10 pointer-events-none">
                    <svg viewBox="0 0 100 150" className="w-full h-full overflow-visible">
                        <defs>
                            <clipPath id={`bolt-clip-${charge}`}>
                                <path d={boltPath} />
                            </clipPath>

                            {/* Liquid gradient - warmer yellow */}
                            <linearGradient id={`liquid-grad-${charge}`} x1="0" y1="1" x2="0" y2="0">
                                <stop offset="0%" stopColor="#d4a817" />
                                <stop offset="50%" stopColor="#f2c94c" />
                                <stop offset="100%" stopColor="#f2c94c" />
                            </linearGradient>

                            {/* Sharp diagonal glass reflection */}
                            <linearGradient id={`glass-reflect-${charge}`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="white" stopOpacity="0" />
                                <stop offset="38%" stopColor="white" stopOpacity="0" />
                                <stop offset="42%" stopColor="white" stopOpacity="0.12" />
                                <stop offset="48%" stopColor="white" stopOpacity="0.18" />
                                <stop offset="52%" stopColor="white" stopOpacity="0.12" />
                                <stop offset="58%" stopColor="white" stopOpacity="0" />
                                <stop offset="100%" stopColor="white" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Base dark bolt (empty glass container) */}
                        <path
                            d={boltPath}
                            fill="#2a2a2c"
                            className="opacity-90"
                        />

                        {/* Yellow liquid fill */}
                        <g clipPath={`url(#bolt-clip-${charge})`}>
                            <motion.rect
                                x="-30"
                                y="0"
                                width="160"
                                height="170"
                                fill={`url(#liquid-grad-${charge})`}
                                initial={{ y: 150 }}
                                animate={{ y: 150 - (charge * 1.48) }}
                                transition={{
                                    type: "spring",
                                    stiffness: 35,
                                    damping: 20,
                                    mass: 1
                                }}
                            />
                        </g>

                        {/* Glass reflection stripe */}
                        <path
                            d={boltPath}
                            fill={`url(#glass-reflect-${charge})`}
                        />

                        {/* Very subtle edge highlight */}
                        <path
                            d={boltPath}
                            fill="none"
                            stroke="rgba(242, 201, 76, 0.15)"
                            strokeWidth="0.8"
                        />
                    </svg>
                </div>

                {/* Diagonal dark overlay stripe (key detail from reference!) */}
                <div
                    className="absolute inset-0 z-20 pointer-events-none rounded-[4.5rem] overflow-hidden"
                    style={{
                        background: 'linear-gradient(130deg, transparent 0%, transparent 42%, rgba(0,0,0,0.12) 46%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.12) 54%, transparent 58%, transparent 100%)'
                    }}
                />

                {/* Subtle inner card glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none rounded-[4.5rem]" />
            </motion.div>
        </div>
    );
};

export default function BatteryWidgetCRM() {
    return (
        <section className="space-y-10">
            <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-[#f2c94c] rounded-full" />
                <h2 className="text-3xl font-bold">Battery Charging Widget</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                <BatteryWidget charge={52} />
                <BatteryWidget charge={78} />
                <BatteryWidget charge={25} />
            </div>
        </section>
    );
}
