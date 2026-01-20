"use client";

import React, { useState } from "react";
import {
    Search,
    ChevronDown,
    Plus,
    Check,
    Eye,
    EyeOff,
    Upload,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function UiComponentsShowcase() {
    const [priceRange, setPriceRange] = useState([12340, 40350]);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    return (
        <div className="w-full bg-gradient-to-br from-[#E8EDF5] to-[#F0F4F8] p-8 rounded-[40px] mt-10 font-sans text-slate-800">

            <h2 className="text-3xl font-bold mb-8 text-center text-slate-900">UI Components Showcase</h2>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1400px] mx-auto">

                {/* 1. COUNTRY SELECT */}
                <div className="bg-white rounded-[32px] p-6 shadow-lg">
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search countries..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="space-y-2">
                        {[
                            { flag: "🇩🇪", name: "Germany", code: "+241" },
                            { flag: "🇧🇷", name: "Brazil", code: "+46", selected: true },
                            { flag: "🇦🇺", name: "Australia", code: "+76" },
                            { flag: "🇨🇦", name: "Canada", code: "+918" },
                        ].map((country, idx) => (
                            <div key={idx} className={cn(
                                "flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer",
                                country.selected ? "bg-blue-50" : "hover:bg-slate-50"
                            )}>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{country.flag}</span>
                                    <div>
                                        <div className="font-semibold text-sm">{country.name}</div>
                                        <div className="text-xs text-slate-400">( {country.code} )</div>
                                    </div>
                                </div>
                                {country.selected && (
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 bg-blue-500 text-white font-bold py-3 rounded-2xl hover:bg-blue-600 transition-colors">
                        Login
                    </button>
                </div>


                {/* 2. PRICE FILTER */}
                <div className="bg-white rounded-[32px] p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Price Filter</h3>
                        <div className="flex gap-2">
                            <button className="text-sm px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">Colors Filter</button>
                            <button className="text-sm px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">Brand Filter</button>
                        </div>
                    </div>

                    {/* Range Slider */}
                    <div className="relative h-2 bg-slate-200 rounded-full mb-8">
                        <div className="absolute h-full bg-blue-500 rounded-full" style={{ left: '30%', right: '20%' }} />
                        <div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg cursor-pointer" style={{ left: '30%', marginLeft: '-16px' }}>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                                1
                            </div>
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg cursor-pointer" style={{ right: '20%', marginRight: '-16px' }}>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                                1
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="text-xs text-slate-400 mb-1">From:</div>
                            <div className="font-bold text-lg">$ 12,340.45</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-400 mb-1">To:</div>
                            <div className="font-bold text-lg">$ 40,350.90</div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex-1 bg-blue-500 text-white font-bold py-3 rounded-2xl hover:bg-blue-600 transition-colors">
                            Apply
                        </button>
                        <button className="px-6 py-3 rounded-2xl border border-slate-200 font-semibold hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>


                {/* 3. LOGIN FORM */}
                <div className="bg-white rounded-[32px] p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img src="https://i.pravatar.cc/100?img=20" alt="User" />
                        </div>
                        <div className="text-xs text-slate-400">Username</div>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-500 rounded-3xl p-4 mb-4">
                        <div className="text-xs text-slate-400 mb-1">Username</div>
                        <input
                            type="text"
                            value="Amirbaqian |"
                            className="w-full bg-transparent font-bold text-slate-900 focus:outline-none"
                        />
                    </div>

                    <div className="bg-slate-50 rounded-3xl p-4 mb-4 relative">
                        <div className="text-xs text-slate-400 mb-1">Password</div>
                        <div className="flex items-center gap-2">
                            <input
                                type={showPassword ? "text" : "password"}
                                value="••••••••••••"
                                className="flex-1 bg-transparent font-bold text-slate-900 focus:outline-none"
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-6">
                        <button
                            onClick={() => setRememberMe(!rememberMe)}
                            className={cn(
                                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                                rememberMe ? "bg-blue-500 border-blue-500" : "border-slate-300"
                            )}
                        >
                            {rememberMe && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <span className="text-sm text-slate-600">Remember me</span>
                    </div>

                    <button className="w-full bg-blue-500 text-white font-bold py-3 rounded-2xl hover:bg-blue-600 transition-colors">
                        Login
                    </button>
                </div>


                {/* 4. EVENT CARD */}
                <div className="bg-white rounded-[32px] p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-slate-400">Event Name</div>
                            <div className="font-bold text-sm">Meeting with Ace&apos;s member</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-slate-400">Start Date</div>
                            <div className="font-bold text-sm">November 14, 2021</div>
                        </div>
                        <div className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                            <span className="text-xs font-bold">On</span>
                            <div className="w-8 h-4 bg-white/30 rounded-full relative">
                                <div className="absolute right-0 top-0 w-4 h-4 bg-white rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>


                {/* 5. UPLOAD AREA */}
                <div className="bg-white rounded-[32px] p-6 shadow-lg flex flex-col items-center justify-center min-h-[280px]">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Upload pictures</h3>
                    <p className="text-xs text-slate-400 text-center mb-1">Videos must be less than <span className="font-bold text-slate-900">30 MB</span></p>
                    <p className="text-xs text-slate-400 text-center mb-6">and photos must be less than <span className="font-bold text-slate-900">2 MB</span> in size.</p>

                    <button className="bg-blue-500 text-white font-bold px-8 py-3 rounded-2xl hover:bg-blue-600 transition-colors">
                        Upload
                    </button>

                    <div className="absolute top-6 right-6">
                        <div className="bg-pink-100 text-pink-500 w-12 h-12 rounded-full flex items-center justify-center relative">
                            <Heart className="w-6 h-6 fill-current" />
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                10
                            </div>
                        </div>
                    </div>
                </div>


                {/* 6. TEXT EDITOR */}
                <div className="bg-white rounded-[32px] p-6 shadow-lg">
                    <textarea
                        placeholder="Enter your message here..."
                        className="w-full h-24 bg-slate-50 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    />

                    <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-3">
                        <div className="flex items-center gap-2">
                            <button className="w-8 h-8 rounded-lg hover:bg-white transition-colors flex items-center justify-center">
                                <AlignLeft className="w-4 h-4 text-slate-600" />
                            </button>
                            <button className="w-8 h-8 rounded-lg hover:bg-white transition-colors flex items-center justify-center">
                                <AlignCenter className="w-4 h-4 text-slate-600" />
                            </button>
                            <button className="w-8 h-8 rounded-lg hover:bg-white transition-colors flex items-center justify-center">
                                <AlignRight className="w-4 h-4 text-slate-600" />
                            </button>
                            <div className="w-px h-6 bg-slate-300 mx-1" />
                            <button className="w-8 h-8 rounded-lg hover:bg-white transition-colors flex items-center justify-center">
                                <Bold className="w-4 h-4 text-slate-600" />
                            </button>
                            <button className="w-8 h-8 rounded-lg hover:bg-white transition-colors flex items-center justify-center">
                                <Italic className="w-4 h-4 text-slate-600" />
                            </button>
                            <button className="w-8 h-8 rounded-lg hover:bg-white transition-colors flex items-center justify-center">
                                <Underline className="w-4 h-4 text-slate-600" />
                            </button>
                            <button className="w-8 h-8 rounded-lg hover:bg-white transition-colors flex items-center justify-center">
                                <Strikethrough className="w-4 h-4 text-slate-600" />
                            </button>
                            <button className="w-8 h-8 rounded-lg hover:bg-white transition-colors flex items-center justify-center">
                                <List className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 bg-slate-50 rounded-2xl p-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🇺🇸</span>
                            <span className="text-xs font-bold">+1</span>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-slate-400">Number</div>
                            <div className="font-bold">207 9042 301</div>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                </div>


                {/* 7. SEARCH APPLICATION */}
                <div className="bg-white rounded-[32px] p-6 shadow-lg lg:col-span-2">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search application..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="space-y-3">
                        {[
                            { name: "Framer", selected: false },
                            { name: "Invision Studio", selected: true },
                            { name: "Adobe XD", selected: false },
                            { name: "Figma", selected: false },
                        ].map((app, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                                <div className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                    app.selected ? "border-blue-500" : "border-slate-300"
                                )}>
                                    {app.selected && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                                </div>
                                <span className="font-semibold text-sm">{app.name}</span>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 bg-blue-500 text-white font-bold py-3 rounded-2xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                        <span>Continue</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>

            </div>
        </div>
    );
}
