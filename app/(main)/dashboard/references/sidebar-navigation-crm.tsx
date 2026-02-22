"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    FileText,
    Calendar,
    PieChart,
    Megaphone,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    Plus,
    MoreVertical
} from "lucide-react";

interface MenuItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    subItems?: { id: string; label: string; active?: boolean }[];
    isOpen?: boolean;
    disabled?: boolean;
}

const menuData: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "audience", label: "Audience", icon: Users },
    { id: "posts", label: "Posts", icon: FileText, badge: 8, badgeColor: "bg-emerald-100 text-emerald-600" },
    {
        id: "schedules",
        label: "Schedules",
        icon: Calendar,
        badge: 3,
        badgeColor: "bg-orange-100 text-orange-600"
    },
    {
        id: "income",
        label: "Income",
        icon: PieChart,
        isOpen: true,
        subItems: [
            { id: "earnings", label: "Earnings" },
            { id: "refunds", label: "Refunds", active: true },
            { id: "declines", label: "Declines" },
            { id: "payouts", label: "Payouts" },
        ]
    },
    { id: "promote", label: "Promote", icon: Megaphone },
];

const SidebarItem = ({
    item,
    isCollapsed,
    isActive,
    onToggle
}: {
    item: MenuItem,
    isCollapsed: boolean,
    isActive?: boolean,
    onToggle: (id: string) => void
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // Expanded View
    if (!isCollapsed) {
        return (
            <div className="mb-1">
                <div role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={() => item.subItems ? onToggle(item.id) : null}
                    className={`
                        relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors
                        ${isActive || (item.isOpen && item.subItems) ? 'bg-slate-100/80 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                    `}
                >
                    <div className="flex items-center gap-3">
                        <item.icon size={20} strokeWidth={2} className={isActive ? "text-slate-900" : "text-slate-400"} />
                        <span className="font-medium text-[15px]">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {item.badge && (
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor || 'bg-slate-100'}`}>
                                {item.badge}
                            </span>
                        )}
                        {item.id === "schedules" && (
                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">
                                <Plus size={12} />
                            </div>
                        )}
                        {item.subItems && (
                            <ChevronDown
                                size={16}
                                className={`text-slate-400 transition-transform duration-200 ${item.isOpen ? 'rotate-180' : ''}`}
                            />
                        )}
                    </div>
                </div>

                {/* Nested Tree Structure */}
                <AnimatePresence>
                    {item.subItems && item.isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="relative ml-8 mt-1 space-y-1">
                                {/* Vertical Tree Line */}
                                <div className="absolute left-0 top-0 bottom-4 w-px bg-slate-200" />

                                {item.subItems.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className={`
                                            relative pl-4 pr-3 py-2 rounded-lg cursor-pointer flex items-center text-[14px] font-medium transition-colors
                                            ${sub.active ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-800'}
                                        `}
                                    >
                                        {/* Horizontal Branch Line */}
                                        <div className="absolute left-0 top-1/2 w-3 h-px bg-slate-200 -mt-px" />

                                        {/* Curved connector for last item visual effect can be tricky in pure CSS, simpler L-shape works well */}

                                        {sub.label}

                                        {sub.active && (
                                            <ChevronRight size={14} className="ml-auto text-slate-400" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Collapsed View
    return (
        <div
            className="relative mb-2 flex justify-center w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`
                    w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer transition-colors relative
                    ${isActive || item.isOpen ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}
                `}
            >
                <item.icon size={20} strokeWidth={2} />
                {item.badge && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
                )}
            </div>

            {/* Floating Tooltip / Menu on Hover */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 20, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{ top: 0 }}
                        className="absolute left-full z-50 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-200 p-2 min-w-[200px]"
                    >
                        <div className="px-3 py-2 mb-1">
                            <span className="font-semibold text-slate-900 text-sm">{item.label}</span>
                        </div>

                        {item.subItems ? (
                            <div className="space-y-0.5">
                                {item.subItems.map(sub => (
                                    <div
                                        key={sub.id}
                                        className={`
                                            px-3 py-2 rounded-lg text-sm font-medium cursor-pointer flex items-center justify-between
                                            ${sub.active ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                                        `}
                                    >
                                        {sub.label}
                                        {sub.active && <ChevronRight size={14} />}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function SidebarNavigationCRM() {
    const [items, setItems] = useState(menuData);

    const toggleItem = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, isOpen: !item.isOpen } : item
        ));
    };

    return (
        <section className="py-12 flex justify-center bg-[#ecedf0]">
            <div className="flex gap-3">
                {/* 
                    We render two independent sidebars side-by-side for the showcase.
                    In a real app, this would be one component toggling state.
                */}

                {/* STATE 1: EXPANDED */}
                <div className="w-[280px] h-[700px] bg-white rounded-3xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] p-5 flex flex-col relative overflow-visible">
                    {/* Toggle Button */}
                    <button type="button" className="absolute -right-3 top-12 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-slate-400 hover:text-slate-600 border border-slate-200 z-10">
                        <ChevronLeft size={14} />
                    </button>

                    {/* Logo Area */}
                    <div className="flex items-center gap-3 px-2 mb-8 mt-2">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full relative">
                                <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-200 cursor-pointer">
                                <span className="text-sm font-semibold pl-2">My Project</span>
                                <ChevronDown size={14} className="text-slate-400" />
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        {items.map(item => (
                            <SidebarItem
                                key={item.id}
                                item={item}
                                isCollapsed={false}
                                isActive={item.id === 'income'}
                                onToggle={toggleItem}
                            />
                        ))}
                    </div>

                    {/* User Profile */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-3 px-2 py-1 cursor-pointer hover:bg-slate-50 rounded-xl transition-colors">
                            <Image
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                                alt="Profile"
                                className="w-9 h-9 rounded-full object-cover"
                                width={36}
                                height={36}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">Alexandra D.</p>
                                <p className="text-xs text-slate-400 truncate">Admin</p>
                            </div>
                            <MoreVertical size={16} className="text-slate-400" />
                        </div>
                    </div>
                </div>


                {/* STATE 2: COLLAPSED */}
                <div className="w-[84px] h-[700px] bg-white rounded-3xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] p-4 flex flex-col relative items-center">
                    {/* Toggle Button */}
                    <button type="button" className="absolute -right-3 top-12 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-slate-400 hover:text-slate-600 border border-slate-200 z-10">
                        <ChevronRight size={14} />
                    </button>

                    {/* Logo Area */}
                    <div className="mb-10 mt-2">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                            <span className="font-bold text-white">W.</span>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 w-full space-y-2">
                        {items.map(item => (
                            <SidebarItem
                                key={item.id}
                                item={item}
                                isCollapsed={true}
                                isActive={item.id === 'income'}
                                onToggle={toggleItem}
                            />
                        ))}
                    </div>

                    <div className="mt-auto">
                        <div className="cursor-pointer hover:opacity-80 transition-opacity">
                            <Image
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                                alt="Profile"
                                className="w-9 h-9 rounded-full object-cover"
                                width={36}
                                height={36}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
