"use client";


import {
    ArrowUpRight,
    ChevronRight,
    Plus,
    Power,
    Sun,
    Moon,
    Wind,
    Wifi,
    Tv,
    Droplets
} from "lucide-react";


export default function SmartHomeDashboard() {
    return (
        <div className="w-full bg-[#E8EBF2] p-8 rounded-[40px] mt-10 font-sans text-slate-800 flex flex-col items-center justify-center min-h-[800px]">

            {/* Container for the UI Cards (emulating the layout in screenshot) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1000px] w-full">

                {/* --- LEFT COLUMN --- */}
                <div className="flex flex-col gap-6">

                    {/* 1. Header/Greeting Card */}
                    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-2 pr-6 rounded-full w-max">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                            <img src="https://i.pravatar.cc/100?img=9" alt="User" />
                        </div>
                        <div className="bg-[#dfff00] px-6 py-2.5 rounded-full flex items-center justify-between gap-12 text-[#0F172A] shadow-sm">
                            <div>
                                <h3 className="font-bold text-sm">Hi, Diana Kemmer</h3>
                                <p className="text-[10px] opacity-70 font-semibold">7 devices active</p>
                            </div>
                            <div className="flex flex-col gap-[3px]">
                                <div className="w-1 h-1 bg-black rounded-full" />
                                <div className="w-1 h-1 bg-black rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* 2. Device List Card */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm flex-1">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center text-slate-900">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">AI Power Analytics</h3>
                                    <p className="text-xs text-slate-400 font-semibold">Daily usage</p>
                                </div>
                            </div>
                            <button className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center rotate-45 hover:bg-slate-800 transition-colors">
                                <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="space-y-3">
                            {/* Item 1 */}
                            <div className="bg-[#F8F9FB] rounded-2xl p-4 flex items-center justify-between group hover:bg-slate-100 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-sm">
                                        <Wind className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900">Air Conditioner</h4>
                                        <div className="text-[11px] text-slate-400 font-semibold"><span className="text-slate-500">2 unit</span> | 18kWh</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>

                            {/* Item 2 */}
                            <div className="bg-[#F8F9FB] rounded-2xl p-4 flex items-center justify-between group hover:bg-slate-100 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-sm">
                                        <Wifi className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900">Wi-Fi Router</h4>
                                        <div className="text-[11px] text-slate-400 font-semibold"><span className="text-slate-500">1 unit</span> | 8kWh</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>

                            {/* Item 3 */}
                            <div className="bg-[#F8F9FB] rounded-2xl p-4 flex items-center justify-between group hover:bg-slate-100 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-sm">
                                        <Tv className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900">Smart TV</h4>
                                        <div className="text-[11px] text-slate-400 font-semibold"><span className="text-slate-500">2 unit</span> | 12kWh</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>

                            {/* Item 4 */}
                            <div className="bg-[#F8F9FB] rounded-2xl p-4 flex items-center justify-between group hover:bg-slate-100 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-sm">
                                        <Droplets className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900">Humidifier</h4>
                                        <div className="text-[11px] text-slate-400 font-semibold"><span className="text-slate-500">1 unit</span> | 2kWh</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                    </div>

                </div>


                {/* --- RIGHT COLUMN --- */}
                <div className="flex flex-col gap-6">

                    {/* 1. Climate Control Card */}
                    <div className="bg-white rounded-[40px] p-8 shadow-sm relative">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <Sun className="w-6 h-6 text-slate-900" />
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Air Conditioner</h3>
                                    <p className="text-xs text-slate-400 font-semibold">Auto cooling</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-xs font-bold text-slate-900">On</div>
                                <div className="w-2 h-2 rounded-full bg-black" />
                                <button className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-slate-800 transition-colors">
                                    <Power className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Timer Pill */}
                        <div className="absolute top-20 left-8 bg-[#8FABFF] text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            2h
                        </div>

                        {/* Auto Indicator */}
                        <div className="absolute top-20 right-12 flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full border border-blue-500" />
                            <span className="text-[10px] font-bold text-slate-400">Auto</span>
                        </div>

                        {/* Dial / Gauge */}
                        <div className="relative flex items-center justify-center h-[200px] mt-4">
                            {/* SVG Gauge */}
                            <svg width="240" height="120" viewBox="0 0 240 120" className="overflow-visible">
                                {/* Ticks */}
                                {Array.from({ length: 41 }).map((_, i) => {
                                    const angle = (180 / 40) * i; // 0 to 180
                                    const isLong = i % 5 === 0;
                                    const isActive = i >= 12 && i <= 28; // Active range roughly
                                    // Convert polar to cartesian
                                    // We want the arc to go from left (180 deg) to right (0 deg) in SVG coordinate system but bottom-heavy? 
                                    // Actually usually gauges are top-half. Let's assume top half arc.
                                    // 180 deg is left, 0 is right. 
                                    // Center at 120, 120. Radius 100.
                                    const rad = (angle + 180) * (Math.PI / 180);
                                    const x1 = 120 + 100 * Math.cos(rad);
                                    const y1 = 120 + 100 * Math.sin(rad);
                                    const x2 = 120 + (100 - (isLong ? 15 : 8)) * Math.cos(rad);
                                    const y2 = 120 + (100 - (isLong ? 15 : 8)) * Math.sin(rad);

                                    return (
                                        <line
                                            key={i}
                                            x1={x1} y1={y1} x2={x2} y2={y2}
                                            stroke={isActive ? (i === 28 ? "#5B5BFF" : "#0F172A") : "#CBD5E1"}
                                            strokeWidth={isActive ? 2 : 1}
                                            strokeLinecap="round"
                                        />
                                    );
                                })}

                                {/* The Blue Indicator Knob/Needle */}
                                {(() => {
                                    const i = 28;
                                    const angle = (180 / 40) * i;
                                    const rad = (angle + 180) * (Math.PI / 180);
                                    const x = 120 + 115 * Math.cos(rad);
                                    const y = 120 + 115 * Math.sin(rad);
                                    return (
                                        <circle cx={x} cy={y} r="6" fill="white" stroke="#5B5BFF" strokeWidth="3" />
                                    );
                                })()}

                                {/* Labels */}
                                <text x="40" y="115" fontSize="10" fill="#94A3B8" fontWeight="bold" textAnchor="middle">- 10°</text>
                                <text x="120" y="115" fontSize="10" fill="#CBD5E1" fontWeight="bold" textAnchor="middle">Temperature</text>
                                <text x="200" y="115" fontSize="10" fill="#94A3B8" fontWeight="bold" textAnchor="middle">40°</text>
                            </svg>

                            {/* Center Text */}
                            <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                <div className="text-[56px] font-bold text-slate-900 leading-none">24°</div>
                            </div>
                        </div>
                    </div>


                    {/* 2. Scenes Cards */}
                    <div className="bg-[#E2E6EE] rounded-[40px] p-2 grid grid-cols-2 gap-2 shadow-inner">

                        {/* Morning Scene */}
                        <div className="bg-[#8FABFF] rounded-[32px] p-6 relative flex flex-col justify-between h-[160px] group cursor-pointer hover:bg-blue-400 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-900">
                                    <Sun className="w-5 h-5" />
                                </div>
                                <div className="flex gap-[3px] mt-2">
                                    <div className="w-1 h-1 bg-black rounded-full" />
                                    <div className="w-1 h-1 bg-black rounded-full" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 mb-1">Morning Scene</h4>
                                <p className="text-[10px] text-slate-700 font-semibold opacity-70">7 Devices</p>
                            </div>
                        </div>

                        {/* Night Scene */}
                        <div className="bg-white rounded-[32px] p-6 relative flex flex-col justify-between h-[160px] group cursor-pointer hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 rounded-full bg-[#dfff00] flex items-center justify-center text-slate-900">
                                    <Moon className="w-5 h-5" />
                                </div>
                                <div className="flex gap-[3px] mt-2">
                                    <div className="w-1 h-1 bg-black rounded-full" />
                                    <div className="w-1 h-1 bg-black rounded-full" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 mb-1">Night Scene</h4>
                                <p className="text-[10px] text-slate-400 font-semibold">2 Devices</p>
                            </div>
                        </div>

                    </div>

                    {/* 3. Bottom Scenes Widget */}
                    <div className="bg-white rounded-full p-2 pl-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-900">You created 8 scenes</div>
                                <div className="text-[10px] text-slate-400 font-semibold">24 devices in use</div>
                            </div>
                        </div>
                        <button className="bg-black text-white text-[10px] font-bold px-6 py-3 rounded-full hover:bg-slate-800 transition-colors">
                            See All
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}
