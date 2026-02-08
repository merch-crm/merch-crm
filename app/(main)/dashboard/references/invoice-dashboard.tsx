"use client";

import React from "react";
import Image from "next/image";
import {
    Plus,
    ChevronLeft,
    MoreHorizontal,
    CreditCard,
    Settings,
    X,
    Globe,
    CheckCircle2,
    ArrowUpRight,
    LayoutGrid,
    Calendar,
    Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

const InvoiceDashboard = () => {

    const invoiceItems = [
        { id: 1, name: "iPhone 14 Pro", price: 850, qty: 20, store: "Store 2", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-1inch-deeppurple?wid=200&hei=200&fmt=jpeg" },
        { id: 2, name: "iPhone 14", price: 700, qty: 20, store: "Store 2", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch-blue?wid=200&hei=200&fmt=jpeg" },
        { id: 3, name: "MacBook Pro 13", price: 1600, qty: 10, store: "Store 2", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mbp-spacegray-select-202206?wid=200&hei=200&fmt=jpeg" },
        { id: 4, name: "MacBook Air M1", price: 1100, qty: 20, store: "Store 1", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mba-spacegray-select-202402?wid=200&hei=200&fmt=jpeg" },
        { id: 5, name: "iMac 27\"", price: 1300, qty: 20, store: "Store 1", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/imac-24-blue-selection-hero-202310?wid=200&hei=200&fmt=jpeg" },
        { id: 6, name: "iPhone 15", price: 800, qty: 15, store: "Store 2", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=200&hei=200&fmt=jpeg" },
    ];

    const activities = [
        { date: "12 Feb", time: "at 11 pm", title: "Send Payment Reminder", person: "Jessi Johnson", action: "sent a payment reminder", color: "bg-[#e5d5ff]", personImg: "https://randomuser.me/api/portraits/women/44.jpg" },
        { date: "13 Feb", time: "at 12 pm", title: "Call about the contract", person: "Brian Carpenter", action: "Google meets", color: "bg-[#fff7aa]", personImg: "https://randomuser.me/api/portraits/men/32.jpg" },
    ];

    return (
        <div className="rounded-[48px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-4 border-white/50 relative p-1 pb-0 flex flex-col font-sans max-w-[1500px] min-w-[1240px] mx-auto"
            style={{ background: "linear-gradient(135deg, #cdeee2 0%, #f7f6ff 40%, #f6ecff 70%, #d4e7f7 100%)" }}>

            {/* Top Navigation Bar */}
            <div className="px-10 py-8 flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <div className="text-[28px] font-black tracking-tighter text-black flex items-center">sf.</div>

                    <div className="flex items-center gap-2">
                        <button className="w-11 h-11 rounded-full bg-white/60 border border-white flex items-center justify-center text-black/30 hover:bg-white transition-all">
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button className="w-11 h-11 rounded-full bg-white/60 border border-white flex items-center justify-center text-black/30 hover:bg-white transition-all">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>

                    <h1 className="text-[24px] font-medium text-black/30 tracking-tight">Invoice</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/60 border border-white text-[14px] font-bold text-black/60 hover:bg-white transition-all shadow-sm">
                        <CreditCard className="w-4 h-4 opacity-40" />
                        Issue Credit
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/60 border border-white text-[14px] font-bold text-black/60 hover:bg-white transition-all shadow-sm">
                        <Settings className="w-4 h-4 opacity-40" />
                        Edit
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/60 border border-white text-[14px] font-bold text-black/60 hover:bg-white transition-all shadow-sm">
                        <X className="w-4 h-4 opacity-40" />
                        Delete
                    </button>

                    <div className="flex items-center gap-2 ml-4">
                        <div className="w-11 h-11 rounded-full border-2 border-white shadow-lg overflow-hidden cursor-pointer bg-white">
                            <Image src="https://randomuser.me/api/portraits/men/46.jpg" alt="User" width={44} height={44} className="object-cover" />
                        </div>
                        <button className="w-11 h-11 rounded-full bg-white/60 border border-white flex items-center justify-center text-black/30 hover:bg-white transition-all shadow-sm">
                            <Globe className="w-5 h-5 opacity-40" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Hero Section */}
            <div className="px-14 py-6 flex flex-col gap-14">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-3xl bg-white/40 border border-white/60 backdrop-blur-xl flex items-center justify-center shadow-[0_20px_40px_-5px_rgba(0,0,0,0.05)]">
                            <CreditCard className="w-9 h-9 text-black/20" />
                        </div>
                        <div className="flex items-baseline">
                            <span className="text-[100px] font-bold text-black leading-none tracking-[-0.04em]">$</span>
                            <span className="text-[100px] font-bold text-black leading-none tracking-[-0.04em] ml-2">68,575</span>
                            <span className="text-[48px] font-medium text-black/25 leading-none tracking-tight">.00</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-16 pr-10">
                        <div className="space-y-1.5">
                            <div className="text-[11px] font-semibold text-black/30 uppercase tracking-[0.15em]">Account</div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center">
                                    <Globe className="w-3.5 h-3.5 text-black/40" />
                                </div>
                                <span className="text-[19px] font-bold text-black">Ohana Inc.</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="text-[11px] font-semibold text-black/30 uppercase tracking-[0.15em]">Invoice Number</div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center">
                                    <span className="text-[11px] font-bold text-black/40">#</span>
                                </div>
                                <span className="text-[19px] font-bold text-black tracking-tight">INV-4905</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="text-[11px] font-semibold text-black/30 uppercase tracking-[0.15em]">Status</div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 rounded-full border-2 border-black/20" />
                                </div>
                                <span className="text-[19px] font-bold text-black">Posted</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Stats Bar */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-6 py-4.5 rounded-[26px] bg-[#9cf8ce] border border-white/40 shadow-[0_10px_25px_-5px_rgba(156,248,206,0.3)]">
                        <CheckCircle2 className="w-5 h-5 text-black/60" />
                        <span className="text-[19px] font-bold text-black">$ 25.000</span>
                        <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest ml-[-4px]">Paid</span>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-4.5 rounded-[26px] bg-[#fff09e] border border-white/40 shadow-[0_10px_25px_-5px_rgba(255,240,158,0.3)]">
                        <CreditCard className="w-5 h-5 text-black/60" />
                        <span className="text-[19px] font-bold text-black">$ 10.000</span>
                        <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest ml-[-4px]">Credits</span>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-4.5 rounded-[26px] bg-[#e4e7ee] border border-white/40 shadow-[0_10px_25px_-5px_rgba(228,231,238,0.3)]">
                        <ArrowUpRight className="w-5 h-5 text-black/60" />
                        <span className="text-[19px] font-bold text-black">$ 38.575</span>
                        <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest ml-[-4px]">Balance</span>
                    </div>

                    {/* Days Outstanding Dotted Bar */}
                    <div className="flex-1 h-[72px] bg-white/30 backdrop-blur-md rounded-[26px] overflow-hidden flex items-center px-5 gap-8">
                        <div className="flex-1 h-3 flex gap-[3px] items-center"
                            style={{ background: "repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0, rgba(0,0,0,0.08) 1.5px, transparent 1.5px, transparent 4px)" }}>
                            <div className="h-full bg-black/10 w-[45%]" />
                        </div>
                        <div className="flex items-center gap-3 whitespace-nowrap">
                            <span className="text-[14px] font-semibold text-black/40">Days Outstanding</span>
                            <span className="px-5 py-2.5 rounded-2xl bg-black/5 text-[15px] font-bold text-black">8 Days</span>
                        </div>
                        <button className="px-8 py-4.5 rounded-full bg-black text-white text-[15px] font-bold hover:scale-[1.02] transition-transform shadow-lg">
                            Pay Invoice
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Content Area */}
            <div className="mt-4 flex gap-1 px-8 items-end">
                {/* Left Panel - Tabs & Grid */}
                <div className="flex-1 flex flex-col pt-4 relative">
                    <div className="flex items-end mx-14 h-28 relative">
                        {/* Active Tab with Scoop */}
                        <div className="relative flex items-end">
                            <button className="px-16 py-9 bg-white rounded-t-[50px] text-[24px] font-extrabold text-black relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                                Invoice lines
                            </button>
                            {/* The Scoop Element - Creating the concave transition with a shadow trick */}
                            <div className="absolute bottom-0 -right-[50px] w-[50px] h-[50px] pointer-events-none z-10 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full rounded-bl-[50px] shadow-[-25px_25px_0_0_white]" />
                            </div>
                        </div>

                        {/* Inactive Tabs as Pill Capsules */}
                        <div className="flex items-center gap-3 mb-6 ml-14">
                            {["Details", "Docs", "Notes"].map((tab) => (
                                <button key={tab} className="px-11 py-5.5 bg-[#b9e5da] hover:bg-[#a6dbce] transition-all rounded-[32px] text-[20px] font-bold text-[#448074]">
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 bg-white rounded-tl-[60px] p-12 shadow-[inset_0_20px_40px_rgba(0,0,0,0.01)] border-t border-white relative z-20 min-h-[700px]">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-baseline gap-2">
                                <span className="text-[64px] font-black text-black leading-none">67</span>
                                <span className="text-[20px] font-bold text-black/30">Items</span>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3 px-6 py-4 bg-[#f5f6f8] rounded-2xl w-[360px] border border-black/[0.03]">
                                    <Globe className="w-5 h-5 text-black/20" />
                                    <input type="text" placeholder="Search Items" className="bg-transparent outline-none text-[16px] font-bold text-black placeholder:text-black/20 w-full" />
                                </div>
                                <div className="flex p-1.5 bg-[#f5f6f8] rounded-[22px] border border-black/[0.03]">
                                    <button className="p-3.5 bg-white rounded-[18px] shadow-sm text-black">
                                        <LayoutGrid className="w-5 h-5" />
                                    </button>
                                    <button className="p-3.5 text-black/20"><MoreHorizontal className="w-5 h-5" /></button>
                                    <button className="p-3.5 text-black/20"><Settings className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-8">
                            {invoiceItems.map((item) => (
                                <div key={item.id} className="group bg-white rounded-[40px] p-8 border border-black/[0.06] hover:border-black/[0.1] hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col justify-between">
                                    <div className="flex items-start justify-between mb-10">
                                        <div className="w-20 h-20 rounded-[28px] bg-[#f5f6f8] flex items-center justify-center p-3">
                                            <Image src={item.image} alt={item.name} width={64} height={64} className="object-contain" />
                                        </div>
                                        <div className="text-right">
                                            <h4 className="text-[19px] font-black text-black leading-tight mb-1.5">{item.name}</h4>
                                            <p className="text-[15px] font-bold text-black/30 tracking-tight">$ {item.price}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[42px] font-black text-black leading-none">{item.qty}</span>
                                            <span className="text-[14px] font-bold text-black/20 uppercase tracking-widest text-[10px]">Qty</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[14px] font-bold text-black/30">{item.store}</span>
                                            <button className="w-11 h-11 rounded-[18px] bg-black/5 flex items-center justify-center text-black/20 group-hover:bg-black group-hover:text-white transition-all duration-300">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Activity */}
                <div className="w-[480px] flex flex-col pt-4 pr-1">
                    <div className="flex items-center justify-between mx-12 h-20">
                        <h2 className="text-[22px] font-black text-black">Activity</h2>
                    </div>

                    <div className="flex-1 bg-white rounded-tr-[48px] p-12 border-t border-white shadow-[inset_0_20px_40px_rgba(0,0,0,0.02)]">
                        {/* Icons Bar */}
                        <div className="flex items-center gap-3.5 mb-14">
                            {[Calendar, Plus, CreditCard, Plus, Globe, Plus, Bell, Plus].map((Icon, i) => (
                                <button key={i} className="flex-1 aspect-square rounded-[24px] bg-white border border-black/[0.06] flex items-center justify-center text-black/20 hover:bg-black/5 hover:text-black transition-all">
                                    <Icon className="w-6 h-6" />
                                </button>
                            ))}
                        </div>

                        {/* Redesigned Liquid Activity Section */}
                        <div className="space-y-12">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-[64px] font-bold text-black leading-none tracking-tighter">12</span>
                                    <span className="text-[18px] font-bold text-black/15 uppercase tracking-widest">Activities</span>
                                </div>
                                <div className="flex -space-x-3">
                                    {[44, 32, 46].map(id => (
                                        <div key={id} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm bg-white">
                                            <Image src={`https://randomuser.me/api/portraits/thumb/${id % 2 === 0 ? 'women' : 'men'}/${id}.jpg`} alt="User" width={40} height={40} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-14 pt-4">
                                {activities.map((act, i) => (
                                    <div key={i} className="relative group cursor-pointer pl-6">
                                        {/* Organic Fluid Protrusion (The Icon Tab) */}
                                        <div className={cn("absolute -left-6 top-0 w-[84px] h-[84px] rounded-[38px] flex items-center justify-center z-20 border-[6px] border-white shadow-xl relative", act.color)}>
                                            {i === 0 ? <Calendar className="w-7 h-7 text-black/40" /> : <MoreHorizontal className="w-7 h-7 text-black/40" />}

                                            {/* Top Scoop */}
                                            <div className="absolute -top-[40px] right-0 w-[40px] h-[40px] pointer-events-none">
                                                <div className={cn("absolute inset-0", act.color)} />
                                                <div className="absolute inset-0 rounded-br-[40px] bg-white border-r border-b border-white" />
                                            </div>

                                            {/* Bottom Scoop */}
                                            <div className="absolute -bottom-[40px] right-0 w-[40px] h-[40px] pointer-events-none">
                                                <div className={cn("absolute inset-0", act.color)} />
                                                <div className="absolute inset-0 rounded-tr-[40px] bg-white border-r border-t border-white" />
                                            </div>
                                        </div>

                                        <div className={cn("p-12 pl-24 rounded-[56px] border-2 border-white transition-all duration-500 shadow-sm hover:shadow-xl relative overflow-hidden", act.color)}>
                                            <div className="flex items-start justify-between mb-12">
                                                <div className="space-y-1.5 pt-4">
                                                    <div className="text-[14px] font-bold text-black/25 uppercase tracking-[0.2em] mb-1">{act.date}</div>
                                                    <div className="text-[14px] font-bold text-black/15">{act.time}</div>
                                                </div>
                                                <button className="w-14 h-14 rounded-full bg-white/40 flex items-center justify-center hover:bg-white transition-all duration-300 shadow-sm scale-90 group-hover:scale-100">
                                                    <ArrowUpRight className="w-7 h-7 text-black/30" />
                                                </button>
                                            </div>

                                            <h3 className="text-[30px] font-bold text-black mb-12 leading-[1.05] tracking-tight max-w-[280px]">{act.title}</h3>

                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-full border-[5px] border-white overflow-hidden shadow-md bg-white">
                                                    <Image src={act.personImg} alt={act.person} width={56} height={56} className="object-cover" />
                                                </div>
                                                <div>
                                                    <div className="text-[19px] font-bold text-black">{act.person}</div>
                                                    <div className="text-[16px] font-bold text-black/30">{act.action}</div>
                                                </div>
                                            </div>

                                            {/* Glass Overlay for Depth */}
                                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/15 to-transparent shadow-[inset_0_20px_40px_rgba(255,255,255,0.1)]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDashboard;
