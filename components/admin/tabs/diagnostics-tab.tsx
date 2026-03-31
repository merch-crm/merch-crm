import {
    Activity,
    Database,
    HardDrive,
    RefreshCw,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HealthData } from "../types";

interface DiagnosticsTabProps {
    healthData: HealthData | null;
    diagnosing: boolean;
    onRunDiagnostics: () => void;
}

export function DiagnosticsTab({
    healthData,
    diagnosing,
    onRunDiagnostics,
}: DiagnosticsTabProps) {
    return (
        <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300 px-1">
            <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-800">
                                Самодиагностика системы
                            </CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-400">
                                Проверка целостности и связи с сервисами
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRunDiagnostics}
                            disabled={diagnosing}
                            className="bg-white border-slate-200 text-slate-600 text-xs font-bold rounded-[18px] hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 shadow-sm gap-2 h-9"
                        >
                            <RefreshCw
                                size={14}
                                className={cn(diagnosing && "animate-spin")}
                            />
                            {diagnosing ? "Проверка..." : "Запустить тест"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {!healthData && !diagnosing ? (
                        <div className="py-12 text-center">
                            <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">
                                Нажмите кнопку выше, чтобы проверить состояние систем.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {/* DB */}
                                <div
                                    className={cn(
                                        "p-4 rounded-[18px] border transition-all",
                                        healthData?.database.status === "ok"
                                            ? "bg-emerald-50/30 border-emerald-100"
                                            : "bg-slate-50/50 border-slate-200",
                                        diagnosing && "animate-pulse"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    "p-1.5 rounded-[18px]",
                                                    healthData?.database.status === "ok"
                                                        ? "bg-emerald-100 text-emerald-600"
                                                        : "bg-slate-200 text-slate-500"
                                                )}
                                            >
                                                <Database size={16} />
                                            </div>
                                            <span className="font-bold text-slate-700">
                                                База данных
                                            </span>
                                        </div>
                                        {healthData?.database.status === "ok" ? (
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                OK
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-400">
                                                ...
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-xs text-slate-400 font-bold mb-1">
                                            Задержка (Latency)
                                        </p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {healthData?.database.latency ?? "0"}{" "}
                                            <span className="text-xs text-slate-400">ms</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Storage */}
                                <div
                                    className={cn(
                                        "p-4 rounded-[18px] border transition-all",
                                        healthData?.storage.status === "ok"
                                            ? "bg-emerald-50/30 border-emerald-100"
                                            : healthData?.storage.status === "error"
                                                ? "bg-red-50/30 border-red-100"
                                                : "bg-slate-50/50 border-slate-200",
                                        diagnosing && "animate-pulse"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    "p-1.5 rounded-[18px]",
                                                    healthData?.storage.status === "ok"
                                                        ? "bg-emerald-100 text-emerald-600"
                                                        : healthData?.storage.status === "error"
                                                            ? "bg-red-100 text-red-600"
                                                            : "bg-slate-200 text-slate-500"
                                                )}
                                            >
                                                <HardDrive size={16} />
                                            </div>
                                            <span className="font-bold text-slate-700">
                                                S3 Хранилище
                                            </span>
                                        </div>
                                        {healthData?.storage.status === "ok" ? (
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                Доступно
                                            </span>
                                        ) : healthData?.storage.status === "error" ? (
                                            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                                Ошибка
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-400">
                                                ...
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-xs text-slate-400 font-bold mb-1">
                                            Состояние
                                        </p>
                                        <p className="text-xs text-slate-600 font-medium">
                                            {healthData?.storage.status === "ok"
                                                ? "Запись и чтение успешно"
                                                : "Ожидание..."}
                                        </p>
                                    </div>
                                </div>

                                {/* Env Vars */}
                                <div
                                    className={cn(
                                        "p-4 rounded-[18px] border transition-all",
                                        healthData?.env.status === "ok"
                                            ? "bg-emerald-50/30 border-emerald-100"
                                            : healthData?.env.status === "warning"
                                                ? "bg-amber-50/30 border-amber-100"
                                                : "bg-slate-50/50 border-slate-200",
                                        diagnosing && "animate-pulse"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    "p-1.5 rounded-[18px]",
                                                    healthData?.env.status === "ok"
                                                        ? "bg-emerald-100 text-emerald-600"
                                                        : healthData?.env.status === "warning"
                                                            ? "bg-amber-100 text-amber-600"
                                                            : "bg-slate-200 text-slate-500"
                                                )}
                                            >
                                                <Zap size={16} />
                                            </div>
                                            <span className="font-bold text-slate-700">
                                                Окружение
                                            </span>
                                        </div>
                                        {healthData?.env.status === "ok" ? (
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                OK
                                            </span>
                                        ) : healthData?.env.status === "warning" ? (
                                            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                                WARN
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-400">
                                                ...
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-xs text-slate-400 font-bold mb-1">
                                            Критические ключи
                                        </p>
                                        <p className="text-xs text-slate-600 font-bold truncate">
                                            {healthData?.env.status === "ok"
                                                ? "Все переменные на месте"
                                                : healthData?.env.details.length
                                                    ? `Мимо: ${healthData.env.details.join(", ")}`
                                                    : "Ожидание..."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
