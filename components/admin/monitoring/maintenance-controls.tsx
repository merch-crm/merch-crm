import React from "react";
import { Power, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaintenanceControlsProps {
    onClearRam: () => void;
    isClearingRam: boolean;
    onRestartRequest: () => void;
    isRestartingAction: boolean;
}

export function MaintenanceControls({
    onClearRam,
    isClearingRam,
    onRestartRequest,
    isRestartingAction,
}: MaintenanceControlsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-5 rounded-[18px] bg-white border border-slate-200/60 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-[18px] bg-indigo-50 text-[#5d00ff] group-hover:bg-[#5d00ff] group-hover:text-white transition-all shadow-sm">
                        <Zap size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">
                            Очистка RAM
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                            Принудительный запуск Garbage Collector
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    onClick={onClearRam}
                    disabled={isClearingRam}
                    className="bg-slate-50 text-slate-600 rounded-[18px] hover:bg-indigo-50 hover:text-[#5d00ff] border border-slate-200 h-9 text-[11px] font-bold px-5"
                >
                    {isClearingRam ? "Очистка..." : "Очистить"}
                </Button>
            </div>

            <div className="p-5 rounded-[18px] bg-white border border-slate-200/60 shadow-sm flex items-center justify-between group hover:border-rose-100 transition-all">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-[18px] bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                        <Power size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">
                            Перезагрузка
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                            Мягкий перезапуск инстанса Next.js
                        </p>
                    </div>
                </div>
                <Button
                    onClick={onRestartRequest}
                    disabled={isRestartingAction}
                    className="bg-rose-500 text-white rounded-[18px] hover:bg-rose-600 shadow-md shadow-rose-100 h-9 text-[11px] font-bold px-5"
                >
                    {isRestartingAction ? "Запуск..." : "Рестарт"}
                </Button>
            </div>
        </div>
    );
}
