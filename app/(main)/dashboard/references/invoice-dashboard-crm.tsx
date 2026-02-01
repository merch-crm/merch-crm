"use client";

import Image from "next/image";
import React from "react";
import {
    Check,
    Plus,
    Trash2,
    Pencil,
    FileText,
    CreditCard,
    Clock,
    ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InvoiceDashboardCRM() {
    return (
        <div className="w-full glass-panel p-8 rounded-[var(--radius-outer)] mt-10 overflow-hidden relative">
            {/* Ambient Orbs */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[var(--radius-inner)] bg-slate-900 flex items-center justify-center text-primary shadow-2xl shadow-slate-900/20">
                        <FileText className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold  tracking-normal text-slate-400">Inventory Management</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-[10px] font-bold  tracking-normal text-primary">Invoices</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Inv-672109</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="h-12 px-6 rounded-[var(--radius-inner)] btn-secondary flex items-center gap-2 text-sm font-bold">
                        Issue Credit
                    </button>
                    <div className="flex items-center gap-1">
                        <button className="w-12 h-12 flex items-center justify-center bg-white text-slate-900 rounded-[var(--radius-inner)] shadow-md hover:scale-110 active:scale-95 transition-all text-primary border border-slate-200">
                            <Pencil className="w-5 h-5" />
                        </button>
                        <button className="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-100 rounded-[var(--radius-inner)] shadow-md hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:scale-110 active:scale-95 transition-all">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                {/* Main Content */}
                <div className="lg:col-span-8 flex flex-col gap-8">

                    {/* Hero Section */}
                    <div className="bg-slate-900 rounded-[var(--radius-outer)] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[60px]" />
                        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                            <div>
                                <span className="text-xs font-bold  tracking-normal text-white/50 mb-3 block">Total amount to pay</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-bold">$12,450</span>
                                    <span className="text-2xl font-bold text-white/40">.00</span>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between">
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-[var(--radius-inner)] px-4 py-2">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    <span className="text-sm font-bold">Paid via Stripe</span>
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                </div>
                                <div className="mt-4 flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800">
                                            <Image src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" width={40} height={40} />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-4 border-slate-900 bg-primary flex items-center justify-center text-[10px] font-bold">
                                        +12
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Items */}
                    <div className="crm-card p-0">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="font-bold text-lg">Invoice Items</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400">Showing 67 items</span>
                                <ArrowUpRight className="w-4 h-4 text-slate-300" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-4 text-[10px] font-bold  tracking-normal text-slate-400">Product</th>
                                        <th className="px-6 py-4 text-[10px] font-bold  tracking-normal text-slate-400">Qty</th>
                                        <th className="px-6 py-4 text-[10px] font-bold  tracking-normal text-slate-400">Price</th>
                                        <th className="px-6 py-4 text-[10px] font-bold  tracking-normal text-slate-400">Tax</th>
                                        <th className="px-6 py-4 text-[10px] font-bold  tracking-normal text-slate-400">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {[
                                        { name: "Premium Hoodie", qty: 240, price: "$45.00", tax: "10%", total: "$10,800.00" },
                                        { name: "Sticker Pack", qty: 1200, price: "$0.50", tax: "0%", total: "$600.00" },
                                        { name: "Custom Cap", qty: 45, price: "$12.00", tax: "5%", total: "$540.00" },
                                    ].map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                                                        <Plus className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900">{row.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-500">{row.qty}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-500">{row.price}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-500">{row.tax}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-primary">{row.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Stats */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="crm-card p-6 border-2 border-primary/20 bg-primary/5">
                        <h3 className="font-bold text-lg mb-6">Payment Progress</h3>
                        <div className="space-y-6">
                            {[
                                { label: "Design Fee", val: 100, color: "bg-primary" },
                                { label: "Production", val: 65, color: "bg-primary/60" },
                                { label: "Shipping", val: 30, color: "bg-slate-300" },
                            ].map((item, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold  tracking-normal">
                                        <span className="text-slate-500">{item.label}</span>
                                        <span className="text-primary">{item.val}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="crm-card p-6">
                        <h3 className="font-bold text-lg mb-6">Recent Activity</h3>
                        <div className="space-y-6">
                            {[
                                { user: "Leo M.", action: "Invoiced updated", time: "2h ago", icon: <Clock className="w-3 h-3" /> },
                                { user: "System", action: "Payment received", time: "5h ago", icon: <Check className="w-3 h-3" /> },
                                { user: "Design Dept", action: "File attached", time: "1d ago", icon: <Plus className="w-3 h-3" /> },
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 relative">
                                    {idx !== 2 && <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-100" />}
                                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 z-10">
                                        <div className="text-primary">{item.icon}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">{item.action}</div>
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mt-1">
                                            <span>{item.user}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span>{item.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
