import React from "react";
import { AlertTriangle, Trash2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { getTimeAgo, translateErrorMessage } from "../utils";
import { SystemError } from "../types";

interface SystemErrorsCardProps {
    systemErrors: SystemError[];
    onClearSecurityErrors: () => void;
    isClearingErrors: boolean;
    onViewDetails: (error: SystemError) => void;
}

export function SystemErrorsCard({
    systemErrors,
    onClearSecurityErrors,
    isClearingErrors,
    onViewDetails,
}: SystemErrorsCardProps) {
    return (
        <Card className="border-rose-100 shadow-xl shadow-rose-200/20 overflow-hidden bg-white rounded-[32px] border">
            <CardHeader className="pb-4 border-b border-rose-50 bg-rose-50/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-600 text-white rounded-[18px] shadow-lg shadow-rose-200 flex items-center justify-center">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-rose-950">
                                Системные ошибки
                            </CardTitle>
                            <p className="text-xs text-rose-400 font-bold mt-0.5">
                                Критические сбои и исключения
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={onClearSecurityErrors}
                        disabled={isClearingErrors || !systemErrors.length}
                        className={cn(
                            "gap-2 text-xs h-8 rounded-[18px]",
                            systemErrors.length && !isClearingErrors
                                ? "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-200"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60 hover:bg-slate-100"
                        )}
                    >
                        <Trash2 size={14} />
                        {isClearingErrors ? "Очистка..." : "Очистить ошибки"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ResponsiveDataView
                    data={systemErrors}
                    renderCard={(error, idx) => (
                        <div
                            role="button"
                            tabIndex={0}
                            key={error.id || idx}
                            className="p-4 bg-white border border-rose-100 rounded-2xl space-y-3"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onViewDetails(error);
                                }
                            }}
                            onClick={() => onViewDetails(error)}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex flex-1 min-w-0 flex-col">
                                    <p className="text-sm font-bold text-slate-900 leading-tight">
                                        {translateErrorMessage(error.message)}
                                    </p>
                                    {error.path && (
                                        <p className="text-xs font-mono text-slate-400 mt-1 truncate">
                                            {error.method || "REQ"} {error.path}
                                        </p>
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-bold shrink-0",
                                        error.severity === "critical"
                                            ? "bg-rose-600 text-white"
                                            : "bg-amber-100 text-amber-600"
                                    )}
                                >
                                    {error.severity === "critical" ? "Критично" : "Предупр."}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <code className="font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                                    {error.ipAddress || "Unknown IP"}
                                </code>
                                <span className="font-bold text-slate-400">
                                    {getTimeAgo(error.createdAt)}
                                </span>
                            </div>
                        </div>
                    )}
                    renderTable={() => (
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="crm-table min-w-[700px]">
                                <thead className="crm-thead">
                                    <tr>
                                        <th className="crm-th">Сообщение об ошибке</th>
                                        <th className="crm-th">Критичность</th>
                                        <th className="crm-th">IP / Путь</th>
                                        <th className="crm-th">Дата</th>
                                    </tr>
                                </thead>
                                <tbody className="crm-tbody divide-y divide-rose-50">
                                    {systemErrors.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="py-16 text-center text-emerald-600 font-bold text-xs"
                                            >
                                                <Zap className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                                Ошибок не выявлено
                                            </td>
                                        </tr>
                                    ) : (
                                        systemErrors.map((error) => (
                                            <tr
                                                key={error.id}
                                                className="crm-tr cursor-pointer"
                                                onClick={() => onViewDetails(error)}
                                            >
                                                <td className="crm-td max-w-md">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500 animate-pulse" />
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-bold text-slate-900 leading-tight">
                                                                {translateErrorMessage(error.message)}
                                                            </p>
                                                            {error.path && (
                                                                <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
                                                                    <span className="bg-slate-100 px-1 rounded font-bold text-slate-500">
                                                                        {error.method || "REQ"}
                                                                    </span>
                                                                    <span className="truncate">{error.path}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="crm-td">
                                                    <span
                                                        className={cn(
                                                            "px-2 py-0.5 rounded-[18px] text-xs font-bold tracking-tight",
                                                            error.severity === "critical"
                                                                ? "bg-rose-600 text-white"
                                                                : "bg-amber-100 text-amber-600"
                                                        )}
                                                    >
                                                        {error.severity === "critical"
                                                            ? "Критично"
                                                            : "Предупреждение"}
                                                    </span>
                                                </td>
                                                <td className="crm-td">
                                                    <div className="flex flex-col gap-1">
                                                        <code className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                                                            {error.ipAddress || "Unknown IP"}
                                                        </code>
                                                    </div>
                                                </td>
                                                <td className="crm-td">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-900">
                                                            {getTimeAgo(error.createdAt)}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-400">
                                                            {new Date(error.createdAt).toLocaleTimeString()}
                                                        </span>
                                                    </div>
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
