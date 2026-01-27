"use client";

import React, { useState } from "react";
import {
    Bell,
    Send,
    ShieldAlert,
    Info,
    CheckCircle2,
    Save,
    Bot,
    Smartphone,
    Monitor,
    Zap,
    AlertTriangle,
    ShoppingBag,
    Boxes,
    UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { updateNotificationSettingsAction, NotificationSettings } from "../actions";
import { useToast } from "@/components/ui/toast";

interface NotificationsClientProps {
    initialSettings: NotificationSettings;
}

export function NotificationsClient({ initialSettings }: NotificationsClientProps) {
    const { toast } = useToast();
    const [settings, setSettings] = useState<NotificationSettings>(initialSettings || {
        system: { enabled: true, browserPush: false },
        telegram: { enabled: false, botToken: "", chatId: "", notifyOnNewOrder: true, notifyOnLowStock: true, notifyOnSystemError: true },
        events: { new_order: true, order_status_change: true, stock_low: true, task_assigned: true }
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        const res = await updateNotificationSettingsAction(settings);
        if (res.success) {
            toast("Настройки уведомлений сохранены", "success");
        } else {
            toast(res.error || "Ошибка при сохранении", "error");
        }
        setLoading(false);
    };

    const toggleNested = (section: keyof NotificationSettings, key: string) => {
        setSettings((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: !(prev[section][key] as boolean)
            }
        }));
    };

    const updateValue = (section: keyof NotificationSettings, key: string, value: string) => {
        setSettings((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-normal">Уведомления</h1>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mt-1">Управление каналами связи и триггерами системы</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    size="lg"
                    className="rounded-2xl shadow-xl shadow-primary/20 font-bold"
                >
                    {loading ? <Zap className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Сохранить изменения
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* System & Push Settings */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Monitor className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Системные уведомления</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Внутри браузера</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-colors hover:border-blue-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Общие уведомления</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Показывать в колокольчике CRM</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleNested("system", "enabled")}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-all relative",
                                    settings.system.enabled ? "bg-primary" : "bg-slate-200"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                    settings.system.enabled ? "right-1" : "left-1"
                                )} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-colors hover:border-blue-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Push-уведомления</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Всплывающие окна рабочего стола</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleNested("system", "browserPush")}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-all relative",
                                    settings.system.browserPush ? "bg-primary" : "bg-slate-200"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                    settings.system.browserPush ? "right-1" : "left-1"
                                )} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Telegram Integration */}
                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl space-y-8 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Send className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold">Telegram Бот</h3>
                            <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mt-0.5">Мгновенные оповещения</p>
                        </div>
                        <button
                            onClick={() => toggleNested("telegram", "enabled")}
                            className={cn(
                                "ml-auto w-12 h-6 rounded-full transition-all relative",
                                settings.telegram.enabled ? "bg-blue-400" : "bg-slate-700"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                settings.telegram.enabled ? "right-1" : "left-1"
                            )} />
                        </button>
                    </div>

                    <div className={cn("space-y-5 relative z-10 transition-all", !settings.telegram.enabled && "opacity-40 pointer-events-none grayscale")}>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Токен бота (API Token)</label>
                            <input
                                type="password"
                                value={settings.telegram.botToken}
                                onChange={(e) => updateValue("telegram", "botToken", e.target.value)}
                                placeholder="123456789:ABCDEF..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID Группы или Чат-ID</label>
                            <input
                                type="text"
                                value={settings.telegram.chatId}
                                onChange={(e) => updateValue("telegram", "chatId", e.target.value)}
                                placeholder="-100123456789"
                                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-300 text-xs font-bold">
                            <Bot className="w-5 h-5 shrink-0" />
                            <p>Добавьте бота в нужный чат и отправьте любое сообщение, чтобы узнать ID.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Triggers (Bento grid style events) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">События для уведомлений</h3>
                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                        {Object.values(settings.events).filter(Boolean).length} триггера активно
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { key: "new_order", label: "Новый заказ", icon: <ShoppingBag className="w-5 h-5" />, color: "bg-emerald-50 text-emerald-600" },
                        { key: "order_status_change", label: "Смена статуса", icon: <CheckCircle2 className="w-5 h-5" />, color: "bg-blue-50 text-blue-600" },
                        { key: "stock_low", label: "Мало остатков", icon: <Boxes className="w-5 h-5" />, color: "bg-orange-50 text-orange-600" },
                        { key: "task_assigned", label: "Новая задача", icon: <UserCheck className="w-5 h-5" />, color: "bg-purple-50 text-purple-600" },
                        { key: "system_error", label: "Ошибки системы", icon: <ShieldAlert className="w-5 h-5" />, color: "bg-rose-50 text-rose-600" },
                        { key: "big_payment", label: "Крупный платеж", icon: <Zap className="w-5 h-5" />, color: "bg-amber-50 text-amber-600" },
                        { key: "client_update", label: "Изменение клиента", icon: <Info className="w-5 h-5" />, color: "bg-indigo-50 text-indigo-600" },
                        { key: "security_alert", label: "Безопасность", icon: <AlertTriangle className="w-5 h-5" />, color: "bg-red-50 text-red-600" },
                    ].map((item) => (
                        <div
                            key={item.key}
                            onClick={() => toggleNested("events", item.key)}
                            className={cn(
                                "p-6 rounded-3xl border transition-all cursor-pointer group hover:shadow-lg",
                                (settings.events[item.key] || settings.telegram[`notifyOn${item.key.charAt(0).toUpperCase() + item.key.slice(1)}`]) // Rough sync for now
                                    ? "bg-white border-slate-100 shadow-sm"
                                    : "bg-slate-50/50 border-transparent grayscale opacity-60"
                            )}
                        >
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", item.color)}>
                                {item.icon}
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm mb-1">{item.label}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic group-hover:text-primary transition-colors">
                                {(settings.events[item.key] || settings.telegram[`notifyOn${item.key.charAt(0).toUpperCase() + item.key.slice(1)}`]) ? "Активно" : "Выключено"}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
