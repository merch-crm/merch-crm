"use client";

import { useState } from "react";
import { Cloud, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import { S3StorageManager } from "./s3-storage-manager";
import { LocalStorageManager } from "./local-storage-manager";

type StorageTab = "s3" | "local";

export function StorageManager() {
    const [activeTab, setActiveTab] = useState<StorageTab>("s3");

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex items-center gap-3 p-2 bg-slate-50/50 rounded-[24px] border border-slate-100 w-fit">
                <button
                    onClick={() => setActiveTab("s3")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-[20px] text-sm font-black uppercase tracking-widest transition-all",
                        activeTab === "s3"
                            ? "bg-white text-indigo-600 shadow-sm border border-slate-100"
                            : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <Cloud size={18} />
                    Облачное S3
                </button>
                <button
                    onClick={() => setActiveTab("local")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-[20px] text-sm font-black uppercase tracking-widest transition-all",
                        activeTab === "local"
                            ? "bg-white text-emerald-600 shadow-sm border border-slate-100"
                            : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <HardDrive size={18} />
                    Локальный диск
                </button>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === "s3" && <S3StorageManager />}
                {activeTab === "local" && <LocalStorageManager />}
            </div>
        </div>
    );
}
