

import React from "react";
import { Download, Activity } from "lucide-react";
import { Variant1Match } from "./components/variant-1-match";
import { Variant2Card } from "./components/variant-2-card";
import { Variant3Dark } from "./components/variant-3-dark";
import { Variant4Action } from "./components/variant-4-action";
import { Variant5Compact } from "./components/variant-5-compact";
import { Variant6Timeline } from "./components/variant-6-timeline";
import { Variant7Soft } from "./components/variant-7-soft";
import { Variant8Analytics } from "./components/variant-8-analytics";
import { Variant9ERP } from "./components/variant-9-erp";
import { Variant10Mobile } from "./components/variant-10-mobile";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CRM Tables Demo | MerchCRM',
    description: 'Explore various CRM table design variants for high-performance data management.',
};

export default function CRMTablesDemo() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-32">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold  text-slate-900">История операций</h1>
                            <p className="text-sm text-slate-500">10 вариантов дизайна для ваших данных.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors text-sm flex items-center gap-2 shadow-sm">
                            <Download className="w-4 h-4" /> Скачать
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 space-y-3 mt-12">
                <Variant1Match />
                <Variant2Card />
                <Variant3Dark />
                <Variant4Action />
                <Variant5Compact />
                <Variant6Timeline />
                <Variant7Soft />
                <Variant8Analytics />
                <Variant9ERP />
                <Variant10Mobile />
            </div>
        </div>
    );
}
