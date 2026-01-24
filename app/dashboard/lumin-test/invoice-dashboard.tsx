"use client";

import React from "react";
import {
    ArrowLeft,
    CreditCard,
    Edit,
    Trash2,
    Search,
    Plus,
    MoreHorizontal,
    Phone,
    Mail,
    ArrowUpRight,
    FileText,
    Calendar
} from "lucide-react";
import Image from "next/image";

export default function InvoiceDashboard() {
    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-[#A8E6CF] via-[#DCEDC1] to-[#D4C1EC] p-8 rounded-[40px] mt-10 font-sans relative overflow-hidden">

            {/* Abstract Shapes/Blur */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-[#6EDCD9]/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-[#E2A9F3]/30 rounded-full blur-[120px]" />
            </div>

            {/* --- HEADER --- */}
            <header className="relative z-10 flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                    <div className="text-2xl font-bold italic tracking-normal text-slate-900">sf.</div>

                    <div className="flex items-center gap-2">
                        <button className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-slate-600 hover:bg-white/60 transition-colors">
                            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                                <div className="bg-slate-600 rounded-[1px]" />
                                <div className="bg-slate-600 rounded-[1px]" />
                                <div className="bg-slate-600 rounded-[1px]" />
                                <div className="bg-slate-600 rounded-[1px]" />
                            </div>
                        </button>
                        <button className="h-10 px-4 rounded-full bg-white/40 backdrop-blur-md flex items-center gap-2 text-sm font-medium text-slate-600 hover:bg-white/60 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            <span>Invoice</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="h-10 px-6 rounded-full bg-white/60 backdrop-blur-md flex items-center gap-2 text-sm font-semibold text-slate-900 shadow-sm border border-white/50 hover:bg-white/80 transition-colors">
                        <CreditCard className="w-4 h-4" />
                        <span>Issue Credit</span>
                    </button>
                    <button className="h-10 px-6 rounded-full bg-white/60 backdrop-blur-md flex items-center gap-2 text-sm font-semibold text-slate-900 shadow-sm border border-white/50 hover:bg-white/80 transition-colors">
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                    </button>
                    <button className="h-10 px-6 rounded-full bg-white/60 backdrop-blur-md flex items-center gap-2 text-sm font-semibold text-slate-900 shadow-sm border border-white/50 hover:bg-white/80 transition-colors">
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                    </button>

                    <div className="w-10 h-10 rounded-full bg-orange-200 ml-4 overflow-hidden border-2 border-white cursor-pointer relative">
                        <Image src="https://i.pravatar.cc/100?img=33" fill className="object-cover" alt="User" />
                    </div>
                    <button className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-slate-600 hover:bg-white/60 transition-colors">
                        <Search className="w-4 h-4" />
                    </button>
                </div>
            </header>


            {/* --- HERO SECTION --- */}
            <div className="relative z-10 grid grid-cols-12 gap-8 mb-12 items-end">
                <div className="col-span-12 lg:col-span-5">
                    <div className="flex items-start gap-4 mb-8">
                        <div className="w-12 h-12 rounded-full border border-slate-900/10 flex items-center justify-center text-slate-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h1 className="text-7xl font-light text-slate-900 tracking-tight">
                            $ 68,575<span className="text-4xl text-slate-500 font-normal">.00</span>
                        </h1>
                    </div>

                    {/* Status Pills */}
                    <div className="flex items-center gap-0 bg-white/20 backdrop-blur-md rounded-full p-1 max-w-fit">
                        <div className="bg-[#66E070] text-slate-900 px-6 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm">
                            <div className="w-4 h-4 rounded-full border border-slate-900 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-2.5 h-2.5" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            $ 25,000
                        </div>
                        <div className="bg-[#FFF580] text-slate-900 px-6 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm -ml-4 z-10">
                            <div className="w-4 h-4 rounded-full border border-slate-900 flex items-center justify-center">
                                <div className="w-2 h-1.5 border border-slate-900 rounded-sm" />
                            </div>
                            $ 10,000
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-7 flex flex-col items-end gap-6 pb-2">
                    <div className="flex items-center gap-12 w-full justify-end text-slate-500 text-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center">
                                <Briefcase className="w-3 h-3" />
                            </div>
                            <div>
                                <div className="text-[10px]  tracking-wider opacity-60">Account</div>
                                <div className="font-semibold text-slate-900">Ohana Inc.</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center">
                                <span className="text-xs font-bold">#</span>
                            </div>
                            <div>
                                <div className="text-[10px]  tracking-wider opacity-60">Invoice Number</div>
                                <div className="font-semibold text-slate-900">INV-4905</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-dotted border-slate-400 rounded-full" />
                            </div>
                            <div>
                                <div className="text-[10px]  tracking-wider opacity-60">Status</div>
                                <div className="font-semibold text-slate-900">Posted</div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full flex items-center gap-4">
                        <div className="flex-1 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center px-2 relative overflow-hidden border border-white/30">
                            {/* Stripe pattern */}
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #000, #000 1px, transparent 1px, transparent 4px)' }}></div>

                            <div className="bg-white/40 h-10 px-6 rounded-full flex items-center gap-3 text-sm font-bold relative z-10 backdrop-blur-md">
                                <div className="w-4 h-4 border border-slate-900 flex items-center justify-center text-[10px] rounded-sm italic font-serif">8</div>
                                $ 38,575
                            </div>

                            <div className="ml-auto pr-6 text-xs font-semibold text-slate-700 z-10">
                                Days Outstanding <span className="text-slate-900 text-sm">8 Days</span>
                            </div>
                        </div>

                        <button className="bg-black text-white px-8 h-14 rounded-full font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg">
                            Pay Invoice
                        </button>
                    </div>
                </div>
            </div>


            {/* --- MAIN CONTENT (Grid) --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">

                {/* LEFT COLUMN: INVOICE LINES */}
                <div className="md:col-span-8 bg-white/40 backdrop-blur-xl rounded-[40px] p-8 border border-white/50">

                    {/* Tabs */}
                    <div className="flex items-center gap-2 mb-8">
                        <button className="bg-white px-6 py-2 rounded-full text-sm font-bold shadow-sm">Invoice lines</button>
                        <button className="px-6 py-2 rounded-full text-sm font-medium text-slate-500 hover:bg-white/20 transition-colors">Details</button>
                        <button className="px-6 py-2 rounded-full text-sm font-medium text-slate-500 hover:bg-white/20 transition-colors">Docs</button>
                        <button className="px-6 py-2 rounded-full text-sm font-medium text-slate-500 hover:bg-white/20 transition-colors">Notes</button>
                    </div>

                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-end gap-2">
                            <h2 className="text-4xl font-light">67</h2>
                            <span className="text-slate-500 font-medium mb-1">Items</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" placeholder="Search Items" className="bg-transparent border-b border-slate-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-slate-900" />
                            </div>
                            <div className="flex bg-white/50 rounded-full p-1">
                                <button className="p-2 rounded-full bg-white shadow-sm"><div className="grid grid-cols-2 gap-0.5 w-3 h-3"><div className="bg-slate-900 rounded-[1px]" /><div className="bg-slate-900 rounded-[1px]" /><div className="bg-slate-900 rounded-[1px]" /><div className="bg-slate-900 rounded-[1px]" /></div></button>
                                <button className="p-2 rounded-full text-slate-400"><div className="flex flex-col gap-0.5 w-3 h-3"><div className="bg-current h-0.5 w-full rounded-full" /><div className="bg-current h-0.5 w-full rounded-full" /><div className="bg-current h-0.5 w-full rounded-full" /></div></button>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { name: "iPhone 14 Pro", price: "$ 850", qty: "20", img: "https://images.unsplash.com/photo-1678685888221-cda773a3dcd9?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
                            { name: "iPhone 14", price: "$ 700", qty: "20", img: "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
                            { name: "MacBook Pro 13", price: "$ 1,600", qty: "10", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
                            { name: "MacBook Air M1", price: "$ 1,100", qty: "20", img: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
                            { name: "iMac 27\"", price: "$ 1,300", qty: "20", img: "https://images.unsplash.com/photo-1547082299-ff1167503719?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
                            { name: "iPhone 15", price: "$ 800", qty: "10", img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white rounded-[18px] p-4 flex flex-col justify-between h-[180px] hover:shadow-lg transition-all cursor-pointer group">
                                <div className="flex gap-4">
                                    <div className="w-12 h-16 bg-slate-100 rounded-[18px] overflow-hidden shrink-0 relative">
                                        <Image src={item.img} fill className="object-cover mix-blend-multiply" alt={item.name} />
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <h3 className="font-bold text-sm leading-tight mb-1">{item.name}</h3>
                                        <div className="text-xs text-slate-500 font-medium">{item.price}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-light">{item.qty}</span>
                                        <span className="text-[10px] text-slate-400 font-bold ">Qty</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400">Store 2</span>
                                        <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN: ACTIVITY */}
                <div className="md:col-span-4 bg-white/40 backdrop-blur-xl rounded-[40px] p-8 border border-white/50 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-medium">Activity</h3>
                    </div>

                    {/* Action Row */}
                    <div className="flex justify-between gap-2 mb-10">
                        <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900"><Calendar className="w-4 h-4" /><div className="absolute top-1 right-1 w-2 h-2 bg-slate-900 rounded-full border-2 border-white translate-x-1 -translate-y-1" /></button>
                        <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900"><Plus className="w-4 h-4" /></button>
                        <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900"><FileText className="w-4 h-4" /><div className="absolute top-1 right-1 w-2 h-2 bg-slate-900 rounded-full border-2 border-white translate-x-1 -translate-y-1" /></button>
                        <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900"><Plus className="w-4 h-4" /></button>
                        <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900"><Phone className="w-4 h-4" /><div className="absolute top-1 right-1 w-2 h-2 bg-slate-900 rounded-full border-2 border-white translate-x-1 -translate-y-1" /></button>
                        <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900"><Plus className="w-4 h-4" /></button>
                        <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900"><Mail className="w-4 h-4" /><div className="absolute top-1 right-1 w-2 h-2 bg-slate-900 rounded-full border-2 border-white translate-x-1 -translate-y-1" /></button>
                        <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900"><Plus className="w-4 h-4" /></button>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <div className="font-semibold text-slate-900">Upcoming</div>
                        <div className="flex items-center gap-1">
                            <span className="text-2xl font-light">12</span>
                            <span className="text-[10px] text-slate-400 font-bold ">Activities</span>
                        </div>
                    </div>

                    <div className="space-y-4 relative">
                        {/* Timeline Line (Visual) */}
                        <div className="absolute left-[26px] top-4 bottom-4 w-[1px] bg-slate-300 border-l border-dashed border-slate-400/50" />

                        {/* Item 1 */}
                        <div className="bg-[#D4C1EC] rounded-[18px] p-4 flex gap-4 relative z-10 transition-transform hover:scale-[1.02] cursor-pointer">
                            <div className="flex flex-col items-center gap-1 min-w-[32px]">
                                <div className="w-8 h-8 rounded-full border border-slate-900/10 flex items-center justify-center">
                                    <Mail className="w-3 h-3 text-slate-700" />
                                </div>
                                <div className="text-[9px] font-bold mt-1 text-slate-700 text-center leading-tight">12 Feb<br />at 11 pm</div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-sm text-slate-900 mb-1">Send Payment Reminder</h4>
                                    <ArrowUpRight className="w-3 h-3 text-slate-600" />
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-white relative">
                                        <Image src="https://i.pravatar.cc/100?img=5" fill className="object-cover" alt="User" />
                                    </div>
                                    <div className="text-[10px] text-slate-600 leading-tight">
                                        <span className="font-bold">Jessi Johnson</span> sent a payment<br />reminder
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="bg-[#FFF580] rounded-[18px] p-4 flex gap-4 relative z-10 transition-transform hover:scale-[1.02] cursor-pointer">
                            <div className="flex flex-col items-center gap-1 min-w-[32px]">
                                <div className="w-8 h-8 rounded-full border border-slate-900/10 flex items-center justify-center">
                                    <Phone className="w-3 h-3 text-slate-700" />
                                </div>
                                <div className="text-[9px] font-bold mt-1 text-slate-700 text-center leading-tight">13 Feb<br />at 12 pm</div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-sm text-slate-900 mb-1">Call about the contract</h4>
                                    <ArrowUpRight className="w-3 h-3 text-slate-600" />
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-white relative">
                                        <Image src="https://i.pravatar.cc/100?img=12" fill className="object-cover" alt="User" />
                                    </div>
                                    <div className="text-[10px] text-slate-600 leading-tight">
                                        <span className="font-bold">Brian Carpenter</span><br />Google meets
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

        </div>
    );
}

// Helper icon component since Briefcase was not imported above but used
function Briefcase(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            <rect width="20" height="14" x="2" y="6" rx="2" />
        </svg>
    )
}
