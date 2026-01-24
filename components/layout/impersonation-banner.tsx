"use client";

import { LogOut } from "lucide-react";
import { stopImpersonating } from "@/app/dashboard/admin/actions";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ImpersonationBannerProps {
    impersonatorName: string;
    targetName: string;
}

export function ImpersonationBanner({ impersonatorName, targetName }: ImpersonationBannerProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleStop = async () => {
        setIsLoading(true);
        try {
            const res = await stopImpersonating();
            if (res.success) {
                toast("Вы вернулись в свой аккаунт", "success");
                window.location.href = "/dashboard";
            } else {
                toast(res.error || "Ошибка при выходе", "destructive");
            }
        } catch (error) {
            toast("Произошла ошибка", "destructive");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-[110] shadow-lg animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-white/20 p-2 rounded-full hidden sm:block">
                    <LogOut className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold truncate">
                    <span className="opacity-80 font-medium">Режим имперсонации: </span>
                    <span className="bg-amber-600 px-2 py-0.5 rounded-md mx-1">{targetName}</span>
                    <span className="hidden sm:inline opacity-80 font-medium ml-1">
                        (Администратор: {impersonatorName})
                    </span>
                </div>
            </div>
            <button
                onClick={handleStop}
                disabled={isLoading}
                className={cn(
                    "ml-4 px-4 py-1.5 bg-white text-amber-600 rounded-full text-xs font-bold  tracking-normal hover:bg-amber-50 transition-all flex items-center gap-2 shadow-sm whitespace-nowrap",
                    isLoading && "opacity-50 cursor-not-allowed"
                )}
            >
                {isLoading ? "Выход..." : "Вернуться к админу"}
            </button>
        </div>
    );
}
