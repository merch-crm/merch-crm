"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Globe } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface SessionData {
    id: string;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: Date;
    expiresAt: Date;
    updatedAt: Date;
}

export function ActiveSessions() {
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    async function loadSessions() {
        setIsLoading(true);
        const { data } = await authClient.listSessions();
        if (data) setSessions(data as unknown as SessionData[]);
        setIsLoading(false);
    }

    useEffect(() => {
        loadSessions();
    }, []);

    async function handleRevoke(token: string) {
        const { error } = await authClient.revokeSession({ token });
        if (error) {
            toast.error("Не удалось завершить сессию");
        } else {
            toast.success("Сессия успешно завершена");
            loadSessions();
        }
    }

    function parseUserAgent(ua: string | null) {
        if (!ua) return { os: "Неизвестно", browser: "Неизвестно", isMobile: false };
        let os = "Неизвестно";
        let browser = "Неизвестный браузер";
        const isMobile = /Mobile|Android|iP(hone|od|ad)/i.test(ua);

        if (/Windows/i.test(ua)) os = "Windows";
        else if (/Mac/i.test(ua)) os = "macOS";
        else if (/Linux/i.test(ua)) os = "Linux";
        else if (/Android/i.test(ua)) os = "Android";
        else if (/iOS/i.test(ua)) os = "iOS";

        if (/Chrome/i.test(ua)) browser = "Chrome";
        else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
        else if (/Firefox/i.test(ua)) browser = "Firefox";
        else if (/Edge/i.test(ua)) browser = "Edge";

        return { os, browser, isMobile };
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Активные сессии</CardTitle>
                <CardDescription>Устройства, с которых выполнен вход в ваш аккаунт</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {isLoading ? (
                    <div className="text-sm text-slate-500">Загрузка сессий...</div>
                ) : sessions.length === 0 ? (
                    <div className="text-sm text-slate-500">Нет активных сессий</div>
                ) : (
                    sessions.map((session) => {
                        const { os, browser, isMobile } = parseUserAgent(session.userAgent);
                        // session.id is usually the token for better-auth revocation, or authClient.revokeSession expects { token: string }
                        // Let's assume we can revoke it by id/token
                        return (
                            <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-white rounded-full shadow-sm mt-0.5">
                                        {isMobile ? <Smartphone className="w-5 h-5 text-slate-600" /> : <Monitor className="w-5 h-5 text-slate-600" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">{os} • {browser}</p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {session.ipAddress || "Неизвестный IP"}</span>
                                            <span>•</span>
                                            <span>Был в сети: {format(new Date(session.updatedAt || session.createdAt), "dd MMM, HH:mm", { locale: ru })}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="destructive" size="sm" onClick={() => handleRevoke(session.id)}>
                                    Завершить
                                </Button>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}
