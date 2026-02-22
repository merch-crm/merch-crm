"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    X,
    Image as ImageIcon,
    Smile,
    SlidersHorizontal,
    Wand2,
    Trash2,
    Play,
    Pause,
    Save,
    Clock,
    ArrowRight,
    Type,
    AlignLeft,
    CalendarPlus,
    Mic
} from "lucide-react";

const PanelContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 flex items-center px-2 py-2 ${className}`}
    >
        {children}
    </motion.div>
);

const IconButton = ({ icon: Icon, active = false, className = "", blue = false }: { icon: React.ElementType, active?: boolean, className?: string, blue?: boolean }) => (
    <button type="button" className={`p-2.5 rounded-full transition-colors flex items-center justify-center ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'} ${blue ? '!bg-[#3b5bdb] !text-white hover:!bg-[#3b5bdb]/90' : ''} ${className}`}>
        <Icon size={20} strokeWidth={2} />
    </button>
);

const Divider = () => <div className="w-[1px] h-6 bg-slate-100 mx-2" />;

export default function FloatingPanelsCRM() {
    return (
        <section className="space-y-12 py-12 bg-[#f8f9fa] rounded-[3rem] items-center flex flex-col justify-center">
            <div className="flex items-center gap-3 self-start px-12 mb-[-2rem]">
                <div className="h-8 w-1 bg-[#3b5bdb] rounded-full" />
                <h2 className="text-3xl font-bold text-slate-800">Floating Action Panels</h2>
            </div>

            <div className="flex flex-col gap-3 items-start scale-110 p-[--padding-xl]">

                {/* 1. Type Selector (Small pill) */}
                <PanelContainer className="self-start mb-2 px-3">
                    <IconButton icon={ImageIcon} />
                    <IconButton icon={Mic} />
                    <IconButton icon={CalendarPlus} />
                </PanelContainer>

                {/* 2. Text Formatting Toolbar */}
                <PanelContainer className="gap-1 pr-3 pl-4 h-16 w-full max-w-xl justify-between">
                    <div className="flex items-center gap-2">
                        <IconButton icon={Type} className="text-slate-600" />
                        <span className="text-slate-400 font-medium px-2">Aa</span>
                        <span className="text-slate-400 font-serif px-2">T<span className="text-xs align-sub">T</span></span>
                    </div>

                    <Divider />

                    <div className="flex items-center gap-1">
                        <IconButton icon={Smile} />
                        <IconButton icon={ImageIcon} />
                        <IconButton icon={AlignLeft} />
                        <IconButton icon={SlidersHorizontal} />
                    </div>

                    <Divider />

                    <div className="flex items-center gap-3">
                        <IconButton icon={Wand2} className="text-slate-400" />
                        <div className="w-[1px] h-8 bg-slate-100" />
                        <IconButton icon={X} className="text-slate-300 hover:text-slate-500" />
                    </div>
                </PanelContainer>

                {/* 3. Audio Recorder (Idle) */}
                <PanelContainer className="gap-3 pr-3 pl-6 h-16 w-full max-w-xl justify-between">
                    <span className="text-slate-600 font-medium font-mono text-lg">0:00</span>

                    {/* Dotted Line Placeholder */}
                    <div className="flex-1 flex items-center justify-center gap-1 opacity-20">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-slate-400 rounded-full" />
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <IconButton icon={Trash2} />
                        <IconButton icon={Play} blue className="w-10 h-10 !p-0" />
                        <div className="w-[1px] h-8 bg-slate-100 mx-1" />
                        <IconButton icon={X} className="text-slate-300 hover:text-slate-500" />
                    </div>
                </PanelContainer>

                {/* 4. Audio Recorder (Active/Recorded) */}
                <PanelContainer className="gap-3 pr-3 pl-6 h-16 w-full max-w-xl justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#3b5bdb] rounded-full animate-pulse" />
                        <span className="text-[#3b5bdb] font-medium font-mono text-lg">0:04</span>
                    </div>

                    {/* Waveform Visualization */}
                    <div className="flex-1 flex items-center gap-3 h-8 mx-2 overflow-hidden">
                        {[4, 8, 5, 10, 14, 20, 12, 16, 24, 18, 12, 8, 4, 3, 6, 12, 22, 14, 8, 5, 8, 12, 6, 4, 8, 12, 16, 20, 14, 8, 4, 2].map((height, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 4 }}
                                animate={{ height }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 }}
                                className="w-1 bg-[#3b5bdb] rounded-full opacity-80"
                                style={{ height: `${height}px` }}
                            />
                        ))}
                        {/* Faded tail */}
                        {[12, 8, 6, 4, 2, 2, 2, 2].map((h, i) => (
                            <div key={`fade-${i}`} className="w-1 bg-slate-200 rounded-full" style={{ height: `${h}px` }} />
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <IconButton icon={Trash2} />
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer">
                            <Pause size={18} fill="currentColor" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#0f172a] flex items-center justify-center text-white hover:bg-[#0f172a]/90 shadow-lg shadow-black/30 cursor-pointer">
                            <Save size={18} />
                        </div>
                        <div className="w-[1px] h-8 bg-slate-100 mx-1" />
                        <IconButton icon={X} className="text-slate-300 hover:text-slate-500" />
                    </div>
                </PanelContainer>

                {/* 5. Time Schedule Picker */}
                <PanelContainer className="gap-3 pr-3 pl-6 h-16 w-full max-w-xl justify-between">
                    <div className="flex items-center gap-3">
                        <Clock className="text-slate-400" size={20} />
                        <span className="text-slate-900 font-semibold text-lg">12:00</span>
                    </div>

                    <ArrowRight className="text-slate-300" size={18} />

                    <div className="flex items-center gap-3 flex-1">
                        <span className="text-slate-900 font-bold text-lg">12:30</span>
                        <span className="text-slate-400 font-medium">30min</span>
                    </div>

                    <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
                        <IconButton icon={X} className="text-slate-300 hover:text-slate-500" />
                    </div>
                </PanelContainer>

            </div>
        </section>
    );
}
