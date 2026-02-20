"use client";

import React from "react";
import { HardDrive, Folder, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

interface StorageStatsProps {
    fileCount: number;
    folderCount: number;
    totalSize: string;
    loading: boolean;
    onRefresh: () => void;
}

export function StorageStats({
    fileCount,
    folderCount,
    totalSize,
    loading,
    onRefresh
}: StorageStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
                title="Всего файлов"
                value={fileCount}
                subtitle={totalSize}
                icon={HardDrive}
                colorScheme="emerald"
            />

            <StatCard
                title="Папок"
                value={folderCount}
                subtitle="в структуре"
                icon={Folder}
                colorScheme="amber"
            />

            <StatCard
                title="Статус"
                value={loading ? "Обновление..." : "Данные актуальны"}
                subtitle="Нажмите для обновления"
                icon={RefreshCw}
                colorScheme="slate"
                onClick={onRefresh}
                className={loading ? "opacity-70" : ""}
            />
        </div>
    );
}
