"use client";

import { HardDrive, AlertTriangle, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StorageData } from "../types";

interface StorageInfoProps {
    data: StorageData | null;
    formatSize: (bytes: number) => string;
}

export const StorageInfo = ({ data, formatSize }: StorageInfoProps) => {
    return (
        <div className="space-y-3">
            <Card className="border-slate-200 shadow-sm bg-white rounded-[32px] border overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-[18px]">
                            <HardDrive size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-slate-900">Серверное хранилище</CardTitle>
                            <p className="text-xs text-slate-400 font-bold  mt-0.5">Локальные данные</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                    <div className="bg-slate-50 p-4 rounded-[18px] border border-slate-200 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-500  tracking-tight">Путь системы</span>
                            <code className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 max-w-[150px] truncate" title={data?.local.path}>
                                {data?.local.path}
                            </code>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-500  tracking-tight">Доступно</span>
                            <span className="text-sm font-bold text-emerald-600">{formatSize(data?.local.free || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-500  tracking-tight">Использовано</span>
                            <span className="text-sm font-bold text-slate-900">{formatSize(data?.local.used || 0)}</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-[18px] border border-amber-100">
                        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                        <p className="text-xs text-amber-900 font-medium leading-relaxed">
                            Локальное хранилище используется для кэша и временных файлов. Основные данные хранятся в S3.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white rounded-[32px] border overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-[18px]">
                            <Info size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-slate-900">Возможности</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <ul className="space-y-2">
                        {[
                            "Создание папок для организации",
                            "Переименование файлов и папок",
                            "Массовое удаление объектов",
                            "Навигация по структуре"
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};
