import React from "react";
import { Users } from "lucide-react";
import Image from "next/image";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { MonitoringData } from "../types";

interface ActiveUsersListProps {
    monitoringData: MonitoringData | null;
}

export function ActiveUsersList({ monitoringData }: ActiveUsersListProps) {
    return (
        <Card className="border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="pb-0 pt-4 px-6">
                <CardTitle className="text-slate-400 text-xs font-bold flex items-center gap-2">
                    <Users size={14} /> Пользователи онлайн
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex items-center">
                {!monitoringData ? (
                    <div className="w-full px-6 py-4 flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-slate-100" />
                        <div className="space-y-2">
                            <div className="h-3 w-24 bg-slate-100 rounded" />
                            <div className="h-2 w-16 bg-slate-50 rounded" />
                        </div>
                    </div>
                ) : (
                    <div className="w-full px-6 py-4">
                        {monitoringData.activeUsers.length === 0 ? (
                            <div className="flex items-center gap-3 text-slate-400">
                                <Users size={20} />
                                <span className="text-sm font-medium">
                                    Нет активных пользователей
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 overflow-x-auto pb-1 no-scrollbar">
                                {monitoringData.activeUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-3 min-w-fit pr-4 border-r border-slate-200 last:border-0"
                                    >
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden relative">
                                                {user.avatar ? (
                                                    <Image
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    user.name?.[0]
                                                )}
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">
                                                {user.name}
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-medium">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
