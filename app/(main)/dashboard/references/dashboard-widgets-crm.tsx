"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Apple } from "lucide-react";

// Individual widget components
const BrandCard = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#5b3fd9] to-[#4a2fb8] rounded-3xl p-8 flex items-center justify-center aspect-square"
    >
        <div className="text-white">
            <h2 className="text-6xl font-bold">nue</h2>
            <div className="w-3 h-3 bg-white/40 rounded-full mt-2 ml-auto" />
        </div>
    </motion.div>
);

const AppIconCard = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#e8e4f0] rounded-3xl p-6 relative overflow-hidden"
    >
        <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Apple className="w-6 h-6" />
            </div>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-[#3ddc84]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.341l-.003-.001-5.52-3.19V5.797l5.523 3.19v6.354zm-11.046 0V8.987l5.523-3.19v6.353l-5.52 3.19-.003.001zM12 .955L1.476 7.308v12.707L12 26.368l10.524-6.353V7.308L12 .955z" />
                </svg>
            </div>
        </div>
        <p className="text-[#3d3850] text-xl font-medium">App icon</p>

        {/* Phone mockup */}
        <div className="absolute -right-8 -bottom-4 w-48 h-64 transform rotate-12">
            <div className="relative w-full h-full bg-black rounded-[2.5rem] border-[6px] border-gray-800 overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10" />

                {/* Screen */}
                <div className="w-full h-full bg-gradient-to-br from-[#6b4fd9] to-[#5b3fd9] p-4">
                    <div className="text-white text-xs mb-2">1:47</div>
                    <div className="grid grid-cols-3 gap-3">
                        {/* App icons */}
                        <div className="bg-white rounded-2xl aspect-square flex items-center justify-center">
                            <span className="text-2xl">📱</span>
                        </div>
                        <div className="bg-white rounded-2xl aspect-square flex items-center justify-center">
                            <span className="text-xs font-bold">26</span>
                        </div>
                        <div className="bg-white rounded-2xl aspect-square flex items-center justify-center">
                            <span className="text-2xl">🌸</span>
                        </div>
                        <div className="bg-white rounded-2xl aspect-square flex items-center justify-center">
                            <span className="text-2xl">❤️</span>
                        </div>
                        <div className="bg-white rounded-2xl aspect-square flex items-center justify-center">
                            <span className="text-2xl">💳</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

const NewUsersCard = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#e8e4f0] rounded-3xl p-6 aspect-square flex flex-col justify-between"
    >
        <p className="text-[#3d3850] text-base font-medium">New users</p>
        <div>
            <h3 className="text-6xl font-bold text-[#3d3850] leading-none">78K</h3>
            <p className="text-[#22c55e] text-xl font-semibold mt-2">+10%</p>
        </div>
    </motion.div>
);

const RatingCard = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#e8e4f0] rounded-3xl p-6 aspect-square flex flex-col justify-between"
    >
        <div className="flex items-start justify-between">
            <h3 className="text-6xl font-bold text-[#3d3850]">4.9</h3>
            <ArrowUpRight className="w-6 h-6 text-[#3d3850]" />
        </div>
        <div className="flex gap-2">
            <div className="w-12 h-12 rounded-full bg-[#a8e6a1] flex items-center justify-center text-2xl">
                👨
            </div>
            <div className="w-12 h-12 rounded-full bg-[#b8a8e6] flex items-center justify-center text-2xl">
                👩
            </div>
            <div className="w-12 h-12 rounded-full bg-[#e6b8a8] flex items-center justify-center text-2xl">
                🧔
            </div>
        </div>
    </motion.div>
);

