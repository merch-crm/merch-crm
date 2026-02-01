"use client";

import { useEffect, useState } from "react";
import { Cloud, HardDrive, AlertTriangle, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { S3StorageManager } from "./s3-storage-manager";
import { LocalStorageManager } from "./local-storage-manager";
import { checkStorageQuotas, StorageQuotaUsage } from "@/app/(main)/admin-panel/storage-actions";
import { StorageQuotaDialog } from "./storage-quota-dialog";

type StorageTab = "s3" | "local";

export function StorageManager() {
    const [activeTab, setActiveTab] = useState<StorageTab>("s3");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [quotaUsage, setQuotaUsage] = useState<StorageQuotaUsage | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadQuotas = async () => {
            const res = await checkStorageQuotas();
            if (!cancelled && res.data) {
                setQuotaUsage(res.data);
            }
        };

        loadQuotas();

        return () => {
            cancelled = true;
        };
    }, []);

    const refreshQuotas = async () => {
        const res = await checkStorageQuotas();
        if (res.data) setQuotaUsage(res.data);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                {/* Tab Navigation */}
                <div className="flex items-center gap-3 p-2 bg-slate-50/50 rounded-[24px] border border-slate-200 w-fit">
                    <button
                        onClick={() => setActiveTab("s3")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-[20px] text-sm font-bold  tracking-normal transition-all",
                            activeTab === "s3"
                                ? "bg-white text-#5d00ff shadow-sm border border-slate-200"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <Cloud size={18} />
                        Облачное S3
                    </button>
                    <button
                        onClick={() => setActiveTab("local")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-[20px] text-sm font-bold  tracking-normal transition-all",
                            activeTab === "local"
                                ? "bg-white text-emerald-600 shadow-sm border border-slate-200"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <HardDrive size={18} />
                        Локальный диск
                    </button>
                </div>

                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-3 bg-white text-slate-500 hover:text-#5d00ff hover:bg-slate-50 rounded-[18px] border border-slate-200 shadow-sm transition-all active:scale-95"
                    title="Настройки лимитов"
                >
                    <Settings2 size={20} />
                </button>
            </div>

            {/* Quota Alerts */}
            {quotaUsage && (
                <div className="space-y-4">
                    {quotaUsage.local.status !== 'ok' && (
                        <div className={cn(
                            "p-4 rounded-[18px] flex items-center gap-4 shadow-sm border animate-in slide-in-from-top-2",
                            quotaUsage.local.status === 'critical' ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-amber-50 border-amber-100 text-amber-700"
                        )}>
                            <div className={cn(
                                "p-2 rounded-[18px] text-white shrink-0",
                                quotaUsage.local.status === 'critical' ? "bg-rose-500" : "bg-amber-500"
                            )}>
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm  tracking-wide">
                                    {quotaUsage.local.status === 'critical' ? "Критическая нехватка места на диске" : "Заканчивается место на диске"}
                                </p>
                                <p className="text-xs font-medium opacity-80 mt-1">
                                    Локальное хранилище использовано на {Math.round(quotaUsage.local.percent * 100)}% ({(quotaUsage.local.used / 1024 / 1024 / 1024).toFixed(1)} GB из {(quotaUsage.local.limit / 1024 / 1024 / 1024).toFixed(1)} GB)
                                </p>
                            </div>
                        </div>
                    )}

                    {quotaUsage.s3.status !== 'ok' && (
                        <div className={cn(
                            "p-4 rounded-[18px] flex items-center gap-4 shadow-sm border animate-in slide-in-from-top-2",
                            quotaUsage.s3.status === 'critical' ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-amber-50 border-amber-100 text-amber-700"
                        )}>
                            <div className={cn(
                                "p-2 rounded-[18px] text-white shrink-0",
                                quotaUsage.s3.status === 'critical' ? "bg-rose-500" : "bg-amber-500"
                            )}>
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm  tracking-wide">
                                    {quotaUsage.s3.status === 'critical' ? "S3 хранилище переполнено" : "Заканчивается место в S3"}
                                </p>
                                <p className="text-xs font-medium opacity-80 mt-1">
                                    S3 использовано на {Math.round(quotaUsage.s3.percent * 100)}% ({(quotaUsage.s3.used / 1024 / 1024 / 1024).toFixed(1)} GB из {(quotaUsage.s3.limit / 1024 / 1024 / 1024).toFixed(1)} GB)
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === "s3" && <S3StorageManager />}
                {activeTab === "local" && <LocalStorageManager />}
            </div>

            <StorageQuotaDialog
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
                onSaved={refreshQuotas}
            />
        </div>
    );
}
