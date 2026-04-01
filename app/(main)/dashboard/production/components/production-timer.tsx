"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Clock } from "lucide-react";
import { startTaskTimerAction, stopTaskTimerAction, getOrCreateTaskAndTimerStatusAction } from "../actions/time-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useIsClient } from "@/hooks/use-is-client";

interface ProductionTimerProps {
    taskId?: string | null;
    orderItemId: string;
    stage: string;
    initialIsRunning?: boolean;
    initialStartTime?: Date | null;
    className?: string;
}

export function ProductionTimer({
    taskId: initialTaskId,
    orderItemId,
    stage,
    initialIsRunning = false,
    initialStartTime = null,
    className
}: ProductionTimerProps) {
    const [taskId, setTaskId] = useState<string | null>(initialTaskId || null);
    const [isRunning, setIsRunning] = useState(initialIsRunning);
    const [startTime, setStartTime] = useState<Date | null>(initialStartTime);
    const [elapsed, setElapsed] = useState(0);
    const [loading, setLoading] = useState(false);

    // Синхронизация с сервером при монтировании
    useEffect(() => {
        async function sync() {
            const data = await getOrCreateTaskAndTimerStatusAction({ orderItemId, stage });
            if (data?.success) {
                setTaskId(data.data.taskId);
                setIsRunning(data.data.isRunning);
                setStartTime(data.data.startTime ? new Date(data.data.startTime) : null);
            }
        }
        sync();
    }, [orderItemId, stage]);

    // Таймер (тик)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && startTime) {
            interval = setInterval(() => {
                const now = new Date(); // suppressHydrationWarning
                const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                setElapsed(diff);
            }, 1000);
        } else {
            setElapsed(0);
        }
        return () => clearInterval(interval);
    }, [isRunning, startTime]);

    const handleToggle = useCallback(async () => {
        if (!taskId) return;
        setLoading(true);
        try {
            if (isRunning) {
                const res = await stopTaskTimerAction({ taskId });
                if (res.success) {
                    setIsRunning(false);
                    setStartTime(null);
                    toast.success("Таймер остановлен");
                } else {
                    toast.error(res.error || "Ошибка остановки");
                }
            } else {
                const res = await startTaskTimerAction({ taskId });
                if (res.success) {
                    setIsRunning(true);
                    setStartTime(new Date()); // suppressHydrationWarning
                    toast.success("Таймер запущен");
                } else {
                    toast.error(res.error || "Ошибка запуска");
                }
            }
        } finally {
            setLoading(false);
        }
    }, [isRunning, taskId]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [
            h > 0 ? h.toString().padStart(2, '0') : null,
            m.toString().padStart(2, '0'),
            s.toString().padStart(2, '0')
        ].filter(Boolean).join(':');
    };

    const isClient = useIsClient();

    return (
        <div className={cn("flex items-center gap-2 px-2 py-1.5 rounded-md border border-border/40 bg-muted/30", className)}>
            <div className="flex items-center gap-1.5 min-w-[70px]">
                <Clock className={cn("w-3.5 h-3.5", isRunning ? "text-primary animate-pulse" : "text-muted-foreground")} />
                <span className={cn("text-xs font-mono font-medium tabular-nums", isRunning ? "text-foreground" : "text-muted-foreground")}>
                    {isClient && isRunning ? formatTime(elapsed) : "00:00"}
                </span>
            </div>
            
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "h-7 w-7 rounded-full transition-all duration-300",
                    isRunning 
                        ? "text-orange-500 hover:text-orange-600 hover:bg-orange-500/10" 
                        : "text-green-500 hover:text-green-600 hover:bg-green-500/10"
                )}
                onClick={handleToggle}
                disabled={loading}
            >
                {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </Button>
        </div>
    );
}
