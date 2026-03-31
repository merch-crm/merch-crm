"use client";

import React from "react";
import { ArrowRightLeft, RotateCw, ArrowUpCircle, ArrowDownCircle, Activity } from "lucide-react";

export const renderIcon = (typeIcon: string) => {
    switch (typeIcon) {
        case 'swap':
            return <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-sm border border-purple-200/50"><ArrowRightLeft className="w-4 h-4" /></div>;
        case 'refresh':
            return <div className="w-8 h-8 rounded-full bg-fuchsia-100 text-fuchsia-500 flex items-center justify-center shrink-0 shadow-sm border border-fuchsia-200/50"><RotateCw className="w-4 h-4" /></div>;
        case 'expense':
            return <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 shadow-sm border border-rose-200/50"><ArrowUpCircle className="w-4 h-4" /></div>;
        case 'income':
            return <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200/50"><ArrowDownCircle className="w-4 h-4" /></div>;
        default:
            return <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><Activity className="w-4 h-4" /></div>;
    }
};
