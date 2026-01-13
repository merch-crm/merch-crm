"use client";

import { SystemStats } from "@/components/admin/system-stats";

export default function AdminSettingsPage() {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
            <SystemStats />
        </div>
    );
}