const RevenueLifecycleCard = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#e8e4f0] rounded-3xl p-8 flex flex-col justify-between row-span-2"
    >
        <div>
            <h3 className="text-2xl font-semibold text-[#3d3850] leading-tight">
                Manage<br />your<br />revenue<br />lifecycle
            </h3>
        </div>
        <div className="flex justify-center">
            <div className="w-32 h-32 relative">
                {/* 3D asterisk shape */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                        <div className="absolute inset-0 bg-[#4a3d6b] rounded-full transform rotate-0" style={{ clipPath: 'polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)' }} />
                        <div className="absolute inset-0 bg-[#5b4d7b] rounded-full transform -rotate-45" style={{ clipPath: 'polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)' }} />
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

const MRRChartCard = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-[#5b3fd9] to-[#4a2fb8] rounded-3xl p-6 col-span-2 relative overflow-hidden"
    >
        <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#b8a8e6] rounded-full" />
                <span className="text-white/80 text-sm">Basic</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#e8e4f0] rounded-full" />
                <span className="text-white/80 text-sm">Enterprise</span>
            </div>
        </div>

        {/* Wavy chart */}
        <div className="relative h-32 mb-4">
            <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                {/* Enterprise wave */}
                <path
                    d="M0,60 Q100,20 200,40 T400,30"
                    fill="none"
                    stroke="#e8e4f0"
                    strokeWidth="3"
                    opacity="0.6"
                />
                <path
                    d="M0,60 Q100,20 200,40 T400,30 L400,120 L0,120 Z"
                    fill="url(#enterpriseGrad)"
                    opacity="0.3"
                />

                {/* Basic wave */}
                <path
                    d="M0,80 Q100,50 200,70 T400,60"
                    fill="none"
                    stroke="#b8a8e6"
                    strokeWidth="3"
                    opacity="0.8"
                />
                <path
                    d="M0,80 Q100,50 200,70 T400,60 L400,120 L0,120 Z"
                    fill="url(#basicGrad)"
                    opacity="0.4"
                />

                <defs>
                    <linearGradient id="enterpriseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e8e4f0" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#e8e4f0" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="basicGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#b8a8e6" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#b8a8e6" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>

        <div className="flex items-end justify-between">
            <div className="text-white/60 text-sm">MRR</div>
            <div className="text-white text-4xl font-bold">$24,414</div>
        </div>
    </motion.div>
);

const ProfileCard = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[#e8e4f0] rounded-3xl p-8 flex items-center justify-center relative overflow-hidden"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-[#b8a8e6] to-[#9888d6] rounded-full transform scale-75" />
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-48 h-48 rounded-full overflow-hidden mb-4 bg-gradient-to-br from-[#b8a8e6] to-[#9888d6]">
                <div className="w-full h-full flex items-end justify-center bg-gradient-to-b from-transparent to-[#b8a8e6]/20">
                    <div className="text-8xl mb-4">👩‍💼</div>
                </div>
            </div>
            <div className="bg-white rounded-full px-6 py-3 shadow-lg">
                <span className="text-[#5b3fd9] text-2xl font-bold">Avail</span>
            </div>
        </div>
    </motion.div>
);

const RevenueCard = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-[#5b3fd9] to-[#4a2fb8] rounded-3xl p-8 relative overflow-hidden"
    >
        {/* Abstract shapes background */}
        <div className="absolute top-4 right-4 w-32 h-32">
            <div className="absolute inset-0 bg-[#7d6dd9] rounded-full opacity-40" />
            <div className="absolute top-8 left-8 w-24 h-24 bg-[#b8a8e6] rounded-full opacity-30" />
        </div>

        <div className="relative z-10">
            <div className="bg-white/90 rounded-full px-4 py-2 inline-block mb-4">
                <span className="text-[#5b3fd9] font-bold text-lg">+23%</span>
            </div>
            <p className="text-white/80 text-xl mb-2">Revenue</p>
            <h3 className="text-white text-5xl font-bold">$230,545</h3>
        </div>
    </motion.div>
);

export default function DashboardWidgetsCRM() {
    return (
        <section className="space-y-10">
            <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-[#5b3fd9] rounded-full" />
                <h2 className="text-3xl font-bold">Dashboard Widgets Collection</h2>
            </div>

            <div className="bg-[#2d2a3d] rounded-[3rem] p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">
                    {/* Row 1 */}
                    <BrandCard />
                    <AppIconCard />
                    <div className="lg:col-span-2 lg:row-span-2">
                        <ProfileCard />
                    </div>

                    {/* Row 2 */}
                    <NewUsersCard />
                    <RatingCard />

                    {/* Row 3 */}
                    <MRRChartCard />
                    <RevenueCard />

                    {/* Row 4 */}
                    <RevenueLifecycleCard />
                </div>
            </div>
        </section>
    );
}
