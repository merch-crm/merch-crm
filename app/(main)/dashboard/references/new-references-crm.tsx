"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Wifi,
    Bluetooth,
    Signal,
    Volume2,
    Settings,
    ChevronDown,
    ArrowDown,
    Package,
    Truck,
    Home,
    LayoutGrid,
    Truck as TruckIcon,
    CreditCard,
    Calendar,
    MousePointer2,
    Layers,
    Share,
    X,
    Globe,
    Zap,
    Lock,
    Mic,
    Sparkles,
    Flag,
    Bell,
    CheckCircle2,
    Radio,
    Cloud,
    CloudRain,
    Sun,
    ArrowUp,
    Fan,
    Droplets,
    Tv,
    Router,
    Moon,
    Power,
    PlusCircle,
    MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import InvoiceDashboard from "./invoice-dashboard";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    eachDayOfInterval,
    isWithinInterval,
    getDate,
} from "date-fns";
import { ru } from "date-fns/locale";

/* --- 1. LOGISTICS BUBBLES --- */
const FlightBubbles = () => {
    return (
        <div className="p-6 md:p-20 rounded-[40px] bg-[#F9F9F9] flex flex-col gap-y-3 items-center justify-center min-h-[500px] overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative cursor-pointer transition-shadow hover:shadow-xl"
            >
                <div className="flex items-center gap-3 px-7 py-4 rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-black">
                    <span className="text-[16px] font-semibold">Смена аэропорта</span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F2F2F2] text-[11px] font-bold tracking-wide">
                        <span>IST</span>
                        <ChevronRight className="w-2.5 h-2.5 opacity-30 mx-0.5" />
                        <span>SAW</span>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-black text-white text-[13px] font-bold">1д 2ч</div>
                </div>
                <svg className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.02)]" width="20" height="12" viewBox="0 0 20 12" fill="currentColor">
                    <path d="M10 12L0 0H20L10 12Z" />
                </svg>
            </motion.div>

            <div className="flex flex-wrap gap-3 justify-center w-full">
                {[
                    { label: "Пересадка в KIV", time: "1ч 30м", variant: "dark" },
                    { label: "Турецкие авиалинии", time: "3ч 45м", variant: "light" },
                    { label: "Турецкие авиалинии", time: "3ч 45м", variant: "dark" }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="relative cursor-pointer"
                    >
                        <div className={cn(
                            "flex items-center gap-3 px-7 py-4 rounded-full shadow-xl transition-shadow",
                            item.variant === "dark" ? "bg-black text-white shadow-black/10" : "bg-white text-black shadow-black/5"
                        )}>
                            <span className="text-[16px] font-semibold">{item.label}</span>
                            <div className={cn(
                                "px-3.5 py-1.5 rounded-xl text-[13px] font-bold",
                                item.variant === "dark" ? "bg-white text-black" : "bg-black text-white"
                            )}>{item.time}</div>
                        </div>
                        <svg className={cn("absolute -bottom-2.5 left-1/2 -translate-x-1/2", item.variant === "dark" ? "text-black" : "text-white")} width="20" height="12" viewBox="0 0 20 12" fill="currentColor">
                            <path d="M10 12L0 0H20L10 12Z" />
                        </svg>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

/* --- 2. DELIVERY TRACKING --- */
const DeliveryTracking = () => {
    return (
        <div className="p-6 md:p-20 rounded-[40px] bg-[#F2F2F2] flex items-center justify-center overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className="w-[400px] bg-white rounded-[48px] p-6 shadow-crm-lg border border-slate-200"
            >
                <div className="space-y-1 mb-10">
                    <h2 className="text-[32px] font-bold text-[#1A1B2E]">В пути</h2>
                    <p className="text-[#1A1B2E]/50 text-[18px] font-medium">Ваш груз доставляется.</p>
                </div>

                <div className="bg-[#1A1B2E] rounded-[40px] p-6 relative overflow-hidden flex items-center justify-between mb-10 min-h-[120px]">
                    <div className="absolute left-[50px] right-[50px] h-4 bg-white/5 rounded-full top-1/2 -translate-y-1/2 z-0" />

                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "50%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 2, ease: [0.34, 1.56, 0.64, 1] }}
                        className="absolute left-[50px] h-4 bg-[#BFFF07] rounded-full top-1/2 -translate-y-1/2 z-0 shadow-[0_0_20px_rgba(191,255,7,0.3)]"
                    />

                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                        className="relative z-10 w-14 h-14 rounded-full bg-[#BFFF07] flex items-center justify-center text-black shadow-lg"
                    >
                        <Package className="w-7 h-7" />
                    </motion.div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                            className="w-14 h-14 rounded-full bg-[#BFFF07] flex items-center justify-center text-black shadow-lg shadow-[#BFFF07]/40 relative"
                        >
                            <Truck className="w-7 h-7" />
                            <motion.div
                                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 rounded-full bg-[#BFFF07]"
                            />
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0.3 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="relative z-10 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white/40 border-4 border-[#1A1B2E]"
                    >
                        <Home className="w-7 h-7" />
                    </motion.div>
                </div>

                <div className="space-y-2">
                    <p className="text-[#1A1B2E]/50 text-[18px] font-bold">Ожидаемое время доставки</p>
                    <h3 className="text-[54px] font-black text-[#1A1B2E] leading-noneer">09:20</h3>
                </div>
            </motion.div>
        </div>
    );
};

/* --- 3. TASKELLO CARD --- */
const TaskelloCard = () => {
    return (
        <div className="p-6 md:p-20 rounded-[48px] bg-[#F5F5F0] flex items-center justify-center overflow-hidden">
            <motion.div
                whileHover={{ scale: 1.02, rotate: 0.5 }}
                className="w-[380px] h-[380px] bg-black rounded-[54px] p-2 shadow-2xl overflow-hidden flex flex-col cursor-pointer group"
            >
                <div className="flex-1 bg-black rounded-[46px] overflow-hidden relative">
                    <div className="h-[45%] bg-gradient-to-br from-[#FF4E00] via-[#FF2A00] to-[#C90000] relative">
                        <motion.div
                            animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[40px] rounded-full"
                        />
                        <div className="absolute top-10 right-10 text-right">
                            <div className="text-white font-bold text-[17px] leading-tight flex flex-col">
                                <span>Taskello App</span>
                                <span>Card Design</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-[65%] flex flex-col">
                        <div className="relative h-12 w-full">
                            <svg className="absolute bottom-0 left-0 w-full h-[60px]" preserveAspectRatio="none" viewBox="0 0 340 60">
                                <path
                                    d="M0,60 L0,15 C0,6.7 6.7,0 15,0 L140,0 C148.3,0 155,6.7 155,15 C155,23.3 161.7,30 170,30 L325,30 C333.3,30 340,36.7 340,45 L340,60"
                                    fill="#1A1A1A"
                                />
                            </svg>
                            <div className="absolute top-[-10px] left-8 space-y-0.5 group-hover:translate-x-1 transition-transform">
                                <h3 className="text-white text-[20px] font-bold">Ежедневник</h3>
                                <p className="text-white/40 text-[14px] font-bold">Заметки и дневник</p>
                            </div>
                        </div>

                        <div className="flex-1 bg-[#1A1A1A] relative px-10 pb-10 flex flex-col justify-end">
                            <div className="flex justify-between items-end">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[44px] font-bold text-whiteer leading-none">05</span>
                                    <span className="text-[17px] font-bold text-white/50 leading-none">Док</span>
                                </div>
                                <div className="text-[17px] font-bold text-white pb-1">
                                    1270 заметок
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

/* --- 4. SOFT MESH FOLDER --- */
const SoftFolder = () => {
    return (
        <div className="p-6 md:p-24 rounded-[40px] bg-[#F9F9F9] flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <motion.div
                whileHover={{ y: -8, rotate: 1 }}
                className="w-[340px] h-[340px] bg-[#F7F7F2] rounded-[48px] border-[12px] border-[#ECEBE6] shadow-2xl relative overflow-hidden flex flex-col"
            >
                <div className="h-[40%] relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FFE7A3] via-[#FAC2E2] to-[#D7B1FF]" />
                    <div className="absolute inset-0 bg-white/20 blur-xl opacity-50" />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-[65%] flex flex-col">
                    <div className="relative h-8 w-full">
                        <svg className="absolute bottom-0 left-0 w-full h-[45px]" preserveAspectRatio="none" viewBox="0 0 320 45">
                            <path
                                d="M0,45 L0,5 C0,2.2 2.2,0 5,0 L110,0 C112.8,0 115,2.2 115,5 C115,8 117,10 120,10 L310,10 C315,10 320,15 320,20 L320,45"
                                fill="#F7F7F2"
                            />
                        </svg>
                        <div className="absolute top-[-30px] left-8">
                            <h3 className="text-black text-[15px] font-black">Дизайны</h3>
                            <p className="text-black/30 text-[11px] font-bold">Веб и приложения</p>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#F7F7F2] relative px-10 pb-12 flex flex-col justify-end">
                        <div className="flex justify-between items-baseline w-full">
                            <div className="flex items-baseline gap-1">
                                <span className="text-[28px] font-black text-black">04</span>
                                <span className="text-[13px] font-bold text-black/30">Теги</span>
                            </div>
                            <div className="text-[13px] font-black text-black opacity-80">
                                1012 работ
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

/* --- 5. CRYPTO SWAP WIDGET --- */
const CryptoSwap = () => {
    return (
        <div className="p-6 md:p-20 rounded-[40px] bg-[#F2F2F2] flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full max-w-[480px] flex flex-col items-center">
                <div className="flex gap-3 mb-8">
                    <button type="button" className="px-6 py-2 rounded-full bg-black/5 text-black font-bold text-[15px]">Обмен</button>
                    <button type="button" className="px-6 py-2 text-black/40 font-bold text-[15px] hover:text-black transition-colors">Отправить</button>
                    <button type="button" className="px-6 py-2 text-black/40 font-bold text-[15px] hover:text-black transition-colors">Купить</button>
                </div>
                <div className="w-full space-y-1 relative">
                    <motion.div whileHover={{ scale: 1.01 }} className="bg-white rounded-[32px] p-6 shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-white">
                        <div className="text-[15px] font-bold text-black/40 mb-4">Продать</div>
                        <div className="flex justify-between items-center mb-2">
                            <input type="text" defaultValue="10" className="text-[48px] font-bold text-black bg-transparent w-1/2 outline-none" />
                            <div className="flex flex-col items-end gap-2">
                                <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/5 hover:bg-black/5 transition-all group">
                                    <div className="w-8 h-8 rounded-full bg-[#627EEA] flex items-center justify-center text-white">
                                        <svg width="14" height="22" viewBox="0 0 14 22" fill="none"><path d="M7 0L6.8 0.7V15L7 15.2L13.7 11.2L7 0Z" fill="white" fillOpacity="0.6" /><path d="M7 0L0.3 11.2L7 15.2V8.1V0Z" fill="white" /><path d="M7 22L6.9 21.6V16.7L7 16.5L13.7 12.5L7 22Z" fill="white" fillOpacity="0.6" /><path d="M7 22V16.5L0.3 12.5L7 22Z" fill="white" /><path d="M7 15.2L13.7 11.2L7 8.1L7 15.2Z" fill="white" fillOpacity="0.2" /><path d="M0.3 11.2L7 15.2V8.1L0.3 11.2Z" fill="white" fillOpacity="0.6" /></svg>
                                    </div>
                                    <span className="font-bold text-[17px]">ETH</span>
                                    <ChevronDown className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                                </button>
                                <div className="text-[13px] font-bold text-black/30 flex gap-2">
                                    <span>52.32 ETH</span>
                                    <span className="text-[#627EEA] cursor-pointer hover:underline">Макс</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-[15px] font-bold text-black/30">$38,409.24</div>
                    </motion.div>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <motion.button whileHover={{ rotate: 180 }} whileTap={{ scale: 0.9 }} className="bg-[#F2F2F2] p-2 rounded-2xl border-4 border-[#F2F2F2] shadow-sm">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-black">
                                <ArrowDown className="w-5 h-5" />
                            </div>
                        </motion.button>
                    </div>
                    <motion.div whileHover={{ scale: 1.01 }} className="bg-white rounded-[32px] p-6 shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-white">
                        <div className="text-[15px] font-bold text-black/40 mb-4">Купить</div>
                        <div className="flex justify-between items-center mb-2">
                            <input type="text" defaultValue="147.712" className="text-[48px] font-bold text-black bg-transparent w-1/2 outline-none" />
                            <div className="flex flex-col items-end gap-2">
                                <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/5 hover:bg-black/5 transition-all group">
                                    <div className="w-8 h-8 rounded-full bg-[#7139C5] flex items-center justify-center text-white">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M11.64 4.14a4.34 4.34 0 1 0-7.28 0 4.14 4.14 0 0 0 .54 8 4.14 4.14 0 0 06.2 0 4.14 4.14 0 0 0 .54-8zM8 12.3a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6zm3.45-6.9a.86.86 0 1 1-1.72 0 .86.86 0 0 1 1.72 0zm-5.18 0a.86.86 0 1 1-1.72 0 .86.86 0 0 1 1.72 0z" /></svg>
                                    </div>
                                    <span className="font-bold text-[17px]">AAVE</span>
                                    <ChevronDown className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        </div>
                        <div className="text-[15px] font-bold text-black/30">$38,257.15</div>
                    </motion.div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-black text-white font-bold py-6 rounded-[32px] text-[20px] mt-2 shadow-xl shadow-black/10">
                    Обменять
                </motion.button>
            </div>
        </div>
    );
};

/* --- 6. QUICK SETTINGS MODULE --- */
const QuickSettings = () => {
    const modules = [
        { icon: <Wifi className="w-7 h-7" />, active: true },
        { icon: <Bluetooth className="w-7 h-7" />, active: false },
        { icon: <Signal className="w-7 h-7" />, active: false },
        { icon: <Volume2 className="w-7 h-7" />, active: false }
    ];
    return (
        <div className="p-6 md:p-24 rounded-[40px] bg-[#FDFDF9] flex flex-col items-center justify-center overflow-hidden relative min-h-[500px]">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05]">
                <div className="w-[300px] h-[300px] border border-black rounded-full" />
                <div className="w-[500px] h-[500px] border border-black rounded-full absolute" />
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="w-[340px] bg-[#1A1A1A] rounded-[48px] p-5 shadow-[0_30px_60px_rgba(0,0,0,0.1)] relative z-10">
                <div className="flex items-center justify-between px-4 mb-5">
                    <span className="text-white/40 text-[13px] font-bold">Быстрые настройки</span>
                    <button type="button" className="text-white/30 hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {modules.map((m, i) => (
                        <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={cn("aspect-square rounded-[40px] flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden", m.active ? "bg-white text-black shadow-lg" : "bg-black/20 text-white/40 hover:bg-black/30")}>
                            <div className="absolute top-5 right-5 flex gap-1">
                                <div className={cn("w-1.5 h-1.5 rounded-full", m.active ? "bg-black" : "bg-white/20")} />
                            </div>
                            {m.icon}
                        </motion.button>
                    ))}
                </div>
            </motion.div>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between px-10 py-5 bg-black rounded-3xl text-white">
                <div className="flex gap-3 items-center">
                    <span className="text-[18px] font-black">{new Date().getFullYear()}</span>
                    <div className="flex flex-col text-xs font-bold opacity-60">
                        <span>23</span>
                        <span>Янв</span>
                    </div>
                </div>
                <span className="text-[12px] font-bold opacity-60">Модули системы</span>
            </div>
        </div>
    );
};

/* --- 7. DARK SCHEDULE --- */
const DarkSchedule = () => {
    return (
        <div className="p-6 md:p-20 rounded-[40px] bg-[#EAEAEA] flex items-center justify-center overflow-hidden">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="w-[380px] bg-black rounded-[48px] p-6 shadow-3xl">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-[32px] font-semibold text-white">Март</h2>
                    <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-white border border-white/5 shadow-lg"><Plus className="w-6 h-6" /></motion.button>
                </div>
                <div className="space-y-3">
                    {[
                        { d: "Пн", n: "20", t: "На сегодня ничего не запланировано", active: false },
                        { d: "Вт", n: "21", t: "Встреча по онбордингу проекта", sub: "09:15 - 10:15", active: true },
                        { d: "Вт", n: "21", t: "Ужин с клиентом", sub: "18:30 - 20:00", active: true },
                        { d: "Сб", n: "25", t: "Кофе", sub: "14:30 - 15:30", active: false }
                    ].map((item, i) => (
                        <motion.div key={i} initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.03, x: 5 }} className="flex gap-3 cursor-pointer group">
                            <div className="w-10 pt-1.5 flex flex-col items-center">
                                <span className="text-[11px] font-bold text-[#444] group-hover:text-[#666] transition-colors">{item.d}</span>
                                <span className="text-[20px] font-semibold text-white">{item.n}</span>
                            </div>
                            <div className={cn("flex-1 px-6 py-5 rounded-[22px] transition-all", item.active ? "bg-[#7C3AED] text-white shadow-xl shadow-[#7C3AED]/20" : "bg-[#181818] text-[#666] group-hover:bg-[#202020]")}>
                                <h4 className="text-[14px] font-bold leading-tight">{item.t}</h4>
                                {item.sub && <p className="text-[12px] opacity-70 mt-1 font-medium">{item.sub}</p>}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

/* --- 8. CALENDAR WIDGETS --- */
const CalendarWidgets = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2021, 11, 28));
    const daysArr = ["П", "В", "С", "Ч", "П", "С", "В"];
    const getDaysInMonth = (date: Date) => {
        const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    };
    return (
        <div className="p-6 md:p-20 rounded-[40px] bg-[#F2F2F2] flex flex-col items-center justify-center overflow-hidden">
            <div className="flex flex-col xl:flex-row gap-3 items-center justify-center w-full">
                <motion.div whileHover={{ y: -10 }} className="w-[320px] bg-white rounded-[40px] p-6 shadow-2xl border border-slate-200 flex-shrink-0">
                    <div className="flex justify-between items-start mb-6">
                        <motion.div layout>
                            <div className="text-[36px] font-bold text-black leading-noneer">{selectedDate ? getDate(selectedDate) : getDate(new Date())}</div>
                            <div className="text-[18px] font-medium text-slate-300">{selectedDate ? format(selectedDate, "MMMM", { locale: ru }) : "Дата"}</div>
                        </motion.div>
                    </div>
                    <div className="grid grid-cols-7 gap-y-3 text-center">
                        {daysArr.map((d, i) => <div key={i} className="text-[12px] font-black text-slate-200">{d}</div>)}
                        {getDaysInMonth(new Date(2021, 11, 1)).map((date, i) => (
                            <div key={i} className="flex items-center justify-center">
                                <motion.div onClick={() => setSelectedDate(date)} className={cn("w-7 h-7 text-[14px] font-bold cursor-pointer flex items-center justify-center", isSameDay(date, selectedDate!) ? "bg-[#FF3B30] text-white rounded-[8px] shadow-lg shadow-[#FF3B30]/30" : (isSameMonth(date, new Date(2021, 11, 1)) ? "text-slate-800" : "text-slate-100"))}>
                                    {getDate(date)}
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

/* --- 10. MODERN DROPDOWN --- */
const ModernDropdown = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [, setSelected] = useState<string | null>(null);

    const options = [
        {
            id: "public",
            title: "Public",
            desc: "Shared with everyone across all workspaces.",
            icon: <Globe className="w-5 h-5" />,
            color: "text-slate-400"
        },
        {
            id: "workspace",
            title: "Limited to Workspace",
            desc: "Shared with everyone in your workspace team.",
            icon: <Zap className="w-5 h-5" />,
            color: "text-blue-500",
            active: true
        },
        {
            id: "private",
            title: "Private",
            desc: "Visible only to you.",
            icon: <Lock className="w-5 h-5" />,
            color: "text-slate-400"
        }
    ];

    return (
        <div className="p-6 md:p-24 flex flex-col items-center justify-center pb-64">
            <div className="w-full max-w-[320px] space-y-3">
                <label className="block text-[15px] font-bold text-slate-900 ml-1">Share with</label>

                <div className="relative">
                    <button type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
                    >
                        <span className="text-[15px] font-medium text-slate-500">Select option</span>
                        <ChevronDown className={cn("w-4 h-4 text-blue-600 transition-transform duration-300", isOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-3xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-200 z-50 overflow-hidden"
                            >
                                <div className="flex flex-col gap-1">
                                    {options.map((option) => (
                                        <button type="button"
                                            key={option.id}
                                            onClick={() => {
                                                setSelected(option.id);
                                                setIsOpen(false);
                                            }}
                                            className={cn(
                                                "flex items-start gap-3 p-4 rounded-2xl transition-all text-left group/item",
                                                option.active ? "bg-blue-50/50" : "hover:bg-slate-50"
                                            )}
                                        >
                                            <div className={cn(
                                                "mt-0.5 transition-colors",
                                                option.active ? "text-blue-600" : "text-slate-300 group-hover/item:text-slate-400"
                                            )}>
                                                {option.icon}
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className={cn(
                                                    "text-[15px] font-bold leading-none",
                                                    option.active ? "text-blue-700" : "text-slate-900"
                                                )}>
                                                    {option.title}
                                                </span>
                                                <p className={cn(
                                                    "text-[13px] font-medium leading-tight",
                                                    option.active ? "text-blue-600/60" : "text-slate-400"
                                                )}>
                                                    {option.desc}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

/* --- 12. INTERACTIVE PAGINATION --- */
/* --- 13. AI CHAT CARDS --- */
const AIChatCards = () => {
    return (
        <div className="p-6 md:p-24 rounded-[40px] bg-[#F3F4F6] flex flex-wrap gap-3 items-center justify-center overflow-hidden">
            {/* DARK CARD */}
            <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="w-[320px] aspect-square bg-[#171717] rounded-[48px] p-6 flex flex-col items-center justify-between shadow-crm-xl cursor-default"
            >
                <div className="w-12 h-12 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current">
                        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5153-4.9066 6.0462 6.0462 0 0 0-4.4412-2.7319 6.0021 6.0021 0 0 0-5.1185-1.5544 6.0462 6.0462 0 0 0-4.507 2.6223 6.0021 6.0021 0 0 0-2.3102 4.8193 6.0462 6.0462 0 0 0 1.9547 5.031l-1.0142 1.7512a.375.375 0 0 0 .1373.5133l1.1073.6392a.375.375 0 0 0 .5133-.1373l1.0142-1.7512a5.9847 5.9847 0 0 0 4.1378 1.4883v2.0284a.375.375 0 0 0 .375.375h1.2785a.375.375 0 0 0 .375-.375v-2.0284a5.9847 5.9847 0 0 0 4.275-1.502l1.0142 1.7512a.375.375 0 0 0 .5133.1373l1.1073-.6392a.375.375 0 0 0 .1373-.5133l-1.0142-1.7512a5.9847 5.9847 0 0 0 1.9547-5.031zM12 11.5161a2.3161 2.3161 0 1 1 0-4.6322 2.3161 2.3161 0 0 1 0 4.6322z" />
                    </svg>
                </div>

                <h3 className="text-white text-[24px] font-bold text-center leading-tight">
                    Чем я могу помочь сегодня?
                </h3>

                <button type="button" className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all group/mic">
                    <Mic className="w-6 h-6 transition-transform group-hover/mic:scale-110" />
                </button>
            </motion.div>

            {/* LIGHT CARD */}
            <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="w-[320px] aspect-square bg-white rounded-[48px] p-6 flex flex-col items-center justify-between shadow-crm-xl border border-slate-200 cursor-default"
            >
                <div className="w-12 h-12 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#171717] fill-current">
                        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5153-4.9066 6.0462 6.0462 0 0 0-4.4412-2.7319 6.0021 6.0021 0 0 0-5.1185-1.5544 6.0462 6.0462 0 0 0-4.507 2.6223 6.0021 6.0021 0 0 0-2.3102 4.8193 6.0462 6.0462 0 0 0 1.9547 5.031l-1.0142 1.7512a.375.375 0 0 0 .1373.5133l1.1073.6392a.375.375 0 0 0 .5133-.1373l1.0142-1.7512a5.9847 5.9847 0 0 0 4.1378 1.4883v2.0284a.375.375 0 0 0 .375.375h1.2785a.375.375 0 0 0 .375-.375v-2.0284a5.9847 5.9847 0 0 0 4.275-1.502l1.0142 1.7512a.375.375 0 0 0 .5133.1373l1.1073-.6392a.375.375 0 0 0 .1373-.5133l-1.0142-1.7512a5.9847 5.9847 0 0 0 1.9547-5.031zM12 11.5161a2.3161 2.3161 0 1 1 0-4.6322 2.3161 2.3161 0 0 1 0 4.6322z" />
                    </svg>
                </div>

                <h3 className="text-black text-[24px] font-bold text-center leading-tight">
                    What can I help you with today?
                </h3>

                <div className="w-full h-14 rounded-2xl bg-slate-50 flex items-center px-5 text-slate-400 font-medium text-[15px]">
                    Ask something...
                </div>
            </motion.div>
        </div>
    );
};

const PaginationCRM = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const pages = [1, 2, 3, "...", 10];
    return (
        <div className="p-6 md:p-24 rounded-[40px] bg-[#EBEBEB] flex flex-col gap-3 items-center justify-center overflow-hidden">
            <div className="flex items-center bg-[#D9D9D9]/50 p-1 rounded-[20px] shadow-inner">
                <motion.button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="flex items-center gap-1.5 px-6 py-3.5 rounded-[16px] bg-white text-black font-bold text-[15px] shadow-sm hover:bg-white/90 mr-1"><ChevronLeft className="w-4 h-4" />Пред</motion.button>
                <div className="flex items-center px-2 gap-1.5">
                    {pages.map((p, i) => (
                        <motion.button key={i} onClick={() => typeof p === "number" && setCurrentPage(p)} className={cn("w-11 h-11 rounded-[14px] flex items-center justify-center text-[16px] font-bold transition-all", p === currentPage ? "bg-[#1A1A1A] text-white shadow-xl" : (p === "..." ? "text-black/30 cursor-default" : "text-black hover:bg-black/5"))}>{p}</motion.button>
                    ))}
                </div>
                <motion.button onClick={() => setCurrentPage(p => Math.min(10, p + 1))} className="flex items-center gap-1.5 px-6 py-3.5 rounded-[16px] bg-white text-black font-bold text-[15px] shadow-sm hover:bg-white/90 ml-1">След<ChevronRight className="w-4 h-4" /></motion.button>
            </div>
        </div>
    );
};

const PWAPrompt = () => {
    return (
        <div className="p-6 md:p-24 rounded-[40px] bg-[#121212] flex items-center justify-center overflow-hidden relative min-h-[400px]">
            {/* Background Mesh/Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#BFFF07 0.5px, transparent 0)',
                    backgroundSize: '20px 20px'
                }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative group w-full max-w-[420px]"
            >
                <div className="bg-[#BFFF07] rounded-[32px] p-6 pr-12 shadow-[0_20px_50px_rgba(191,255,7,0.15)] relative">
                    <div className="flex items-center gap-3">
                        {/* Icon Block */}
                        <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center relative flex-shrink-0">
                            <Share className="w-8 h-8 text-white" />
                            {/* Animated Finger Cursor */}
                            <motion.div
                                animate={{
                                    y: [0, -8, 0],
                                    x: [0, 4, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute -bottom-1 -right-1"
                            >
                                <MousePointer2 className="w-8 h-8 text-white fill-white stroke-black stroke-2" />
                            </motion.div>
                        </div>

                        {/* Text Block */}
                        <div className="space-y-1">
                            <p className="text-black font-black text-[17px] leading-tight pr-2">
                                Хотите играть в полноэкранном режиме?
                            </p>
                            <p className="text-black/60 font-bold text-[15px] leading-tight flex items-center gap-1.5 flex-wrap">
                                Нажмите <Share className="w-4 h-4" /> внизу и выберите
                                <span className="text-black">«Добавить на экран &quot;Домой&quot;»</span>
                            </p>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button type="button" className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                        <X className="w-4 h-4" />
                    </button>

                    {/* Speech Bubble Tail */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-[#BFFF07]" />
                </div>
            </motion.div>
        </div>
    );
};

/* --- JOB ACTIONS GRID --- */
const JobActionsGrid = () => {
    const actions = [
        { id: 'fetch', label: 'fetch', icon: Radio, color: 'from-emerald-400 to-emerald-600', dots: 'bg-emerald-500' },
        { id: 'listen', label: 'listen', icon: Radio, color: 'from-blue-400 to-blue-600', dots: 'bg-blue-500' },
        { id: 'validate', label: 'validate', icon: CheckCircle2, color: 'from-cyan-400 to-cyan-600', dots: 'bg-cyan-500' },
        { id: 'flag', label: 'flag', icon: Flag, color: 'from-rose-400 to-rose-600', dots: 'bg-rose-500' },
        { id: 'enrich', label: 'enrich', icon: Sparkles, color: 'from-purple-400 to-purple-600', dots: 'bg-purple-500' },
        { id: 'notify', label: 'notify', icon: Bell, color: 'from-orange-400 to-orange-600', dots: 'bg-orange-500' },
    ];

    return (
        <div className="p-5 md:p-[--padding-xl] rounded-[20px] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '16px 16px' }} />

            {/* Floating dots */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-5 left-5 w-1 h-1 rounded-full bg-black opacity-40"
            />
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-10 right-10 w-1 h-1 rounded-full bg-black opacity-40"
            />
            <motion.div
                animate={{ x: [0, -7.5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-1/2 right-5 w-1 h-1 rounded-full bg-black opacity-40"
            />
            <motion.div
                animate={{ x: [0, 7.5, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-5 left-10 w-1 h-1 rounded-full bg-black opacity-40"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[450px] bg-white rounded-3xl p-5 md:p-6 shadow-[0_16px_32px_rgba(0,0,0,0.08)] relative z-10"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg md:text-xl font-bold text-black">Add job</h3>
                    <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-xs font-semibold">
                        More
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4">
                    {actions.map((action, index) => (
                        <motion.button
                            key={action.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative bg-slate-50/80 hover:bg-slate-100/80 rounded-[16px] p-4 md:p-5 flex flex-col items-start gap-3 transition-all duration-300 border border-transparent hover:border-slate-200/50"
                        >
                            {/* Icon with dots pattern */}
                            <div className="relative">
                                <div className="grid grid-cols-2 gap-1.5">
                                    {[0, 1, 2, 3].map((dot) => (
                                        <motion.div
                                            key={dot}
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.05 + dot * 0.03 }}
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                                action.dots,
                                                "group-hover:scale-110"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Label */}
                            <span className="text-sm md:text-base font-bold text-black">
                                {action.label}
                            </span>
                        </motion.button>
                    ))}
                </div>

                {/* Input field */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Or just describe it"
                        className="w-full h-10 md:h-12 px-4 pr-12 rounded-[14px] bg-slate-50/80 border-2 border-transparent hover:border-slate-200/50 focus:border-slate-300 focus:bg-white outline-none text-sm md:text-base text-slate-400 placeholder:text-slate-300 font-medium transition-all"
                    />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all group">
                        <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};



/* --- WEATHER WIDGET --- */
const WeatherWidget = () => {
    const forecast = [
        { day: 'Tue', date: '23°', icon: CloudRain, temp: '23°' },
        { day: 'Wed', date: '23°', icon: Cloud, temp: '23°' },
        { day: 'Thr', date: '23°', icon: CloudRain, temp: '23°' },
        { day: 'Wed', date: '23°', icon: Cloud, temp: '23°' },
    ];

    return (
        <div className="p-5 md:p-[--padding-xl] rounded-[20px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[400px] aspect-[9/16] bg-black rounded-[40px] p-6 shadow-[0_32px_64px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col"
            >
                {/* Status Bar */}
                <div className="flex items-center justify-between text-white text-xs mb-8 z-20 relative">
                    <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className={cn("w-1 h-1 rounded-full", i <= 3 ? "bg-white" : "bg-white/30")} />
                            ))}
                        </div>
                        <span className="ml-1.5 font-semibold">GS</span>
                        <Wifi className="w-3 h-3 ml-1" />
                    </div>
                    <span className="font-semibold">9:41 AM</span>
                    <div className="flex items-center gap-1">
                        <Bluetooth className="w-3 h-3" />
                        <span className="font-semibold">58 %</span>
                        <div className="w-6 h-3 border border-white/50 rounded-sm relative">
                            <div className="absolute inset-0.5 bg-white rounded-[1px]" style={{ width: '58%' }} />
                        </div>
                    </div>
                </div>

                {/* City Selector */}
                <div className="flex items-center justify-center gap-3 mb-4 z-20 relative">
                    <button type="button" className="text-white/50 text-base font-light hover:text-white transition-colors">Los Angeles</button>
                    <button type="button" className="text-white text-base font-light border-b border-white pb-0.5">New York</button>
                    <button type="button" className="text-white/50 text-base font-light hover:text-white transition-colors">Be</button>
                </div>

                {/* Main Weather Visual - Realistic Cloud & Lightning */}
                <div className="flex-1 flex items-center justify-center relative -mt-8">
                    <div className="relative w-64 h-64 flex items-center justify-center">

                        {/* Lightning Bolt */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{
                                opacity: [1, 0.8, 1, 0.9, 1],
                                filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute top-[45%] left-[50%] -translate-x-1/2 w-40 h-64 z-10 origin-top"
                            style={{ transform: 'translateX(-20px)' }}
                        >
                            <svg viewBox="0 0 145 280" className="w-full h-full drop-shadow-[0_0_30px_rgba(255,160,0,0.6)]">
                                <path
                                    d="M105 0 L25 105 H65 L45 280 L145 95 H95 L135 0 H105 Z"
                                    fill="url(#lightning-fill)"
                                />
                                <defs>
                                    <linearGradient id="lightning-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#FFF7D6" />
                                        <stop offset="20%" stopColor="#FFD54F" />
                                        <stop offset="60%" stopColor="#FF8F00" />
                                        <stop offset="100%" stopColor="#FF6F00" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </motion.div>

                        {/* Cloud Composition */}
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-20"
                        >
                            {/* Inner Glow (Simulating lightning inside cloud) */}
                            <motion.div
                                animate={{ opacity: [0.4, 0.7, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute top-[30%] left-[30%] w-32 h-32 bg-[#FF6F00] rounded-full blur-[40px] mix-blend-screen z-20"
                            />

                            {/* Cloud shapes */}
                            <div className="relative w-72 h-44">
                                {/* Base dark layers for depth */}
                                <div className="absolute bottom-2 left-4 w-36 h-36 bg-[#4a4a4a] rounded-full blur-md opacity-80" />
                                <div className="absolute bottom-4 right-2 w-40 h-40 bg-[#505050] rounded-full blur-md opacity-80" />

                                {/* Main bright masses */}
                                <div className="absolute bottom-0 left-0 w-40 h-36 bg-gradient-to-br from-white via-slate-200 to-slate-400 rounded-[45%] shadow-inner" />
                                <div className="absolute bottom-2 right-0 w-44 h-40 bg-gradient-to-bl from-white via-slate-100 to-slate-400 rounded-[48%] shadow-lg" />
                                <div className="absolute top-0 left-12 w-48 h-44 bg-gradient-to-b from-white via-slate-100 to-slate-300 rounded-[50%] shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.1)] z-10" />

                                {/* Fluff details */}
                                <div className="absolute top-4 left-8 w-24 h-24 bg-white rounded-full blur-[2px] opacity-90 z-20" />
                                <div className="absolute top-2 right-12 w-28 h-28 bg-white rounded-full blur-[1px] opacity-80 z-20" />

                                {/* Subtle orange tint at bottom from lightning */}
                                <div className="absolute bottom-0 left-10 right-10 h-20 bg-gradient-to-t from-orange-500/30 to-transparent blur-xl rounded-b-full z-30 mix-blend-overlay" />
                            </div>
                        </motion.div>

                    </div>
                </div>

                {/* Temperature */}
                <div className="text-center mb-8 relative z-20 mt-4">
                    <div className="text-white text-[100px] font-thin leading-[0.9]er">16°</div>
                    <div className="flex items-center justify-center gap-3 text-white/80 text-base font-light mt-2">
                        <div className="flex items-center gap-1">
                            <ArrowDown className="w-4 h-4 text-white/60" />
                            <span>7°</span>
                        </div>
                        <div className="w-px h-4 bg-white/20" />
                        <div className="flex items-center gap-1">
                            <ArrowUp className="w-4 h-4 text-white/60" />
                            <span>21°</span>
                        </div>
                    </div>
                    <div className="text-[#FFD54F] text-2xl font-light tracking-wide mt-2">Stormy Monday</div>
                </div>

                {/* Forecast */}
                <div className="flex items-center justify-between px-4 pb-2 z-20 relative">
                    {forecast.map((day, i) => {
                        const Icon = day.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex flex-col items-center gap-1.5"
                            >
                                <span className="text-white/60 text-xs font-medium">{day.day}</span>
                                <div className="relative my-1">
                                    <Icon className="w-6 h-6 text-[#FFD54F]" />
                                    {day.icon === CloudRain && (
                                        <Zap className="w-3 h-3 text-orange-400 absolute -bottom-1 -right-1 drop-shadow-md" />
                                    )}
                                </div>
                                <span className="text-white text-sm font-medium">{day.temp}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};


/* --- SMART HOME DASHBOARD --- */
const SmartHomeDashboard = () => {
    return (
        <div className="p-5 md:p-[--padding-xl] rounded-[40px] bg-[#E0E5EC] flex flex-col lg:flex-row gap-3 items-start justify-center overflow-hidden relative">

            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-3 w-full lg:w-[320px]">
                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-[#D4F82C] rounded-[32px] p-6 flex items-center justify-between relative overflow-hidden shadow-lg shadow-[#D4F82C]/20"
                >
                    <div className="flex items-center gap-3 z-10">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black/5 bg-white">
                            {/* Placeholder avatar */}
                            <Image
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Diana"
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                width={48}
                                height={48}
                            />
                        </div>
                        <div>
                            <h3 className="text-black font-bold text-lg leading-tight">Hi, Diana Kemmer</h3>
                            <p className="text-black/60 text-xs font-medium">7 devices active</p>
                        </div>
                    </div>
                    <button type="button" className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black/40 hover:bg-black/10 transition-colors z-10">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {/* Decorative circles */}
                    <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full border-[16px] border-white/20" />
                </motion.div>

                {/* Power Analytics Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[40px] p-6 shadow-xl shadow-slate-200/50"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">AI Power Analytics</h3>
                                <p className="text-slate-400 text-xs font-medium">Daily usage</p>
                            </div>
                        </div>
                        <button type="button" className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 transition-transform">
                            <ArrowUp className="w-5 h-5 rotate-45" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {[
                            { icon: Fan, label: "Air Conditioner", units: "2 unit", power: "18kWh", active: true },
                            { icon: Router, label: "Wi-Fi Router", units: "1 unit", power: "8kWh", active: false },
                            { icon: Tv, label: "Smart TV", units: "2 unit", power: "12kWh", active: false },
                            { icon: Droplets, label: "Humidifier", units: "1 unit", power: "2kWh", active: false },
                        ].map((item, i) => (
                            <div key={i} className={cn("flex items-center justify-between p-4 rounded-3xl cursor-pointer transition-all hover:scale-[1.02]", item.active ? "bg-slate-50" : "hover:bg-slate-50")}>
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-12 h-12 rounded-[20px] flex items-center justify-center", item.active ? "bg-white shadow-sm text-slate-800" : "bg-white border border-slate-200 text-slate-400")}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{item.label}</h4>
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                            <span>{item.units}</span>
                                            <span className="w-px h-3 bg-slate-200" />
                                            <span>{item.power}</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-3 w-full lg:w-[480px]">
                {/* Air Conditioner Widget */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[40px] p-6 shadow-xl shadow-slate-200/50 relative overflow-hidden"
                >
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                                <Fan className="w-6 h-6 text-slate-800" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Air Conditioner</h3>
                                <p className="text-slate-400 text-sm font-medium">Auto cooling</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-xs font-bold text-slate-400">On <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block ml-1" /></div>
                            <button type="button" className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-black/20">
                                <Power className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Radial Dial */}
                    <div className="relative h-[280px] flex items-center justify-center mb-6">
                        {/* Timer Pill */}
                        <div className="absolute top-0 left-0 bg-[#E8EDF5] text-[#5570F1] px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-[#5570F1] flex items-center justify-center text-xs">l</div>
                            2h
                        </div>

                        <div className="absolute top-10 right-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#5570F1]" />
                            <span className="text-xs font-bold text-slate-400">Auto</span>
                        </div>

                        {/* SVG Dial */}
                        <svg viewBox="0 0 300 300" className="w-full h-full -rotate-90">
                            {/* Ticks track */}
                            <circle cx="150" cy="150" r="120" stroke="#E8EDF5" strokeWidth="20" fill="none" strokeDasharray="2 8" />

                            {/* Active ticks (Simulated with another circle masked or simplified) */}
                            {/* For simplicity in this demo, we'll draw manual ticks for the active part */}
                            <path d="M 150 30 A 120 120 0 0 1 254 90" fill="none" stroke="#5570F1" strokeWidth="20" strokeDasharray="2 8" strokeLinecap="round" />

                            {/* Marker */}
                            <circle cx="254" cy="90" r="12" fill="white" stroke="#5570F1" strokeWidth="4" className="drop-shadow-md cursor-pointer hover:scale-110 transition-transform" />
                        </svg>

                        {/* Center Info */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center mt-6">
                            <div className="text-xs font-bold text-slate-800 mb-1">24°</div>
                            <div className="text-6xl font-black text-slate-800">24°</div>
                            <div className="text-slate-400 text-sm font-medium mt-1">Temperature</div>

                            <div className="flex items-center justify-between w-48 mt-8 text-xs font-bold text-slate-400 px-4">
                                <span>10°</span>
                                <span>40°</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom Row - Scenes */}
                <div className="flex gap-3">
                    {/* Morning Scene */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex-1 bg-[#8EAFFC] rounded-[32px] p-6 relative overflow-hidden group cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                <Sun className="w-6 h-6" />
                            </div>
                            <MoreHorizontal className="text-white/60 w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-lg">Morning Scene</h4>
                            <p className="text-white/60 text-xs font-medium mt-1">7 Devices</p>
                        </div>
                    </motion.div>

                    {/* Night Scene */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="flex-1 bg-white rounded-[32px] p-6 relative overflow-hidden group cursor-pointer shadow-lg shadow-slate-200/50"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-12 h-12 rounded-full bg-[#D4F82C] flex items-center justify-center text-black">
                                <Moon className="w-6 h-6" />
                            </div>
                            <MoreHorizontal className="text-slate-400 w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-slate-800 font-bold text-lg">Night Scene</h4>
                            <p className="text-slate-400 text-xs font-medium mt-1">2 Devices</p>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-3xl p-3 pl-5 flex items-center justify-between shadow-lg shadow-slate-200/50"
                >
                    <div className="flex items-center gap-3">
                        <button type="button" className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors">
                            <PlusCircle className="w-5 h-5" />
                        </button>
                        <div>
                            <h4 className="text-slate-800 font-bold text-sm">You created 8 scenes</h4>
                            <p className="text-slate-400 text-xs font-medium">24 devices in use</p>
                        </div>
                    </div>
                    <button type="button" className="bg-black text-white px-5 py-2.5 rounded-2xl text-xs font-bold hover:bg-slate-800 transition-colors">
                        See All
                    </button>
                </motion.div>
            </div>
        </div>
    );
};


/* --- DATE RANGE PICKERS --- */
const DateRangePickers = () => {
    // State for Blue Calendar
    const [currentDate1, setCurrentDate1] = useState(new Date(2021, 5, 1)); // June 2021
    const [selectedRange1, setSelectedRange1] = useState<{ start: Date | null, end: Date | null }>({
        start: new Date(2021, 5, 11),
        end: new Date(2021, 5, 24)
    });

    // State for Purple Calendar
    const [currentDate2] = useState(new Date(2021, 5, 1)); // June 2021
    const [selectedRange2, setSelectedRange2] = useState<{ start: Date | null, end: Date | null }>({
        start: new Date(2021, 5, 11),
        end: new Date(2021, 5, 24)
    });

    // Helper to generate calendar days
    const generateDays = (date: Date) => {
        const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    };

    interface DateRange {
        start: Date | null;
        end: Date | null;
    }

    const handleDateClick = (date: Date, setRange: (range: DateRange) => void, range: DateRange) => {
        if (!range.start || (range.start && range.end)) {
            setRange({ start: date, end: null });
        } else {
            if (date < range.start) {
                setRange({ start: date, end: range.start });
            } else {
                setRange({ start: range.start, end: date });
            }
        }
    };

    const isSelected = (date: Date, range: DateRange) => {
        if (range.start && isSameDay(date, range.start)) return true;
        if (range.end && isSameDay(date, range.end)) return true;
        if (range.start && range.end) {
            return isWithinInterval(date, { start: range.start, end: range.end });
        }
        return false;
    };

    const isStart = (date: Date, range: DateRange) => range.start && isSameDay(date, range.start);
    const isEnd = (date: Date, range: DateRange) => range.end && isSameDay(date, range.end);
    const isRange = (date: Date, range: DateRange) => range.start && range.end && isWithinInterval(date, { start: range.start, end: range.end }) && !isSameDay(date, range.start) && !isSameDay(date, range.end);

    return (
        <div className="p-6 md:p-20 rounded-[40px] bg-[#EAEAEA] flex flex-wrap gap-3 items-center justify-center min-h-[600px]">

            {/* BLUE CALENDAR */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[32px] p-6 w-[340px] shadow-xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6 px-2">
                    <button type="button" onClick={() => setCurrentDate1(subMonths(currentDate1, 1))} className="text-slate-400 hover:text-slate-600">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-slate-800 font-bold text-lg capitalize">{format(currentDate1, 'LLLL yyyy', { locale: ru })}</h3>
                    <button type="button" onClick={() => setCurrentDate1(addMonths(currentDate1, 1))} className="text-slate-400 hover:text-slate-600">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 mb-4">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d, i) => (
                        <div key={i} className="text-center text-xs font-bold text-slate-400 py-2">{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-y-2 mb-8">
                    {generateDays(currentDate1).map((day, i) => {
                        const isCurrentMonth = isSameMonth(day, currentDate1);
                        const start = isStart(day, selectedRange1);
                        const end = isEnd(day, selectedRange1);
                        const range = isRange(day, selectedRange1);
                        const selected = start || end;

                        return (
                            <div key={i} className="relative h-10 flex items-center justify-center">
                                {/* Range Background Strip */}
                                {isSelected(day, selectedRange1) && (
                                    <div className={cn(
                                        "absolute top-1 bottom-1 bg-[#F0F6FF]",
                                        start && "left-1 rounded-l-full",
                                        end && "right-1 rounded-r-full",
                                        range && "left-0 right-0",
                                        !range && !start && !end && "left-0 right-0" // Fallback
                                    )} style={{ left: start ? '4px' : '0', right: end ? '4px' : '0' }} />
                                )}

                                <button type="button"
                                    onClick={() => handleDateClick(day, setSelectedRange1, selectedRange1)}
                                    className={cn(
                                        "relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all z-10",
                                        selected ? "bg-[#0062FF] text-white shadow-lg shadow-[#0062FF]/40" : isCurrentMonth ? "text-slate-700 hover:bg-slate-50" : "text-slate-300",

                                    )}
                                >
                                    {format(day, 'd', { locale: ru })}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-auto">
                    <button type="button" className="hidden md:block flex-1 py-3 rounded-2xl bg-slate-50 text-slate-500 font-semibold text-sm hover:bg-slate-100 transition-colors">
                        Отмена
                    </button>
                    <button type="button" className="flex-1 py-3 rounded-2xl bg-[#EAF2FF] text-[#0062FF] font-semibold text-sm hover:bg-[#D4E5FF] transition-colors w-full">
                        Применить
                    </button>
                </div>
            </motion.div>

            {/* PURPLE CALENDAR */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[32px] p-6 w-[340px] shadow-xl"
            >
                {/* Header with Dropdowns */}
                <div className="flex items-center gap-3 mb-6 px-1">
                    <button type="button" className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-xl text-slate-700 text-sm font-bold flex-1 hover:bg-slate-100 capitalize">
                        {format(currentDate2, 'LLLL', { locale: ru })}
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                    <button type="button" className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-xl text-slate-700 text-sm font-bold flex-1 hover:bg-slate-100">
                        {format(currentDate2, 'yyyy', { locale: ru })}
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 mb-4">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d, i) => (
                        <div key={i} className="text-center text-xs font-bold text-slate-400 py-2">{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-y-2 mb-8">
                    {generateDays(currentDate2).map((day, i) => {
                        const isCurrentMonth = isSameMonth(day, currentDate2);
                        const start = isStart(day, selectedRange2);
                        const end = isEnd(day, selectedRange2);
                        const range = isRange(day, selectedRange2);
                        const selected = start || end;

                        return (
                            <div key={i} className="relative h-10 flex items-center justify-center">
                                {/* Range Background Strip */}
                                {isSelected(day, selectedRange2) && (
                                    <div className={cn(
                                        "absolute top-1 bottom-1 bg-[#F4EFFD]",
                                        start && "left-1 rounded-l-full",
                                        end && "right-1 rounded-r-full",
                                        range && "left-0 right-0",
                                    )} style={{ left: start ? '4px' : '0', right: end ? '4px' : '0' }} />
                                )}

                                <button type="button"
                                    onClick={() => handleDateClick(day, setSelectedRange2, selectedRange2)}
                                    className={cn(
                                        "relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all z-10",
                                        selected ? "bg-[#7B2CBF] text-white shadow-lg shadow-[#7B2CBF]/40" : isCurrentMonth ? "text-slate-700 hover:bg-slate-50" : "text-slate-300",
                                    )}
                                >
                                    {format(day, 'd', { locale: ru })}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-auto">
                    <button type="button" className="hidden md:block flex-1 py-3 rounded-2xl bg-slate-50 text-slate-500 font-semibold text-sm hover:bg-slate-100 transition-colors">
                        Отмена
                    </button>
                    <button type="button" className="flex-1 py-3 rounded-2xl bg-[#F0E5FF] text-[#7B2CBF] font-semibold text-sm hover:bg-[#E0CCFF] transition-colors w-full">
                        Применить
                    </button>
                </div>
            </motion.div>

        </div>
    );
};


/* --- PRICING PLANS --- */
const PricingPlans = () => {
    const plans = [
        {
            name: "Стартовый",
            price: "$0",
            period: "/мес",
            description: "Идеально для небольших команд",
            buttonText: "Начать работу",
            features: [
                "3 Проекта",
                "AI Анализ кандидатов",
                "AI Рекрутер"
            ],
            bgClass: "bg-slate-100",
            badgeClass: "bg-white text-black"
        },
        {
            name: "ПРОФЕССИОНАЛ",
            price: "$99",
            period: "/мес",
            description: "Идеально для растущих команд",
            buttonText: "Начать работу",
            features: [
                "Безлимит проектов",
                "AI Анализ кандидатов",
                "AI Рекрутер",
                "Гарантия возврата"
            ],
            bgClass: "bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100",
            badgeClass: "bg-white/80 backdrop-blur text-indigo-900 border border-white/50"
        },
        {
            name: "КОРПОРАТИВНЫЙ",
            price: "Индив.",
            period: "",
            description: "Для крупных организаций",
            buttonText: "Связаться с нами",
            features: [
                "Безлимит проектов",
                "AI Анализ кандидатов",
                "Кастомные тесты навыков",
                "Персональный AI Рекрутер"
            ],
            bgClass: "bg-slate-100",
            badgeClass: "bg-white text-black"
        }
    ];

    return (
        <div className="p-6 md:p-20 rounded-[40px] bg-[#F5F5F7] flex flex-wrap gap-3 items-center justify-center">
            {plans.map((plan, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="w-[340px] bg-white rounded-[32px] p-4 shadow-xl shadow-slate-200/50 flex flex-col"
                >
                    {/* Top Section (Card in Card) */}
                    <div className={cn("rounded-3xl p-6 pb-8 relative", plan.bgClass)}>
                        {/* Badge */}
                        <div className={cn("inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold mb-6", plan.badgeClass)}>
                            {plan.name}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                            {plan.period && <span className="text-slate-500 font-medium">{plan.period}</span>}
                        </div>

                        {/* Description */}
                        <p className="text-slate-600 text-sm font-medium mb-8">
                            {plan.description}
                        </p>

                        {/* Button */}
                        <button type="button" className="w-full py-4 bg-[#1A1A1A] hover:bg-black text-white rounded-[20px] font-bold text-sm transition-transform active:scale-[0.98] shadow-lg shadow-black/20">
                            {plan.buttonText}
                        </button>
                    </div>

                    {/* Features List */}
                    <div className="px-6 py-8 space-y-3 flex-1">
                        {plan.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                                <CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};




export default function NewReferencesCRM() {
    const [activeTab, setActiveTab] = useState("all");

    const categories = [
        { id: "all", name: "Все", icon: <LayoutGrid className="w-4 h-4" /> },
        { id: "logistics", name: "Логистика", icon: <TruckIcon className="w-4 h-4" /> },
        { id: "cards", name: "Карточки", icon: <CreditCard className="w-4 h-4" /> },
        { id: "widgets", name: "Виджеты", icon: <Layers className="w-4 h-4" /> },
        { id: "calendar", name: "Календари", icon: <Calendar className="w-4 h-4" /> },
        { id: "ui", name: "Интерфейс", icon: <MousePointer2 className="w-4 h-4" /> },
        { id: "dropdowns", name: "Выпадающие списки", icon: <ChevronDown className="w-4 h-4" /> },
        { id: "ai", name: "Искусственный интеллект", icon: <Sparkles className="w-4 h-4" /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "logistics":
                return (
                    <div className="space-y-24">
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><TruckIcon className="text-blue-500" />Отслеживание и статус</h3>
                            <DeliveryTracking />
                        </section>
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><TruckIcon className="text-blue-500" />Инфо-бабблы логистики</h3>
                            <FlightBubbles />
                        </section>
                    </div>
                );
            case "ai":
                return (
                    <div className="space-y-24">
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-purple-500" />Модули AI чата</h3>
                            <AIChatCards />
                        </section>
                    </div>
                );
            case "cards":
                return (
                    <div className="space-y-24">
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><CreditCard className="text-orange-500" />Invoice Dashboard</h3>
                            <InvoiceDashboard />
                        </section>
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><CreditCard className="text-orange-500" />Карточка Taskello</h3>
                            <TaskelloCard />
                        </section>
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><CreditCard className="text-orange-500" />Soft Mesh Folder</h3>
                            <SoftFolder />
                        </section>
                    </div>
                );
            case "widgets":
                return (
                    <div className="space-y-24">
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Layers className="text-purple-500" />Обмен криптовалюты</h3>
                            <CryptoSwap />
                        </section>
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Layers className="text-purple-500" />Быстрые настройки (Bento)</h3>
                            <QuickSettings />
                        </section>
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Layers className="text-purple-500" />Умный дом</h3>
                            <SmartHomeDashboard />
                        </section>
                    </div>
                );
            case "calendar":
                return (
                    <div className="space-y-24">
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Calendar className="text-red-500" />Расписание (Тёмная тема)</h3>
                            <DarkSchedule />
                        </section>
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Calendar className="text-red-500" />Календарные виджеты</h3>
                            <CalendarWidgets />
                        </section>
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Calendar className="text-red-500" />Выбор диапазона дат</h3>
                            <DateRangePickers />
                        </section>
                    </div>
                );
            case "ui":
                return (
                    <div className="space-y-24">
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><MousePointer2 className="text-green-500" />Установка приложения (PWA)</h3>
                            <PWAPrompt />
                        </section>
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><MousePointer2 className="text-green-500" />Премиальная пагинация</h3>
                            <PaginationCRM />
                        </section>
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><CreditCard className="text-green-500" />Тарифные планы</h3>
                            <PricingPlans />
                        </section>
                    </div>
                );
            case "dropdowns":
                return (
                    <div className="space-y-38">
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold flex items-center gap-2"><ChevronDown className="text-blue-500" />Современный Dropdown</h3>
                            <ModernDropdown />
                        </section>
                    </div>
                );
            default:
                return (
                    <div className="space-y-34">
                        <section className="space-y-12">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <TruckIcon className="w-8 h-8 text-blue-500" />
                                <div>
                                    <h3 className="text-2xl font-black">Логистика и доставка</h3>
                                    <p className="text-slate-400 font-medium">Виджеты отслеживания и транспортные статусы</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                <DeliveryTracking />
                                <FlightBubbles />
                            </div>
                        </section>

                        <section className="space-y-12">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <CreditCard className="w-8 h-8 text-orange-500" />
                                <div>
                                    <h3 className="text-2xl font-black">Карточки и контент</h3>
                                    <p className="text-slate-400 font-medium">Премиальные дизайны карточек и контейнеров</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                <TaskelloCard />
                                <SoftFolder />
                            </div>
                        </section>

                        <section className="space-y-12">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <Layers className="w-8 h-8 text-purple-500" />
                                <div>
                                    <h3 className="text-2xl font-black">Интерактивные виджеты</h3>
                                    <p className="text-slate-400 font-medium">Сложные UI взаимодействия и инструменты</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                <CryptoSwap />
                                <QuickSettings />
                                <SmartHomeDashboard />
                            </div>
                        </section>

                        <section className="space-y-12">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <Calendar className="w-8 h-8 text-red-500" />
                                <div>
                                    <h3 className="text-2xl font-black">Календари и расписания</h3>
                                    <p className="text-slate-400 font-medium">Управление временем и событиями</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                <DarkSchedule />
                                <CalendarWidgets />
                                <DateRangePickers />
                            </div>
                        </section>

                        <section className="space-y-12">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <MousePointer2 className="w-8 h-8 text-green-500" />
                                <div>
                                    <h3 className="text-2xl font-black">UI Компоненты</h3>
                                    <p className="text-slate-400 font-medium">Навигация и базовые элементы интерфейса</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <PaginationCRM />
                                <PWAPrompt />
                                <JobActionsGrid />
                                <WeatherWidget />
                                <PricingPlans />
                            </div>
                        </section>

                        <section className="space-y-12">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <ChevronDown className="w-8 h-8 text-blue-500" />
                                <div>
                                    <h3 className="text-2xl font-black">Выпадающие списки</h3>
                                    <p className="text-slate-400 font-medium">Интерактивные меню выбора и фильтрации</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                <ModernDropdown />
                            </div>
                        </section>

                        <section className="space-y-12">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <Sparkles className="w-8 h-8 text-purple-600" />
                                <div>
                                    <h3 className="text-2xl font-black">OpenAI / GPT Модули</h3>
                                    <p className="text-slate-400 font-medium">Интерфейсы для работы с нейросетями</p>
                                </div>
                            </div>
                            <AIChatCards />
                        </section>
                    </div>
                );
        }
    };

    return (
        <section className="max-w-[1600px] mx-auto px-6 py-12 space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div className="space-y-2">
                    <span className="text-blue-600 font-black tracking-[0.3em] text-xs">Reference Hub</span>
                    <h2 className="text-6xl font-black text-slate-900er leading-none">Библиотека референсов</h2>
                    <p className="text-slate-400 text-lg font-medium max-w-xl">Коллекция интерактивных компонентов и премиальных UI-дизайнов для CRM системы.</p>
                </div>

                <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-1">
                    {categories.map((cat) => (
                        <button type="button"
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === cat.id
                                    ? "bg-white text-black shadow-md"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {cat.icon}
                            {cat.name}
                        </button>
                    ))}
                </div>
            </header>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="pt-12"
            >
                {renderContent()}
            </motion.div>

            <footer className="pt-24 pb-12 border-t mt-24 text-center">
                <p className="text-slate-300 font-black text-xs">Merch CRM Design System © {new Date().getFullYear()}</p>
            </footer>
        </section>
    );
}


