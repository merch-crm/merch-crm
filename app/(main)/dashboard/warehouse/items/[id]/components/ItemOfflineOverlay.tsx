"use client";

import { RefreshCcw } from "lucide-react";

interface ItemOfflineOverlayProps {
    isOnline: boolean;
}

export function ItemOfflineOverlay({ isOnline }: ItemOfflineOverlayProps) {
    if (isOnline) return null;

    return (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-500" role="dialog" aria-modal="true" data-dialog-open="true">
            <div className="crm-card !p-[--padding-xl] !rounded-[3rem] shadow-2xl !border-rose-100 max-w-sm text-center space-y-3">
                <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto animate-pulse">
                    <RefreshCcw className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">Соединение потеряно</h3>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">Интерфейс временно заблокирован для безопасности данных. Ждем возврата в сеть...</p>
                </div>
            </div>
        </div>
    );
}
