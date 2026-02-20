import React from "react";
import { Lock, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { getTimeAgo } from "../utils";
import { FailedLogin } from "../types";

interface FailedLoginsCardProps {
    failedLogins: FailedLogin[];
    onClearFailedLogins: () => void;
    isClearingLogins: boolean;
}

export function FailedLoginsCard({
    failedLogins,
    onClearFailedLogins,
    isClearingLogins,
}: FailedLoginsCardProps) {
    return (
        <Card className="border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden bg-white rounded-[32px] border">
            <CardHeader className="pb-4 border-b border-slate-200 bg-slate-50/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-[18px]">
                            <Lock size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-slate-900">
                                Попытки входа (24ч)
                            </CardTitle>
                            <p className="text-xs text-slate-400 font-bold mt-0.5">
                                Мониторинг безопасности доступа
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={onClearFailedLogins}
                        disabled={isClearingLogins || !failedLogins.length}
                        className={cn(
                            "gap-2 text-xs h-8 rounded-[18px]",
                            failedLogins.length && !isClearingLogins
                                ? "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-200"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60 hover:bg-slate-100"
                        )}
                    >
                        <Trash2 size={14} />
                        {isClearingLogins ? "Очистка..." : "Очистить список"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ResponsiveDataView
                    data={failedLogins}
                    renderCard={(login, idx) => (
                        <div
                            key={login.id || idx}
                            className="p-4 bg-white border border-slate-100 rounded-2xl space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                                        <AlertTriangle size={14} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">
                                        {login.email}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-slate-400">
                                    {getTimeAgo(login.createdAt)} назад
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span
                                    className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-bold",
                                        login.reason === "password_mismatch"
                                            ? "bg-amber-50 text-amber-600"
                                            : "bg-rose-50 text-rose-600"
                                    )}
                                >
                                    {login.reason === "password_mismatch"
                                        ? "Неверный пароль"
                                        : "Пользователь не найден"}
                                </span>
                                <code className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                                    {login.ipAddress || "Unknown"}
                                </code>
                            </div>
                        </div>
                    )}
                    renderTable={() => (
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="crm-table min-w-[600px]">
                                <thead className="crm-thead">
                                    <tr>
                                        <th className="crm-th">Email / Аккаунт</th>
                                        <th className="crm-th">Причина</th>
                                        <th className="crm-th">IP Адрес</th>
                                        <th className="crm-th">Дата и время</th>
                                    </tr>
                                </thead>
                                <tbody className="crm-tbody">
                                    {failedLogins.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="py-12 text-center text-slate-400 font-bold text-xs"
                                            >
                                                Атак не обнаружено
                                            </td>
                                        </tr>
                                    ) : (
                                        failedLogins.map((login) => (
                                            <tr key={login.id} className="crm-tr">
                                                <td className="crm-td">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-rose-50 text-rose-500 rounded-[18px] group-hover:scale-110 transition-transform">
                                                            <AlertTriangle size={14} />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700">
                                                            {login.email}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="crm-td">
                                                    <span
                                                        className={cn(
                                                            "px-2 py-0.5 rounded-[18px] text-xs font-bold tracking-tight",
                                                            login.reason === "password_mismatch"
                                                                ? "bg-amber-50 text-amber-600"
                                                                : "bg-rose-50 text-rose-600"
                                                        )}
                                                    >
                                                        {login.reason === "password_mismatch"
                                                            ? "Неверный пароль"
                                                            : "Пользователь не найден"}
                                                    </span>
                                                </td>
                                                <td className="crm-td">
                                                    <code className="text-xs font-mono font-bold text-slate-400 bg-slate-100/50 px-2 py-1 rounded">
                                                        {login.ipAddress || "Unknown"}
                                                    </code>
                                                </td>
                                                <td className="crm-td">
                                                    <span className="text-xs font-bold text-slate-400">
                                                        {getTimeAgo(login.createdAt)} назад
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                />
            </CardContent>
        </Card>
    );
}
