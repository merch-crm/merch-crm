"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export const ChargingWidget = () => {
    const [charge] = useState(52);

    // EXACT BOLT SHAPE FROM REFERENCE:
    // This one is wide at the top, has a horizontal middle, and the tail points DOWN-RIGHT.
    // Coordinates are adjusted to make it massive and broad.
    const boltPath = `
        M 58 2 
        L 102 2 
        L 62 76 
        L 108 76 
        L 85 148 
        L 42 148 
        L 66 76 
        L 22 76 
        Z
    `;

    return (
        <div className="flex items-center justify-center p-12 bg-[#f0f0f0] dark:bg-black rounded-[4rem]">
            {/* Main Card Container */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-80 h-80 bg-[#161617] rounded-[4.2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col justify-between p-11 overflow-hidden select-none"
            >
                {/* 
                    1. BOLT LAYER (Background)
                    It's now positioned more to the center-right and is much larger.
                */}
                <div className="absolute right-[-10%] top-[2%] w-[100%] h-[96%] pointer-events-none z-10">
                    <svg viewBox="0 0 120 150" className="w-full h-full overflow-visible">
                        <defs>
                            <clipPath id="hugeBoltClip">
                                <path d={boltPath} />
                            </clipPath>

                            <linearGradient id="liquidYellow" x1="0" y1="1" x2="0" y2="0">
                                <stop offset="0%" stopColor="#dcdc05" />
                                <stop offset="100%" stopColor="#f2f207" />
                            </linearGradient>

                            {/* Crisp Glass Reflect Highlight */}
                            <linearGradient id="glassShine" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="white" stopOpacity="0" />
                                <stop offset="40%" stopColor="white" stopOpacity="0.08" />
                                <stop offset="50%" stopColor="white" stopOpacity="0.22" />
                                <stop offset="60%" stopColor="white" stopOpacity="0.08" />
                                <stop offset="100%" stopColor="white" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Base Dark/Glass Bolt */}
                        <path
                            d={boltPath}
                            fill="#28282a"
                            className="opacity-90"
                        />

                        {/* Liquid Fill */}
                        <g clipPath="url(#hugeBoltClip)">
                            <motion.rect
                                x="-50"
                                y="0"
                                width="250"
                                height="200"
                                fill="url(#liquidYellow)"
                                initial={{ y: 150 }}
                                animate={{ y: 150 - (charge * 1.5) }}
                                transition={{ type: "spring", stiffness: 35, damping: 20 }}
                            />

                            {/* Surface Wave */}
                            <motion.path
                                d="M -50 0 Q 50 -10 150 0 L 150 30 L -50 30 Z"
                                fill="#f2f207"
                                initial={{ y: 150 }}
                                animate={{
                                    y: 150 - (charge * 1.5),
                                    x: [-60, 0, -60]
                                }}
                                transition={{
                                    y: { type: "spring", stiffness: 35, damping: 20 },
                                    x: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                                }}
                            />
                        </g>

                        {/* Diagonal Glass Reflection Sticker */}
                        <path
                            d={boltPath}
                            fill="url(#glassShine)"
                        />
                    </svg>
                </div>

                {/* 
                    2. TEXT LAYER (Foreground - Overlapping the bolt)
                */}
                <div className="relative z-20 flex flex-col h-full justify-between pointer-events-none">
                    <div className="mt-[-4px]">
                        <motion.h1
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-[6.8rem] font-[900] text-[#F2F207] leading-[0.7] tracking-[-0.07em] drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                        >
                            {charge}%
                        </motion.h1>
                        <p className="text-white text-[1.8rem] font-medium mt-5 shadow-black drop-shadow-md">
                            Charged
                        </p>
                    </div>

                    <div className="mb-[-2px]">
                        <p className="text-white text-[1.7rem] font-bold leading-tight drop-shadow-md">
                            2,5 hours
                        </p>
                        <p className="text-[#99999f] text-[1.4rem] font-medium mt-1 drop-shadow-md">
                            for full charge
                        </p>
                    </div>
                </div>

                {/* Subtle Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#f2f20704] to-transparent pointer-events-none z-30" />
            </motion.div>
        </div>
    );
};

export default function ChargingWidgetCRM() {
    return (
        <section className="space-y-12">
            <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-[#F2F207] rounded-full" />
                <h2 className="text-3xl font-bold">Smart Charging Interface</h2>
            </div>

            <div className="flex flex-wrap gap-12 items-start justify-center md:justify-start">
                <ChargingWidget />

                {/* 88% Variant for Showcase */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative w-80 h-80 bg-[#161617] rounded-[4.2rem] shadow-2xl flex flex-col justify-between p-11 overflow-hidden"
                >
                    <div className="relative z-20">
                        <h1 className="text-[6.8rem] font-[900] text-[#f2f207] leading-[0.7] drop-shadow-md">88%</h1>
                        <p className="text-white text-[1.8rem] font-medium mt-5 drop-shadow-md">Charged</p>
                    </div>
                    <div className="relative z-20 mt-auto">
                        <p className="text-white text-[1.7rem] font-bold leading-tight drop-shadow-md">45 minutes</p>
                        <p className="text-[#99999f] text-[1.4rem] font-medium drop-shadow-md">to full charge</p>
                    </div>

                    <div className="absolute right-[-10%] top-[2%] w-[100%] h-[96%] pointer-events-none z-10 opacity-100">
                        <svg viewBox="0 0 120 150" className="w-full h-full overflow-visible">
                            <path d="M 58 2 L 102 2 L 62 76 L 108 76 L 85 148 L 42 148 L 66 76 L 22 76 Z" fill="#28282a" />
                            <clipPath id="bolt88Huge">
                                <path d="M 58 2 L 102 2 L 62 76 L 108 76 L 85 148 L 42 148 L 66 76 L 22 76 Z" />
                            </clipPath>
                            <g clipPath="url(#bolt88Huge)">
                                <rect x="-50" y={150 - (88 * 1.5)} width="250" height="200" fill="#f2f207" />
                            </g>
                            <path d="M 58 2 L 102 2 L 62 76 L 108 76 L 85 148 L 42 148 L 66 76 L 22 76 Z" fill="url(#glassShine)" />
                        </svg>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
