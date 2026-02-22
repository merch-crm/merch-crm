"use client";

import React from "react";
import { Database, Server, RefreshCw } from "lucide-react";
import { StatCard } from "./stat-card";
import { StorageData } from "../types";

interface StorageStatsProps {
    data: StorageData | null;
    loading: boolean;
    formatSize: (bytes: number) => string;
    fetchData: (manual?: boolean) => Promise<void>;
}

export const StorageStats = ({ data, loading, formatSize, fetchData }: StorageStatsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatCard
                icon={<Database size={24} />}
                iconBgClassName="bg-indigo-50"
                iconTextClassName="text-indigo-600"
                title="Всего в S3"
                value={formatSize(data?.s3.size || 0)}
                subtitle={`${data?.s3.fileCount || 0} объектов`}
            />

            <StatCard
                icon={<Server size={24} />}
                iconBgClassName="bg-emerald-50"
                iconTextClassName="text-emerald-600"
                title="Локальный диск"
                value={`${formatSize(data?.local.used || 0)} / ${formatSize(data?.local.total || 0)}`}
            >
                <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${((data?.local.used || 0) / (data?.local.total || 1)) * 100}%` }}
                    />
                </div>
            </StatCard>

            <StatCard
                icon={<RefreshCw size={24} className={loading ? "animate-spin" : ""} />}
                iconBgClassName="bg-slate-100"
                iconTextClassName="text-slate-600"
                title="Статус"
                value={<h3 className="text-sm font-bold text-slate-900">Данные актуальны</h3>}
                subtitle="Нажмите для обновления"
                onClick={() => fetchData(true)}
            />
        </div>
    );
};
